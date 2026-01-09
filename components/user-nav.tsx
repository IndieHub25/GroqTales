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
          <Avatar className="h-8 w-8 bg-slate-300">
            <AvatarImage src="/avatars/01.png" alt="@user" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-56 sm:w-64 p-0 overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white dark:bg-slate-950 z-[9999]" 
        align="end"
        alignOffset={-8}
        sideOffset={8}
      >

        {/* Header Section */}
        <DropdownMenuLabel className="bg-yellow-400 dark:bg-yellow-600 text-black dark:text-white italic border-b-4 border-black py-3 px-4">
          User Options
        </DropdownMenuLabel>

        {/* Menu Items Container */}
        <div className="bg-white dark:bg-slate-950 p-2">
          <DropdownMenuGroup className="space-y-1">
            <DropdownMenuItem asChild className="cursor-pointer text-black dark:text-white rounded border-2 border-transparent hover:border-black dark:hover:border-white transition-all px-3 py-1.5 uppercase font-bold">
              <Link href="/profile" className="flex items-center w-full">
                <User className="mr-3 h-4 w-4 flex-shrink-0" />
                Profile
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="cursor-pointer text-black dark:text-white rounded border-2 border-transparent hover:border-black dark:hover:border-white transition-all px-3 py-1.5 uppercase font-bold">
              <Link href="/my-stories" className="flex items-center w-full">
                <BookOpen className="mr-3 h-4 w-4 flex-shrink-0" />
                My Stories
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="cursor-pointer text-black dark:text-white rounded border-2 border-transparent hover:border-black dark:hover:border-white transition-all px-3 py-1.5 uppercase font-bold">
              <Link href="/nft-gallery" className="flex items-center w-full">
                <Wallet className="mr-3 h-4 w-4 flex-shrink-0" />
                My NFTs
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="h-1 bg-black my-2" />
          <DropdownMenuItem 
            onClick={disconnectWallet} 
            className="cursor-pointer text-red-600 focus:bg-red-600 focus:text-white rounded-none transition-all uppercase px-3 py-2 font-bold"
          >
            <LogOut className="mr-3 h-4 w-4 flex-shrink-0" />
            Disconnect Wallet
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator />

        <div className="px-4 py-3 bg-muted/20">
          <p className="text-xs font-black uppercase text-muted-foreground italic mb-1">Authenticated Wallet:</p>
          <p className="text-xs font-black uppercase tracking-widest bg-white border-2 border-black px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {truncateAddress(account)}
          </p>
        </div>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}
