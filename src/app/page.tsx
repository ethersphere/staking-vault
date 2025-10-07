"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { StakingCard } from "@/components/StakingCard";
import { DashboardStats } from "@/components/DashboardStats";
import { UserStakes } from "@/components/UserStakes";

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold">🐝</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  BZZ Staking Vault
                </h1>
                <p className="text-sm text-gray-400">
                  Stake BZZ, Earn USDC Instantly
                </p>
              </div>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Stats */}
        <DashboardStats />

        {/* Staking Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Staking Card */}
          <StakingCard />

          {/* User Stakes */}
          {isConnected && <UserStakes />}
        </div>

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Secure Locking
            </h3>
            <p className="text-gray-400 text-sm">
              Your BZZ tokens are locked in a secure smart contract for 1 or 2
              years
            </p>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Instant Rewards
            </h3>
            <p className="text-gray-400 text-sm">
              Receive 5% (1 year) or 10% (2 years) in USDC immediately upon
              staking
            </p>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">⏱️</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              First Come First Serve
            </h3>
            <p className="text-gray-400 text-sm">
              Stake while USDC rewards are available in the vault
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 border-t border-gray-700 bg-gray-900/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © 2025 Swarm Foundation. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a
                href="https://ethswarm.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-orange-500 transition-colors text-sm"
              >
                Swarm
              </a>
              <a
                href="https://docs.ethswarm.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-orange-500 transition-colors text-sm"
              >
                Docs
              </a>
              <a
                href="https://github.com/ethersphere"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-orange-500 transition-colors text-sm"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
