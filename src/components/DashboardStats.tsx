"use client";

import { useReadContract, useChainId } from "wagmi";
import { getContractAddresses } from "@/lib/contracts/addresses";
import { formatUnits } from "viem";
import StakingVaultABI from "@/lib/contracts/StakingVaultABI.json";

export function DashboardStats() {
  const chainId = useChainId();
  const addresses = getContractAddresses(chainId);

  // Read total locked BZZ
  const { data: totalLockedBZZ } = useReadContract({
    address: addresses.stakingVault,
    abi: StakingVaultABI,
    functionName: "totalLockedBZZ",
  });

  // Read total USDC in vault
  const { data: totalUSDC } = useReadContract({
    address: addresses.stakingVault,
    abi: StakingVaultABI,
    functionName: "getTotalUSDC",
  });

  // Read total USDC paid out
  const { data: totalPaidOut } = useReadContract({
    address: addresses.stakingVault,
    abi: StakingVaultABI,
    functionName: "totalUSDCPaidOut",
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      {/* Total Locked BZZ */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
            <span className="text-lg">🔒</span>
          </div>
          <h3 className="text-sm font-medium text-gray-400">Total Locked BZZ</h3>
        </div>
        <p className="text-2xl font-bold text-white mb-1">
          {totalLockedBZZ
            ? parseFloat(formatUnits(totalLockedBZZ as bigint, 16)).toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })
            : "0"}
        </p>
        <p className="text-xs text-gray-500">BZZ Tokens Staked</p>
      </div>

      {/* Available USDC */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
            <span className="text-lg">💵</span>
          </div>
          <h3 className="text-sm font-medium text-gray-400">Available USDC</h3>
        </div>
        <p className="text-2xl font-bold text-white mb-1">
          ${totalUSDC
            ? parseFloat(formatUnits(totalUSDC as bigint, 6)).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : "0.00"}
        </p>
        <p className="text-xs text-gray-500">Rewards Available</p>
      </div>

      {/* Total Paid Out */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <span className="text-lg">📊</span>
          </div>
          <h3 className="text-sm font-medium text-gray-400">Total Rewards Paid</h3>
        </div>
        <p className="text-2xl font-bold text-white mb-1">
          ${totalPaidOut
            ? parseFloat(formatUnits(totalPaidOut as bigint, 6)).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : "0.00"}
        </p>
        <p className="text-xs text-gray-500">USDC Distributed</p>
      </div>
    </div>
  );
}

