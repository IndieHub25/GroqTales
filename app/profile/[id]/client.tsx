'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Bookmark,
  Activity,
  Heart,
  MessageSquare,
  Settings,
  Bell,
  BarChart3,
  Eye,
  Users,
  Sparkles,
  Share2,
  Copy,
  Edit,
  Wallet,
  Github,
  CheckCircle2,
  ExternalLink,
  TrendingUp,
  Calendar,
  MapPin,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

/* ───────────── Types ───────────── */
interface UserProfile {
  _id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
  email?: string;
  wallet?: { address?: string };
  walletAddress?: string;
  badges?: string[];
  socialLinks?: { twitter?: string; website?: string };
  createdAt?: string;
}

interface StoryItem {
  _id: string;
  title: string;
  content?: string;
  genre?: string;
  coverImage?: string;
  stats?: { likes?: number; views?: number; comments?: number };
  createdAt?: string;
  isNFT?: boolean;
}

interface ProfileStats {
  storyCount: number;
  totalLikes: number;
  totalViews: number;
}

/* ───────────── Helpers ───────────── */
function timeAgo(dateStr?: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

/* ───────────── Story Card ───────────── */
function StoryCard({ story }: { story: StoryItem }) {
  const excerpt =
    story.content && story.content.length > 120
      ? story.content.slice(0, 120) + '…'
      : story.content || 'No excerpt available.';
  return (
    <Card className="group overflow-hidden border-slate-800 bg-slate-950 hover:border-violet-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-900/10">
      {/* Cover gradient */}
      <div className="relative h-36 w-full overflow-hidden bg-gradient-to-br from-violet-900/60 via-indigo-900/40 to-slate-900">
        <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity">
          <BookOpen className="w-16 h-16 text-violet-400" />
        </div>
        <div className="absolute top-2 right-2 flex gap-2">
          {story.isNFT && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg text-[10px]">
              NFT
            </Badge>
          )}
          {story.genre && (
            <Badge
              variant="secondary"
              className="bg-black/60 backdrop-blur text-white border-0 text-[10px]"
            >
              {story.genre}
            </Badge>
          )}
        </div>
      </div>

      <CardHeader className="p-4 pb-2">
        <h3 className="text-base font-bold text-slate-100 line-clamp-1 group-hover:text-violet-400 transition-colors">
          {story.title}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-2">{excerpt}</p>
      </CardHeader>

      <div className="p-4 pt-2 flex justify-between items-center text-slate-500 text-xs">
        <div className="flex gap-3">
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5" /> {story.stats?.likes || 0}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" /> {story.stats?.views || 0}
          </span>
        </div>
        <span className="text-slate-600">{timeAgo(story.createdAt)}</span>
      </div>
    </Card>
  );
}

/* ───────────── Main Component ───────────── */
export default function ProfilePageClient({ userId }: { userId: string }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [stats, setStats] = useState<ProfileStats>({
    storyCount: 0,
    totalLikes: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (userId === 'default') {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    async function fetchProfile() {
      try {
        setLoading(true);
        setError(false);

        const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const res = await fetch(`${baseUrl}/api/v1/users/profile/id/${userId}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error('Failed to load profile');
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Failed');

        setUser(json.data.user);
        setStories(json.data.stories || []);
        setStats(
          json.data.stats || { storyCount: 0, totalLikes: 0, totalViews: 0 }
        );

        // Check ownership — try fetching our own profile
        try {
          const token = typeof window !== 'undefined'
            ? localStorage.getItem('accessToken')
            : null;
          if (token) {
            const meRes = await fetch(`${baseUrl}/api/v1/users/profile`, {
              headers: { Authorization: `Bearer ${token}` },
              signal: controller.signal,
            });
            if (meRes.ok) {
              const meJson = await meRes.json();
              if (
                meJson.success &&
                meJson.data?._id === json.data.user._id
              ) {
                setIsOwner(true);
              }
            }
          }
        } catch {
          // Not logged in — it's fine
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.error('Profile fetch failed:', err);
        setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchProfile();
    return () => controller.abort();
  }, [userId]);

  /* ── Loading Skeleton ── */
  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-background/80">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Header skeleton */}
            <div className="relative">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <div className="flex items-end gap-6 -mt-16 ml-8">
                <Skeleton className="w-32 h-32 rounded-full border-4 border-background" />
                <div className="space-y-2 pb-4">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>

            {/* Stats skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>

            {/* Stories skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-background/80 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md px-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
            <Activity className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100">
            Failed to Load Profile
          </h2>
          <p className="text-slate-400">
            We couldn&apos;t retrieve this profile. The user may not exist or
            there&apos;s a connectivity issue.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
            <Button asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  /* ── Not Found ── */
  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-background/80 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md px-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-violet-500/10 flex items-center justify-center">
            <Users className="w-10 h-10 text-violet-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100">User Not Found</h2>
          <p className="text-slate-400">
            This profile doesn&apos;t exist. The link may be outdated or the
            account has been removed.
          </p>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </main>
    );
  }

  /* ── Derived values ── */
  const displayName = user.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user.username || 'Anonymous';
  const initials = displayName.slice(0, 2).toUpperCase();
  const walletAddr = user.wallet?.address || user.walletAddress;
  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : '';

  /* ── Render ── */
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/80 pb-20">
      {/* ─── Hero / Header ─── */}
      <div className="relative w-full">
        {/* Banner */}
        <div className="h-36 md:h-52 w-full bg-gradient-to-r from-violet-900/50 via-slate-900 to-indigo-900/50 rounded-b-3xl" />

        {/* Profile info overlay */}
        <div className="container max-w-5xl mx-auto px-4 relative -mt-20 md:-mt-24">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000" />
              <Avatar className="w-28 h-28 md:w-36 md:h-36 border-4 border-background relative">
                <AvatarImage src={user.avatar} alt={displayName} />
                <AvatarFallback className="text-2xl font-bold bg-slate-800 text-slate-200">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Name / Username */}
            <div className="flex-1 text-center md:text-left space-y-1 pb-2">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  {displayName}
                </h1>
                {user.badges?.includes('verified') && (
                  <CheckCircle2 className="w-5 h-5 text-blue-400" />
                )}
              </div>
              {user.username && (
                <p className="text-slate-400 font-medium">@{user.username}</p>
              )}
              {walletAddr && (
                <Badge
                  variant="outline"
                  className="inline-flex items-center gap-1 bg-slate-900/50 border-slate-700 text-xs font-mono text-slate-400 mt-1"
                >
                  <Wallet className="w-3 h-3" />
                  {walletAddr.slice(0, 6)}…{walletAddr.slice(-4)}
                  <button
                    onClick={() => navigator.clipboard?.writeText(walletAddr)}
                    className="ml-1 text-slate-400 hover:text-white transition-colors"
                    aria-label="Copy wallet address"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {user.bio && (
                <p className="max-w-lg text-sm text-slate-300 mt-2">
                  {user.bio}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                {joinDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Joined {joinDate}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-4 md:mt-0 pb-2">
              {isOwner ? (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className="gap-2 border-slate-700 hover:bg-slate-800"
                  >
                    <Link href="/profile/settings">
                      <Edit className="w-4 h-4" /> Edit Profile
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="icon"
                    className="border-slate-700 hover:bg-slate-800"
                  >
                    <Link href="/dashboard">
                      <BarChart3 className="w-4 h-4" />
                    </Link>
                  </Button>
                </>
              ) : (
                <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/20">
                  Follow
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white"
                onClick={() => navigator.clipboard?.writeText(window.location.href)}
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Stats ─── */}
      <div className="container max-w-5xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Stories',
              value: stats.storyCount,
              icon: BookOpen,
              color: 'text-blue-400',
              bg: 'bg-blue-500/10',
            },
            {
              label: 'Total Views',
              value: stats.totalViews,
              icon: Eye,
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10',
            },
            {
              label: 'Total Likes',
              value: stats.totalLikes,
              icon: Heart,
              color: 'text-pink-400',
              bg: 'bg-pink-500/10',
              highlight: true,
            },
            {
              label: 'Followers',
              value: 0,
              icon: Users,
              color: 'text-violet-400',
              bg: 'bg-violet-500/10',
            },
          ].map((stat) => (
            <Card
              key={stat.label}
              className="border-slate-800 bg-slate-950/50 hover:border-slate-700 transition-colors"
            >
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p
                    className={`text-2xl font-bold ${
                      stat.highlight
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400'
                        : 'text-slate-100'
                    }`}
                  >
                    {formatCount(stat.value)}
                  </p>
                  <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                    {stat.label}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ─── Badges ─── */}
        {user.badges && user.badges.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {user.badges.map((badge) => (
              <Badge
                key={badge}
                variant="secondary"
                className="bg-violet-500/10 text-violet-300 border-violet-500/20"
              >
                <Sparkles className="w-3 h-3 mr-1" /> {badge}
              </Badge>
            ))}
          </div>
        )}

        {/* ─── Content Tabs ─── */}
        <div className="mt-8">
          <Tabs defaultValue="stories" className="w-full">
            <div className="flex justify-center md:justify-start mb-6">
              <TabsList className="bg-slate-900 border border-slate-800">
                <TabsTrigger value="stories" className="gap-2">
                  <BookOpen className="w-4 h-4" /> Stories
                </TabsTrigger>
                <TabsTrigger value="saved" className="gap-2">
                  <Bookmark className="w-4 h-4" /> Saved
                </TabsTrigger>
                <TabsTrigger value="activity" className="gap-2">
                  <Activity className="w-4 h-4" /> Activity
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="stories"
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              {stories.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stories.map((story) => (
                    <Link
                      key={story._id}
                      href={`/stories/${story._id}`}
                      className="block"
                    >
                      <StoryCard story={story} />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-slate-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">No stories yet</p>
                  <p className="text-sm mt-1">
                    {isOwner
                      ? 'Start creating your first story!'
                      : 'This creator hasn\'t published any stories yet.'}
                  </p>
                  {isOwner && (
                    <Button asChild className="mt-6">
                      <Link href="/create/ai-story">Create a Story</Link>
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="saved">
              <div className="p-12 text-center text-slate-500 bg-slate-900/30 rounded-xl border border-slate-800 border-dashed">
                <Bookmark className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Saved stories</p>
                <p className="text-sm mt-1 text-slate-600">
                  Bookmarked stories will appear here.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="activity">
              <div className="p-12 text-center text-slate-500 bg-slate-900/30 rounded-xl border border-slate-800 border-dashed">
                <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Activity feed</p>
                <p className="text-sm mt-1 text-slate-600">
                  Recent interactions and activity will appear here.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
