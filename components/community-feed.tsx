'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, Share2, ChevronUp, ChevronDown,
  BookOpen, Users, TrendingUp, Filter, Search, Award, Star, Zap, Hexagon
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

interface CommunityPost {
  id: string; author: { id: string; name: string; avatar: string; verified?: boolean; level: number; };
  content: string; title?: string; genre?: string[]; timestamp: Date;
  likes: number; comments: number; shares: number; userVote?: 'up' | 'down' | null;
  type: 'story' | 'discussion' | 'review' | 'announcement'; storyPreview?: string; tags?: string[];
}



const showcaseNFTs = [
  { id: 1, img: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop', title: 'Neon Shadows', author: 'Marcus' },
  { id: 2, img: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=400&fit=crop', title: 'Quantum Drop', author: 'Sarah' },
  { id: 3, img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', title: 'Ethereal Dragon', author: 'Elena' }
];

function PostActions({ post, onVote }: { post: CommunityPost; onVote: (id: string, v: 'up' | 'down' | null) => void }) {
  return (
    <div className="flex items-center justify-between text-white/50 pt-4 mt-2 border-t border-white/10">
      <div className="flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/10">
        <button
          onClick={() => onVote(post.id, post.userVote === 'up' ? null : 'up')}
          aria-label={post.userVote === 'up' ? "Remove upvote" : "Upvote"}
          aria-pressed={post.userVote === 'up'}
          className={`p-1.5 rounded-full hover:bg-white/10 hover:text-emerald-400 transition-colors ${post.userVote === 'up' ? 'text-emerald-400 bg-emerald-400/10' : ''}`}
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <span className={`text-sm font-semibold min-w-[2ch] text-center ${post.userVote === 'up' ? 'text-emerald-400' : post.userVote === 'down' ? 'text-rose-400' : 'text-white/70'}`}>{post.likes}</span>
        <button
          onClick={() => onVote(post.id, post.userVote === 'down' ? null : 'down')}
          aria-label={post.userVote === 'down' ? "Remove downvote" : "Downvote"}
          aria-pressed={post.userVote === 'down'}
          className={`p-1.5 rounded-full hover:bg-white/10 hover:text-rose-400 transition-colors ${post.userVote === 'down' ? 'text-rose-400 bg-rose-400/10' : ''}`}
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="rounded-full hover:bg-white/10 hover:text-white">
          <MessageCircle className="w-4 h-4 mr-1.5" /> {post.comments}
        </Button>
        <Button variant="ghost" size="sm" className="rounded-full hover:bg-white/10 hover:text-white">
          <Share2 className="w-4 h-4 mr-1.5" /> {post.shares}
        </Button>
      </div>
    </div>
  );
}

function PostCard({ post, onVote }: { post: CommunityPost; onVote: (id: string, v: 'up' | 'down' | null) => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="group relative">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl blur-xl -z-10" />
      <div className="bg-black/60 border border-white/10 rounded-3xl p-6 backdrop-blur-md transition-colors hover:border-white/20">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-3 items-center">
            <div className="relative">
              <Avatar className="h-12 w-12 border-2 border-emerald-500/30">
                <AvatarImage src={post.author.avatar} /><AvatarFallback>{post.author.name[0]}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-black text-[10px] font-bold text-amber-400 border border-amber-500/50 rounded-full w-5 h-5 flex items-center justify-center">
                {post.author.level}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-white/90">{post.author.name}</span>
                {post.author.verified && <Award className="w-3.5 h-3.5 text-blue-400" />}
              </div>
              <div className="text-xs text-white/40">{Math.floor((Date.now() - post.timestamp.getTime()) / 3600000)}h ago</div>
            </div>
          </div>
          <Badge className="bg-white/5 text-white/50 border-white/10 uppercase tracking-wider text-[10px]">{post.type}</Badge>
        </div>

        {post.title && <h3 className="text-xl font-bold mb-2 text-white">{post.title}</h3>}
        <p className="text-white/70 leading-relaxed mb-4">{post.content}</p>
        {post.storyPreview && (
          <div className="bg-white/5 border-l-2 border-emerald-500 p-4 rounded-r-xl mb-4 text-white/60 italic text-sm">
            "{post.storyPreview}"
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {post.genre?.map(g => <Badge key={g} className="bg-emerald-500/10 text-emerald-400 border-none hover:bg-emerald-500/20">{g}</Badge>)}
          {post.tags?.map(t => <Badge key={t} className="bg-white/5 text-white/50 border-white/10 hover:bg-white/10">#{t}</Badge>)}
        </div>
        <PostActions post={post} onVote={onVote} />
      </div>
    </motion.div>
  );
}

export default function CommunityFeed() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'stories' | 'discussions'>('all');
  const [profile, setProfile] = useState<any>(null);
  const { toast } = useToast();
  const supabase = React.useMemo(() => createClient(), []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase.from('profiles').select('*').eq('id', session.user.id).single()
          .then(({ data }) => setProfile(data || session.user));
      }
    });

    fetch('/api/feed?limit=20')
      .then(r => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        return r.json();
      })
      .then(json => {
        const data = json.data || [];
        const mapped = data.map((story: any, i: number) => ({
          id: story._id || story.id || `feed-item-${i}`,
          author: {
            id: story.author_id || story.author?.id || `user-${i}`,
            name: story.authorName || story.author?.name || 'Community Member',
            avatar: story.coverImage || `https://api.dicebear.com/7.x/personas/svg?seed=${story.authorName || i}`,
            level: 1,
            verified: false,
          },
          content: story.summary || story.content || `Check out this latest community addition: ${story.title || 'Untitled'}`,
          title: story.title,
          genre: Array.isArray(story.genre) ? story.genre : (story.genre ? [story.genre] : (Array.isArray(story.tags) ? story.tags : (story.tags ? [story.tags] : ['General']))),
          tags: Array.isArray(story.tags) ? story.tags : (story.tags ? [story.tags] : (Array.isArray(story.genre) ? story.genre : (story.genre ? [story.genre] : ['General']))),
          timestamp: new Date(story.created_at || story.createdAt || Date.now()),
          likes: story.likesCount || story.likes_count || story.likes || 0,
          comments: story.commentsCount || story.comments_count || story.comments || 0,
          shares: 0,
          type: story.type || story.kind || 'story',
        }));
        setPosts(mapped);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load feed:', err);
        setLoading(false);
        toast({ title: 'Error loading feed', description: err.message, variant: 'destructive' });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVote = (id: string, vote: 'up' | 'down' | null) => {
    setPosts(prev => prev.map(p => {
      if (p.id === id) {
        let nL = p.likes;
        if (p.userVote === 'up' && vote !== 'up') nL--;
        if (p.userVote !== 'up' && vote === 'up') nL++;
        return { ...p, userVote: vote, likes: nL };
      }
      return p;
    }));
  };

  const filtered = posts.filter(p => filter === 'all' || p.type === (filter.endsWith('s') ? filter.slice(0, -1) : filter));

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30">

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-emerald-500/10 blur-[150px] rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-blue-500/10 blur-[150px] rounded-full -translate-x-1/3 translate-y-1/3" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10 max-w-7xl">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold tracking-wider text-emerald-400 mb-4">
            <Hexagon className="w-3 h-3" /> NEURAL SYNDICATE
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter">Community Nexus</h1>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">

          {/* Main Feed */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex bg-white/5 border border-white/10 rounded-full p-1 backdrop-blur-md w-fit">
              {(['all', 'stories', 'discussions'] as const).map(f => (
                <button
                  key={f} onClick={() => setFilter(f)}
                  className={`px-6 py-2 rounded-full text-sm font-semibold capitalize transition-all ${filter === f ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="space-y-6">
              {loading ? (
                <div className="text-center py-12 text-white/50">Loading real-time data...</div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/10">
                  <h3 className="text-xl font-bold mb-2">No Posts Found</h3>
                  <p className="text-white/50">The community feed is currently quiet.</p>
                </div>
              ) : (
                <AnimatePresence>
                  {filtered.map(p => <PostCard key={p.id} post={p} onVote={handleVote} />)}
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">

            {/* User Profile / XP Card */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <Avatar className="h-16 w-16 border-2 border-emerald-500">
                      <AvatarImage src={`https://api.dicebear.com/7.x/personas/svg?seed=${profile?.username || 'You'}`} />
                      <AvatarFallback>{profile?.username ? profile.username[0].toUpperCase() : 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 bg-black text-amber-400 font-bold border-2 border-amber-500 w-8 h-8 rounded-full flex items-center justify-center text-sm">
                      {profile?.level || 1}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">{profile?.username || 'Guest Creator'}</h3>
                    <p className="text-sm text-emerald-400">{profile?.rank || 'Novice Scribe'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-white/50">
                    <span>XP</span> <span>{(profile?.xp || 0).toLocaleString()} / {(profile?.nextLevelXp || 2000).toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-black/50 rounded-full h-3 border border-white/10 overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${Math.min(100, ((profile?.xp || 0) / (profile?.nextLevelXp || 2000)) * 100)}%` }} transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 relative"
                    >
                      <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] skew-x-12" />
                    </motion.div>
                  </div>
                  <p className="text-center text-[10px] text-white/40 pt-1">{(profile?.nextLevelXp || 2000) - (profile?.xp || 0)} XP to Level {(profile?.level || 1) + 1}</p>
                </div>
              </div>
            </motion.div>

            {/* Showcase NFTs */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-lg">Community Hall of Fame</h3>
              </div>
              <div className="space-y-4">
                {showcaseNFTs.map(nft => (
                  <div key={nft.id} className="flex items-center gap-4 group cursor-pointer">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/20 perspective-1000">
                      <motion.div whileHover={{ rotateY: 15, rotateX: 5 }} className="w-full h-full preserve-3d">
                        <Image src={nft.img} alt={nft.title} fill className="object-cover transition-transform group-hover:scale-110" />
                      </motion.div>
                    </div>
                    <div>
                      <h4 className="font-bold group-hover:text-emerald-400 transition-colors line-clamp-1">{nft.title}</h4>
                      <p className="text-xs text-white/50">By {nft.author}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}