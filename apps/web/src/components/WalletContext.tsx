"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  chainId: number;
  balanceCred: number;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchAccount: (addr: string) => void;
  claimFaucet: () => Promise<boolean>;
  isClaiming: boolean;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  isConnected: false,
  chainId: 84532,
  balanceCred: 1000,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  switchAccount: () => {},
  claimFaucet: async () => false,
  isClaiming: false,
});

export const DEMO_OPERATOR_ACCOUNTS = [
  { label: "Operator Alpha (Deployer)", address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" },
  { label: "ResearchBot Operator", address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" },
  { label: "Trading Agent Operator", address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65" },
];

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [balanceCred, setBalanceCred] = useState<number>(2500);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);

  useEffect(() => {
    // Check localStorage for persisted wallet
    const saved = localStorage.getItem("cerdagent_connected_address");
    if (saved) {
      setAddress(saved);
    }
  }, []);

  const connectWallet = async () => {
    // Check if window.ethereum exists
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts && accounts.length > 0) {
          setAddress(accounts[0]);
          localStorage.setItem("cerdagent_connected_address", accounts[0]);
          return;
        }
      } catch (err) {
        console.warn("Browser wallet connection rejected or cancelled, falling back to demo account:", err);
      }
    }

    // Default to Primary Operator address for immediate testing
    const defaultAddr = DEMO_OPERATOR_ACCOUNTS[0].address;
    setAddress(defaultAddr);
    localStorage.setItem("cerdagent_connected_address", defaultAddr);
  };

  const disconnectWallet = () => {
    setAddress(null);
    localStorage.removeItem("cerdagent_connected_address");
  };

  const switchAccount = (addr: string) => {
    setAddress(addr);
    localStorage.setItem("cerdagent_connected_address", addr);
  };

  const claimFaucet = async (): Promise<boolean> => {
    if (!address) return false;
    setIsClaiming(true);
    try {
      const res = await fetch("/api/faucet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientAddress: address }),
      });
      if (res.ok) {
        setBalanceCred((prev) => prev + 1000);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected: !!address,
        chainId: 84532,
        balanceCred,
        connectWallet,
        disconnectWallet,
        switchAccount,
        claimFaucet,
        isClaiming,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
