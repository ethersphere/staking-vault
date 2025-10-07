"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { StakingCard } from "@/components/StakingCard";
import { DashboardStats } from "@/components/DashboardStats";
import { UserStakes } from "@/components/UserStakes";

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <main className="min-h-screen bg-black">
      {/* Background gradient shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-500/20 to-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-20 w-60 h-60 bg-gradient-to-br from-purple-500/20 to-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-500/20 to-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-gray-800 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Swarm hexagonal logo */}
              <div className="w-8 h-8 bg-orange-500 rounded-sm flex items-center justify-center transform rotate-45">
                <div className="w-4 h-4 bg-white rounded-sm transform -rotate-45"></div>
              </div>
              <span className="text-xl font-medium text-orange-500">swarm</span>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">BZZ Staking Vault</h1>
          <p className="text-gray-400">Stake BZZ tokens and earn instant USDC rewards</p>
        </div>

        {/* Dashboard Stats */}
        <DashboardStats />

        {/* Main Staking Interface */}
        <div className="mt-8 max-w-4xl mx-auto">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 relative">
            {/* BETA Tag */}
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
                BETA
              </span>
            </div>

            {/* Tabs */}
            <div className="flex gap-8 mb-8 border-b border-gray-800">
              <button className="pb-4 text-white font-medium border-b-2 border-orange-500">
                Stake
              </button>
              <button className="pb-4 text-gray-400 hover:text-white transition-colors">
                History
              </button>
            </div>

            {/* Staking Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Staking Card */}
              <StakingCard />

              {/* User Stakes */}
              {isConnected && <UserStakes />}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  How it works
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  <span className="text-orange-500">Beeport</span> is the web2 rails for{" "}
                  <span className="text-orange-500">Swarm</span>, making it quick and simple to stake BZZ tokens and earn USDC rewards without running a node.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Important Notice
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  This app is currently in <span className="text-orange-500">beta</span>, and some features may be unstable. For critical or large-scale use, we recommend running your own Bee node.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-20 border-t border-gray-800 bg-black/50">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © 2025 Swarm Foundation. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a
                href="https://ethswarm.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-orange-500 transition-colors text-sm"
              >
                Swarm
              </a>
              <a
                href="https://docs.ethswarm.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-orange-500 transition-colors text-sm"
              >
                Docs
              </a>
              <a
                href="https://github.com/ethersphere"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-orange-500 transition-colors text-sm"
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
