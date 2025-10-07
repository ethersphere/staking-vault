"use client";

import { useAccount, useChainId, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { getContractAddresses, LOCK_PERIODS } from "@/lib/contracts/addresses";
import { formatUnits } from "viem";
import StakingVaultABI from "@/lib/contracts/StakingVaultABI.json";

interface Stake {
  bzzAmount: bigint;
  usdcReward: bigint;
  unlockTime: bigint;
  withdrawn: boolean;
}

export function UserStakes() {
  const { address } = useAccount();
  const chainId = useChainId();
  const addresses = getContractAddresses(chainId);

  // Read user stakes
  const { data: userStakes, refetch } = useReadContract({
    address: addresses.stakingVault,
    abi: StakingVaultABI,
    functionName: "getUserStakes",
    args: address ? [address] : undefined,
  });

  // Withdraw transaction
  const {
    writeContract: withdrawWrite,
    data: withdrawHash,
    isPending: isWithdrawPending,
  } = useWriteContract();

  const { isLoading: isWithdrawConfirming } = useWaitForTransactionReceipt({
    hash: withdrawHash,
    onSuccess: () => {
      refetch();
    },
  });

  const handleWithdraw = (stakeIndex: number) => {
    try {
      withdrawWrite({
        address: addresses.stakingVault,
        abi: StakingVaultABI,
        functionName: "withdraw",
        args: [stakeIndex],
      });
    } catch (error) {
      console.error("Withdraw error:", error);
    }
  };

  const isUnlocked = (unlockTime: bigint) => {
    return BigInt(Math.floor(Date.now() / 1000)) >= unlockTime;
  };

  const formatTimeRemaining = (unlockTime: bigint) => {
    const now = BigInt(Math.floor(Date.now() / 1000));
    if (now >= unlockTime) return "Unlocked";

    const diff = Number(unlockTime - now);
    const days = Math.floor(diff / (24 * 60 * 60));
    const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const stakes = (userStakes as Stake[]) || [];

  if (stakes.length === 0) {
    return (
      <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Your Stakes</h2>
        <div className="text-center py-12">
          <span className="text-6xl">📊</span>
          <p className="text-gray-500 mt-4">No stakes yet</p>
          <p className="text-gray-600 text-sm mt-2">
            Stake BZZ tokens to see your positions here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Your Stakes</h2>

      <div className="space-y-4">
        {stakes.map((stake, index) => (
          <div
            key={index}
            className={`p-5 rounded-lg border-2 transition-all ${
              stake.withdrawn
                ? "border-gray-800 bg-gray-900/50 opacity-60"
                : isUnlocked(stake.unlockTime)
                ? "border-green-500/30 bg-green-500/5"
                : "border-orange-500/30 bg-orange-500/5"
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-400">
                    Stake #{index + 1}
                  </span>
                  {stake.withdrawn ? (
                    <span className="px-2 py-0.5 bg-gray-700 text-gray-400 text-xs rounded-full">
                      Withdrawn
                    </span>
                  ) : isUnlocked(stake.unlockTime) ? (
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                      Ready
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                      Locked
                    </span>
                  )}
                </div>
                <div className="text-2xl font-bold text-white">
                  {parseFloat(formatUnits(stake.bzzAmount, 16)).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                  })}{" "}
                  BZZ
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400 mb-1">Reward Earned</div>
                <div className="text-lg font-semibold text-green-400">
                  ${parseFloat(formatUnits(stake.usdcReward, 6)).toFixed(2)}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-800">
              <div>
                <div className="text-xs text-gray-500 mb-1">Unlock Date</div>
                <div className="text-sm font-medium text-gray-300">
                  {formatDate(stake.unlockTime)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatTimeRemaining(stake.unlockTime)}
                </div>
              </div>

              {!stake.withdrawn && isUnlocked(stake.unlockTime) && (
                <button
                  onClick={() => handleWithdraw(index)}
                  disabled={isWithdrawPending || isWithdrawConfirming}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                  {isWithdrawPending || isWithdrawConfirming
                    ? "Withdrawing..."
                    : "Withdraw"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {withdrawHash && (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-400">
          {isWithdrawConfirming
            ? "Confirming withdrawal..."
            : "Withdrawal successful! Your BZZ tokens have been returned."}
        </div>
      )}
    </div>
  );
}

