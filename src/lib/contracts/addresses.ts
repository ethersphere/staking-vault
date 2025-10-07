// Temporary contract addresses for development
// These will be replaced with real deployed addresses

export const CONTRACTS = {
  // Gnosis Chain
  gnosis: {
    stakingVault: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    bzzToken: "0xdBF3Ea6F5beE45c02255B2c26a16F300502F68da" as `0x${string}`, // Real BZZ token on Gnosis
    usdcToken: "0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83" as `0x${string}`, // Real USDC on Gnosis
  },
  // Sepolia Testnet
  sepolia: {
    stakingVault: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    bzzToken: "0x0000000000000000000000000000000000000000" as `0x${string}`, // Mock address
    usdcToken: "0x0000000000000000000000000000000000000000" as `0x${string}`, // Mock address
  },
} as const;

// Default network
export const DEFAULT_CHAIN_ID = 100; // Gnosis Chain

// Network names
export const CHAIN_NAMES: Record<number, string> = {
  100: "Gnosis Chain",
  11155111: "Sepolia Testnet",
  1: "Ethereum Mainnet",
};

// BZZ Token decimals
export const BZZ_DECIMALS = 16;

// USDC Token decimals
export const USDC_DECIMALS = 6;

// Lock periods
export const LOCK_PERIODS = {
  ONE_YEAR: {
    value: 1,
    duration: 365 * 24 * 60 * 60, // 1 year in seconds
    rewardBps: 500, // 5%
    rewardPercent: 5,
    label: "1 Year",
  },
  TWO_YEARS: {
    value: 2,
    duration: 730 * 24 * 60 * 60, // 2 years in seconds
    rewardBps: 1000, // 10%
    rewardPercent: 10,
    label: "2 Years",
  },
} as const;

// Helper function to get contract addresses for a chain
export function getContractAddresses(chainId: number) {
  if (chainId === 100) return CONTRACTS.gnosis;
  if (chainId === 11155111) return CONTRACTS.sepolia;
  return CONTRACTS.gnosis; // Default to Gnosis
}

// Helper function to calculate reward
export function calculateReward(amount: bigint, lockPeriod: 1 | 2): bigint {
  const rewardBps = lockPeriod === 1 ? LOCK_PERIODS.ONE_YEAR.rewardBps : LOCK_PERIODS.TWO_YEARS.rewardBps;
  return (amount * BigInt(rewardBps)) / BigInt(10000);
}

