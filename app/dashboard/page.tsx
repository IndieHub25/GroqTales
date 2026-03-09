'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Image as ImageIcon,
  Gem,
  Activity,
  Settings,
  TrendingUp,
  PenLine,
  FileText,
  Eye,
  Heart,
  ChevronRight,
  Plus,
  ExternalLink,
  Loader2,
  AlertCircle,
  RefreshCw,
  Wallet,
  Bell,
  Shield,
  User,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import Link from 'next/link';
import {
  getUserProfile,
  getUserComics,
  getUserDrafts,
  getUserNFTs,
  getUserFeed,
  getUserSettings,
  updateUserSettings,
} from '@/lib/api-client';
import { apiFetch, authHeaders, API_BASE_URL } from '@/lib/api-client';
import { useWallet } from '@/hooks/use-wallet';

// ─────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────

interface UserProfile {
  displayName: string;
  email: string;
  avatar: string | null;
  bio: string;
  stats: {
    stories: number;
    comics: number;
    nfts: number;
    drafts: number;
    views: number;
    likes: number;
    earnings: number;
  };
}

interface StoryItem {
  _id: string;
  title: string;
  type: string;
  status: string;
  updatedAt: string;
  viewCount?: number;
  likeCount?: number;
}

interface ComicItem {
  _id: string;
  slug: string;
  title: string;
  coverImage?: { gatewayURL?: string };
  genres: string[];
  status: string;
  metadata?: {
    heroName?: string;
    stylePreset?: string;
  };
  pages?: any[];
  updatedAt: string;
}

interface NFTItem {
  _id: string;
  name: string;
  tokenId?: string;
  status: string;
  linkedContent?: { title?: string; type?: string };
  imageUrl?: string;
  createdAt: string;
}

interface FeedItem {
  _id: string;
  type: string;
  title: string;
  creator?: { displayName?: string; avatar?: string };
  createdAt: string;
  content?: string;
}

type Tab = 'stories' | 'comics' | 'collectibles' | 'feed' | 'wallet' | 'settings';

// ─────────────────────────────────────────────────────────────────────────
// Tab config
// ─────────────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'stories', label: 'Stories', icon: BookOpen },
  { id: 'comics', label: 'Comics', icon: ImageIcon },
  { id: 'collectibles', label: 'Collectibles', icon: Gem },
  { id: 'feed', label: 'Feed', icon: Activity },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'settings', label: 'Settings', icon: Settings },
];

// ─────────────────────────────────────────────────────────────────────────
// Loading Skeleton
// ─────────────────────────────────────────────────────────────────────────

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-white/[0.06] rounded-lg ${className}`} />
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-20" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────────────────────────────────────

function EmptyState({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon: any;
  title: string;
  subtitle: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-white/20" />
      </div>
      <p className="text-sm font-medium text-white/40 mb-1">{title}</p>
      <p className="text-xs text-white/20 mb-4 max-w-[280px]">{subtitle}</p>
      {action && (
        <Link href={action.href}>
          <Button size="sm" className="text-xs bg-blue-600 hover:bg-blue-500 text-white border-0">
            <Plus className="w-3 h-3 mr-1.5" />
            {action.label}
          </Button>
        </Link>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('stories');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Tab data
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [drafts, setDrafts] = useState<StoryItem[]>([]);
  const [comics, setComics] = useState<ComicItem[]>([]);
  const [nfts, setNFTs] = useState<any[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [walletData, setWalletData] = useState<any>(null);
  const [tabLoading, setTabLoading] = useState(false);
  const [tabError, setTabError] = useState<string | null>(null);

  const { address } = useWallet();

  // Settings
  const [settingsForm, setSettingsForm] = useState<{
    displayName: string;
    bio: string;
    notifications: boolean;
    publicProfile: boolean;
  }>({
    displayName: '',
    bio: '',
    notifications: true,
    publicProfile: true,
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const [profileError, setProfileError] = useState<string | null>(null);

  // ── Load Profile ──────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      setProfileLoading(true);
      setProfileError(null);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (!token) {
          setProfileError('not_authenticated');
          setProfileLoading(false);
          return;
        }
        const res = await getUserProfile();
        if (!res.ok) {
          if (res.status === 401) {
            setProfileError('session_expired');
            setProfileLoading(false);
            return;
          }
          throw new Error('Failed to load profile');
        }
        if ((res.data as any)?.success !== false) {
          const d = (res.data as any)?.data || (res.data as any)?.user || res.data;
          setProfile({
            displayName: d.displayName || d.display_name || d.username || 'Creator',
            email: d.email || '',
            avatar: d.avatar || d.avatar_url || d.profileImage || null,
            bio: d.bio || '',
            stats: {
              stories: d.stats?.stories || d.storyCount || 0,
              comics: d.stats?.comics || d.comicCount || 0,
              nfts: d.stats?.nfts || d.nftCount || 0,
              drafts: d.stats?.drafts || d.draftCount || 0,
              views: d.stats?.views || d.totalViews || 0,
              likes: d.stats?.likes || d.totalLikes || 0,
              earnings: d.stats?.earnings || d.totalEarnings || 0,
            },
          });
          setSettingsForm({
            displayName: d.displayName || d.display_name || d.username || '',
            bio: d.bio || '',
            notifications: d.notifications !== false,
            publicProfile: d.publicProfile !== false,
          });
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
        setProfileError('load_failed');
      } finally {
        setProfileLoading(false);
      }
    })();
  }, []);

  // ── Load Tab Data ─────────────────────────────────────────────

  const loadTabData = useCallback(async (tab: Tab) => {
    setTabLoading(true);
    setTabError(null);

    try {
      switch (tab) {
        case 'stories': {
          const [storiesRes, draftsRes] = await Promise.all([
            apiFetch('/api/v1/stories?limit=20', { method: 'GET', headers: authHeaders() }),
            getUserDrafts(),
          ]);
          if (storiesRes.ok) {
            const d = (storiesRes.data as any)?.data || (storiesRes.data as any)?.stories || [];
            setStories(Array.isArray(d) ? d : []);
          }
          if (draftsRes.ok) {
            const d = (draftsRes.data as any)?.data || (draftsRes.data as any)?.drafts || [];
            setDrafts(Array.isArray(d) ? d : []);
          }
          break;
        }
        case 'comics': {
          const res = await getUserComics();
          if (res.ok) {
            const d = (res.data as any)?.data || (res.data as any)?.comics || [];
            setComics(Array.isArray(d) ? d : []);
          }
          break;
        }
        case 'collectibles': {
          if (address) {
            // Use the new Alchemy backend endpoint for NFT fetching
            const res = await apiFetch(`/api/v1/eth-mainnet/wallets/${address}/nfts`, {
              method: 'GET',
              headers: authHeaders(),
            });
            if (res.ok) {
              const d = (res.data as any)?.data || (res.data as any)?.nfts || (res.data as any)?.ownedNfts || [];
              setNFTs(Array.isArray(d) ? d : []);
            }
          } else {
            // Fallback back to standard offchain DB
            const res = await getUserNFTs();
            if (res.ok) {
              const d = (res.data as any)?.data || (res.data as any)?.nfts || [];
              setNFTs(Array.isArray(d) ? d : []);
            }
          }
          break;
        }
        case 'feed': {
          const res = await getUserFeed();
          if (res.ok) {
            const d = (res.data as any)?.data || (res.data as any)?.feed || (res.data as any)?.items || [];
            setFeed(Array.isArray(d) ? d : []);
          }
          break;
        }
        case 'wallet': {
          if (address) {
            const res = await apiFetch(`/api/v1/eth-mainnet/wallets/${address}/portfolio`, {
              method: 'GET',
              headers: authHeaders(),
            });
            if (res.ok) {
              setWalletData((res.data as any)?.data || res.data);
            }
          } else {
            setTabError('Wallet not connected. Connect your wallet to view portfolio.');
          }
          break;
        }
        case 'settings':
          // profile already loaded
          break;
      }
    } catch (err: any) {
      setTabError(err.message || 'Failed to load data');
    } finally {
      setTabLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab, address, loadTabData]);

  // ── Save Settings ─────────────────────────────────────────────

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    setSettingsSaved(false);
    try {
      await updateUserSettings(settingsForm);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSettingsSaving(false);
    }
  };

  // ── Time formatter ────────────────────────────────────────────

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="min-h-screen relative bg-black text-white font-sans overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(59,130,246,0.08),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(168,85,247,0.06),_transparent_50%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 max-w-[1200px] mx-auto px-4 py-6"
      >
        {/* ════════════════════════════════════════════════════════
           PROFILE ERROR STATE
           ════════════════════════════════════════════════════════ */}
        {profileError && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">
              {profileError === 'session_expired'
                ? 'Session Expired'
                : profileError === 'not_authenticated'
                  ? 'Not Logged In'
                  : 'Failed to Load Dashboard'}
            </h2>
            <p className="text-sm text-white/40 mb-6 max-w-sm">
              {profileError === 'session_expired'
                ? 'Your session has expired. Please sign in again to access your dashboard.'
                : profileError === 'not_authenticated'
                  ? 'You need to be logged in to access your dashboard.'
                  : 'Something went wrong loading your profile. Please try again.'}
            </p>
            <div className="flex gap-3">
              {(profileError === 'session_expired' || profileError === 'not_authenticated') ? (
                <Link href="/sign-in">
                  <Button className="bg-blue-600 hover:bg-blue-500 text-white">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
              ) : (
                <Button onClick={() => window.location.reload()} variant="outline" className="border-white/10 text-white/70 hover:text-white">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              )}
              <Link href="/">
                <Button variant="ghost" className="text-white/40 hover:text-white">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        )}

        {!profileError && (
        <>
        {/* ════════════════════════════════════════════════════════
           HERO WELCOME BLOCK
           ════════════════════════════════════════════════════════ */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {profile?.avatar ? (
                <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-7 h-7 text-white/30" />
              )}
            </div>
            <div className="flex-1">
              {profileLoading ? (
                <>
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </>
              ) : (
                <>
                  <h1 className="text-xl font-bold text-white">
                    Welcome back, {profile?.displayName || 'Creator'}
                  </h1>
                  <p className="text-sm text-white/40">
                    Your creative command center
                  </p>
                </>
              )}
            </div>
            <Link href="/create">
              <Button className="text-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-blue-500/10">
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Create New
              </Button>
            </Link>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                label: 'Stories',
                value: profile?.stats.stories || 0,
                icon: BookOpen,
                color: 'blue',
                gradient: 'from-blue-500/10 to-blue-600/5',
                border: 'border-blue-500/15',
              },
              {
                label: 'Comics',
                value: profile?.stats.comics || 0,
                icon: ImageIcon,
                color: 'purple',
                gradient: 'from-purple-500/10 to-purple-600/5',
                border: 'border-purple-500/15',
              },
              {
                label: 'NFTs Minted',
                value: profile?.stats.nfts || 0,
                icon: Gem,
                color: 'amber',
                gradient: 'from-amber-500/10 to-amber-600/5',
                border: 'border-amber-500/15',
              },
              {
                label: 'Drafts',
                value: profile?.stats.drafts || 0,
                icon: PenLine,
                color: 'emerald',
                gradient: 'from-emerald-500/10 to-emerald-600/5',
                border: 'border-emerald-500/15',
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl border ${stat.border} bg-gradient-to-br ${stat.gradient} backdrop-blur-xl p-4`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-white/40" />
                    <span className="text-[11px] text-white/40 uppercase tracking-wide">{stat.label}</span>
                  </div>
                  {profileLoading ? (
                    <Skeleton className="h-7 w-12" />
                  ) : (
                    <span className="text-2xl font-bold text-white">{stat.value}</span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
           TAB NAVIGATION
           ════════════════════════════════════════════════════════ */}
        <div className="border-b border-white/[0.06] mb-6">
          <div className="flex gap-1 -mb-px overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-white/40 hover:text-white/60 hover:border-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
           TAB CONTENT
           ════════════════════════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {/* Error Banner */}
            {tabError && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-sm text-red-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {tabError}
                <button
                  onClick={() => loadTabData(activeTab)}
                  className="ml-auto text-xs text-red-400 hover:text-red-300"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Loading Skeletons */}
            {tabLoading && activeTab !== 'settings' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <>
                {/* ──────── STORIES TAB ──────── */}
                {activeTab === 'stories' && (
                  <>
                    {stories.length === 0 && drafts.length === 0 ? (
                      <EmptyState
                        icon={BookOpen}
                        title="No stories yet"
                        subtitle="Start your first story with VedaScript or the AI Story Studio"
                        action={{ label: 'Create Story', href: '/create/ai-story' }}
                      />
                    ) : (
                      <div className="space-y-6">
                        {/* Published / All Stories */}
                        {stories.length > 0 && (
                          <div>
                            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
                              Published Stories ({stories.length})
                            </h3>
                            <div className="space-y-2">
                              {stories.map((story) => (
                                <div
                                  key={story._id}
                                  className="flex items-center gap-4 px-4 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors group"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-4 h-4 text-blue-400/60" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white/80 truncate">{story.title}</p>
                                    <div className="flex items-center gap-3 text-[11px] text-white/30">
                                      <span>{story.type || 'Story'}</span>
                                      <span>·</span>
                                      <span>{timeAgo(story.updatedAt)}</span>
                                      {story.viewCount !== undefined && (
                                        <>
                                          <span>·</span>
                                          <span className="flex items-center gap-1">
                                            <Eye className="w-3 h-3" /> {story.viewCount}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] ${
                                      story.status === 'published'
                                        ? 'border-emerald-500/30 text-emerald-400'
                                        : 'border-white/10 text-white/30'
                                    }`}
                                  >
                                    {story.status}
                                  </Badge>
                                  <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white/30 transition-colors" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Drafts */}
                        {drafts.length > 0 && (
                          <div>
                            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
                              Drafts ({drafts.length})
                            </h3>
                            <div className="space-y-2">
                              {drafts.map((draft) => (
                                <div
                                  key={draft._id}
                                  className="flex items-center gap-4 px-4 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors group"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                                    <PenLine className="w-4 h-4 text-amber-400/60" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white/80 truncate">{draft.title}</p>
                                    <span className="text-[11px] text-white/30">{timeAgo(draft.updatedAt)}</span>
                                  </div>
                                  <Badge variant="outline" className="text-[10px] border-amber-500/20 text-amber-400/60">
                                    Draft
                                  </Badge>
                                  <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white/30 transition-colors" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* ──────── COMICS TAB ──────── */}
                {activeTab === 'comics' && (
                  <>
                    {comics.length === 0 ? (
                      <EmptyState
                        icon={ImageIcon}
                        title="No comics yet"
                        subtitle="Create your first comic with the Panelra Engine"
                        action={{ label: 'Create Comic', href: '/create/comic' }}
                      />
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {comics.map((comic) => (
                          <Card
                            key={comic._id}
                            className="bg-white/[0.03] border-white/[0.08] backdrop-blur-xl overflow-hidden group hover:border-purple-500/20 transition-all"
                          >
                            {/* Cover */}
                            <div className="aspect-[16/10] bg-gradient-to-br from-purple-500/10 to-blue-500/5 flex items-center justify-center overflow-hidden">
                              {comic.coverImage?.gatewayURL ? (
                                <img
                                  src={comic.coverImage.gatewayURL}
                                  alt={comic.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              ) : (
                                <ImageIcon className="w-10 h-10 text-white/10" />
                              )}
                            </div>
                            <CardContent className="p-3">
                              <p className="text-sm font-medium text-white/80 mb-1 truncate">{comic.title}</p>
                              <div className="flex items-center gap-2 text-[11px] text-white/30 mb-2">
                                {comic.metadata?.heroName && (
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" /> {comic.metadata.heroName}
                                  </span>
                                )}
                                {comic.pages && (
                                  <span>{comic.pages.length} pages</span>
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex gap-1">
                                  {comic.genres?.slice(0, 2).map((g) => (
                                    <Badge key={g} variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-white/10 text-white/30">
                                      {g}
                                    </Badge>
                                  ))}
                                </div>
                                <Badge
                                  variant="outline"
                                  className={`text-[9px] ${
                                    comic.status === 'published'
                                      ? 'border-emerald-500/30 text-emerald-400'
                                      : 'border-amber-500/20 text-amber-400/60'
                                  }`}
                                >
                                  {comic.status}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* ──────── COLLECTIBLES TAB ──────── */}
                {activeTab === 'collectibles' && (
                  <>
                    {nfts.length === 0 ? (
                      <EmptyState
                        icon={Gem}
                        title="No collectibles yet"
                        subtitle="Mint your stories and comics as NFTs to build your collection"
                      />
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {nfts.map((nft, i) => {
                          const name = nft.name || nft.title || nft.contract?.name || `NFT ${i}`;
                          const image = nft.imageUrl || nft.image?.cachedUrl || nft.image?.originalUrl;
                          return (
                          <Card
                            key={nft._id || nft.tokenId || i}
                            className="bg-white/[0.03] border-white/[0.08] backdrop-blur-xl overflow-hidden group hover:border-amber-500/20 transition-all"
                          >
                            <div className="aspect-square bg-gradient-to-br from-amber-500/10 to-purple-500/5 flex items-center justify-center overflow-hidden">
                              {image ? (
                                <img
                                  src={image}
                                  alt={name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              ) : (
                                <Gem className="w-10 h-10 text-amber-400/20" />
                              )}
                            </div>
                            <CardContent className="p-3">
                              <p className="text-sm font-medium text-white/80 mb-1 truncate">{name}</p>
                              <div className="flex items-center justify-between text-[11px] text-white/30">
                                <span>
                                  {nft.linkedContent?.type || nft.tokenType || 'NFT'}: {nft.linkedContent?.title || '–'}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`text-[9px] ${
                                    (nft.status === 'minted' || nft.tokenId)
                                      ? 'border-emerald-500/30 text-emerald-400'
                                      : 'border-white/10 text-white/30'
                                  }`}
                                >
                                  {nft.status || 'Owned'}
                                </Badge>
                              </div>
                              {nft.tokenId && (
                                <p className="text-[10px] text-white/15 mt-1 font-mono truncate">
                                  Token: {nft.tokenId}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        )})}
                      </div>
                    )}
                  </>
                )}

                {/* ──────── FEED TAB ──────── */}
                {activeTab === 'feed' && (
                  <>
                    {feed.length === 0 ? (
                      <EmptyState
                        icon={Activity}
                        title="No activity yet"
                        subtitle="Your feed will show stories, comics, and activity from creators you follow"
                      />
                    ) : (
                      <div className="space-y-2">
                        {feed.map((item) => (
                          <div
                            key={item._id}
                            className="flex items-start gap-4 px-4 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                          >
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {item.creator?.avatar ? (
                                <img src={item.creator.avatar} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-4 h-4 text-blue-400/50" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white/80">
                                <span className="font-medium">{item.creator?.displayName || 'Creator'}</span>
                                {' '}
                                <span className="text-white/40">
                                  {item.type === 'story' ? 'published a story' :
                                   item.type === 'comic' ? 'created a comic' :
                                   item.type === 'nft' ? 'minted an NFT' : 'shared something'}
                                </span>
                              </p>
                              <p className="text-sm font-medium text-blue-300/80 mt-0.5 truncate">{item.title}</p>
                              <span className="text-[11px] text-white/20 mt-1 block">{timeAgo(item.createdAt)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* ──────── WALLET PORTFOLIO TAB ──────── */}
                {activeTab === 'wallet' && (
                  <>
                    {!address ? (
                      <EmptyState
                        icon={Wallet}
                        title="Wallet not connected"
                        subtitle="Please connect your Wallet in the UI to view your web3 portfolio."
                      />
                    ) : !walletData ? (
                       <EmptyState
                        icon={Loader2}
                        title="Loading Portfolio..."
                        subtitle=""
                      />
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card className="bg-white/[0.03] border-white/[0.08] backdrop-blur-xl">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm flex items-center gap-2 text-white/90">
                                <Wallet className="w-4 h-4 text-emerald-400" />
                                Ethereum Balance
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-2xl font-bold">{walletData?.assets?.eth?.balanceRaw || '0.00'} ETH</p>
                            </CardContent>
                          </Card>
                          
                          <Card className="bg-white/[0.03] border-white/[0.08] backdrop-blur-xl">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm flex items-center gap-2 text-white/90">
                                <Gem className="w-4 h-4 text-amber-400" />
                                Total NFTs
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-2xl font-bold">{walletData?.meta?.totalNfts || 0}</p>
                            </CardContent>
                          </Card>

                          <Card className="bg-white/[0.03] border-white/[0.08] backdrop-blur-xl">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm flex items-center gap-2 text-white/90">
                                <Activity className="w-4 h-4 text-purple-400" />
                                Recent Transactions
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-2xl font-bold">0</p>
                            </CardContent>
                          </Card>
                        </div>
                        
                        <div>
                          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
                            ERC-20 Tokens
                          </h3>
                          <div className="space-y-2">
                            {walletData?.assets?.tokens?.length > 0 ? (
                               walletData.assets.tokens.map((tb: any, i: number) => (
                                 <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                                    <p className="text-sm text-white/80">{tb.contractAddress || tb.address || 'Unknown Token'}</p>
                                    <p className="text-sm text-white font-mono">{tb.balanceRaw || tb.tokenBalance || 0}</p>
                                 </div>
                               ))
                            ) : (
                              <p className="text-sm text-white/30 text-center py-4">No tokens found.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* ──────── SETTINGS TAB ──────── */}
                {activeTab === 'settings' && (
                  <div className="max-w-xl space-y-6">
                    {/* Profile Info */}
                    <Card className="bg-white/[0.03] border-white/[0.08] backdrop-blur-xl">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2 text-white/90">
                          <User className="w-4 h-4 text-blue-400" />
                          Profile
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-white/50">Display Name</Label>
                          <Input
                            value={settingsForm.displayName}
                            onChange={(e) => setSettingsForm((prev) => ({ ...prev, displayName: e.target.value }))}
                            className="text-sm bg-white/5 border-white/10"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-white/50">Bio</Label>
                          <Textarea
                            value={settingsForm.bio}
                            onChange={(e) => setSettingsForm((prev) => ({ ...prev, bio: e.target.value }))}
                            className="text-sm bg-white/5 border-white/10 resize-none h-20"
                            placeholder="Tell the world about yourself…"
                          />
                        </div>
                        <div className="text-xs text-white/20">
                          Email: {profile?.email || '–'}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Preferences */}
                    <Card className="bg-white/[0.03] border-white/[0.08] backdrop-blur-xl">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2 text-white/90">
                          <Bell className="w-4 h-4 text-purple-400" />
                          Preferences
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-white/80">Email Notifications</p>
                            <p className="text-[11px] text-white/30">Receive updates about your content</p>
                          </div>
                          <Switch
                            checked={settingsForm.notifications}
                            onCheckedChange={(checked) =>
                              setSettingsForm((prev) => ({ ...prev, notifications: checked }))
                            }
                          />
                        </div>
                        <div className="h-px bg-white/[0.06]" />
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-white/80">Public Profile</p>
                            <p className="text-[11px] text-white/30">Allow others to see your profile</p>
                          </div>
                          <Switch
                            checked={settingsForm.publicProfile}
                            onCheckedChange={(checked) =>
                              setSettingsForm((prev) => ({ ...prev, publicProfile: checked }))
                            }
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Save */}
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={handleSaveSettings}
                        disabled={settingsSaving}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-blue-500/10"
                      >
                        {settingsSaving ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : settingsSaved ? (
                          <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }}>✓</motion.span>
                        ) : null}
                        {settingsSaving ? 'Saving…' : settingsSaved ? 'Saved!' : 'Save Settings'}
                      </Button>
                      {settingsSaved && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-emerald-400"
                        >
                          Changes saved successfully
                        </motion.span>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
        </>
        )}
      </motion.div>
    </div>
  );
}