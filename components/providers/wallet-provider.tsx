'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

type WalletContextType = {
  address: string;
  connect: () => Promise<string | null>;
  disconnect: () => Promise<void>;
};

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    const onAccountsChanged = (accounts: string[]) => {
      setAddress(accounts[0] ?? '');
    };

    ethereum.on('accountsChanged', onAccountsChanged);
    return () => ethereum.removeListener('accountsChanged', onAccountsChanged);
  }, []);

  const connect = async () => {
  const ethereum = (window as any).ethereum;
  if (!ethereum) {
    toast({
      title: 'Wallet not found',
      description: 'Please install MetaMask',
      variant: 'destructive',
    });
    return null;
  }

  try {
    // 🔒 FORCE explicit user confirmation
    await ethereum.request({
      method: 'wallet_requestPermissions',
      params: [{ eth_accounts: {} }],
    });

    const accounts = await ethereum.request({
      method: 'eth_requestAccounts',
    });

    setAddress(accounts[0]);
    return accounts[0];
  } catch {
    toast({
      title: 'Connection cancelled',
      description: 'Wallet connection was not approved.',
      variant: 'destructive',
    });
    return null;
  }
};


  const disconnect = async () => {
    setAddress('');
    toast({ title: 'Wallet disconnected' });
  };

  return (
    <WalletContext.Provider value={{ address, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error('useWallet must be used inside WalletProvider');
  }
  return ctx;
}
