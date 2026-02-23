'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Heart, ThumbsUp, ThumbsDown, Eye, Share, PenSquare, 
  MessageSquare, Award, Star, Calendar, Cpu, VerifiedIcon, BookOpen, Hexagon, Sparkles
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

import { getGenreBySlug } from '@/components/genre-selector';
import { useWeb3 } from '@/components/providers/web3-provider';
import StoryCard from '@/components/story-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { fetchStoryById } from '@/lib/mock-data';
import { useStoryAnalytics } from '@/hooks/use-story-analysis';
import { cn } from '@/lib/utils';

interface Comment {
  id: string; text: string; author: string; authorAvatar: string;
  authorAddress?: string; timestamp: Date; likes: number; isVerified?: boolean;
}

export default function StoryPage({ params }: { params: { id: string } }) {
  const [story, setStory] = useState<any>(null);
  const [relatedStories, setRelatedStories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('story');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [voteStatus, setVoteStatus] = useState<'upvote' | 'downvote' | null>(null);
  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);
  const [isSharing, setIsSharing] = useState(false);
  const [readingMode, setReadingMode] = useState(false);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  const { toast } = useToast();
  const { account } = useWeb3();
  const { trackInteraction } = useStoryAnalytics(params.id);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const storyData = fetchStoryById(params.id);
        if (!storyData) {
          toast({ title: 'Story Not Found', description: "The story doesn't exist.", variant: 'destructive' });
          return;
        }
        setStory(storyData);
        setUpvotes(storyData.likes || 0);
        setDownvotes(Math.floor((storyData.likes || 100) * 0.2));

        const mockComments: Comment[] = [
          { id: '1', text: 'This story is absolutely mesmerizing! The world-building is so detailed.', author: 'CreativeMind', authorAvatar: `https://api.dicebear.com/7.x/personas/svg?seed=CreativeMind`, timestamp: new Date(Date.now() - 8640000), likes: 24, isVerified: true },
          { id: '2', text: "The character development in this piece is outstanding. I felt so connected to the protagonist's journey.", author: 'StoryLover', authorAvatar: `https://api.dicebear.com/7.x/personas/svg?seed=StoryLover`, timestamp: new Date(Date.now() - 172800000), likes: 18 },
          { id: '3', text: "I'm inspired to create my own story after reading this masterpiece!", author: 'NewWriter', authorAvatar: `https://api.dicebear.com/7.x/personas/svg?seed=NewWriter`, timestamp: new Date(Date.now() - 259200000), likes: 12 },
        ];
        setComments(mockComments);
        setRelatedStories(fetchStoryById(params.id, 4, true) || []);
      } catch (error) {
        console.error('Error fetching story:', error);
        toast({ title: 'Error', description: 'Failed to load story details.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleVote = (type: 'upvote' | 'downvote') => {
    if (!account) { toast({ title: 'Wallet Required', description: 'Connect your wallet to vote.' }); return; }
    if (type === 'upvote' && voteStatus !== 'upvote') trackInteraction('LIKE');

    if (voteStatus === type) {
      setVoteStatus(null);
      type === 'upvote' ? setUpvotes(p => p - 1) : setDownvotes(p => p - 1);
    } else if (voteStatus !== null) {
      setVoteStatus(type);
      if (type === 'upvote') { setUpvotes(p => p + 1); setDownvotes(p => p - 1); }
      else { setDownvotes(p => p + 1); setUpvotes(p => p - 1); }
    } else {
      setVoteStatus(type);
      type === 'upvote' ? setUpvotes(p => p + 1) : setDownvotes(p => p + 1);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) { toast({ title: 'Wallet Required', description: 'Connect wallet to comment.' }); return; }
    if (!commentText.trim()) return;

    setComments(prev => [{
      id: Date.now().toString(), text: commentText,
      author: account.substring(0, 6) + '...' + account.substring(account.length - 4),
      authorAvatar: `https://api.dicebear.com/7.x/personas/svg?seed=${account}`,
      authorAddress: account, timestamp: new Date(), likes: 0,
    }, ...prev]);
    setCommentText('');
    toast({ title: 'Comment Added', description: 'Your voice is heard.' });
  };

  const handleCommentLike = (commentId: string) => {
    if (!account) { toast({ title: 'Wallet Required', description: 'Connect wallet to like.' }); return; }
    
    setLikedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
        setComments(current => current.map(c => c.id === commentId ? { ...c, likes: Math.max(0, c.likes - 1) } : c));
      } else {
        newSet.add(commentId);
        setComments(current => current.map(c => c.id === commentId ? { ...c, likes: c.likes + 1 } : c));
      }
      return newSet;
    });
  };

  const handleShare = async () => {
    setIsSharing(true);
    trackInteraction('SHARE');
    try {
      if (navigator.share) await navigator.share({ title: story?.title, text: `Check out ${story?.title}`, url: window.location.href });
      else {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: 'Copied!', description: 'Link copied to clipboard.' });
      }
    } catch (error) { console.error(error); } finally { setIsSharing(false); }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!story) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Signal Lost</h2>
        <p className="text-white/50">Story not found.</p>
        <Link href="/nft-gallery"><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4"/> Return to Hub</Button></Link>
      </div>
    </div>
  );

  const genre = getGenreBySlug(story.genre);

  // READING MODE VIEW
  if (readingMode) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-[#e0e0e0] font-serif transition-colors duration-500">
        <div className="fixed top-0 left-0 w-full p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-50 transition-opacity opacity-0 hover:opacity-100 focus-within:opacity-100">
          <Button variant="ghost" onClick={() => setReadingMode(false)} className="text-white/70 hover:text-white rounded-full">
            <ArrowLeft className="h-4 w-4 mr-2" /> Exit Reader
          </Button>
          <div className="text-xs tracking-widest uppercase text-white/40">Reading Mode</div>
        </div>
        <div className="max-w-3xl mx-auto py-24 px-6 md:px-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#f0f0f0] tracking-tight">{story.title}</h1>
          <div className="flex items-center gap-3 mb-16 text-sm text-[#8a8a8a]">
            <span>By {story.author}</span>
            <span>•</span>
            <span>{Math.ceil(story.description.length / 800)} min read</span>
          </div>
          <div className="prose prose-invert prose-lg md:prose-xl max-w-none 
                          prose-p:leading-relaxed prose-p:text-[#d4d4d4] prose-p:mb-8 
                          first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:text-emerald-400">
            {story.description.split('\n\n').map((paragraph: string, index: number) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-20 pt-10 border-t border-white/10 flex justify-center">
            <Button onClick={() => setReadingMode(false)} variant="outline" className="rounded-full border-white/10 text-white hover:bg-white/5">
              Reflect & Discuss
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // STANDARD VIEW
  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30">
      
      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-blue-500/10 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-purple-500/10 blur-[150px] rounded-full -translate-x-1/2 translate-y-1/2" />
      </div>

      <nav className="relative z-10 container mx-auto px-6 py-6 fade-in">
        <Link href="/nft-gallery">
          <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/5 rounded-full px-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Gallery
          </Button>
        </Link>
      </nav>

      {/* BIG HERO (3D NFT + Title) */}
      <header className="relative z-10 container mx-auto px-6 py-12 lg:py-24 border-b border-white/10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          {/* Left: 3D Rotating NFT artwork */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}
            className="relative perspective-1000 mx-auto w-full max-w-md aspect-[3/4]"
          >
            <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-110" />
            <motion.div 
              animate={{ rotateY: [0, 5, -5, 0], rotateX: [0, -2, 2, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              className="w-full h-full preserve-3d relative rounded-2xl border border-white/20 bg-slate-900 shadow-2xl overflow-hidden group"
            >
              <Image src={story.coverImage} alt={story.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity skew-x-12 pointer-events-none animate-[shimmer_2s_infinite]" />
              
              {story.isTop10 && (
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-amber-500/50 text-amber-400 px-3 py-1.5 rounded-full text-xs font-bold flex items-center">
                  <Award className="h-3.5 w-3.5 mr-1.5" /> LEGENDARY
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* Right: Title & Stats */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <div className="flex items-center gap-3 mb-6">
              {genre && (
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border" style={{ borderColor: genre.color, color: genre.color, backgroundColor: `${genre.color}15` }}>
                  {genre.name}
                </span>
              )}
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 text-white/50 border border-white/10 flex items-center gap-1.5">
                <Hexagon className="w-3.5 h-3.5" /> Monad
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-tight text-white drop-shadow-md">
              {story.title}
            </h1>
            
            <div className="flex items-center gap-4 mb-8 bg-white/5 p-4 rounded-2xl border border-white/10 w-fit backdrop-blur-sm">
              <Avatar className="h-12 w-12 border-2 border-emerald-500/50">
                <AvatarImage src={`https://api.dicebear.com/7.x/personas/svg?seed=${story.author}`} />
                <AvatarFallback>{story.author.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-lg">{story.author}</span>
                  <VerifiedIcon className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="text-sm text-white/50">{new Date().toLocaleDateString()}</div>
              </div>
            </div>

            {/* Quick Action Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={() => setReadingMode(true)} className="h-14 px-8 rounded-full bg-white text-black hover:bg-white/90 font-semibold text-lg shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                <BookOpen className="mr-2 h-5 w-5" /> Dive In
              </Button>
              <Button onClick={handleShare} disabled={isSharing} variant="outline" className="h-14 w-14 rounded-full border-white/20 text-white hover:bg-white/10 p-0 flex items-center justify-center">
                <Share className="h-5 w-5" />
              </Button>
              <div className="h-14 flex items-center gap-4 px-6 rounded-full bg-white/5 border border-white/10 text-white/70">
                <button onClick={() => handleVote('upvote')} className={`flex items-center gap-2 hover:text-emerald-400 transition-colors ${voteStatus === 'upvote' ? 'text-emerald-400' : ''}`}>
                  <ThumbsUp className="h-4 w-4" /> {upvotes}
                </button>
                <div className="w-px h-6 bg-white/10" />
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" /> {story.views}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* TABBED CONTENT */}
      <section className="relative z-10 container mx-auto px-6 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
          <TabsList className="flex w-full bg-white/5 p-1 rounded-full border border-white/10 mb-8 h-14">
            <TabsTrigger value="story" className="flex-1 rounded-full data-[state=active]:bg-white data-[state=active]:text-black text-white/60 font-semibold text-base transition-all">The Lore</TabsTrigger>
            <TabsTrigger value="nft" className="flex-1 rounded-full data-[state=active]:bg-white data-[state=active]:text-black text-white/60 font-semibold text-base transition-all">Asset Details</TabsTrigger>
            <TabsTrigger value="community" className="flex-1 rounded-full data-[state=active]:bg-white data-[state=active]:text-black text-white/60 font-semibold text-base transition-all">Community ({comments.length})</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              
              <TabsContent value="story" className="mt-0 outline-none">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-8 pb-8 border-b border-white/10">
                    <h3 className="text-2xl font-bold">Synopsis</h3>
                    <Button onClick={() => setReadingMode(true)} variant="outline" size="sm" className="rounded-full border-white/20 hover:bg-white/10">Enter Reader</Button>
                  </div>
                  <div className="prose prose-invert prose-lg max-w-none text-white/70 leading-relaxed">
                    {story.description.split('\n\n').slice(0, 3).map((p: string, i: number) => <p key={i}>{p}</p>)}
                  </div>
                  <div className="mt-10 pt-10 border-t border-white/10 flex justify-center">
                    <p className="text-white/40 italic">Enter Reading Mode to experience the full continuity.</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="nft" className="mt-0 outline-none">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm space-y-6">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Cpu className="text-emerald-400" /> Ownership</h3>
                    <div className="flex justify-between items-center py-3 border-b border-white/5"><span className="text-white/50">Current Price</span><span className="font-bold text-lg text-emerald-400">{story.price} ETH</span></div>
                    <div className="flex justify-between items-center py-3 border-b border-white/5"><span className="text-white/50">Token ID</span><span className="font-mono bg-white/10 px-2 py-1 rounded">#{params.id}</span></div>
                    <div className="flex justify-between items-center py-3 border-b border-white/5"><span className="text-white/50">Network</span><span className="font-medium flex items-center gap-1.5"><Hexagon className="w-4 h-4 text-purple-400"/> Monad Testnet</span></div>
                    <div className="flex justify-between items-center py-3 border-b border-white/5"><span className="text-white/50">Creator Royalty</span><span className="font-medium">10%</span></div>
                    <Button className="w-full mt-4 h-12 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-base rounded-xl">Purchase Asset</Button>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm space-y-6">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Sparkles className="text-blue-400" /> Generation Info</h3>
                    <div className="flex justify-between items-center py-3 border-b border-white/5"><span className="text-white/50">Engine</span><span className="font-medium">Groq LLM</span></div>
                    <div className="flex justify-between items-center py-3 border-b border-white/5"><span className="text-white/50">Mint Date</span><span className="font-medium">{new Date().toLocaleDateString()}</span></div>
                    <div className="flex justify-between items-center py-3 border-b border-white/5"><span className="text-white/50">Content Rating</span><span className="font-medium bg-white/10 px-2 py-1 rounded text-xs">Safe</span></div>
                    
                    <div className="mt-8 pt-8 border-t border-white/10">
                      <Button variant="outline" className="w-full h-12 border-white/20 hover:bg-white/10 text-white rounded-xl" onClick={() => { window.location.href = `/create/ai-story?source=story&genre=${encodeURIComponent(story.genre || 'fantasy')}&format=nft`; }}>
                        <PenSquare className="h-4 w-4 mr-2" /> Remix / Fork Story
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="community" className="mt-0 outline-none">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-sm">
                  <h3 className="text-2xl font-bold mb-2">Lore Masters Board</h3>
                  <p className="text-white/50 mb-8">Join the discussion with other collectors and readers.</p>
                  
                  <form onSubmit={handleCommentSubmit} className="mb-10 relative">
                    <Textarea 
                      placeholder="Share your perspective..." value={commentText} onChange={(e) => setCommentText(e.target.value)}
                      className="min-h-32 bg-black/50 border-white/10 rounded-2xl p-5 text-white placeholder:text-white/30 resize-none focus-visible:ring-1 focus-visible:ring-emerald-500"
                    />
                    <div className="absolute bottom-4 right-4 text-xs text-white/30 hidden md:block">Press bold/italic tools to format</div>
                    <div className="flex justify-end mt-4">
                      <Button type="submit" disabled={!commentText.trim() || !account} className="bg-white text-black hover:bg-white/90 rounded-full px-8 h-12 font-semibold">Post Insight</Button>
                    </div>
                  </form>

                  <div className="space-y-6">
                    <AnimatePresence>
                      {comments.map((comment) => (
                        <motion.div key={comment.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                          className="bg-black/40 border border-white/5 rounded-2xl p-6"
                        >
                          <div className="flex gap-4">
                            <Avatar className="h-10 w-10 border border-white/10"><AvatarImage src={comment.authorAvatar} /><AvatarFallback>{comment.author[0]}</AvatarFallback></Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm">{comment.author}</span>
                                {comment.isVerified && <VerifiedIcon className="h-3.5 w-3.5 text-emerald-400" />}
                                <span className="text-xs text-white/30 ml-auto">{comment.timestamp.toLocaleDateString()}</span>
                              </div>
                              <p className="text-white/80 text-sm leading-relaxed mb-3">{comment.text}</p>
                              <Button variant="ghost" size="sm" onClick={() => handleCommentLike(comment.id)} disabled={!account} className="h-8 px-2 text-white/50 hover:text-emerald-400 hover:bg-white/5 -ml-2 rounded-lg">
                                <Heart className={`h-3.5 w-3.5 mr-1.5 ${likedComments.has(comment.id) ? 'fill-current text-emerald-400' : ''}`} /> {comment.likes}
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </TabsContent>

            </motion.div>
          </AnimatePresence>
        </Tabs>
      </section>

      {/* RELATED CARDS */}
      <section className="relative z-10 border-t border-white/5 bg-zinc-950/50 py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8">More from the Multiverse</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedStories.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <StoryCard story={s} showCreateButton />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}