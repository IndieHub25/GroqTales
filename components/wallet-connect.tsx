'use client';

import { Wallet, ChevronDown, Copy, ExternalLink, AlertCircle } from 'lucide-react';
import React, { useState, useCallback } from 'react';

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
import { useWallet } from '@/hooks/use-wallet';

export default function WalletConnect() {
  const { address, connect, disconnect } = useWallet();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const copyAddress = useCallback(async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    toast({ title: 'Address Copied' });
  }, [address, toast]);

  if (!address) {
    return (
      <Button
        onClick={async () => {
          await connect();
        }}
        className="flex items-center gap-2 px-3 sm:px-6 py-1.5 sm:py-2 rounded-none bg-white text-black border-2 sm:border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all duration-200 font-black uppercase tracking-wider text-xs sm:text-sm"
      >
        <Wallet className="h-5 w-5" />
        <span>Connect Wallet</span>
      </Button>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md bg-primary text-primary-foreground border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span>{truncateAddress(address)}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 p-0 border-4 border-black bg-white">
        <div className="px-4 py-3 border-b-4 border-black">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 rounded-none">
              <AvatarImage src={`https://api.dicebear.com/7.x/identicon/svg?seed=${address}`} />
              <AvatarFallback className="rounded-none bg-black text-white font-black text-sm">
                {address.slice(2, 4).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm font-black uppercase truncate">
              {truncateAddress(address)}
            </p>
          </div>
        </div>

        <div className="p-1">
          <DropdownMenuItem onClick={copyAddress}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Address
          </DropdownMenuItem>

          <DropdownMenuSeparator className="h-1 bg-black" />

          <DropdownMenuItem
            onClick={async () => {
              await disconnect();
              setOpen(false);
            }}
            className="text-red-500"
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
