# StakingVault Smart Contract

## Overview

The `StakingVault` contract allows BZZ token holders to lock their tokens for 1 or 2 years and receive instant USDC rewards of 5% or 10% respectively.

## Contract Features

### Core Functionality

- **Staking**: Users deposit BZZ tokens and immediately receive USDC rewards
- **Lock Periods**: Two options available:
  - 1 year: 5% reward
  - 2 years: 10% reward
- **Instant Rewards**: USDC is paid out immediately upon staking
- **Withdrawal**: BZZ can be withdrawn after the lock period expires
- **First-Come-First-Serve**: Staking is available until USDC funds are depleted

### Security Features

- **Access Control**: Foundation-only functions for fund management
- **ReentrancyGuard**: Protection against reentrancy attacks
- **Pausable**: Emergency pause functionality
- **SafeERC20**: Secure token transfers using OpenZeppelin's library
- **Immutable Tokens**: BZZ and USDC addresses cannot be changed after deployment

## Contract Architecture

```
StakingVault
├── AccessControl (OpenZeppelin)
├── ReentrancyGuard (OpenZeppelin)
└── Pausable (OpenZeppelin)
```

### Roles

- **DEFAULT_ADMIN_ROLE**: Full admin control (granted to foundation)
- **FOUNDATION_ROLE**: Can manage USDC, pause contract, and emergency withdraw

## Functions

### User Functions

#### `stake(uint256 bzzAmount, uint256 bzzValueInUSDC, uint256 lockPeriod)`
Stake BZZ tokens for rewards.

**Parameters:**
- `bzzAmount`: Amount of BZZ tokens to stake (in wei, 16 decimals)
- `bzzValueInUSDC`: Current USD value of the BZZ amount (6 decimals)
- `lockPeriod`: Lock period (1 = one year, 2 = two years)

**Requirements:**
- User must approve BZZ tokens to the contract first
- Sufficient USDC must be available in the vault
- Contract must not be paused

**Example:**
```solidity
// Approve BZZ
bzzToken.approve(stakingVault, 100e16); // 100 BZZ

// Stake for 1 year at $1000 value
stakingVault.stake(100e16, 1000e6, 1);
// Receives 50 USDC instantly (5% of $1000)
```

#### `withdraw(uint256 stakeIndex)`
Withdraw staked BZZ after lock period.

**Parameters:**
- `stakeIndex`: Index of the stake to withdraw

**Requirements:**
- Lock period must have expired
- Stake must not have been withdrawn already

### Foundation Functions

#### `fundUSDC(uint256 amount)`
Add USDC to the vault for rewards.

**Requires:** FOUNDATION_ROLE

#### `withdrawUSDC(uint256 amount)`
Withdraw unused USDC from the vault.

**Requires:** FOUNDATION_ROLE

#### `setPriceOracle(address oracle)`
Set the price oracle address (for future use).

**Requires:** FOUNDATION_ROLE

#### `pause()` / `unpause()`
Pause or resume staking operations.

**Requires:** FOUNDATION_ROLE

#### `emergencyWithdraw(address token, uint256 amount)`
Emergency withdrawal of any ERC20 token.

**Requires:** FOUNDATION_ROLE

### View Functions

#### `getUserStakes(address user)` → `Stake[]`
Get all stakes for a user.

#### `getUserStakeCount(address user)` → `uint256`
Get the number of stakes for a user.

#### `getAvailableUSDC()` → `uint256`
Get available USDC in the vault.

#### `getTotalUSDC()` → `uint256`
Get total USDC balance in the vault.

#### `calculateReward(uint256 bzzValueInUSDC, uint256 lockPeriod)` → `uint256`
Calculate expected USDC reward for a given value and lock period.

## Events

### `Staked`
```solidity
event Staked(
    address indexed user,
    uint256 indexed stakeIndex,
    uint256 bzzAmount,
    uint256 usdcReward,
    uint256 unlockTime,
    uint256 lockPeriod
)
```

### `Withdrawn`
```solidity
event Withdrawn(
    address indexed user,
    uint256 indexed stakeIndex,
    uint256 bzzAmount
)
```

### `USDCFunded`
```solidity
event USDCFunded(address indexed funder, uint256 amount)
```

### `USDCWithdrawn`
```solidity
event USDCWithdrawn(address indexed foundation, uint256 amount)
```

## Token Specifications

### BZZ Token
- **Decimals**: 16
- **Example**: `100e16` = 100 BZZ tokens

### USDC Token
- **Decimals**: 6
- **Example**: `1000e6` = 1000 USDC

## Usage Example

### For Users

```typescript
// 1. Approve BZZ tokens
const bzzAmount = ethers.parseUnits("1000", 16); // 1000 BZZ
await bzzToken.approve(stakingVaultAddress, bzzAmount);

// 2. Calculate current BZZ value in USD
const bzzValueInUSDC = ethers.parseUnits("500", 6); // $500

// 3. Stake for 2 years (10% reward)
await stakingVault.stake(bzzAmount, bzzValueInUSDC, 2);
// Receives 50 USDC instantly

// 4. After 2 years, withdraw BZZ
await stakingVault.withdraw(0); // Withdraw first stake
```

### For Foundation

```typescript
// Fund the vault with USDC
const usdcAmount = ethers.parseUnits("100000", 6); // 100k USDC
await usdcToken.approve(stakingVaultAddress, usdcAmount);
await stakingVault.fundUSDC(usdcAmount);

// Check available USDC
const available = await stakingVault.getAvailableUSDC();

// Withdraw excess USDC
await stakingVault.withdrawUSDC(ethers.parseUnits("10000", 6));

// Pause in emergency
await stakingVault.pause();
```

## Security Considerations

1. **Price Oracles**: Currently, users provide the BZZ value. In production, consider integrating a trusted price oracle (Chainlink, etc.)
2. **Access Control**: Only the foundation address can manage USDC and pause the contract
3. **Immutability**: The contract cannot be upgraded. Any bugs require redeployment
4. **Token Approvals**: Users must approve BZZ tokens before staking
5. **Foundation Approvals**: Foundation must approve USDC before funding

## Gas Optimization

- Uses OpenZeppelin's SafeERC20 for gas-efficient token transfers
- Optimizer enabled with 200 runs
- Immutable variables for token addresses

## Testing

Run the test suite:
```bash
npm run test:contracts
```

Run with gas reporting:
```bash
npm run test:contracts:gas
```

## License

MIT

