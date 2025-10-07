import { expect } from "chai";
import { ethers } from "hardhat";
import { StakingVault } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("StakingVault", function () {
  let stakingVault: StakingVault;
  let bzzToken: any;
  let usdcToken: any;
  let foundation: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const BZZ_DECIMALS = 16; // BZZ token has 16 decimals
  const USDC_DECIMALS = 6; // USDC has 6 decimals

  beforeEach(async function () {
    [foundation, user1, user2] = await ethers.getSigners();

    // Deploy mock ERC20 tokens for testing
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    
    // Deploy BZZ token with 16 decimals
    bzzToken = await MockERC20.deploy("Swarm BZZ", "BZZ", BZZ_DECIMALS);
    await bzzToken.waitForDeployment();

    // Deploy USDC token with 6 decimals
    usdcToken = await MockERC20.deploy("USD Coin", "USDC", USDC_DECIMALS);
    await usdcToken.waitForDeployment();

    // Deploy StakingVault
    const StakingVault = await ethers.getContractFactory("StakingVault");
    stakingVault = await StakingVault.deploy(
      await bzzToken.getAddress(),
      await usdcToken.getAddress(),
      foundation.address
    );
    await stakingVault.waitForDeployment();

    // Mint tokens for testing
    const bzzAmount = ethers.parseUnits("10000", BZZ_DECIMALS);
    const usdcAmount = ethers.parseUnits("100000", USDC_DECIMALS);

    await bzzToken.mint(user1.address, bzzAmount);
    await bzzToken.mint(user2.address, bzzAmount);
    await usdcToken.mint(foundation.address, usdcAmount);
  });

  describe("Deployment", function () {
    it("Should set the correct token addresses", async function () {
      expect(await stakingVault.bzzToken()).to.equal(await bzzToken.getAddress());
      expect(await stakingVault.usdcToken()).to.equal(await usdcToken.getAddress());
    });

    it("Should grant FOUNDATION_ROLE to foundation address", async function () {
      const FOUNDATION_ROLE = await stakingVault.FOUNDATION_ROLE();
      expect(await stakingVault.hasRole(FOUNDATION_ROLE, foundation.address)).to.be.true;
    });

    it("Should set correct reward percentages", async function () {
      expect(await stakingVault.ONE_YEAR_REWARD_BPS()).to.equal(500); // 5%
      expect(await stakingVault.TWO_YEARS_REWARD_BPS()).to.equal(1000); // 10%
    });
  });

  describe("Funding", function () {
    it("Should allow foundation to fund USDC", async function () {
      const fundAmount = ethers.parseUnits("1000", USDC_DECIMALS);
      
      await usdcToken.connect(foundation).approve(await stakingVault.getAddress(), fundAmount);
      await expect(stakingVault.connect(foundation).fundUSDC(fundAmount))
        .to.emit(stakingVault, "USDCFunded")
        .withArgs(foundation.address, fundAmount);

      expect(await stakingVault.getTotalUSDC()).to.equal(fundAmount);
    });

    it("Should not allow non-foundation to fund", async function () {
      const fundAmount = ethers.parseUnits("1000", USDC_DECIMALS);
      
      await usdcToken.connect(foundation).transfer(user1.address, fundAmount);
      await usdcToken.connect(user1).approve(await stakingVault.getAddress(), fundAmount);
      
      await expect(stakingVault.connect(user1).fundUSDC(fundAmount))
        .to.be.reverted;
    });
  });

  describe("Staking", function () {
    beforeEach(async function () {
      // Fund the vault
      const fundAmount = ethers.parseUnits("10000", USDC_DECIMALS);
      await usdcToken.connect(foundation).approve(await stakingVault.getAddress(), fundAmount);
      await stakingVault.connect(foundation).fundUSDC(fundAmount);
    });

    it("Should allow user to stake for 1 year", async function () {
      const bzzAmount = ethers.parseUnits("100", BZZ_DECIMALS);
      const bzzValue = ethers.parseUnits("1000", USDC_DECIMALS); // $1000 worth
      const lockPeriod = 1;

      await bzzToken.connect(user1).approve(await stakingVault.getAddress(), bzzAmount);
      
      const expectedReward = ethers.parseUnits("50", USDC_DECIMALS); // 5% of $1000

      await expect(stakingVault.connect(user1).stake(bzzAmount, bzzValue, lockPeriod))
        .to.emit(stakingVault, "Staked");

      const stakes = await stakingVault.getUserStakes(user1.address);
      expect(stakes.length).to.equal(1);
      expect(stakes[0].bzzAmount).to.equal(bzzAmount);
      expect(stakes[0].usdcReward).to.equal(expectedReward);

      // User should have received USDC
      expect(await usdcToken.balanceOf(user1.address)).to.equal(expectedReward);
    });

    it("Should allow user to stake for 2 years", async function () {
      const bzzAmount = ethers.parseUnits("100", BZZ_DECIMALS);
      const bzzValue = ethers.parseUnits("1000", USDC_DECIMALS); // $1000 worth
      const lockPeriod = 2;

      await bzzToken.connect(user1).approve(await stakingVault.getAddress(), bzzAmount);
      
      const expectedReward = ethers.parseUnits("100", USDC_DECIMALS); // 10% of $1000

      await expect(stakingVault.connect(user1).stake(bzzAmount, bzzValue, lockPeriod))
        .to.emit(stakingVault, "Staked");

      const stakes = await stakingVault.getUserStakes(user1.address);
      expect(stakes[0].usdcReward).to.equal(expectedReward);
    });

    it("Should reject invalid lock period", async function () {
      const bzzAmount = ethers.parseUnits("100", BZZ_DECIMALS);
      const bzzValue = ethers.parseUnits("1000", USDC_DECIMALS);
      const invalidLockPeriod = 3;

      await bzzToken.connect(user1).approve(await stakingVault.getAddress(), bzzAmount);
      
      await expect(
        stakingVault.connect(user1).stake(bzzAmount, bzzValue, invalidLockPeriod)
      ).to.be.revertedWith("Invalid lock period");
    });

    it("Should reject stake when insufficient USDC", async function () {
      // Try to stake more than available USDC allows
      const bzzAmount = ethers.parseUnits("100", BZZ_DECIMALS);
      const bzzValue = ethers.parseUnits("100000", USDC_DECIMALS); // $100k worth (would need $10k USDC)
      const lockPeriod = 1;

      await bzzToken.connect(user1).approve(await stakingVault.getAddress(), bzzAmount);
      
      await expect(
        stakingVault.connect(user1).stake(bzzAmount, bzzValue, lockPeriod)
      ).to.be.revertedWith("Insufficient USDC in vault");
    });
  });

  describe("Withdrawal", function () {
    beforeEach(async function () {
      // Fund the vault
      const fundAmount = ethers.parseUnits("10000", USDC_DECIMALS);
      await usdcToken.connect(foundation).approve(await stakingVault.getAddress(), fundAmount);
      await stakingVault.connect(foundation).fundUSDC(fundAmount);

      // User stakes
      const bzzAmount = ethers.parseUnits("100", BZZ_DECIMALS);
      const bzzValue = ethers.parseUnits("1000", USDC_DECIMALS);
      await bzzToken.connect(user1).approve(await stakingVault.getAddress(), bzzAmount);
      await stakingVault.connect(user1).stake(bzzAmount, bzzValue, 1);
    });

    it("Should not allow withdrawal before lock period", async function () {
      await expect(
        stakingVault.connect(user1).withdraw(0)
      ).to.be.revertedWith("Tokens still locked");
    });

    it("Should allow withdrawal after lock period", async function () {
      const bzzAmount = ethers.parseUnits("100", BZZ_DECIMALS);

      // Fast forward time by 1 year
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      const balanceBefore = await bzzToken.balanceOf(user1.address);

      await expect(stakingVault.connect(user1).withdraw(0))
        .to.emit(stakingVault, "Withdrawn")
        .withArgs(user1.address, 0, bzzAmount);

      const balanceAfter = await bzzToken.balanceOf(user1.address);
      expect(balanceAfter - balanceBefore).to.equal(bzzAmount);
    });

    it("Should not allow double withdrawal", async function () {
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      await stakingVault.connect(user1).withdraw(0);

      await expect(
        stakingVault.connect(user1).withdraw(0)
      ).to.be.revertedWith("Already withdrawn");
    });
  });

  describe("Foundation Management", function () {
    it("Should allow foundation to withdraw unused USDC", async function () {
      const fundAmount = ethers.parseUnits("10000", USDC_DECIMALS);
      await usdcToken.connect(foundation).approve(await stakingVault.getAddress(), fundAmount);
      await stakingVault.connect(foundation).fundUSDC(fundAmount);

      const withdrawAmount = ethers.parseUnits("5000", USDC_DECIMALS);
      
      await expect(stakingVault.connect(foundation).withdrawUSDC(withdrawAmount))
        .to.emit(stakingVault, "USDCWithdrawn")
        .withArgs(foundation.address, withdrawAmount);
    });

    it("Should allow foundation to pause staking", async function () {
      await stakingVault.connect(foundation).pause();

      const bzzAmount = ethers.parseUnits("100", BZZ_DECIMALS);
      const bzzValue = ethers.parseUnits("1000", USDC_DECIMALS);
      
      await bzzToken.connect(user1).approve(await stakingVault.getAddress(), bzzAmount);
      
      await expect(
        stakingVault.connect(user1).stake(bzzAmount, bzzValue, 1)
      ).to.be.reverted;
    });
  });

  describe("View Functions", function () {
    it("Should calculate reward correctly", async function () {
      const bzzValue = ethers.parseUnits("1000", USDC_DECIMALS);
      
      const oneYearReward = await stakingVault.calculateReward(bzzValue, 1);
      expect(oneYearReward).to.equal(ethers.parseUnits("50", USDC_DECIMALS)); // 5%

      const twoYearsReward = await stakingVault.calculateReward(bzzValue, 2);
      expect(twoYearsReward).to.equal(ethers.parseUnits("100", USDC_DECIMALS)); // 10%
    });

    it("Should return correct stake count", async function () {
      // Fund the vault
      const fundAmount = ethers.parseUnits("10000", USDC_DECIMALS);
      await usdcToken.connect(foundation).approve(await stakingVault.getAddress(), fundAmount);
      await stakingVault.connect(foundation).fundUSDC(fundAmount);

      expect(await stakingVault.getUserStakeCount(user1.address)).to.equal(0);

      // Make 2 stakes
      const bzzAmount = ethers.parseUnits("50", BZZ_DECIMALS);
      const bzzValue = ethers.parseUnits("500", USDC_DECIMALS);
      
      await bzzToken.connect(user1).approve(await stakingVault.getAddress(), bzzAmount * 2n);
      await stakingVault.connect(user1).stake(bzzAmount, bzzValue, 1);
      await stakingVault.connect(user1).stake(bzzAmount, bzzValue, 2);

      expect(await stakingVault.getUserStakeCount(user1.address)).to.equal(2);
    });
  });
});

// Mock ERC20 token for testing
// This would normally be in a separate file, but included here for convenience

