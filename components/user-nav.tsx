'use client';

import { Wallet, User, Settings, LogOut, BookOpen } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { useWeb3 } from '@/components/providers/web3-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { truncateAddress } from '@/lib/utils';

export function UserNav() {
  const { account, connectWallet, disconnectWallet } = useWeb3();
  const { toast } = useToast();

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast({
        title: 'Connection Failed',
        description: 'Could not connect wallet. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!account) {
    return (
      <Button
        variant="default"
        size="sm"
        onClick={handleConnect}
        className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium comic-pop comic-text-bold"
      >
        Login
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/avatars/01.png" alt="@user" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 p-0 overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white dark:bg-slate-950"
        align="end"
      >
        <DropdownMenuLabel className="bg-yellow-400 dark:bg-yellow-600 text-black dark:text-white italic border-b-4 border-black py-3">
          User Options
        </DropdownMenuLabel>

        <div className="bg-white dark:bg-slate-950 p-1">
          <DropdownMenuGroup>
            <DropdownMenuItem
              asChild
              className="cursor-pointer focus:bg-primary/10 focus:text-primary rounded-none transition-all"
            >
              <Link
                href="/profile"
                className="flex items-center w-full uppercase py-2"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              asChild
              className="cursor-pointer focus:bg-primary/10 focus:text-primary rounded-none transition-all"
            >
              <Link
                href="/my-stories"
                className="flex items-center w-full uppercase py-2"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                <span>My Stories</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              asChild
              className="cursor-pointer focus:bg-primary/10 focus:text-primary rounded-none transition-all"
            >
              <Link
                href="/nft-gallery"
                className="flex items-center w-full uppercase py-2"
              >
                <Wallet className="mr-2 h-4 w-4" />
                <span>My NFTs</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="h-1 bg-black mx-0" />

          <DropdownMenuItem
            onClick={disconnectWallet}
            className="cursor-pointer text-red-600 focus:bg-red-600 focus:text-white rounded-none transition-all uppercase py-2"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Disconnect Wallet</span>
          </DropdownMenuItem>
        </div>

        <div className="px-4 py-3 bg-muted/20 border-t-4 border-black">
          <p className="text-xs font-black uppercase text-muted-foreground italic mb-2">
            Authenticated Wallet:
          </p>
          <div className="text-xs font-black uppercase tracking-widest bg-white dark:bg-slate-800 border-4 border-black px-3 py-1.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
            {truncateAddress(account)}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
