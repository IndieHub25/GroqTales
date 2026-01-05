'use client';

import { Wallet, User, Settings, LogOut } from 'lucide-react';
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

export function UserNav() {
  const { account, connectWallet, disconnectWallet } = useWeb3();
  const { toast } = useToast();

  // Truncate wallet address for display
  const truncateAddress = (address: string) => {
    return address
      ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
      : '';
  };

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
      <DropdownMenuContent className="x-0 y-0 w-56 bg-slate-100" align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link href="/profile" legacyBehavior passHref>
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/my-stories" legacyBehavior passHref>
              <span>My Stories</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/nft-gallery" legacyBehavior passHref>
              <span>My NFTs</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={disconnectWallet}>
          <span>Disconnect Wallet</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>
          Wallet: {truncateAddress(account)}
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
