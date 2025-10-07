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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Locked BZZ */}
      <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
            <span className="text-xl">🔒</span>
          </div>
          <h3 className="text-sm font-medium text-gray-400">Total Locked BZZ</h3>
        </div>
        <p className="text-3xl font-bold text-white mt-2">
          {totalLockedBZZ
            ? parseFloat(formatUnits(totalLockedBZZ as bigint, 16)).toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })
            : "0"}
        </p>
        <p className="text-xs text-gray-500 mt-1">BZZ Tokens Staked</p>
      </div>

      {/* Available USDC */}
      <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
            <span className="text-xl">💵</span>
          </div>
          <h3 className="text-sm font-medium text-gray-400">Available USDC</h3>
        </div>
        <p className="text-3xl font-bold text-white mt-2">
          ${totalUSDC
            ? parseFloat(formatUnits(totalUSDC as bigint, 6)).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : "0.00"}
        </p>
        <p className="text-xs text-gray-500 mt-1">Rewards Available</p>
      </div>

      {/* Total Paid Out */}
      <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <span className="text-xl">📊</span>
          </div>
          <h3 className="text-sm font-medium text-gray-400">Total Rewards Paid</h3>
        </div>
        <p className="text-3xl font-bold text-white mt-2">
          ${totalPaidOut
            ? parseFloat(formatUnits(totalPaidOut as bigint, 6)).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : "0.00"}
        </p>
        <p className="text-xs text-gray-500 mt-1">USDC Distributed</p>
      </div>
    </div>
  );
}

