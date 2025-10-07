import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Hardhat Ignition module for deploying StakingVault
 * 
 * Usage:
 * npx hardhat ignition deploy ignition/modules/StakingVault.ts --network <network>
 * 
 * Make sure to set these environment variables:
 * - BZZ_TOKEN_ADDRESS
 * - USDC_TOKEN_ADDRESS
 * - FOUNDATION_ADDRESS
 */
const StakingVaultModule = buildModule("StakingVault", (m) => {
  // Get parameters from environment variables or use defaults
  const bzzTokenAddress = m.getParameter(
    "bzzTokenAddress",
    process.env.BZZ_TOKEN_ADDRESS || ""
  );
  const usdcTokenAddress = m.getParameter(
    "usdcTokenAddress",
    process.env.USDC_TOKEN_ADDRESS || ""
  );
  const foundationAddress = m.getParameter(
    "foundationAddress",
    process.env.FOUNDATION_ADDRESS || ""
  );

  // Deploy the StakingVault contract
  const stakingVault = m.contract("StakingVault", [
    bzzTokenAddress,
    usdcTokenAddress,
    foundationAddress,
  ]);

  return { stakingVault };
});

export default StakingVaultModule;

