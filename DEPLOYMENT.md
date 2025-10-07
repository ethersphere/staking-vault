# StakingVault Deployment Guide

This guide walks you through deploying the StakingVault smart contract.

## Prerequisites

1. **Node.js 22.x (LTS)** - Required for Hardhat compatibility
   - Use `nvm use` to switch to the correct version
   - Or install: `nvm install 22 && nvm use 22`
2. npm or yarn package manager
3. Private key with sufficient ETH/xDAI for deployment
4. RPC URLs for your target networks
5. Block explorer API keys (for contract verification)

## Environment Setup

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Fill in the required values in `.env`:
   - `PRIVATE_KEY`: Your deployment wallet private key
   - `BZZ_TOKEN_ADDRESS`: Address of the BZZ token contract
   - `USDC_TOKEN_ADDRESS`: Address of the USDC token contract
   - `FOUNDATION_ADDRESS`: Swarm Foundation multisig/wallet address
   - RPC URLs for your target networks
   - API keys for block explorers

## Token Addresses

### Gnosis Chain (Main Network for Swarm)
- **BZZ Token**: Check [BZZ on Gnosis](https://gnosisscan.io/)
- **USDC Token**: `0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83` (USDC on Gnosis)

### Ethereum Mainnet
- **BZZ Token**: Check official Swarm documentation
- **USDC Token**: `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`

### Sepolia Testnet
Use test token addresses for testing purposes.

## Compilation

Compile the smart contracts:

```bash
npx hardhat compile
```

## Deployment Options

### Option 1: Using Hardhat Ignition (Recommended)

Hardhat Ignition is the new deployment system with better state management:

```bash
npx hardhat ignition deploy ignition/modules/StakingVault.ts --network gnosis
```

For testnet:
```bash
npx hardhat ignition deploy ignition/modules/StakingVault.ts --network sepolia
```

### Option 2: Using Traditional Deployment Script

```bash
npx hardhat run scripts/deploy.ts --network gnosis
```

For testnet:
```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

## Post-Deployment Steps

### 1. Verify the Contract

Verify on block explorer for transparency:

```bash
npx hardhat verify --network gnosis <CONTRACT_ADDRESS> <BZZ_TOKEN> <USDC_TOKEN> <FOUNDATION_ADDRESS>
```

Example:
```bash
npx hardhat verify --network gnosis 0x1234... 0xBZZ... 0xUSDC... 0xFOUNDATION...
```

### 2. Fund the Contract with USDC

Using the foundation wallet, call the `fundUSDC` function:

```bash
# Using cast (foundry)
cast send <CONTRACT_ADDRESS> "fundUSDC(uint256)" <AMOUNT> --rpc-url <RPC_URL> --private-key <FOUNDATION_KEY>
```

Or interact through a multisig interface like Gnosis Safe.

### 3. Set Price Oracle (Optional)

If you have a price oracle contract:

```bash
cast send <CONTRACT_ADDRESS> "setPriceOracle(address)" <ORACLE_ADDRESS> --rpc-url <RPC_URL> --private-key <FOUNDATION_KEY>
```

### 4. Update Frontend

Add the contract address to your frontend environment variables:

```bash
# In your frontend .env
NEXT_PUBLIC_STAKING_VAULT_ADDRESS=0x...
```

## Contract Functions

### Foundation Functions (Requires FOUNDATION_ROLE)

- `fundUSDC(uint256 amount)`: Add USDC to the vault
- `withdrawUSDC(uint256 amount)`: Withdraw unused USDC
- `setPriceOracle(address oracle)`: Set price oracle address
- `pause()`: Pause staking
- `unpause()`: Resume staking
- `emergencyWithdraw(address token, uint256 amount)`: Emergency token withdrawal

### User Functions

- `stake(uint256 bzzAmount, uint256 bzzValueInUSDC, uint256 lockPeriod)`: Stake BZZ tokens
  - `lockPeriod`: 1 for one year (5% reward), 2 for two years (10% reward)
- `withdraw(uint256 stakeIndex)`: Withdraw staked BZZ after lock period
- `getUserStakes(address user)`: View all stakes for an address
- `calculateReward(uint256 bzzValueInUSDC, uint256 lockPeriod)`: Calculate expected reward

### View Functions

- `getAvailableUSDC()`: Get available USDC in the vault
- `getTotalUSDC()`: Get total USDC balance
- `totalLockedBZZ()`: Get total BZZ currently locked
- `totalUSDCPaidOut()`: Get total USDC paid to stakers

## Testing

Run the test suite:

```bash
npx hardhat test
```

Run with gas reporting:

```bash
REPORT_GAS=true npx hardhat test
```

## Security Considerations

1. **Access Control**: Only foundation wallet can manage USDC and pause
2. **Reentrancy Protection**: All state-changing functions are protected
3. **SafeERC20**: Uses OpenZeppelin's SafeERC20 for token transfers
4. **Pausable**: Contract can be paused in case of emergency
5. **No Upgradability**: Contract is immutable once deployed

## Network Configuration

The contract is configured for:

- **Gnosis Chain** (Chain ID: 100) - Primary deployment target
- **Ethereum Mainnet** (Chain ID: 1) - Alternative deployment
- **Sepolia Testnet** (Chain ID: 11155111) - For testing

## Troubleshooting

### Deployment Fails

1. Check you have enough gas tokens (ETH/xDAI)
2. Verify all environment variables are set correctly
3. Ensure token addresses are valid for the target network

### Verification Fails

1. Wait a few minutes after deployment
2. Ensure API keys are correct
3. Check constructor arguments match deployment parameters

### Cannot Fund USDC

1. Verify foundation address has FOUNDATION_ROLE
2. Check USDC token approval for the contract
3. Ensure foundation wallet has enough USDC

## Support

For issues or questions:
- Check the contract source code in `contracts/StakingVault.sol`
- Review the Hardhat configuration in `hardhat.config.ts`
- Consult [Hardhat Documentation](https://hardhat.org/docs)

