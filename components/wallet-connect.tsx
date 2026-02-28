'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  ChevronDown,
  Copy,
  ExternalLink,
  Coins,
  AlertCircle,
  CheckCircle2,
  X,
  ShieldCheck,
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
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { truncateAddress } from '@/lib/utils';

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
  } = useWeb3();

  const { toast } = useToast();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [copyTooltip, setCopyTooltip] = useState('Click to copy');

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
    const newWindow = window.open(`${explorerUrl}/address/${account}`, '_blank', 'noopener,noreferrer');
    if (newWindow) newWindow.opener = null;
  }, [account, chainId]);

  const handleMetaMaskConnect = async () => {
    setShowWalletModal(false);
    await connectWallet();
  };

  const handleWalletConnect = async () => {
    setShowWalletModal(false);
    // Placeholder for actual WalletConnect v2 initialization
    toast({
      title: 'WalletConnect Initialization',
      description: 'Opening mobile QR scan modal...',
    });
    console.log("Initiating WalletConnect mobile flow...");
    // await initiateWalletConnectFlow()
  };

  if (!connected) {
    return (
      <>
        <Button
          onClick={() => setShowWalletModal(true)}
          disabled={connecting}
          className="w-full relative group overflow-hidden bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white rounded-xl h-11 transition-all flex items-center justify-center gap-2 font-medium"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          {connecting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <Wallet className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
              <span>Connect Wallet</span>
            </>
          )}
        </Button>

        <Dialog open={showWalletModal} onOpenChange={setShowWalletModal}>
          <DialogContent className="sm:max-w-md bg-black/95 border border-white/10 backdrop-blur-2xl p-0 gap-0 overflow-hidden text-white rounded-3xl shadow-2xl">
            <div className="p-6 border-b border-white/5 relative z-10">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-50 pointer-events-none" />
              <div className="flex justify-between items-center relative z-20">
                <div>
                  <h2 className="text-xl font-medium tracking-tight mb-1">Connect Wallet</h2>
                  <p className="text-sm text-white/50">Select what app to use to connect.</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-3 relative z-10 bg-white/[0.02]">
              <button 
                onClick={handleMetaMaskConnect}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F6851B]/20 flex items-center justify-center border border-[#F6851B]/30">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-white">MetaMask</h3>
                    <p className="text-xs text-white/40">Browser extension</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <ChevronDown className="w-4 h-4 -rotate-90 text-white/50" />
                </div>
              </button>

              <button 
                disabled
                aria-disabled="true"
                title="Coming Soon"
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 opacity-50 cursor-not-allowed transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                    <img src="https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/7a33d7f1-3d12-4b5c-f3ee-5cd83cb1b500?projectId=c98dbfa8da03b44b8296a86c6a7e0da3" alt="WalletConnect" className="w-6 h-6 rounded-md" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-white">WalletConnect</h3>
                    <p className="text-xs text-white/40">Coming Soon</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-50">
                  <ChevronDown className="w-4 h-4 -rotate-90 text-white/50" />
                </div>
              </button>
            </div>

            <div className="p-4 bg-white/5 border-t border-white/5 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <p className="text-[11px] text-white/40 font-medium">We never store your private keys. Transactions happen securely in your wallet.</p>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <DropdownMenu open={showDropdown} onOpenChange={setShowDropdown}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white transition-all h-10 font-medium"
        >
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
          <span className="text-sm">{ensName || truncateAddress(account)}</span>
          <ChevronDown className="h-4 w-4 opacity-50 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent
        align="end"
        className="w-64 p-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl text-white"
        sideOffset={8}
      >
        <div className="p-3 mb-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-white/20">
            <AvatarImage src={`https://api.dicebear.com/7.x/identicon/svg?seed=${account}`} alt="Avatar" />
            <AvatarFallback className="bg-white/10 text-white text-xs">{account?.slice(2, 4).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold truncate text-white">{ensName || truncateAddress(account)}</span>
            <span className="text-xs text-white/50 bg-white/5 px-2 py-0.5 rounded-full w-fit mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {networkName || 'Ethereum'}
            </span>
          </div>
        </div>

        <div className="p-3 mb-2 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
          <div className="text-xs text-white/50 mb-1">Balance</div>
          <div className="text-xl font-medium tracking-tight flex items-baseline gap-1">
            {balance} <span className="text-xs font-semibold text-blue-400">ETH</span>
          </div>
        </div>

        <div className="space-y-1">
          <DropdownMenuItem
            onClick={copyAddressToClipboard}
            className="flex items-center gap-2 cursor-pointer rounded-lg p-2.5 hover:bg-white/10 focus:bg-white/10 transition-colors"
          >
            <Copy className="h-4 w-4 text-white/60" />
            <span className="text-sm">Copy Address</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={viewOnExplorer}
            className="flex items-center gap-2 cursor-pointer rounded-lg p-2.5 hover:bg-white/10 focus:bg-white/10 transition-colors"
          >
            <ExternalLink className="h-4 w-4 text-white/60" />
            <span className="text-sm">View on Explorer</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1 bg-white/10" />

          <DropdownMenuItem
            onClick={disconnectWallet}
            className="flex items-center gap-2 cursor-pointer rounded-lg p-2.5 text-red-400 hover:bg-red-400/10 focus:bg-red-400/10 focus:text-red-400 transition-colors"
          >
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Disconnect Wallet</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
