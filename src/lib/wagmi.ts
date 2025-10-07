import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { gnosis, sepolia, mainnet } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Staking Vault",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [gnosis, sepolia, mainnet],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

