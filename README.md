# Staking Vault Protocol

A Next.js application for the Swarm Foundation's BZZ token staking vault protocol.

## Problem Statement

Currently the BZZ token is fully circulated and there is remarkable selling pressure awaiting higher prices above 30 cents. Instead of doing a buyback (at least temporarily) we should use the funds we have to offer USDC incentives to lock up BZZ. This improves the fundamentals of the token by locking up supply that would otherwise sell in a free and liquid market.

## Requirements

### Smart Contract

- A smart contract capable of being funded with USDC from the Swarm Foundation's wallet/multisig
- The Swarm wallet should have permissions/role to withdraw any funds that are not used/locked/assigned to a staker
- BZZ holders can become stakers and deposit BZZ into the contract
- The BZZ market $ amount should be allocated to the USDC funds, locking the BZZ, and instantly paying out the USDC amount
- Stakers can select either 1 or 2 year lockups, giving 5% or 10% respectively
- **Example flow:** A BZZ holder stakes $1k of BZZ → the BZZ is locked → $100 of USDC is paid out instantly (10% for 2-year lock)
- **Staking capacity:** BZZ may be staked as long as sufficient USDC is available in the vault to pay the rewards
- The mechanism operates on a **first come, first serve** basis - staking stops when USDC runs out
- **BZZ price:** Users provide the current USD value of their BZZ when staking (frontend calculates this using market data)
- Any excess USDC not allocated to active stakes may be withdrawn by the foundation's wallet at any time

### Front End UI

- **Domain:** New domain or subdomain (e.g., `vault.ethswarm.org` or `vault.bzz.limo`)
- **Landing page** with the following functionality:
  - Connect wallet functionality
  - Deposit buttons/functionality to deposit a definable amount of BZZ
  - Deposits should have selected 1 or 2 year lockups and show the expected ROI
  - Dashboard displaying expected payout in a 'swap card'-like widget
  - Dashboard header displaying total contract holdings of BZZ and USDC
  - User logic to determine the withdrawal date of the BZZ, associated with the connected/depositing wallet

## Tech Stack

- **Framework:** Next.js 14+ with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Blockchain:** Smart contracts for BZZ token staking (Hardhat, OpenZeppelin)
- **Wallet Integration:** Web3 wallet connectivity
- **Node.js:** Version 22 LTS (required for Hardhat compatibility)

## Prerequisites

- **Node.js 22.x** (LTS) - Use `nvm use` or `nvm install` to switch to the correct version
- npm or yarn package manager

## Getting Started

### Prerequisites

First, ensure you're using Node.js 22:

```bash
# If using nvm (recommended)
nvm use

# Or install Node.js 22 if not already installed
nvm install 22
nvm use 22
```

### Installation

Install dependencies:

```bash
npm install
```

### Frontend Setup

1. Copy the environment file:
   ```bash
   cp env.local.example .env.local
   ```

2. Get a WalletConnect Project ID from [https://cloud.walletconnect.com/](https://cloud.walletconnect.com/)

3. Add it to `.env.local`:
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
   ```

### Smart Contracts

Compile the contracts:

```bash
npm run compile
```

Run tests:

```bash
npm run test:contracts
```

Deploy to testnet:

```bash
npm run deploy:sepolia
```

### Run the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## How It Works

1. **Foundation Funds Vault**: The Swarm Foundation deposits USDC into the smart contract
2. **Users Stake BZZ**: BZZ holders deposit their tokens and select a lock period (1 or 2 years)
3. **Instant Rewards**: Users immediately receive USDC rewards (5% or 10% of USD value)
4. **BZZ Locked**: Staked BZZ remains locked in the contract until the unlock date
5. **Withdrawal**: After the lock period expires, users can withdraw their original BZZ tokens
6. **Capacity Management**: Staking continues until available USDC runs out (first come, first serve)

### Important Notes

- **BZZ Price Feed**: The frontend fetches current BZZ market price and calculates USD value automatically
- **User Provides Value**: When staking, users submit the USD value of their BZZ along with the transaction
- **No Oracle (Yet)**: The current version trusts user-provided prices; future versions may integrate price oracles
- **USDC Precision**: All USDC amounts use 6 decimals (standard USDC precision)
- **First Come, First Serve**: Once the vault's USDC runs out, no more staking is possible until the Foundation refunds

### Features

- **🔗 Connect Wallet**: Support for MetaMask, WalletConnect, and other popular wallets
- **📊 Dashboard**: Real-time display of total locked BZZ, available USDC, and rewards paid
- **💰 Staking**: Deposit BZZ tokens with 1 or 2 year lock periods
- **🎁 Instant Rewards**: Receive 5% (1 year) or 10% (2 years) USDC immediately
- **📈 ROI Calculator**: See expected rewards before staking
- **🔓 Withdrawals**: Withdraw BZZ tokens after lock period expires
- **📜 Stake History**: View all your active and completed stakes

## Project Structure

```
staking-vault/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   └── lib/              # Utility functions and helpers
├── public/               # Static assets
└── ...
```

## Development

This project uses:
- ESLint for code linting
- TypeScript for type safety
- Tailwind CSS for styling

## License

TBD
