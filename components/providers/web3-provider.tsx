'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';
// Mock Web3 Provider for production deployment
interface Web3ContextType {
  account: string | null;
  chainId: number | null;
  balance: string | null;
  connected: boolean;
  connecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  networkName: string;
  ensName: string | null;
  switchNetwork: (chainId: number) => Promise<void>;
  mintNFTOnBase: (
    metadata: any,
    recipient?: string
  ) => Promise<{
    tokenId: string;
    transactionHash: string;
  }>;
  mintNFTOnMonad: (
    metadata: any,
    recipient?: string
  ) => Promise<{
    tokenId: string;
    transactionHash: string;
  }>;
  transferNFT: (tokenId: string, to: string) => Promise<string>;
  getUserNFTs: () => Promise<any[]>;
  getMarketplaceNFTs: () => Promise<any[]>;
  sellNFT: (tokenId: string, price: string) => Promise<void>;
  buyNFT: (tokenId: string, price: string) => Promise<void>;
  cancelListing: (tokenId: string) => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

// Fallback (no-op) implementation used during static generation / SSR when the
// provider tree isn't mounted (e.g. export builds on platforms that prerender
// pages without executing RootLayout providers). This prevents build-time
// crashes like: "TypeError: Cannot read properties of null (reading 'useContext')".
// All methods either resolve immediately or throw a clear disabled message.
const fallbackWeb3Context: Web3ContextType = {
  account: null,
  chainId: null,
  balance: null,
  connected: false,
  connecting: false,
  networkName: 'Unknown',
  ensName: null,
  connectWallet: async () => {
    /* no-op during SSR */
  },
  disconnectWallet: () => {
    /* no-op */
  },
  switchNetwork: async () => {
    /* no-op */
  },
  mintNFTOnBase: async () => {
    throw new Error('Web3 functionality unavailable during prerender');
  },
  mintNFTOnMonad: async () => {
    throw new Error('Web3 functionality unavailable during prerender');
  },
  transferNFT: async () => {
    throw new Error('Web3 functionality unavailable during prerender');
  },
  getUserNFTs: async () => [],
  getMarketplaceNFTs: async () => [],
  sellNFT: async () => {
    throw new Error('Web3 functionality unavailable during prerender');
  },
  buyNFT: async () => {
    throw new Error('Web3 functionality unavailable during prerender');
  },
  cancelListing: async () => {
    throw new Error('Web3 functionality unavailable during prerender');
  },
};

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [networkName, setNetworkName] = useState('Unknown');
  const [ensName, setEnsName] = useState<string | null>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const handleAccounts = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]!);
          setConnected(true);
        } else {
          setAccount(null);
          setConnected(false);
        }
      };
      const handleChain = (chainIdHex: string) => {
        setChainId(parseInt(chainIdHex, 16));
      };
      (window as any).ethereum.on('accountsChanged', handleAccounts);
      (window as any).ethereum.on('chainChanged', handleChain);
      return () => {
        (window as any).ethereum.removeListener('accountsChanged', handleAccounts);
        (window as any).ethereum.removeListener('chainChanged', handleChain);
      };
    }
    return;
  }, []);

  useEffect(() => {
    if (chainId === 10143) setNetworkName('Monad Testnet');
    else if (chainId === 1) setNetworkName('Ethereum Mainnet');
    else if (chainId) setNetworkName(`Chain ID: ${chainId}`);
    else setNetworkName('Unknown');
  }, [chainId]);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      setConnecting(true);
      try {
        const accounts = await (window as any).ethereum.request({
          method: 'eth_requestAccounts',
        });
        const chainIdHex = await (window as any).ethereum.request({
          method: 'eth_chainId',
        });
        setAccount(accounts[0]);
        setChainId(parseInt(chainIdHex, 16));
        setConnected(true);
      } catch (error) {
        console.error('Wallet connection failed:', error);
      } finally {
        setConnecting(false);
      }
    } else {
      setShowInstallModal(true);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setChainId(null);
    setBalance(null);
    setConnected(false);
    setNetworkName('Unknown');
    setEnsName(null);
  };

  const switchNetwork = async (targetChainId: number) => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        await (window as any).ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${targetChainId.toString(16)}` }],
        });
      } catch (error) {
        console.error('Failed to switch network:', error);
      }
    }
  };

  const mintNFTOnBase = async (metadata: any, recipient?: string) => {
    console.log('Mock mintNFTOnBase - Web3 functionality disabled');
    throw new Error('Web3 functionality is disabled in this build');
  };

  const mintNFTOnMonad = async (metadata: any, recipient?: string) => {
    console.log('Mock mintNFTOnMonad - Web3 functionality disabled');
    throw new Error('Web3 functionality is disabled in this build');
  };

  const transferNFT = async (tokenId: string, to: string) => {
    console.log('Mock transferNFT - Web3 functionality disabled');
    throw new Error('Web3 functionality is disabled in this build');
  };

  const getUserNFTs = async () => {
    console.log('Mock getUserNFTs - Web3 functionality disabled');
    return [];
  };

  const getMarketplaceNFTs = async () => {
    console.log('Mock getMarketplaceNFTs - Web3 functionality disabled');
    return [];
  };

  const sellNFT = async (tokenId: string, price: string) => {
    console.log('Mock sellNFT - Web3 functionality disabled');
    throw new Error('Web3 functionality is disabled in this build');
  };

  const buyNFT = async (tokenId: string, price: string) => {
    console.log('Mock buyNFT - Web3 functionality disabled');
    throw new Error('Web3 functionality is disabled in this build');
  };

  const cancelListing = async (tokenId: string) => {
    console.log('Mock cancelListing - Web3 functionality disabled');
    throw new Error('Web3 functionality is disabled in this build');
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
    switchNetwork,
    mintNFTOnBase,
    mintNFTOnMonad,
    transferNFT,
    getUserNFTs,
    getMarketplaceNFTs,
    sellNFT,
    buyNFT,
    cancelListing,
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
              
              <h3 className="text-xl font-bold dark:text-white">Install MetaMask</h3>
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
  // Return a safe fallback instead of throwing to keep build / prerender alive.
  return context ?? fallbackWeb3Context;
}
