'use client';
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
import { ethers } from 'ethers';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { base } from 'viem/chains';

import { useToast } from '@/components/ui/use-toast';
import { uploadToIPFS, getIPFSUrl, getIPFSFallbackUrls } from '@/utils/ipfs';

// Import Coinbase AgentKit and related modules
// Removed problematic import for OnchainKit due to linter errors
// Import Coinbase Wallet SDK

// Constants for Monad (placeholder values - commented out)
// const MONAD_CHAIN_ID = "0x1"; // Replace with actual Monad chain ID
// const MONAD_RPC_URL = "https://monad-rpc-url.com"; // Replace with actual Monad RPC URL

// Constants for Base network
const BASE_CHAIN_ID = base.id;
const BASE_RPC_URL =
  process.env.NEXT_PUBLIC_COINBASE_MAINNET_RPC_ENDPOINT ||
  'https://mainnet.base.org';

// Initialize Coinbase Wallet SDK with environment variables
const sdk = new CoinbaseWalletSDK({
  appName: 'GroqTales',
  appChainIds: [BASE_CHAIN_ID],
});

// Make web3 provider
const coinbaseProvider = sdk.makeWeb3Provider();

// Types
interface NFT {
  id: string;
  tokenId: string;
  title: string;
  description: string;
  price: string;
  seller: string;
  owner: string;
  image: string;
  metadata: any;
  status: 'listed' | 'unlisted' | 'sold';
}

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
    metadata: {
      content: string;
      [key: string]: any;
    };
    ipfsHash: string;
    tokenURI: string;
    fallbackUrls: string[];
  }>;
  buyNFTOnBase: (
    tokenId: string,
    price: string
  ) => Promise<{ transactionHash: string; tokenId: string }>;
  sellNFTOnBase: (
    tokenId: string,
    price: string
  ) => Promise<{ transactionHash: string }>;
  getNFTListings: () => Promise<NFT[]>;
}

// Create context with default values
const Web3Context = createContext<Web3ContextType>({
  account: null,
  chainId: null,
  balance: null,
  connected: false,
  connecting: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  networkName: '',
  ensName: null,
  switchNetwork: async () => {},
  mintNFTOnBase: async () => ({
    tokenId: '',
    transactionHash: '',
    metadata: { content: '' },
    ipfsHash: '',
    tokenURI: '',
    fallbackUrls: [],
  }),
  buyNFTOnBase: async () => ({ transactionHash: '', tokenId: '' }),
  sellNFTOnBase: async () => ({ transactionHash: '' }),
  getNFTListings: async () => [],
});

// Networks mapping
const NETWORKS: Record<number, string> = {
  1: 'Ethereum',
  137: 'Polygon',
  56: 'BNB Chain',
  42161: 'Arbitrum',
  10: 'Optimism',
  43114: 'Avalanche',
};

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [ensName, setEnsName] = useState<string | null>(null);

  // Get the network name based on chainId
  const networkName =
    chainId && NETWORKS[chainId] ? NETWORKS[chainId] : 'Unknown Network';

  // Function to disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setChainId(null);
    setBalance(null);
    setConnected(false);
    setEnsName(null);
    localStorage.removeItem('walletConnected');

    toast({
      title: 'Wallet Disconnected',
      description: 'Your wallet has been disconnected successfully',
    });
  };

  // Function to switch network
  const switchNetwork = async (targetChainId: number) => {
    if (!window.ethereum) {
      toast({
        title: 'No Wallet Found',
        description: 'Please install MetaMask or another Web3 wallet',
        variant: 'destructive',
      });
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (error: any) {
      toast({
        title: 'Network Switch Failed',
        description: error.message || 'Failed to switch network',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Function to mint NFT on Base
  const mintNFTOnBase = async (metadata: any, recipient?: string) => {
    try {
      // Mock implementation for demo
      const tokenId = Math.floor(Math.random() * 10000).toString();
      const transactionHash = `0x${Math.random().toString(16).substring(2)}`;

      return {
        tokenId,
        transactionHash,
        metadata: { content: metadata.content || '', ...metadata },
        ipfsHash: 'QmExample',
        tokenURI: 'https://ipfs.io/ipfs/QmExample',
        fallbackUrls: ['https://gateway.pinata.cloud/ipfs/QmExample'],
      };
    } catch (error: any) {
      toast({
        title: 'Minting Failed',
        description: error.message || 'Failed to mint NFT',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Function to buy NFT on Base
  const buyNFTOnBase = async (tokenId: string, price: string) => {
    try {
      // Mock implementation for demo
      const transactionHash = `0x${Math.random().toString(16).substring(2)}`;

      toast({
        title: 'Purchase Successful',
        description: `NFT #${tokenId} purchased for ${price} ETH`,
      });

      return { transactionHash, tokenId };
    } catch (error: any) {
      toast({
        title: 'Purchase Failed',
        description: error.message || 'Failed to purchase NFT',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Function to sell NFT on Base
  const sellNFTOnBase = async (tokenId: string, price: string) => {
    try {
      // Mock implementation for demo
      const transactionHash = `0x${Math.random().toString(16).substring(2)}`;

      toast({
        title: 'Listed for Sale',
        description: `NFT #${tokenId} listed for ${price} ETH`,
      });

      return { transactionHash };
    } catch (error: any) {
      toast({
        title: 'Listing Failed',
        description: error.message || 'Failed to list NFT for sale',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Function to get NFT listings
  const getNFTListings = async (): Promise<NFT[]> => {
    try {
      // Mock NFT data for demo
      const mockNFTs: NFT[] = Array.from({ length: 10 }, (_, i) => ({
        id: `nft-${i + 1}`,
        tokenId: (i + 1).toString(),
        title: `GroqTales NFT #${i + 1}`,
        description: `A unique digital story created with AI technology`,
        price: (Math.random() * 5 + 0.1).toFixed(2),
        seller: `0x${Math.random().toString(16).substring(2, 42)}`,
        owner: `0x${Math.random().toString(16).substring(2, 42)}`,
        image: `https://picsum.photos/400/400?random=${i + 1}`,
        status:
          Math.random() > 0.3
            ? 'listed'
            : Math.random() > 0.5
              ? 'unlisted'
              : 'sold',
        metadata: {
          attributes: [
            {
              trait_type: 'Type',
              value: Math.random() > 0.5 ? 'Comic' : 'Text',
            },
            {
              trait_type: 'Rarity',
              value: ['Common', 'Uncommon', 'Rare', 'Legendary'][
                Math.floor(Math.random() * 4)
              ],
            },
          ],
        },
      }));

      return mockNFTs;
    } catch (error: any) {
      toast({
        title: 'Failed to Load NFTs',
        description: error.message || 'Failed to fetch NFT listings',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Function to connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      toast({
        title: 'No Wallet Found',
        description:
          'Please install MetaMask or another Web3 wallet to continue',
        variant: 'destructive',
      });
      return;
    }

    try {
      setConnecting(true);
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      const chainIdHex = await window.ethereum.request({
        method: 'eth_chainId',
      });
      const chainIdNum = parseInt(chainIdHex, 16);

      if (accounts && accounts[0]) {
        // Get account balance
        const balanceHex = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [accounts[0], 'latest'],
        });
        const balanceWei = parseInt(balanceHex, 16);
        const balanceEth = (balanceWei / 1e18).toFixed(4);

        // Check for ENS name on Ethereum mainnet
        let name = null;
        if (chainIdNum === 1) {
          try {
            // This is a mock for demonstration - in production you'd use an actual ENS lookup
            if (accounts[0].toLowerCase().includes('0x')) {
              name = null; // Would lookup actual ENS name here
            }
          } catch (error) {
            console.error('ENS lookup failed:', error);
          }
        }

        setAccount(accounts[0]);
        setChainId(chainIdNum);
        setBalance(balanceEth);
        setConnected(true);
        setEnsName(name);
        localStorage.setItem('walletConnected', 'true');

        toast({
          title: 'Wallet Connected',
          description: `Connected to ${accounts[0].substring(
            0,
            6
          )}...${accounts[0].substring(38)}`,
        });
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to connect wallet',
        variant: 'destructive',
      });
    } finally {
      setConnecting(false);
    }
  };

  // Check for existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (
        window.ethereum &&
        localStorage.getItem('walletConnected') === 'true'
      ) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          });
          if (accounts && accounts.length > 0) {
            connectWallet();
          }
        } catch (error) {
          console.error('Error checking connection:', error);
        }
      }
    };
    checkConnection();
  }, []);

  // Set up event listeners for wallet events
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected their wallet
        disconnectWallet();
      } else if (accounts[0] !== account) {
        // User switched accounts
        connectWallet();
      }
    };

    const handleChainChanged = () => {
      // When chain changes, we need to reload the page to get fresh state
      window.location.reload();
    };

    const handleDisconnect = () => {
      disconnectWallet();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          'accountsChanged',
          handleAccountsChanged
        );
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, [account]);

  // Mock data for demo purposes
  useEffect(() => {
    // If no real wallet is connected, use mock data after a delay
    if (!window.ethereum && !connected) {
      const timer = setTimeout(() => {
        const mockAccount = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045';
        setAccount(mockAccount);
        setChainId(1); // Ethereum Mainnet
        setBalance('2.5432');
        setConnected(true);
        setEnsName('groq.eth');
      }, 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [connected]);

  const value = {
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
    buyNFTOnBase,
    sellNFTOnBase,
    getNFTListings,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export const useWeb3 = () => useContext(Web3Context);
