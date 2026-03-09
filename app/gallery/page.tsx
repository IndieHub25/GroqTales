'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, Share2, ChevronUp, ChevronDown, Book, Layers, ShieldCheck, Hexagon, ChevronRight
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';

interface GalleryPost {
  id: string; 
  author: { id: string; name: string; avatar: string; verified?: boolean; level: number; };
  content: string; 
  title: string; 
  genre: string[]; 
  timestamp: Date;
  likes: number; 
  userVote?: 'up' | 'down' | null;
  file_url?: string;
  is_verified: boolean;
  format_type: string;
  cover_image?: string;
}

function GalleryCard({ post, onVote }: { post: GalleryPost; onVote: (id: string, v: 'up' | 'down' | null) => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="group relative break-inside-avoid mb-6">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl blur-xl -z-10" />
      <div className="bg-black/80 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md transition-colors hover:border-white/30 h-full flex flex-col justify-between">
        
        {/* Cover Image */}
        <div className="w-full h-48 bg-white/5 relative overflow-hidden group-hover:opacity-90 transition-opacity">
           {post.cover_image ? (
              <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
           ) : (
              <div className="w-full h-full flex items-center justify-center bg-emerald-500/10 text-emerald-500/50">
                <Hexagon className="w-12 h-12" />
              </div>
           )}
           <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
           <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
               <h3 className="text-xl font-bold text-white line-clamp-2 drop-shadow-md">{post.title}</h3>
               {post.is_verified && (
                 <Badge className="bg-emerald-500 text-black border-none capitalize tracking-wider text-[10px] flex items-center gap-1 shadow-lg shrink-0">
                   <ShieldCheck className="w-3 h-3" /> AI Verified
                 </Badge>
               )}
           </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-3 items-center">
              <Avatar className="h-10 w-10 border-2 border-emerald-500/30">
                <AvatarImage src={post.author.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${post.author.name}`} />
                <AvatarFallback>{post.author.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1.5 line-clamp-1">
                  <span className="font-semibold text-white/90 text-sm">{post.author.name}</span>
                </div>
                <div className="text-[10px] text-white/40">{Math.floor((Date.now() - post.timestamp.getTime()) / 3600000)}h ago</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
             {post.format_type === 'Comic Book' ? (
                <Badge className="bg-blue-500/10 text-blue-400 border-none flex items-center gap-1"><Layers className="w-3 h-3"/> Comic</Badge>
             ) : (
                <Badge className="bg-amber-500/10 text-amber-400 border-none flex items-center gap-1"><Book className="w-3 h-3"/> Storybook</Badge>
             )}
             {post.genre?.map(g => <Badge key={g} className="bg-white/5 text-white/50 border-white/10 hover:bg-white/10">{g}</Badge>)}
          </div>

          <p className="text-white/60 leading-relaxed text-sm mb-4 line-clamp-4 italic">
            "{post.content}"
          </p>
        </div>

        <div className="flex items-center justify-between text-white/50 px-6 pb-6 pt-2">
          <div className="flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/10">
            <button
              onClick={() => onVote(post.id, post.userVote === 'up' ? null : 'up')}
              className={`p-1.5 rounded-full hover:bg-white/10 hover:text-emerald-400 transition-colors ${post.userVote === 'up' ? 'text-emerald-400 bg-emerald-400/10' : ''}`}
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <span className={`text-sm font-semibold min-w-[2ch] text-center ${post.userVote === 'up' ? 'text-emerald-400' : post.userVote === 'down' ? 'text-rose-400' : 'text-white/70'}`}>{post.likes}</span>
            <button
              onClick={() => onVote(post.id, post.userVote === 'down' ? null : 'down')}
              className={`p-1.5 rounded-full hover:bg-white/10 hover:text-rose-400 transition-colors ${post.userVote === 'down' ? 'text-rose-400 bg-rose-400/10' : ''}`}
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          {post.file_url ? (
             <Button variant="ghost" size="sm" className="rounded-full hover:bg-emerald-500/20 hover:text-emerald-400" onClick={() => window.open(post.file_url, '_blank')}>
                Read File <ChevronRight className="w-4 h-4 ml-1" />
             </Button>
          ) : (
             <span className="text-xs text-white/30 truncate max-w-[100px]">Text Only</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function GalleryPage() {
  const [posts, setPosts] = useState<GalleryPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'Storybook' | 'Comic Book'>('all');
  const { toast } = useToast();
  const supabase = React.useMemo(() => createClient(), []);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://groqtales-backend-api.onrender.com'}/api/v1/stories?limit=40`)
      .then(r => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        return r.json();
      })
      .then(json => {
        const data = json.data || [];
        // Show all stories including minted ones
        const galleryItems = data;
        
        const mapped = galleryItems.map((story: any, i: number) => ({
          id: story.id || story._id || `feed-item-${i}`,
          author: {
            id: story.author_id || story.author?.id || `user-${i}`,
            name: story.author_name || story.authorName || story.author?.name || 'Community Member',
            avatar: story.author_avatar || '',
            level: 1,
            verified: false,
          },
          content: story.description || story.content || `Check out this latest community addition: ${story.title || 'Untitled'}`,
          title: story.title || 'Unknown Narrative',
          genre: Array.isArray(story.genre) ? story.genre : (story.genre ? [story.genre] : ['General']),
          timestamp: new Date(story.created_at || story.createdAt || Date.now()),
          likes: story.likes || story.likesCount || 0,
          is_verified: story.is_verified || false,
          format_type: story.format_type || 'Storybook',
          cover_image: story.cover_image || story.coverImageUrl || null,
          file_url: story.file_url || null,
        }));
        setPosts(mapped);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load gallery:', err);
        setLoading(false);
        toast({ title: 'Error loading gallery', description: err.message, variant: 'destructive' });
      });
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

  const filtered = posts.filter(p => filter === 'all' || p.format_type === filter);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 font-sans">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-emerald-500/10 blur-[150px] rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-blue-500/10 blur-[150px] rounded-full -translate-x-1/3 translate-y-1/3" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10 max-w-7xl">
        <div className="mb-12 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold tracking-wider text-emerald-400 mb-4">
            <Hexagon className="w-3 h-3" /> NEURAL GALLERY
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-4">Creative Archive</h1>
          <p className="text-white/50 text-lg max-w-2xl">
            Explore masterpieces minted and uploaded by the community. Validated and synthesized by our Synoptic AI framework.
          </p>
        </div>

        <div className="flex bg-white/5 border border-white/10 rounded-full p-1 backdrop-blur-md w-fit mb-8 mx-auto md:mx-0">
          {(['all', 'Storybook', 'Comic Book'] as const).map(f => (
            <button
              key={f} onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${filter === f ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`}
            >
              {f === 'all' ? 'Everything' : f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
             <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                <p className="text-white/40 font-mono tracking-widest text-sm uppercase">Synchronizing Network</p>
             </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center">
            <Layers className="w-16 h-16 text-white/20 mb-4" />
            <h3 className="text-2xl font-bold mb-2">The Archive is Empty</h3>
            <p className="text-white/50">No verified pieces found matching your criteria. Be the first to upload.</p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
            <AnimatePresence>
              {filtered.map(p => <GalleryCard key={p.id} post={p} onVote={handleVote} />)}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
