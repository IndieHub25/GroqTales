'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Wallet, User, Settings, LogOut, BookOpen, Bell, Shield, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { fetchNotifications } from '@/lib/feeds-client';

// Simple deterministic hash to avoid sending raw PII or identifiers to third parties
const generateSeed = (input?: string) => {
  if (!input) return "default";
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
};

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
import { createClient } from '@/lib/supabase/client';
import { useUserRole } from '@/hooks/use-user-role';
import { roleBadgeStyles } from '@/lib/rbac';

export function UserNav() {
  const { account, connectWallet, disconnectWallet } = useWeb3();
  const { toast } = useToast();
  const [dbUser, setDbUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const supabase = React.useMemo(() => createClient(), []);
  const { role, isAdmin, isModerator, isModOrAdmin, isOverridden, toggleViewMode } = useUserRole();

  useEffect(() => {
    // Check Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setDbUser({ username: session.user.user_metadata?.username || session.user.email?.split('@')[0], avatar: session.user.user_metadata?.avatar_url, id: session.user.id });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setDbUser({ username: session.user.user_metadata?.username || session.user.email?.split('@')[0], avatar: session.user.user_metadata?.avatar_url, id: session.user.id });
      } else if (!account) {
        setDbUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, account]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (account || session) {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://groqtales-backend-api.onrender.com';
          let fetchUrl = `${baseUrl}/api/v1/users/profile/${account}`;
          const headers: Record<string, string> = {};

          if (session) {
            const token = session.access_token;
            if (token) {
              headers['Authorization'] = `Bearer ${token}`;
            }
            fetchUrl = `${baseUrl}/api/v1/users/profile`;
          }

          const res = await fetch(fetchUrl, { headers });
          if (res.ok) {
            const data = await res.json();
            setDbUser(data.data?.user || data.data || data.user || data);
          }
        } catch (err) {
          console.error("Failed to fetch nav user data", err);
        }
      }
    };
    if (account || session) fetchUserData();

    // Listen for global profile updates (e.g. from settings page)
    const handleProfileUpdate = () => fetchUserData();
    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [account, session]);

  // Notification badge count — poll every 20s
  const [unreadCount, setUnreadCount] = useState(0);
  const notifIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadUnreadCount = useCallback(async () => {
    try {
      const notifs = await fetchNotifications(true, 50);
      setUnreadCount(notifs.filter(n => !n.read).length);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (account || session) {
      loadUnreadCount();
      notifIntervalRef.current = setInterval(loadUnreadCount, 20_000);
    }
    return () => {
      if (notifIntervalRef.current) clearInterval(notifIntervalRef.current);
    };
  }, [account, session, loadUnreadCount]);

  const handleLogout = async () => {
    if (account) await disconnectWallet();
    if (session) await supabase.auth.signOut();
  };

  if (!account && !session) {
    return (
      <Button
        variant="default"
        size="sm"
        asChild
        aria-label="Login or create account"
        className="flex items-center gap-2 px-5 py-2 rounded-full border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-semibold shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:bg-emerald-500 hover:text-black hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all duration-300 uppercase tracking-wider text-xs"
      >
        <Link href="/sign-in">Login</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" aria-label="User menu" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={dbUser?.avatar || `https://api.dicebear.com/9.x/personas/svg?seed=${encodeURIComponent(generateSeed(dbUser?.id || account || session?.user?.id))}`} alt="User Avatar" />
            <AvatarFallback>{dbUser?.username?.slice(0, 2).toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-72 p-0 overflow-hidden border border-white/10 shadow-2xl bg-black/95 backdrop-blur-xl rounded-xl"
        align="end"
      >
        <DropdownMenuLabel className="bg-emerald-500/10 text-emerald-400 border-b border-white/10 py-3 font-semibold uppercase tracking-wider text-xs flex items-center justify-between">
          <span>User Controls</span>
          {role !== 'user' && (
            <span className={`text-[9px] px-1.5 py-0.5 rounded border ${roleBadgeStyles[role].className}`}>
              {roleBadgeStyles[role].label}
            </span>
          )}
        </DropdownMenuLabel>

        <div className="bg-transparent p-1">
          <DropdownMenuGroup>
            <DropdownMenuItem
              asChild
              className="cursor-pointer focus:bg-primary/10 focus:text-primary rounded-none transition-all"
            >
              <Link
                href={`/profile/${dbUser?.username || 'me'}`}
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
                href={`/profile/${dbUser?.username || 'me'}`}
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

            {/* Additional Wallet Link for Supabase Users lacking Web3 */}
            {!account && (
              <DropdownMenuItem
                onClick={() => connectWallet()}
                className="cursor-pointer focus:bg-emerald-500/10 focus:text-emerald-400 text-emerald-500 rounded-none transition-all uppercase py-2 font-semibold"
              >
                <Wallet className="mr-2 h-4 w-4" />
                <span>Connect Web3 Wallet</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="h-px bg-white/10 mx-0 my-1" />

          {/* Role-based items */}
          <DropdownMenuGroup>
            <DropdownMenuItem
              asChild
              className="cursor-pointer focus:bg-primary/10 focus:text-primary rounded-none transition-all uppercase py-2"
            >
              <Link href="/settings" className="flex items-center w-full">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              asChild
              className="cursor-pointer focus:bg-primary/10 focus:text-primary rounded-none transition-all uppercase py-2"
            >
              <Link href="/notifications" className="flex items-center w-full">
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="ml-auto inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full bg-violet-500 text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            </DropdownMenuItem>

            {isAdmin && (
              <DropdownMenuItem
                asChild
                className="cursor-pointer focus:bg-red-500/10 focus:text-red-400 rounded-none transition-all uppercase py-2 text-red-400"
              >
                <Link href="/admin" className="flex items-center w-full">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Admin Panel</span>
                </Link>
              </DropdownMenuItem>
            )}

            {isModOrAdmin && (
              <DropdownMenuItem
                asChild
                className="cursor-pointer focus:bg-amber-500/10 focus:text-amber-400 rounded-none transition-all uppercase py-2 text-amber-400"
              >
                <Link href="/admin/moderation" className="flex items-center w-full">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Moderation</span>
                </Link>
              </DropdownMenuItem>
            )}

            {isModOrAdmin && (
              <DropdownMenuItem
                onClick={toggleViewMode}
                className="cursor-pointer focus:bg-blue-500/10 focus:text-blue-400 rounded-none transition-all uppercase py-2 text-blue-400"
              >
                {isOverridden ? (
                  <><Eye className="mr-2 h-4 w-4" /><span>Switch to Admin View</span></>
                ) : (
                  <><EyeOff className="mr-2 h-4 w-4" /><span>Switch to User View</span></>
                )}
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>

          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer text-red-500 hover:text-white focus:bg-red-500/20 focus:text-red-400 rounded-lg transition-all uppercase py-2"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log Out</span>
          </DropdownMenuItem>
        </div>

        <div className="px-4 py-3 bg-white/5 border-t border-white/10 space-y-3">
          <div>
            <p className="text-[10px] font-semibold uppercase text-white/50 tracking-wider mb-1">
              Active Identity
            </p>
            <div className="text-xs font-mono uppercase tracking-widest bg-black/50 border border-white/5 rounded-md px-3 py-1.5 overflow-hidden text-ellipsis whitespace-nowrap text-emerald-400">
              {account ? truncateAddress(account) : session?.user?.email}
            </div>
          </div>

          {(session?.user?.last_sign_in_at || account) && (
            <div className="flex flex-col gap-1 border-t border-white/5 pt-2">
              <p className="text-[10px] font-semibold uppercase text-white/50 tracking-wider">
                Security Info
              </p>
              <div className="text-[10px] text-white/40 leading-snug">
                Last Login: {session?.user?.last_sign_in_at ? new Date(session.user.last_sign_in_at).toLocaleString() : 'Active Wallet Session'} <br />
                Access: {account ? 'On-Chain Web3' : 'Off-Chain Auth'}
              </div>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
