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
    Shield,
    Coins,
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
    id?: string;
    _id?: string;
    username?: string;
    firstName?: string;
    first_name?: string;
    lastName?: string;
    last_name?: string;
    display_name?: string;
    bio?: string;
    avatar?: string;
    avatar_url?: string;
    email?: string;
    wallet?: { address?: string };
    walletAddress?: string;
    wallet_address?: string;
    badges?: string[];
    socialLinks?: { twitter?: string; website?: string };
    createdAt?: string;
    created_at?: string;
}

interface StoryItem {
    _id?: string;
    id?: string;
    title: string;
    content?: string;
    genre?: string;
    coverImage?: string;
    cover_image?: string;
    stats?: { likes?: number; views?: number; comments?: number };
    likes?: number;
    views?: number;
    createdAt?: string;
    created_at?: string;
    isNFT?: boolean;
    isMinted?: boolean;
    is_minted?: boolean;
    moderationStatus?: 'pending' | 'approved' | 'rejected';
    moderation_status?: 'pending' | 'approved' | 'rejected';
    source?: string;
}

interface ProfileStats {
    storyCount: number;
    totalLikes: number;
    totalViews: number;
}

interface DraftItem {
    draftKey: string;
    storyType: string;
    title: string;
    genre: string;
    version: number;
    updatedAt: string;
    createdAt: string;
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

function moderationBadge(status?: string) {
    if (!status) return null;
    const map: Record<string, { label: string; className: string }> = {
        pending: { label: 'Pending Review', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
        approved: { label: 'Approved', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
        rejected: { label: 'Rejected', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
    };
    const s = map[status];
    if (!s) return null;
    return (
        <Badge variant="outline" className={`text-[10px] ${s.className}`}>
            {s.label}
        </Badge>
    );
}

/* ───────────── Story Card ───────────── */
function StoryCard({ story, showStatus }: { story: StoryItem; showStatus?: boolean }) {
    const excerpt =
        story.content && story.content.length > 120
            ? story.content.slice(0, 120) + '…'
            : story.content || 'No excerpt available.';
    const storyId = story._id || story.id;
    const cardContent = (
        <Card className="group overflow-hidden border-slate-800 bg-slate-950 hover:border-violet-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-900/10">
            {/* Cover gradient */}
            <div className="relative h-36 w-full overflow-hidden bg-gradient-to-br from-violet-900/60 via-indigo-900/40 to-slate-900">
                <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity">
                    <BookOpen className="w-16 h-16 text-violet-400" />
                </div>
                <div className="absolute top-2 right-2 flex gap-2">
                    {(story.isNFT || story.isMinted) && (
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
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-100 line-clamp-1 group-hover:text-violet-400 transition-colors">
                        {story.title}
                    </h3>
                    {showStatus && moderationBadge(story.moderationStatus)}
                </div>
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
    if (storyId) {
        return <Link href={`/stories/${storyId}`}>{cardContent}</Link>;
    }
    return cardContent;
}

/* ───────────── Main Component ───────────── */
export default function ProfilePageClient({ slug }: { slug: string }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [stories, setStories] = useState<StoryItem[]>([]);
    const [drafts, setDrafts] = useState<DraftItem[]>([]);
    const [stats, setStats] = useState<ProfileStats>({
        storyCount: 0,
        totalLikes: 0,
        totalViews: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        async function fetchProfile() {
            try {
                setLoading(true);
                setError(false);

                const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://groqtales-backend-api.onrender.com';

                if (slug === 'me') {
                    // Fetch own profile using auth token
                    const token = typeof window !== 'undefined'
                        ? localStorage.getItem('accessToken')
                        : null;
                    if (!token) {
                        setError(true);
                        setLoading(false);
                        return;
                    }
                    const res = await fetch(`${baseUrl}/api/v1/users/profile`, {
                        headers: { Authorization: `Bearer ${token}` },
                        signal: controller.signal,
                    });
                    if (!res.ok) throw new Error('Failed to load profile');
                    const json = await res.json();
                    if (!json.success) throw new Error(json.error || 'Failed');
                    // Normalize Supabase field names
                    const profileData = json.data;
                    setUser({
                        ...profileData,
                        _id: profileData.id || profileData._id,
                        firstName: profileData.first_name || profileData.firstName,
                        lastName: profileData.last_name || profileData.lastName,
                        avatar: profileData.avatar_url || profileData.avatar,
                        walletAddress: profileData.wallet_address || profileData.walletAddress,
                        createdAt: profileData.created_at || profileData.createdAt,
                    });
                    // Normalize stories
                    const rawStories = json.stories || [];
                    setStories(rawStories.map((s: StoryItem) => ({
                        ...s,
                        _id: s.id || s._id,
                        moderationStatus: s.moderation_status || s.moderationStatus,
                        isMinted: s.is_minted || s.isMinted,
                        coverImage: s.cover_image || s.coverImage,
                        stats: s.stats || { likes: s.likes || 0, views: s.views || 0, comments: 0 },
                        createdAt: s.created_at || s.createdAt,
                    })));
                    setStats(
                        json.stats || { storyCount: 0, totalLikes: 0, totalViews: 0 }
                    );
                    setIsOwner(true);

                    // Load drafts for owner
                    try {
                        const draftRes = await fetch(`${baseUrl}/api/v1/drafts/list?storyType=vedascript`, {
                            headers: { Authorization: `Bearer ${token}` },
                            signal: controller.signal,
                        });
                        if (draftRes.ok) {
                            const draftJson = await draftRes.json();
                            setDrafts(draftJson.data || []);
                        }
                    } catch { /* drafts are optional */ }
                } else {
                    // Fetch public profile by username
                    const res = await fetch(`${baseUrl}/api/v1/users/profile/username/${encodeURIComponent(slug)}`, {
                        signal: controller.signal,
                    });
                    if (!res.ok) throw new Error('Failed to load profile');
                    const json = await res.json();
                    if (!json.success) throw new Error(json.error || 'Failed');

                    const profileData = json.data?.user || json.data;
                    setUser({
                        ...profileData,
                        _id: profileData.id || profileData._id,
                        firstName: profileData.first_name || profileData.firstName,
                        lastName: profileData.last_name || profileData.lastName,
                        avatar: profileData.avatar_url || profileData.avatar,
                        walletAddress: profileData.wallet_address || profileData.walletAddress,
                        createdAt: profileData.created_at || profileData.createdAt,
                    });
                    const rawStories2 = json.data?.stories || json.stories || [];
                    setStories(rawStories2.map((s: StoryItem) => ({
                        ...s,
                        _id: s.id || s._id,
                        moderationStatus: s.moderation_status || s.moderationStatus,
                        isMinted: s.is_minted || s.isMinted,
                        coverImage: s.cover_image || s.coverImage,
                        stats: s.stats || { likes: s.likes || 0, views: s.views || 0, comments: 0 },
                        createdAt: s.created_at || s.createdAt,
                    })));
                    setStats(
                        json.data?.stats || json.stats || { storyCount: 0, totalLikes: 0, totalViews: 0 }
                    );

                    // Check ownership
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
                                const meId = meJson.data?.id || meJson.data?._id;
                                const profileId = profileData.id || profileData._id;
                                if (meJson.success && meId && meId === profileId) {
                                    setIsOwner(true);
                                }
                            }
                        }
                    } catch {
                        // Not logged in
                    }
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
    }, [slug]);

    /* ── Loading Skeleton ── */
    if (loading) {
        return (
            <main className="min-h-screen bg-gradient-to-b from-background to-background/80">
                <div className="container mx-auto px-4 py-20">
                    <div className="max-w-5xl mx-auto space-y-8">
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
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="h-24 rounded-xl" />
                            ))}
                        </div>
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
                        {slug === 'me' ? 'Please Log In' : 'Failed to Load Profile'}
                    </h2>
                    <p className="text-slate-400">
                        {slug === 'me'
                            ? 'You need to be logged in to view your profile.'
                            : "We couldn\u2019t retrieve this profile. The user may not exist or there\u2019s a connectivity issue."}
                    </p>
                    <div className="flex gap-3 justify-center">
                        {slug === 'me' ? (
                            <Button asChild>
                                <Link href="/sign-in">Sign In</Link>
                            </Button>
                        ) : (
                            <>
                                <Button onClick={() => window.location.reload()} variant="outline">
                                    Retry
                                </Button>
                                <Button asChild>
                                    <Link href="/">Back to Home</Link>
                                </Button>
                            </>
                        )}
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
    const displayName = user.first_name || user.firstName
        ? `${user.first_name || user.firstName || ''} ${user.last_name || user.lastName || ''}`.trim()
        : user.display_name || user.username || 'Anonymous';
    const initials = displayName.slice(0, 2).toUpperCase();
    const walletAddr = user.wallet?.address || user.wallet_address || user.walletAddress;
    const joinDate = (user.created_at || user.createdAt)
        ? new Date(user.created_at || user.createdAt || '').toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
        })
        : '';

    const handleMintNft = async (storyId: string) => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://groqtales-backend-api.onrender.com';
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${baseUrl}/api/v1/nft/mint`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ storyId, metadata: {} }),
            });
            if (res.ok) {
                alert('NFT minting initiated! Check your wallet.');
            } else {
                const err = await res.json();
                alert(`Minting failed: ${err.error || 'Unknown error'}`);
            }
        } catch {
            alert('Failed to connect to minting service.');
        }
    };

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
                                <AvatarImage src={user.avatar_url || user.avatar} alt={displayName} />
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
                                        className={`text-2xl font-bold ${stat.highlight
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
                                {isOwner && (
                                    <TabsTrigger value="drafts" className="gap-2">
                                        <Bookmark className="w-4 h-4 text-amber-400" /> Drafts
                                        {drafts.length > 0 && (
                                            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-400">{drafts.length}</span>
                                        )}
                                    </TabsTrigger>
                                )}
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
                                        <div key={story._id || story.id} className="relative">
                                            <div className="block">
                                                <StoryCard story={story} showStatus={isOwner} />
                                            </div>
                                            {/* Mint NFT button for approved stories that haven't been minted */}
                                            {isOwner && story.moderationStatus === 'approved' && !story.isMinted && (
                                                <Button
                                                    size="sm"
                                                    className="absolute bottom-12 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs gap-1 shadow-lg"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleMintNft(story._id || story.id || '');
                                                    }}
                                                >
                                                    <Coins className="w-3 h-3" /> Mint NFT
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 text-slate-500">
                                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                    <p className="text-lg font-medium">No stories yet</p>
                                    <p className="text-sm mt-1">
                                        {isOwner
                                            ? 'Start creating your first story!'
                                            : "This creator hasn't published any stories yet."}
                                    </p>
                                    {isOwner && (
                                        <Button asChild className="mt-6">
                                            <Link href="/create/ai-story">Create a Story</Link>
                                        </Button>
                                    )}
                                </div>
                            )}
                        </TabsContent>

                        {/* Drafts Tab */}
                        {isOwner && (
                            <TabsContent value="drafts" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {drafts.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {drafts.map((draft) => (
                                            <a
                                                key={draft.draftKey}
                                                href={`/create/ai-story?draftKey=${encodeURIComponent(draft.draftKey)}`}
                                                className="group block p-4 rounded-xl border border-slate-800 bg-slate-950 hover:border-amber-500/40 hover:shadow-lg transition-all"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <h3 className="text-sm font-semibold text-slate-100 line-clamp-1 group-hover:text-amber-400 transition-colors">
                                                        {draft.title || 'Untitled Draft'}
                                                    </h3>
                                                    <span className="text-[10px] text-slate-600 ml-2 shrink-0">v{draft.version}</span>
                                                </div>
                                                {draft.genre && (
                                                    <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
                                                        {draft.genre}
                                                    </span>
                                                )}
                                                <p className="text-xs text-slate-500">
                                                    Saved {new Date(draft.updatedAt).toLocaleDateString()}
                                                </p>
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center text-slate-500 bg-slate-900/30 rounded-xl border border-slate-800 border-dashed">
                                        <Bookmark className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                        <p className="font-medium">No VedaScript drafts</p>
                                        <p className="text-sm mt-1 text-slate-600">
                                            Drafts saved from the VedaScript Engine will appear here.
                                        </p>
                                        <a href="/create/ai-story" className="inline-block mt-4 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm hover:bg-amber-500/20 transition-colors">
                                            Open VedaScript Engine
                                        </a>
                                    </div>
                                )}
                            </TabsContent>
                        )}

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
