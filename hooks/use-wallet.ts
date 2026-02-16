'use client';

import { useState, useEffect } from 'react';

import { useToast } from '@/components/ui/use-toast';

export function useWallet() {
  const [address, setAddress] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          });
          if (accounts.length > 0) {
            setAddress(accounts[0]);
          }
        } catch (error) {
          console.error('Failed to check wallet connection:', error);
        }
      }
    };

    checkConnection();

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        const account = accounts[0] || '';
        setAddress(account);
        toast({
          title: 'Wallet Connected',
          description: `Connected to ${account.slice(0, 6)}...${account.slice(
            -4
          )}`,
        });
      } else {
        setAddress('');
        toast({
          title: 'Wallet Disconnected',
          description: 'Your wallet has been disconnected',
          variant: 'destructive',
        });
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          'accountsChanged',
          handleAccountsChanged
        );
      }
    };
  }, [toast]);

  const connect = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        setAddress(accounts[0]);
        return accounts[0];
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        throw error;
      }
    } else {
      throw new Error('MetaMask not installed');
    }
  };

  return { address, connect };
}
