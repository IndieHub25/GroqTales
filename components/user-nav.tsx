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
      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuLabel className="bg-yellow-400 text-black italic border-b-2 border-black">User Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/profile" className="flex items-center w-full uppercase">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/my-stories" className="flex items-center w-full uppercase">
              <BookOpen className="mr-2 h-4 w-4" />
              <span>My Stories</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/nft-gallery" className="flex items-center w-full uppercase">
              <Wallet className="mr-2 h-4 w-4" />
              <span>My NFTs</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={disconnectWallet} className="cursor-pointer text-red-600 focus:bg-red-600 focus:text-white">
          <LogOut className="mr-2 h-4 w-4" />
          <span className="uppercase">Disconnect Wallet</span>
        </DropdownMenuItem>
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
