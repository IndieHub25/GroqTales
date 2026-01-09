'use client';

import { motion } from 'framer-motion';
import {
  PenSquare,
  Users,
  BookOpen,
  FlaskConical,
  ChevronDown,
  Trophy,
  Menu,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
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

// Type definitions for nav items
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

  // Track scroll position for adding box shadow to header
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Define active class for navigation links
  const isActive = (path: string) => {
    if (path === '/community') {
      return pathname === '/community' || pathname === '/community/creators'
        ? 'bg-primary/10 text-primary font-medium'
        : 'hover:bg-accent/20 text-muted-foreground';
    }
    return pathname === path
      ? 'bg-primary/10 text-primary font-medium'
      : 'hover:bg-accent/20 text-muted-foreground';
  };

  const handleCreateClick = () => {
    // Check if user is authenticated
    const isAdmin =
      typeof window !== 'undefined' && window.localStorage
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
          <Link
            href="/"
            className="flex items-center space-x-2 mr-2 sm:mr-6 group relative"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center doodle-wiggle overflow-hidden border-2 border-white/20"
            >
              <div className="relative w-full h-full">
                <Image
                  src="/logo.png"
                  alt="GroqTales Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </motion.div>
          </Link>

          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map((item, index) => (
              <motion.div
                key={
                  item.type === 'dropdown'
                    ? `dropdown-${item.label}`
                    : item.href || `item-${index}`
                }
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 + 0.1, duration: 0.2 }}
                whileHover={{ scale: 1.03 }}
                className="inline-flex items-center comic-text"
              >
                {item.type === 'dropdown' ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className={`px-4 py-2 text-sm rounded-md transition-all duration-200 flex items-center text-white hover:text-white/80 hover:bg-white/10 backdrop-blur-sm comic-pop comic-text`}
                    >
                      {item.icon}
                      {item.label}
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {item.items?.map((subItem) => (
                        <DropdownMenuItem key={subItem.href} asChild>
                          <Link
                            href={subItem.href}
                            className="flex items-center w-full text-foreground/90 hover:text-foreground hover:bg-white/5 comic-text"
                          >
                            {subItem.icon && subItem.icon}
                            {subItem.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : item.href ? (
                  <Link
                    href={item.href}
                    className={`px-4 py-2 text-sm rounded-md transition-all duration-200 flex items-center text-white hover:text-white/80 hover:bg-white/10 backdrop-blur-sm comic-pop comic-text`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ) : null}
              </motion.div>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-2">
          <div className="hidden md:block">
            <WalletConnect />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex bg-primary/20 hover:bg-primary/30 text-primary backdrop-blur-sm comic-pop comic-text-bold border-white/10"
            onClick={handleCreateClick}
          >
            <PenSquare className="h-4 w-4 mr-2" />
            Create
          </Button>
          <ModeToggle />
          <UserNav />

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10"
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#36454F] border-l-4 border-black text-white p-0">
                <SheetHeader className="p-6 border-b-4 border-black">
                  <SheetTitle className="text-white comic-pop text-xl flex items-center gap-2 text-shadow-comic">
                    <div className="w-8 h-8 relative">
                      <Image src="/logo.png" alt="Logo" fill className="object-contain" />
                    </div>
                    GroqTales
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col p-4 space-y-2">
                  <div className="mb-4 md:hidden">
                    <WalletConnect />
                  </div>
                  {navItems.map((item, index) => (
                    <div
                      key={item.type === 'dropdown' ? `dropdown-${item.label}` : item.href || `item-${index}`}
                      className="flex flex-col"
                    >
                      {item.type === 'dropdown' ? (
                        <>
                          <div className="px-4 py-2 text-sm font-bold uppercase text-white/60 mt-2">
                            {item.label}
                          </div>
                          {item.items?.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              onClick={() => setSheetOpen(false)}
                              className="px-6 py-3 text-lg hover:bg-white/10 rounded-md transition-colors comic-text flex items-center"
                            >
                              {subItem.icon}
                              {subItem.label}
                            </Link>
                          ))}
                        </>
                      ) : (
                        item.href && (
                          <Link
                            href={item.href}
                            onClick={() => setSheetOpen(false)}
                            className={cn(
                              "px-4 py-3 text-lg hover:bg-white/10 rounded-md transition-colors comic-text flex items-center",
                              pathname === item.href && "bg-primary/20 text-primary"
                            )}
                          >
                            {item.icon}
                            {item.label}
                          </Link>
                        )
                      )}
                    </div>
                  ))}
                  <div className="pt-4 mt-4 border-t-2 border-white/10">
                    <Button
                      variant="outline"
                      className="w-full justify-start text-lg bg-primary/20 hover:bg-primary/30 text-primary border-white/10 comic-pop"
                      onClick={() => {
                        setSheetOpen(false);
                        handleCreateClick();
                      }}
                    >
                      <PenSquare className="h-5 w-5 mr-3" />
                      Create Story
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <CreateStoryDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      />
    </motion.header>
  );
}
