export const CONTRACT_ADDRESSES = {
  credToken: process.env.NEXT_PUBLIC_CRED_TOKEN_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  agentIdentity: process.env.NEXT_PUBLIC_AGENT_IDENTITY_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  reputationRegistry: process.env.NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS || "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  agentStaking: process.env.NEXT_PUBLIC_AGENT_STAKING_ADDRESS || "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
  transactionRegistry: process.env.NEXT_PUBLIC_TRANSACTION_REGISTRY_ADDRESS || "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
  taskVerification: process.env.NEXT_PUBLIC_TASK_VERIFICATION_ADDRESS || "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
  disputeResolution: process.env.NEXT_PUBLIC_DISPUTE_RESOLUTION_ADDRESS || "0x0165878A594ca255338adfa4d48449f69242Eb8F",
};

export const BASE_SEPOLIA_CONFIG = {
  id: 84532,
  name: "Base Sepolia",
  network: "base-sepolia",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.base.org"] },
    public: { http: [process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.base.org"] },
  },
  blockExplorers: {
    default: { name: "Basescan", url: "https://sepolia.basescan.org" },
  },
  testnet: true,
};
