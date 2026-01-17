'use client';

import { motion } from 'framer-motion';
import {
  PenSquare,
  Users,
  ChevronDown,
  Trophy,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { UserNav } from '@/components/user-nav';
import WalletConnect from '@/components/wallet-connect';
import { cn } from '@/lib/utils';
import { useWallet } from '@/hooks/use-wallet';

import { CreateStoryDialog } from './create-story-dialog';
import { ModeToggle } from './mode-toggle';

type NavItem = {
  href?: string;
  label: string;
  type?: 'link' | 'dropdown';
  items?: { href: string; label: string }[];
};

export function Header() {
  const { address } = useWallet();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleCreateClick = () => {
    if (!address) {
      toast({
        title: 'Authentication Required',
        description: 'Please connect your wallet before creating a story.',
        variant: 'destructive',
      });
      return;
    }
    setShowCreateDialog(true);
  };

  const navItems: NavItem[] = [
    { type: 'link', href: '/genres', label: 'Genres' },
    {
      type: 'dropdown',
      label: 'Community',
      items: [
        { href: '/community', label: 'Community Hub' },
        { href: '/community/creators', label: 'Top Creators' },
      ],
    },
    { type: 'link', href: '/nft-gallery', label: 'NFT Gallery' },
    { type: 'link', href: '/nft-marketplace', label: 'NFT Marketplace' },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'border-b-4 border-black sticky top-0 z-50 bg-[#36454F]',
        scrolled && 'shadow-md'
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="relative w-12 h-12">
            <Image src="/logo.png" alt="GroqTales Logo" fill />
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-2">
          {navItems.map((item, i) =>
            item.type === 'dropdown' ? (
              <DropdownMenu key={i}>
                <DropdownMenuTrigger className="px-4 py-2 text-sm text-white">
                  {item.label}
                  <ChevronDown className="ml-1 h-3 w-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {item.items?.map((sub) => (
                    <DropdownMenuItem key={sub.href} asChild>
                      <Link href={sub.href}>{sub.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link key={i} href={item.href!} className="px-4 py-2 text-white">
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center space-x-2">
          <WalletConnect />
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex"
            onClick={handleCreateClick}
          >
            <PenSquare className="h-4 w-4 mr-2" />
            Create
          </Button>
          <ModeToggle />
          <UserNav />
        </div>
      </div>

      <CreateStoryDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      />
    </motion.header>
  );
}
