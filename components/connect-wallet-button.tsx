'use client';

import { Wallet } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { useWeb3 } from '@/components/providers/web3-provider';

/**
 * ConnectWalletButton Component
 *
 * Handles wallet connection functionality for the application.
 * Displays:
 * - "Connect Wallet" button when not connected
 * - Connecting state with spinner during connection
 * - Uses the Web3 provider context for connection logic
 *
 * @returns JSX.Element - The connect wallet button
 */
export function ConnectWalletButton() {
  const { connecting, connectWallet } = useWeb3();

  return (
    <Button
      onClick={connectWallet}
      disabled={connecting}
      aria-label={connecting ? 'Connecting to wallet' : 'Connect your wallet'}
      className="flex items-center gap-2 px-3 sm:px-6 py-1.5 sm:py-2 rounded-none bg-white hover:text-white hover:border-white/50 text-black border-2 sm:border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all duration-200 font-black uppercase tracking-wider text-xs sm:text-sm"
    >
      {connecting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black" />
          <span>Connecting...</span>
        </>
      ) : (
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          <span>Connect Wallet</span>
        </div>
      )}
    </Button>
  );
}
