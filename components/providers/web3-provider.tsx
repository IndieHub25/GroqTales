'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { X, Download } from 'lucide-react';

interface Web3ContextType {
  account: string | null;
  chainId: number | null;
  balance: string | null;
  connected: boolean;
  connecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  networkName: string;
  ensName: string | null;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [networkName, setNetworkName] = useState('Unknown');
  const [ensName, setEnsName] = useState<string | null>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);

  // helper to get ethereum safely with type casting
  const getEthereum = useCallback(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      return (window as any).ethereum;
    }
    return null;
  }, []);

  const disconnectWallet = useCallback(async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/settings/wallet`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch (err) {
      console.error("Failed to disconnect wallet on server:", err);
    }
    setAccount(null);
    setChainId(null);
    setBalance(null);
    setConnected(false);
  }, []);

  useEffect(() => {
    const ethereum = getEthereum();
    if (!ethereum) return;

    const handleAccountsChanged = async (accounts: string[]) => {
      if (!accounts || accounts.length === 0) {
        disconnectWallet();
        return;
      }

      const selectedAccount = accounts[0];
      if (!selectedAccount) return;

      setAccount(selectedAccount);
      setConnected(true);

      try {
        const balanceWei = await ethereum.request({
          method: "eth_getBalance",
          params: [selectedAccount, "latest"],
        });
        const balanceEth = Number(BigInt(balanceWei)) / 1e18;
        setBalance(balanceEth.toFixed(4));
      } catch (err) {
        console.error("Failed to refresh balance:", err);
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      setChainId(parseInt(chainIdHex, 16));
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [getEthereum, disconnectWallet]);

  const connectWallet = async () => {
    const ethereum = getEthereum();
    if (!ethereum) {
      setShowInstallModal(true);
      return;
    }

    try {
      const accounts: string[] = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      if (!accounts || accounts.length === 0) return;

      const selectedAccount = accounts[0];

      const chainIdHex = await ethereum.request({
        method: 'eth_chainId',
      });

      const balanceWei = await ethereum.request({
        method: 'eth_getBalance',
        params: [selectedAccount, "latest"],
      });

      const balanceEth = Number(BigInt(balanceWei)) / 1e18;

      setAccount(selectedAccount);
      setChainId(parseInt(chainIdHex, 16));
      setBalance(balanceEth.toFixed(4));
      setConnected(true);

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/settings/wallet`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ address: selectedAccount }),
      });
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  const contextValue: Web3ContextType = {
    account,
    chainId,
    balance,
    connected,
    connecting,
    connectWallet,
    disconnectWallet,
    networkName,
    ensName,
  };

  return (
    <Web3Context.Provider value={contextValue}>
      {children}

      {showInstallModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border-2 border-black dark:border-white rounded-xl shadow-lg max-w-sm w-full p-6 relative">
            <button
              onClick={() => setShowInstallModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Download className="w-6 h-6 text-orange-600" />
              </div>

              <h3 className="text-xl font-bold dark:text-white">
                Install MetaMask
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                You need a crypto wallet to log in.
              </p>

              <a
                href="https://metamask.io/download"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowInstallModal(false)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
              >
                Download Extension
              </a>
            </div>
          </div>
        </div>
      )}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within Web3Provider");
  }
  return context;
}