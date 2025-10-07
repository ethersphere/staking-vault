import { ethers } from "hardhat";

/**
 * Traditional deployment script for StakingVault
 * 
 * Usage:
 * npx hardhat run scripts/deploy.ts --network <network>
 * 
 * Make sure to set these environment variables:
 * - BZZ_TOKEN_ADDRESS
 * - USDC_TOKEN_ADDRESS
 * - FOUNDATION_ADDRESS
 */
async function main() {
  console.log("Starting StakingVault deployment...\n");

  // Get deployment parameters from environment variables
  const BZZ_TOKEN_ADDRESS = process.env.BZZ_TOKEN_ADDRESS;
  const USDC_TOKEN_ADDRESS = process.env.USDC_TOKEN_ADDRESS;
  const FOUNDATION_ADDRESS = process.env.FOUNDATION_ADDRESS;

  // Validate parameters
  if (!BZZ_TOKEN_ADDRESS || !USDC_TOKEN_ADDRESS || !FOUNDATION_ADDRESS) {
    throw new Error(
      "Missing required environment variables:\n" +
      "- BZZ_TOKEN_ADDRESS\n" +
      "- USDC_TOKEN_ADDRESS\n" +
      "- FOUNDATION_ADDRESS"
    );
  }

  console.log("Deployment Parameters:");
  console.log("- BZZ Token:", BZZ_TOKEN_ADDRESS);
  console.log("- USDC Token:", USDC_TOKEN_ADDRESS);
  console.log("- Foundation:", FOUNDATION_ADDRESS);
  console.log();

  // Get the deployer's address
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Get the balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  console.log();

  // Deploy the contract
  console.log("Deploying StakingVault...");
  const StakingVault = await ethers.getContractFactory("StakingVault");
  const stakingVault = await StakingVault.deploy(
    BZZ_TOKEN_ADDRESS,
    USDC_TOKEN_ADDRESS,
    FOUNDATION_ADDRESS
  );

  await stakingVault.waitForDeployment();

  const contractAddress = await stakingVault.getAddress();
  console.log("✅ StakingVault deployed to:", contractAddress);
  console.log();

  // Display contract information
  console.log("Contract Information:");
  console.log("- BZZ Token:", await stakingVault.bzzToken());
  console.log("- USDC Token:", await stakingVault.usdcToken());
  console.log("- One Year Lock:", await stakingVault.ONE_YEAR(), "seconds");
  console.log("- Two Years Lock:", await stakingVault.TWO_YEARS(), "seconds");
  console.log("- One Year Reward:", await stakingVault.ONE_YEAR_REWARD_BPS(), "bps (5%)");
  console.log("- Two Years Reward:", await stakingVault.TWO_YEARS_REWARD_BPS(), "bps (10%)");
  console.log();

  // Save deployment info
  console.log("📝 Deployment Summary:");
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Chain ID:", (await ethers.provider.getNetwork()).chainId);
  console.log("StakingVault Address:", contractAddress);
  console.log("Deployer:", deployer.address);
  console.log();

  console.log("Next Steps:");
  console.log("1. Verify the contract on block explorer:");
  console.log(`   npx hardhat verify --network <network> ${contractAddress} ${BZZ_TOKEN_ADDRESS} ${USDC_TOKEN_ADDRESS} ${FOUNDATION_ADDRESS}`);
  console.log("2. Fund the contract with USDC using the foundation wallet");
  console.log("3. Update the frontend with the contract address");
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

