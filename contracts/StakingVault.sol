// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title StakingVault
 * @notice A staking contract for BZZ tokens with USDC rewards
 * @dev Users stake BZZ for 1 or 2 years and receive 5% or 10% in USDC instantly
 */
contract StakingVault is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // Roles
    bytes32 public constant FOUNDATION_ROLE = keccak256("FOUNDATION_ROLE");

    // Tokens
    IERC20 public immutable bzzToken;
    IERC20 public immutable usdcToken;

    // Price oracle address (to be set by foundation)
    address public priceOracle;

    // Lock periods in seconds
    uint256 public constant ONE_YEAR = 365 days;
    uint256 public constant TWO_YEARS = 730 days;

    // Reward percentages (in basis points: 100 = 1%)
    uint256 public constant ONE_YEAR_REWARD_BPS = 500; // 5%
    uint256 public constant TWO_YEARS_REWARD_BPS = 1000; // 10%
    uint256 public constant BASIS_POINTS = 10000;

    // Stake information
    struct Stake {
        uint256 bzzAmount;
        uint256 usdcReward;
        uint256 unlockTime;
        bool withdrawn;
    }

    // User stakes mapping: user => stake array
    mapping(address => Stake[]) public userStakes;

    // Total locked BZZ
    uint256 public totalLockedBZZ;

    // Total USDC paid out
    uint256 public totalUSDCPaidOut;

    // Events
    event Staked(
        address indexed user,
        uint256 indexed stakeIndex,
        uint256 bzzAmount,
        uint256 usdcReward,
        uint256 unlockTime,
        uint256 lockPeriod
    );
    event Withdrawn(
        address indexed user,
        uint256 indexed stakeIndex,
        uint256 bzzAmount
    );
    event USDCFunded(address indexed funder, uint256 amount);
    event USDCWithdrawn(address indexed foundation, uint256 amount);
    event PriceOracleUpdated(address indexed newOracle);

    /**
     * @notice Constructor
     * @param _bzzToken Address of the BZZ token
     * @param _usdcToken Address of the USDC token
     * @param _foundation Address of the Swarm Foundation wallet
     */
    constructor(
        address _bzzToken,
        address _usdcToken,
        address _foundation
    ) {
        require(_bzzToken != address(0), "Invalid BZZ token address");
        require(_usdcToken != address(0), "Invalid USDC token address");
        require(_foundation != address(0), "Invalid foundation address");

        bzzToken = IERC20(_bzzToken);
        usdcToken = IERC20(_usdcToken);

        _grantRole(DEFAULT_ADMIN_ROLE, _foundation);
        _grantRole(FOUNDATION_ROLE, _foundation);
    }

    /**
     * @notice Set the price oracle address
     * @param _priceOracle Address of the price oracle
     */
    function setPriceOracle(address _priceOracle) external onlyRole(FOUNDATION_ROLE) {
        require(_priceOracle != address(0), "Invalid oracle address");
        priceOracle = _priceOracle;
        emit PriceOracleUpdated(_priceOracle);
    }

    /**
     * @notice Fund the contract with USDC
     * @param amount Amount of USDC to deposit
     */
    function fundUSDC(uint256 amount) external onlyRole(FOUNDATION_ROLE) {
        require(amount > 0, "Amount must be greater than 0");
        usdcToken.safeTransferFrom(msg.sender, address(this), amount);
        emit USDCFunded(msg.sender, amount);
    }

    /**
     * @notice Withdraw excess USDC (not allocated to stakers)
     * @param amount Amount of USDC to withdraw
     */
    function withdrawUSDC(uint256 amount) external onlyRole(FOUNDATION_ROLE) {
        uint256 availableUSDC = getAvailableUSDC();
        require(amount <= availableUSDC, "Insufficient available USDC");
        usdcToken.safeTransfer(msg.sender, amount);
        emit USDCWithdrawn(msg.sender, amount);
    }

    /**
     * @notice Stake BZZ tokens
     * @param bzzAmount Amount of BZZ tokens to stake
     * @param bzzValueInUSDC Current USD value of the BZZ amount (6 decimals for USDC)
     * @param lockPeriod Lock period: 1 for one year, 2 for two years
     */
    function stake(
        uint256 bzzAmount,
        uint256 bzzValueInUSDC,
        uint256 lockPeriod
    ) external nonReentrant whenNotPaused {
        require(bzzAmount > 0, "Amount must be greater than 0");
        require(lockPeriod == 1 || lockPeriod == 2, "Invalid lock period");
        require(bzzValueInUSDC > 0, "Invalid BZZ value");

        // Calculate USDC reward based on lock period
        uint256 rewardBPS = lockPeriod == 1 ? ONE_YEAR_REWARD_BPS : TWO_YEARS_REWARD_BPS;
        uint256 usdcReward = (bzzValueInUSDC * rewardBPS) / BASIS_POINTS;

        // Check if enough USDC is available
        require(usdcReward <= getAvailableUSDC(), "Insufficient USDC in vault");

        // Calculate unlock time
        uint256 lockDuration = lockPeriod == 1 ? ONE_YEAR : TWO_YEARS;
        uint256 unlockTime = block.timestamp + lockDuration;

        // Transfer BZZ from user to contract
        bzzToken.safeTransferFrom(msg.sender, address(this), bzzAmount);

        // Transfer USDC reward to user
        usdcToken.safeTransfer(msg.sender, usdcReward);

        // Record the stake
        userStakes[msg.sender].push(Stake({
            bzzAmount: bzzAmount,
            usdcReward: usdcReward,
            unlockTime: unlockTime,
            withdrawn: false
        }));

        // Update totals
        totalLockedBZZ += bzzAmount;
        totalUSDCPaidOut += usdcReward;

        uint256 stakeIndex = userStakes[msg.sender].length - 1;

        emit Staked(
            msg.sender,
            stakeIndex,
            bzzAmount,
            usdcReward,
            unlockTime,
            lockPeriod
        );
    }

    /**
     * @notice Withdraw staked BZZ tokens after lock period
     * @param stakeIndex Index of the stake to withdraw
     */
    function withdraw(uint256 stakeIndex) external nonReentrant {
        require(stakeIndex < userStakes[msg.sender].length, "Invalid stake index");
        
        Stake storage userStake = userStakes[msg.sender][stakeIndex];
        require(!userStake.withdrawn, "Already withdrawn");
        require(block.timestamp >= userStake.unlockTime, "Tokens still locked");

        uint256 bzzAmount = userStake.bzzAmount;
        userStake.withdrawn = true;

        // Update total locked BZZ
        totalLockedBZZ -= bzzAmount;

        // Transfer BZZ back to user
        bzzToken.safeTransfer(msg.sender, bzzAmount);

        emit Withdrawn(msg.sender, stakeIndex, bzzAmount);
    }

    /**
     * @notice Get available USDC (total balance minus what's already been paid out)
     * @return Available USDC amount
     */
    function getAvailableUSDC() public view returns (uint256) {
        return usdcToken.balanceOf(address(this));
    }

    /**
     * @notice Get total USDC in the contract
     * @return Total USDC balance
     */
    function getTotalUSDC() external view returns (uint256) {
        return usdcToken.balanceOf(address(this));
    }

    /**
     * @notice Get all stakes for a user
     * @param user Address of the user
     * @return Array of stakes
     */
    function getUserStakes(address user) external view returns (Stake[] memory) {
        return userStakes[user];
    }

    /**
     * @notice Get number of stakes for a user
     * @param user Address of the user
     * @return Number of stakes
     */
    function getUserStakeCount(address user) external view returns (uint256) {
        return userStakes[user].length;
    }

    /**
     * @notice Calculate expected USDC reward for a given value and lock period
     * @param bzzValueInUSDC USD value of BZZ to stake
     * @param lockPeriod Lock period: 1 for one year, 2 for two years
     * @return Expected USDC reward
     */
    function calculateReward(
        uint256 bzzValueInUSDC,
        uint256 lockPeriod
    ) external pure returns (uint256) {
        require(lockPeriod == 1 || lockPeriod == 2, "Invalid lock period");
        uint256 rewardBPS = lockPeriod == 1 ? ONE_YEAR_REWARD_BPS : TWO_YEARS_REWARD_BPS;
        return (bzzValueInUSDC * rewardBPS) / BASIS_POINTS;
    }

    /**
     * @notice Pause staking
     */
    function pause() external onlyRole(FOUNDATION_ROLE) {
        _pause();
    }

    /**
     * @notice Unpause staking
     */
    function unpause() external onlyRole(FOUNDATION_ROLE) {
        _unpause();
    }

    /**
     * @notice Emergency withdrawal of any ERC20 token (only foundation)
     * @param token Address of the token to withdraw
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(
        address token,
        uint256 amount
    ) external onlyRole(FOUNDATION_ROLE) {
        IERC20(token).safeTransfer(msg.sender, amount);
    }
}

