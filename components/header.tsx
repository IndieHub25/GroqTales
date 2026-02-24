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
  DollarSign,
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
    { type: 'link', href: '/community', label: 'Community Hub' },
    {
      type: 'link',
      href: '/community/creators',
      label: 'Top Creators',
      icon: <Trophy className="h-4 w-4 mr-1.5 text-emerald-400" />,
    },
    { type: 'link', href: '/nft-gallery', label: 'NFT Gallery' },
    { type: 'link', href: '/nft-marketplace', label: 'NFT Marketplace' },
    ...(account
      ? [
          {
            type: 'link' as const,
            href: '/dashboard/royalties',
            label: 'Earnings',
            icon: <DollarSign className="h-4 w-4 mr-1.5 colorful-icon" />,
          },
        ]
      : []),
  ];

  return (
    <motion.header
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'border-b border-white/5 sticky top-0 z-50 transition-all duration-300 bg-black/40 backdrop-blur-xl',
        scrolled && 'shadow-[0_4px_30px_rgba(0,0,0,0.5)] bg-black/60'
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link
            href="/"
            aria-label="GroqTales home"
            className="flex items-center space-x-2 mr-2 sm:mr-6 group relative"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              className="w-10 h-10 sm:w-11 sm:h-11 relative flex-shrink-0"
            >
              <Image
                src="/logo.png"
                alt="GroqTales Logo"
                fill
                className="object-contain drop-shadow-lg"
                priority
              />
            </motion.div>
            <span className="hidden sm:block font-bold text-xl sm:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 tracking-tight">
              GROQTALES
            </span>
          </Link>

          <nav role="navigation" aria-label="Primary navigation" className="hidden lg:flex items-center space-x-2">
            {navItems.map((item, index) => (
              <motion.div
                key={
                  item.type === 'dropdown'
                    ? `dropdown-${item.label}`
                    : item.href || `item-${index}`
                }
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 + 0.1, duration: 0.2 }}
                whileHover={{ scale: 1.03 }}
                className="inline-flex items-center font-medium"
              >
                {item.type === 'dropdown' ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      aria-haspopup="true"
                      className={`px-4 py-2 text-sm rounded-full transition-all duration-200 flex items-center text-white/70 hover:text-white hover:bg-white/10 backdrop-blur-sm`}
                    >
                      {item.icon}
                      {item.label}
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="bottom"
                      align="start"
                      sideOffset={8}
                      collisionPadding={16}
                      className="
                        z-50
                        w-[160px] sm:w-[180px]
                        bg-black/90
                        backdrop-blur-xl
                        border border-white/10
                        shadow-2xl
                        rounded-xl
                        p-2
                      "
                    >
                      {item.items?.map((subItem) => (
                        <DropdownMenuItem key={subItem.href} asChild>
                          <Link
                            href={subItem.href}
                            aria-current={pathname === subItem.href ? 'page' : undefined}
                            className="flex items-center w-full text-white/80 hover:text-white hover:bg-white/10 rounded-lg"
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
                    aria-current={pathname === item.href ? 'page' : undefined}
                    className={`px-4 py-2 text-sm rounded-full transition-all duration-200 flex items-center text-white/70 hover:text-white hover:bg-white/10 backdrop-blur-sm`}
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
          <Button
            variant="outline"
            size="sm"
            className="hidden lg:flex items-center gap-2 px-5 py-2 rounded-full border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-semibold shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:bg-emerald-500 hover:text-black hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all duration-300"
            onClick={handleCreateClick}
            aria-label="Create a new story"
          >
            <PenSquare className="h-4 w-4 mr-2" />
            Create
          </Button>
          {/* <ModeToggle /> Temporarily disabled */}
          <UserNav />

          {/* Mobile Menu */}
          <div className="lg:hidden">
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
              <SheetContent
                side="right"
                className="bg-zinc-950/90 backdrop-blur-xl border-l border-white/10 text-white p-0"
              >
                <SheetHeader className="p-6 border-b border-white/10">
                  <SheetTitle className="text-white font-bold text-xl flex items-center gap-2">
                    <div className="w-8 h-8 relative">
                      <Image
                        src="/logo.png"
                        alt="Logo"
                        fill
                        className="object-contain"
                      />
                    </div>
                    GroqTales
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col p-4 space-y-2">
                  {navItems.map((item, index) => (
                    <div
                      key={
                        item.type === 'dropdown'
                          ? `dropdown-${item.label}`
                          : item.href || `item-${index}`
                      }
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
                              className="px-6 py-3 text-lg hover:bg-white/10 rounded-md transition-colors flex items-center text-white/80 hover:text-white"
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
                              'px-4 py-3 text-lg hover:bg-white/10 rounded-md transition-colors flex items-center text-white/80 hover:text-white',
                              'bg-emerald-500/10 text-emerald-400'
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
                      className="w-full justify-start text-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full font-semibold"
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
