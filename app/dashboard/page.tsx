"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist";
import { DashboardTour } from "@/components/dashboard/DashboardTour";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Wallet,
  BookOpen,
  Trophy,
  Plus,
  MoreVertical,
  ArrowUpRight,
  DollarSign,
  Shield,
  PenTool
} from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { useCreatorEarnings } from "@/hooks/use-royalties";
import { Skeleton } from "@/components/ui/skeleton";

interface ChecklistStep {
  id: string;
  label: string;
  isCompleted: boolean;
  actionUrl?: string;
}

interface DashboardStats {
  storyCount: number;
  totalLikes: number;
  totalViews: number;
}

interface RecentStory {
  _id: string;
  title: string;
  updatedAt?: string;
  createdAt?: string;
}

export default function DashboardPage() {
  const { address } = useWallet();
  const { earnings } = useCreatorEarnings(address || undefined);

  const [runTour, setRunTour] = useState(false);
  const [isChecklistVisible, setIsChecklistVisible] = useState(false);
  const [dashLoading, setDashLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    storyCount: 0,
    totalLikes: 0,
    totalViews: 0,
  });
  const [recentStories, setRecentStories] = useState<RecentStory[]>([]);

  const [checklistSteps, setChecklistSteps] = useState<ChecklistStep[]>([
    { id: "profile", label: "Complete your Creator Profile", isCompleted: true },
    { id: "wallet", label: "Connect Web3 Wallet", isCompleted: false },
    { id: "story", label: "Publish your first Story", isCompleted: false },
    { id: "mint", label: "Mint a Story NFT", isCompleted: false },
    { id: "social", label: "Share on Social Media", isCompleted: false },
  ]);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("has_seen_dashboard_tour");
    if (!hasSeenTour) {
      setRunTour(true);
    }

    const isDismissed = localStorage.getItem("onboarding_dismissed");
    if (!isDismissed) {
      setIsChecklistVisible(true);
    }
  }, []);

  // Fetch real dashboard data
  useEffect(() => {
    const controller = new AbortController();
    async function fetchDashboard() {
      try {
        setDashLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const token = typeof window !== 'undefined'
          ? localStorage.getItem('accessToken')
          : null;

        if (!token) {
          setDashLoading(false);
          return;
        }

        const headers: Record<string, string> = {
          Authorization: `Bearer ${token}`,
        };

        const res = await fetch(`${baseUrl}/api/v1/users/profile`, {
          headers,
          credentials: 'include',
          signal: controller.signal,
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setStats(
              json.stats || { storyCount: 0, totalLikes: 0, totalViews: 0 }
            );
            const stories: RecentStory[] = (json.stories || [])
              .slice(0, 5)
              .map((s: any) => ({
                _id: s._id,
                title: s.title || 'Untitled Story',
                updatedAt: s.updatedAt,
                createdAt: s.createdAt,
              }));
            setRecentStories(stories);

            // Update checklist based on real data
            setChecklistSteps((prev) =>
              prev.map((step) => {
                if (step.id === 'story' && (json.stats?.storyCount || 0) > 0) {
                  return { ...step, isCompleted: true };
                }
                if (step.id === 'wallet' && address) {
                  return { ...step, isCompleted: true };
                }
                return step;
              })
            );
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Dashboard fetch failed:', err);
        }
      } finally {
        if (!controller.signal.aborted) setDashLoading(false);
      }
    }
    fetchDashboard();
    return () => controller.abort();
  }, [address]);

  const handleTourComplete = () => {
    setRunTour(false);
    localStorage.setItem("has_seen_dashboard_tour", "true");
  };

  const handleChecklistDismiss = () => {
    setIsChecklistVisible(false);
    localStorage.setItem("onboarding_dismissed", "true");
  };

  function timeAgo(dateStr?: string): string {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <DashboardTour 
        shouldRun={runTour} 
        onComplete={handleTourComplete} 
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Creator Dashboard</h1>
          <p className="text-muted-foreground">Manage your stories, NFTs, and earnings.</p>
        </div>

        <Button variant="outline" className="tour-wallet-connect gap-2">
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </Button>
      </div>

      <OnboardingChecklist 
        steps={checklistSteps}
        isVisible={isChecklistVisible}
        onDismiss={handleChecklistDismiss}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="tour-analytics">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <span className="text-muted-foreground">
                <DollarSign className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {earnings ? `${(earnings.totalEarned ?? 0).toFixed(4)} ETH` : '0.0000 ETH'}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {address ? (
                <Link href="/dashboard/royalties" className="text-primary flex items-center hover:underline">
                  View details <ArrowUpRight className="h-3 w-3 ml-0.5" />
                </Link>
              ) : (
                'Connect wallet to track'
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stories Published</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {dashLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.storyCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total published stories
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {dashLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalViews}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all stories
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            {dashLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalLikes}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total story likes
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">  
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Stories</CardTitle>
             
             <Button asChild className="tour-create-story bg-primary text-primary-foreground">
                <Link href="/create/ai-story">
                  <Plus className="mr-2 h-4 w-4" /> Create New Story
                </Link>
              </Button>

          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashLoading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </div>
                ))
              ) : recentStories.length > 0 ? (
                recentStories.map((story) => (
                  <div key={story._id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        📚
                      </div>
                      <div>
                        <Link href={`/stories/${story._id}`} className="font-medium hover:text-primary transition-colors">
                          {story.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          Updated {timeAgo(story.updatedAt || story.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No stories yet</p>
                  <p className="text-sm mt-1">Create your first AI-powered story!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
                <div className="p-3 bg-primary/10 rounded-lg text-primary border border-primary/20">
                    <strong>💡 Pro Tip:</strong> Minting your story as an NFT allows you to earn royalties every time it is resold.
                </div>
                <div className="p-3 bg-muted rounded-lg border">
                    <strong>Writing with AI:</strong> Try using the &quot;Fantasy&quot; prompt preset to generate immersive worlds quickly.
                </div>
            </div>
          </CardContent>
        </Card>

        {/* Access Control & Security Card */}
        <Card className="col-span-7 mt-4 border-emerald-500/20 bg-emerald-950/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-400" />
              Access Control &amp; Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Off-Chain Roles */}
              <div className="space-y-4">
                <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Off-Chain Permissions</h3>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-white/5">
                    <div className="p-2 rounded-full bg-blue-500/10 text-blue-400">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Reader Access</p>
                      <p className="text-xs text-muted-foreground">Can view stories, bookmark, and comment.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-white/5">
                    <div className="p-2 rounded-full bg-purple-500/10 text-purple-400">
                      <PenTool className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Creator Access</p>
                      <p className="text-xs text-muted-foreground">Can write drafts and manage content.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* On-Chain Stepper */}
              <div className="space-y-4">
                <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">On-Chain Actions (Requires Wallet)</h3>
                <div className="relative border-l-2 border-emerald-500/30 ml-3 pl-6 space-y-6">
                  <div className="relative">
                    <span className="absolute -left-[33px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-background" />
                    <p className="font-medium text-sm">Web3 Authentication</p>
                    <p className="text-xs text-muted-foreground">Sign message with wallet to prove ownership.</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[33px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-background" />
                    <p className="font-medium text-sm">AI Engine Access</p>
                    <p className="text-xs text-muted-foreground">Unlock Groq AI storytelling tools for creators.</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[33px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-background" />
                    <p className="font-medium text-sm">Mint Story NFT</p>
                    <p className="text-xs text-muted-foreground">Deploy your story as an NFT to blockchain network.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-200/80 text-xs">
              <strong>Security Note:</strong> Always verify that you are connected to the official site before signing any transactions. Your email sessions are managed off-chain via Supabase securely. Last login events are tracked in your avatar menu.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}