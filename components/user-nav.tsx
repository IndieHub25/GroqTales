'use client';

import { useEffect, useState } from 'react';
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
import { createClient } from '@/lib/supabase/client';

export function UserNav() {
  const { account, connectWallet, disconnectWallet } = useWeb3();
  const { toast } = useToast();
  const [dbUser, setDbUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const supabase = React.useMemo(() => createClient(), []);

  useEffect(() => {
    // Check Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setDbUser({ username: session.user.user_metadata?.username || session.user.email?.split('@')[0], avatar: session.user.user_metadata?.avatar_url });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setDbUser({ username: session.user.user_metadata?.username || session.user.email?.split('@')[0], avatar: session.user.user_metadata?.avatar_url });
      } else if (!account) {
        setDbUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, account]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (account) {
        try {
          const res = await fetch(`/api/v1/users/profile/${account}`);
          if (res.ok) {
            const data = await res.json();
            setDbUser(data.user);
          }
        } catch (err) {
          console.error("Failed to fetch nav user data", err);
        }
      }
    };
    if (account) fetchUserData();
  }, [account]);

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
            <AvatarImage src={dbUser?.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${dbUser?.username || "You"}`} alt="User Avatar" />
            <AvatarFallback>{dbUser?.username?.slice(0, 2).toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-72 p-0 overflow-hidden border border-white/10 shadow-2xl bg-black/95 backdrop-blur-xl rounded-xl"
        align="end"
      >
        <DropdownMenuLabel className="bg-emerald-500/10 text-emerald-400 border-b border-white/10 py-3 font-semibold uppercase tracking-wider text-xs">
          User Controls
        </DropdownMenuLabel>

        <div className="bg-transparent p-1">
          <DropdownMenuGroup>
            <DropdownMenuItem
              asChild
              className="cursor-pointer focus:bg-primary/10 focus:text-primary rounded-none transition-all"
            >
              <Link
                href={`/profile/${account || session?.user?.id}`}
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
                href={`/profile/${account || session?.user?.id}`}
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
