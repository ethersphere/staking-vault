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
- **Example flow:** A BZZ holder stakes $1k of BZZ → the BZZ is locked → $100 of USDC is paid out instantly
- BZZ may be deposited until 10% the $ value of staked BZZ equals the total USDC amount available
- Any excess USDC not assigned and paid out to a staker that remains in the contract may be withdrawn by the foundation's wallet at any time
- This mechanism operates on a first come, first serve basis

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
- **Blockchain:** Smart contracts for BZZ token staking
- **Wallet Integration:** Web3 wallet connectivity

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

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
