'use client';

import { motion } from 'framer-motion';
import {
  PenSquare,
  Users,
  ChevronDown,
  Trophy,
  Menu,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import { useWeb3 } from '@/components/providers/web3-provider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useToast } from '@/components/ui/use-toast';
import { UserNav } from '@/components/user-nav';
import WalletConnect from '@/components/wallet-connect';
import { cn } from '@/lib/utils';

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
  const { account } = useWeb3();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCreateClick = () => {
    const isAdmin =
      typeof window !== 'undefined'
        ? localStorage.getItem('adminSession')
        : null;

    if (!account && !isAdmin) {
      toast({
        title: 'Authentication Required',
        description:
          'Please connect your wallet or login as admin to create stories',
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
      icon: <Users className="h-4 w-4 mr-1.5" />,
      items: [
        { href: '/community', label: 'Community Hub' },
        {
          href: '/community/creators',
          label: 'Top Creators',
          icon: <Trophy className="h-4 w-4 mr-1.5" />,
        },
      ],
    },
    { type: 'link', href: '/nft-gallery', label: 'NFT Gallery' },
    { type: 'link', href: '/nft-marketplace', label: 'NFT Marketplace' },
  ];

  return (
    <motion.header
      className={cn(
        'sticky top-0 z-50 border-b bg-white dark:bg-slate-950/80 dark:border-slate-800 transition-all',
        scrolled && 'shadow-sm'
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={40} height={40} />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) =>
            item.type === 'dropdown' ? (
              <DropdownMenu key={item.label}>
                <DropdownMenuTrigger className="px-4 py-2 text-sm rounded-md flex items-center text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10">
                  {item.icon}
                  {item.label}
                  <ChevronDown className="ml-1 h-3 w-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {item.items?.map((sub) => (
                    <DropdownMenuItem key={sub.href} asChild>
                      <Link href={sub.href} className="flex items-center gap-2">
                        {sub.icon}
                        {sub.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                key={item.href}
                href={item.href!}
                className="px-4 py-2 text-sm rounded-md text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10"
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <div className="hidden md:block text-gray-900 dark:text-white">
            <WalletConnect />
          </div>

          <Button
            size="sm"
            onClick={handleCreateClick}
            className="
              hidden md:flex
              bg-gray-900 text-white hover:bg-gray-800
              dark:bg-primary/20 dark:text-primary
            "
          >
            <PenSquare className="h-4 w-4 mr-2" />
            Create
          </Button>

          <ModeToggle />
          <UserNav />

          {/* Mobile Menu */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              {navItems.map((item) =>
                item.href ? (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSheetOpen(false)}
                    className="block px-4 py-3"
                  >
                    {item.label}
                  </Link>
                ) : null
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <CreateStoryDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      />
    </motion.header>
  );
}

