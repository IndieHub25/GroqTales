'use client';

import { motion } from 'framer-motion';
import {
  Wallet,
  ChevronDown,
  Copy,
  ExternalLink,
  Coins,
  AlertCircle,
  Check,
} from 'lucide-react';
import Image from 'next/image';
import React, { useState, useCallback } from 'react';

import { useWeb3 } from '@/components/providers/web3-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useToast } from '@/components/ui/use-toast';
import { truncateAddress } from '@/lib/utils';

/**
 * WalletConnect Component
 *
 * A comprehensive wallet connection component that provides:
 * - Wallet connection/disconnection functionality
 * - Account display with ENS support
 * - Network information and switching
 * - Balance display
 * - Address copying and blockchain explorer links
 * - Responsive design with tooltips and animations
 *
 * @returns JSX.Element - The wallet connection component
 */
export default function WalletConnect() {
  const {
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
  } = useWeb3();

  const { toast } = useToast();
  const [showDropdown, setShowDropdown] = useState(false);
  const [copyTooltip, setCopyTooltip] = useState('Click to copy');


  /**
   * Copies wallet address to clipboard
   */
  const copyAddressToClipboard = useCallback(async () => {
    if (!account) return;

    try {
      await navigator.clipboard.writeText(account);
      setCopyTooltip('Copied!');
      toast({
        title: 'Address Copied',
        description: 'Wallet address copied to clipboard',
      });

      setTimeout(() => setCopyTooltip('Click to copy'), 2000);
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy address to clipboard',
        variant: 'destructive',
      });
    }
  }, [account, toast]);

  /**
   * Opens blockchain explorer for the connected account
   */
  const viewOnExplorer = useCallback(() => {
    if (!account || !chainId) return;

    const explorerUrls: Record<number, string> = {
      1: 'https://etherscan.io',
      137: 'https://polygonscan.com',
      8453: 'https://basescan.org',
      42161: 'https://arbiscan.io',
      10: 'https://optimistic.etherscan.io',
    };

    const explorerUrl = explorerUrls[chainId] || 'https://etherscan.io';
    window.open(`${explorerUrl}/address/${account}`, '_blank');
  }, [account, chainId]);

  // Show connect button if not connected
  if (!connected) {
    return (
      <Button
        onClick={connectWallet}
        disabled={connecting}
        className="flex items-center gap-2 px-3 sm:px-6 py-1.5 sm:py-2 rounded-none bg-white text-black border-2 sm:border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all duration-200 font-black uppercase tracking-wider text-xs sm:text-sm"
      >
        {connecting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black" />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <Wallet className="h-5 w-5" />
            <span>Connect Wallet</span>
          </>
        )}
      </Button>
    );
  }

  return (
    <DropdownMenu open={showDropdown} onOpenChange={setShowDropdown}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span>{ensName || truncateAddress(account)}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-0 overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white dark:bg-slate-900">
        {/* Account Info */}
        <div className="px-4 py-3 border-b-4 border-black bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="border-4 border-black p-0.5 bg-white shrink-0">
              <Avatar className="h-10 w-10 rounded-none">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/identicon/svg?seed=${account}`}
                />
                <AvatarFallback className="rounded-none bg-black text-white font-black text-sm">
                  {account?.slice(2, 4).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black uppercase truncate tracking-tight text-black dark:text-white">
                {ensName || truncateAddress(account)}
              </p>
              <p className="text-xs font-bold text-primary italic uppercase">{balance} ETH</p>
            </div>
          </div>
        </div>

        {/* Network Info */}
        <div className="px-4 py-2 border-b-4 border-black bg-yellow-400">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-black italic">Network:</span>
            <span className="text-xs font-black uppercase bg-white text-black px-2 py-0.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {networkName || 'Ethereum'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-1 bg-white dark:bg-slate-900">
          <DropdownMenuItem
            onClick={copyAddressToClipboard}
            className="cursor-pointer focus:bg-primary/10 focus:text-primary rounded-none border-b-2 border-transparent hover:border-black transition-all"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy Address
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={viewOnExplorer}
            className="cursor-pointer focus:bg-primary/10 focus:text-primary rounded-none border-b-2 border-transparent hover:border-black transition-all"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View on Explorer
          </DropdownMenuItem>

          <DropdownMenuSeparator className="h-1 bg-black" />

          <DropdownMenuItem
            onClick={disconnectWallet}
            className="cursor-pointer text-red-500 focus:bg-red-500 focus:text-white rounded-none transition-all"
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
