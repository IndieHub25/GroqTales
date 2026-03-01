"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Copy, Edit, Share2, Wallet } from "lucide-react";
import Link from "next/link";

interface ProfileHeaderProps {
   user: {
    firstName?: string;
    lastName?: string;
    username: string;
    bio: string;
    avatar?: string; 
    walletAddress: string;
  };
  isOwner: boolean;
}



export function ProfileHeader({ user, isOwner }: ProfileHeaderProps) {
  // Logic: Use Name if exists, otherwise use Username, otherwise use a slice of Wallet
  const displayName = user.firstName 
    ? `${user.firstName} ${user.lastName || ""}` 
    : user.username || `${user.walletAddress.slice(0, 6)}...`;


  return (
    <div className="relative w-full mb-8">
      <div className="h-32 md:h-48 w-full bg-gradient-to-r from-violet-900/50 via-slate-900 to-indigo-900/50 rounded-b-3xl absolute top-0 z-0" />

      <div className="container mx-auto px-4 relative z-10 pt-16 md:pt-24">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
          
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
            <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-background relative">
              <AvatarImage src={user.avatar} alt={user.username} />
              <AvatarFallback className="text-2xl font-bold bg-slate-800 text-slate-200">

                 {displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {displayName}
            </h1>
            <div className="flex flex-col md:flex-row items-center gap-2 text-muted-foreground">
              <span className="font-medium">@{user.username}</span>
              {user.walletAddress && (
                <Badge variant="outline" className="flex items-center gap-1 bg-slate-900/50 border-slate-700 text-xs font-mono text-slate-400">
                  <Wallet className="w-3 h-3" />
                  {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                  <button
                    type="button"
                    onClick={() => user.walletAddress && navigator.clipboard?.writeText(user.walletAddress)}
                    aria-label="Copy wallet address"
                    className="ml-1 text-slate-400 hover:text-white transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
            <p className="max-w-md text-sm text-slate-300 mx-auto md:mx-0">
              {user.bio || "No bio yet. Just exploring the GroqTales universe."}
            </p>
          </div>
          
          {/* Use the isOwner prop passed from the page */}
          <div className="flex gap-3 mt-4 md:mt-0">
            {isOwner ? (
              <Button asChild variant="outline" className="gap-2 border-slate-700 hover:bg-slate-800">
                <Link href="/profile/settings">
                <Edit className="w-4 h-4" /> Edit Profile
                </Link>
              </Button>
            ) : (
              <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/20">
                Follow
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white"
            >
              <Share2 className="w-5 h-5" />
              <span className="sr-only">Share profile</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}