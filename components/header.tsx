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
import { usePathname } from 'next/navigation';
import React, { useState, useEffect } from 'react';

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

type NavSubItem = {
  href: string;
  label: string;
  icon?: React.ReactNode;
};

type NavItem = {
  href?: string;
  label: string;
  icon?: React.ReactNode;
  type?: 'link' | 'dropdown';
  items?: NavSubItem[];
};

export function Header() {
  const pathname = usePathname();
  const { address } = useWallet();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCreateClick = () => {
    if (!address) {
      toast({
        title: 'Authentication Required',
        description: 'Please authenticate your wallet before creating a story.',
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
      icon: <Users className="h-4 w-4 mr-1.5 colorful-icon" />,
      items: [
        { href: '/community', label: 'Community Hub' },
        {
          href: '/community/creators',
          label: 'Top Creators',
          icon: <Trophy className="h-4 w-4 mr-1.5 colorful-icon" />,
        },
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
        'border-b-4 border-black dark:border-slate-800 sticky top-0 z-50 transition-all duration-300 bg-[#36454F] dark:bg-slate-950/80 dark:backdrop-blur-md',
        scrolled && 'shadow-[0px_4px_0px_0px_rgba(255,255,255,0.2)]'
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2 mr-2 sm:mr-6">
            <div className="relative w-12 h-12 sm:w-16 sm:h-16">
              <Image src="/logo.png" alt="GroqTales Logo" fill />
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map((item, index) => (
              <div key={index}>
                {item.type === 'dropdown' ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="px-4 py-2 text-sm text-white">
                      {item.icon}
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
                  item.href && <Link href={item.href}>{item.label}</Link>
                )}
              </div>
            ))}
          </nav>
        </div>

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
