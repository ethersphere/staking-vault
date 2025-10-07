"use client";

import { useState } from "react";
import { useAccount, useChainId, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { getContractAddresses, LOCK_PERIODS, calculateReward } from "@/lib/contracts/addresses";
import StakingVaultABI from "@/lib/contracts/StakingVaultABI.json";

// ERC20 ABI for approve function
const ERC20_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export function StakingCard() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const addresses = getContractAddresses(chainId);

  const [amount, setAmount] = useState("");
  const [usdValue, setUsdValue] = useState("");
  const [lockPeriod, setLockPeriod] = useState<1 | 2>(1);
  const [step, setStep] = useState<"input" | "approve" | "stake">("input");

  // Approve transaction
  const {
    writeContract: approveWrite,
    data: approveHash,
    isPending: isApprovePending,
  } = useWriteContract();

  const { isLoading: isApproveConfirming } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Stake transaction
  const {
    writeContract: stakeWrite,
    data: stakeHash,
    isPending: isStakePending,
  } = useWriteContract();

  const { isLoading: isStakeConfirming } = useWaitForTransactionReceipt({
    hash: stakeHash,
  });

  // Read BZZ balance
  const { data: bzzBalance } = useReadContract({
    address: addresses.bzzToken,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  // Read BZZ allowance
  const { data: bzzAllowance } = useReadContract({
    address: addresses.bzzToken,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, addresses.stakingVault] : undefined,
  });

  const handleApprove = async () => {
    if (!amount || isNaN(parseFloat(amount))) return;

    try {
      const amountWei = parseUnits(amount, 16); // BZZ has 16 decimals
      approveWrite({
        address: addresses.bzzToken,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [addresses.stakingVault, amountWei],
      });
      setStep("approve");
    } catch (error) {
      console.error("Approve error:", error);
    }
  };

  const handleStake = async () => {
    if (!amount || !usdValue || isNaN(parseFloat(amount)) || isNaN(parseFloat(usdValue)))
      return;

    try {
      const amountWei = parseUnits(amount, 16); // BZZ has 16 decimals
      const usdValueWei = parseUnits(usdValue, 6); // USDC has 6 decimals

      stakeWrite({
        address: addresses.stakingVault,
        abi: StakingVaultABI,
        functionName: "stake",
        args: [amountWei, usdValueWei, lockPeriod],
      });
      setStep("stake");
    } catch (error) {
      console.error("Stake error:", error);
    }
  };

  const expectedReward = () => {
    if (!usdValue || isNaN(parseFloat(usdValue))) return "0";
    const usdValueWei = parseUnits(usdValue, 6);
    const reward = calculateReward(usdValueWei, lockPeriod);
    return formatUnits(reward, 6);
  };

  const needsApproval = () => {
    if (!amount || !bzzAllowance) return true;
    const amountWei = parseUnits(amount, 16);
    return (bzzAllowance as bigint) < amountWei;
  };

  if (!isConnected) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Stake BZZ</h2>
        <p className="text-gray-400 mb-6">Connect your wallet to start staking</p>
        <div className="text-center py-12">
          <span className="text-6xl">🔌</span>
          <p className="text-gray-500 mt-4">Please connect your wallet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Stake BZZ Tokens</h2>

      {/* Amount Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Amount (BZZ)
        </label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            {bzzBalance
              ? `Balance: ${parseFloat(formatUnits(bzzBalance as bigint, 16)).toFixed(2)}`
              : "0.00"}
          </div>
        </div>
      </div>

      {/* USD Value Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          BZZ Value in USD
        </label>
        <input
          type="number"
          value={usdValue}
          onChange={(e) => setUsdValue(e.target.value)}
          placeholder="0.00"
          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
        />
        <p className="text-xs text-gray-500 mt-2">
          Enter the current USD value of your BZZ amount
        </p>
      </div>

      {/* Lock Period Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Lock Period
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setLockPeriod(1)}
            className={`p-4 rounded-lg border-2 transition-all ${
              lockPeriod === 1
                ? "border-orange-500 bg-orange-500/10"
                : "border-gray-600 bg-gray-900 hover:border-gray-500"
            }`}
          >
            <div className="text-lg font-bold text-white">1 Year</div>
            <div className="text-sm text-gray-400">5% Reward</div>
          </button>
          <button
            onClick={() => setLockPeriod(2)}
            className={`p-4 rounded-lg border-2 transition-all ${
              lockPeriod === 2
                ? "border-orange-500 bg-orange-500/10"
                : "border-gray-600 bg-gray-900 hover:border-gray-500"
            }`}
          >
            <div className="text-lg font-bold text-white">2 Years</div>
            <div className="text-sm text-gray-400">10% Reward</div>
          </button>
        </div>
      </div>

      {/* Expected Reward */}
      {usdValue && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Expected USDC Reward:</span>
            <span className="text-xl font-bold text-green-400">
              ${parseFloat(expectedReward()).toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Paid instantly upon staking
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {needsApproval() ? (
          <button
            onClick={handleApprove}
            disabled={!amount || isApprovePending || isApproveConfirming}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {isApprovePending || isApproveConfirming
              ? "Approving..."
              : "Approve BZZ"}
          </button>
        ) : (
          <button
            onClick={handleStake}
            disabled={!amount || !usdValue || isStakePending || isStakeConfirming}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {isStakePending || isStakeConfirming ? "Staking..." : "Stake BZZ"}
          </button>
        )}
      </div>

      {/* Status Messages */}
      {approveHash && step === "approve" && (
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-400">
          {isApproveConfirming ? "Confirming approval..." : "Approval confirmed! You can now stake."}
        </div>
      )}
      {stakeHash && step === "stake" && (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-400">
          {isStakeConfirming ? "Confirming stake..." : "Staking successful! Your USDC reward has been sent."}
        </div>
      )}
    </div>
  );
}

