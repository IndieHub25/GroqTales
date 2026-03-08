'use client';

import React, { useState } from 'react';
import { Wallet, Loader2, ExternalLink, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

export function ConnectWalletButton() {
  const [address, setAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const truncateAddr = (addr: string) =>
    `${addr.slice(0, 6)}…${addr.slice(-4)}`;

  const handleMetaMaskConnect = async () => {
    if (typeof window === 'undefined') return;

    // Check if MetaMask is available
    if (!(window as any).ethereum) {
      toast({
        title: 'MetaMask Not Found',
        description: 'Please install MetaMask browser extension to connect your wallet.',
        variant: 'destructive',
      });
      window.open('https://metamask.io/download', '_blank');
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      });
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0]);
        setIsOpen(false);
        toast({
          title: 'Wallet Connected',
          description: `Connected to ${truncateAddr(accounts[0])}`,
        });
      }
    } catch (err: any) {
      if (err.code === 4001) {
        toast({
          title: 'Connection Rejected',
          description: 'You rejected the wallet connection request.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Connection Failed',
          description: err.message || 'Failed to connect wallet.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setAddress('');
    toast({
      title: 'Wallet Disconnected',
      description: 'Your wallet has been disconnected.',
    });
  };

  // If connected, show address + options
  if (address) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="text-xs border-emerald-500/30 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10"
          onClick={() => setIsOpen(true)}
        >
          <Wallet className="w-3.5 h-3.5 mr-1.5" />
          {truncateAddr(address)}
        </Button>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[380px] bg-[#0a0f1e] border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Wallet</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-xs text-white/40 mb-1">Connected Address</p>
                <p className="text-sm font-mono text-white/80 break-all">{address}</p>
              </div>

              {/* Buy CRAFTs */}
              <button
                onClick={() => window.open('https://app.uniswap.org', '_blank')}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 hover:border-amber-500/30 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                  <Coins className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-medium text-amber-300">Buy CRAFT Coins</p>
                  <p className="text-[10px] text-white/30">via Uniswap</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40" />
              </button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                className="w-full text-xs border-red-500/20 text-red-400 hover:bg-red-500/10"
              >
                Disconnect Wallet
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Not connected: show connect button
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-xs border-white/10 text-white/70 hover:text-white hover:bg-white/10"
        >
          <Wallet className="w-3.5 h-3.5 mr-1.5" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[380px] bg-[#0a0f1e] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Connect Wallet</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <p className="text-sm text-white/50">
            Connect your wallet to buy CRAFT coins, mint story NFTs, and access creator rewards.
          </p>

          {/* MetaMask */}
          <button
            onClick={handleMetaMaskConnect}
            disabled={isConnecting}
            className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <span className="text-xl">🦊</span>
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-semibold text-white">MetaMask</p>
              <p className="text-[11px] text-white/40">Connect with browser extension</p>
            </div>
            {isConnecting && <Loader2 className="w-4 h-4 animate-spin text-white/50" />}
          </button>

          {/* Buy CRAFTs link */}
          <div className="pt-2 border-t border-white/5">
            <button
              onClick={() => window.open('https://app.uniswap.org', '_blank')}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 hover:border-amber-500/30 transition-all group"
            >
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-amber-300 font-medium">Buy CRAFT Coins</span>
              <ExternalLink className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40 ml-auto" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
