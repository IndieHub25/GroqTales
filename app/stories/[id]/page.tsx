'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Share,
  PenSquare,
  MessageSquare,
  Award,
  Star,
  Calendar,
  Cpu,
  BadgeCheck,
  Plus,
  List,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';

import { cn } from '@/lib/utils';
import { getGenreBySlug } from '@/components/genre-selector';
import { useWeb3 } from '@/components/providers/web3-provider';
import StoryCard from '@/components/story-card';
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
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { fetchStoryById } from '@/lib/mock-data';
import { useStoryAnalytics } from '@/hooks/use-story-analysis';
import { useReadingProgress } from '@/hooks/use-reading-progress';
import { ReadingProgressBar } from '@/components/reading-progress-bar';
import { BookmarkPanel } from '@/components/bookmark-panel';
import { AddBookmarkDialog } from '@/components/add-bookmark-dialog';

interface Comment {
  id: string;
  text: string;
  author: string;
  authorAvatar: string;
  authorAddress?: string;
  timestamp: Date;
  likes: number;
  isVerified?: boolean;
}

export default function StoryPage({ params }: { params: { id: string } }) {
  // State
  const [story, setStory] = useState<any>(null);
  const [relatedStories, setRelatedStories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [voteStatus, setVoteStatus] = useState<'upvote' | 'downvote' | null>(null);
  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);
  const [isSharing, setIsSharing] = useState(false);

  const { toast } = useToast();
  const { account } = useWeb3();
  const router = useRouter();

  const { trackInteraction } = useStoryAnalytics(params.id);

  const paragraphs = story?.description?.split('\n\n') || [];
  const {
    progress,
    percentage,
    addBookmark,
    removeBookmark,
    clearBookmarks,
    activeParagraph,
    saveProgress,
    bookmarks
  } = useReadingProgress(params.id, paragraphs.length);

  const [isBookmarkPanelOpen, setIsBookmarkPanelOpen] = useState(false);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [pendingBookmarkIndex, setPendingBookmarkIndex] = useState<number | null>(null);

  const hasProgressAtMount = useRef<boolean>(false);
  const toastFired = useRef<boolean>(false);
  const intersectionObserver = useRef<IntersectionObserver | null>(null);

  // Fetch story data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const storyData = fetchStoryById(params.id);
        if (!storyData) {
          toast({
            title: 'Story Not Found',
            description: "The story you're looking for doesn't exist.",
            variant: 'destructive',
          });
          return;
        }
        setStory(storyData);
        setUpvotes(storyData.likes || 0);
        setDownvotes(Math.floor((storyData.likes || 100) * 0.2));

        // Mock comments data
        const mockComments: Comment[] = [
          {
            id: '1',
            text: 'This story is absolutely mesmerizing! The world-building is so detailed.',
            author: 'CreativeMind',
            authorAvatar: `https://api.dicebear.com/7.x/personas/svg?seed=CreativeMind`,
            timestamp: new Date(Date.now() - 8640000),
            likes: 24,
            isVerified: true,
          },
          {
            id: '2',
            text: "The character development in this piece is outstanding. I felt so connected to the protagonist's journey.",
            author: 'StoryLover',
            authorAvatar: `https://api.dicebear.com/7.x/personas/svg?seed=StoryLover`,
            timestamp: new Date(Date.now() - 172800000),
            likes: 18,
          },
        ];
        setComments(mockComments);

        const relatedData = fetchStoryById(params.id, 4, true);
        setRelatedStories(relatedData || []);
      } catch (error) {
        console.error('Error fetching story:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [params.id, toast]);

  // Check progress existence at mount
  useEffect(() => {
    if (progress && progress.storyId === params.id && !hasProgressAtMount.current) {
      if (progress.percentage > 0 && progress.percentage < 100) {
        hasProgressAtMount.current = true;
      }
    }
  }, [progress, params.id]);

  // Intersection Observer for scroll tracking
  useEffect(() => {
    if (paragraphs.length === 0) return;

    intersectionObserver.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-paragraph-index') || '0');
            saveProgress(index);
          }
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll('[data-paragraph-index]').forEach((el) => intersectionObserver.current?.observe(el));
    return () => intersectionObserver.current?.disconnect();
  }, [paragraphs.length, saveProgress]);

  // Resume toast logic
  useEffect(() => {
    if (hasProgressAtMount.current && !toastFired.current && progress?.paragraphIndex) {
      toastFired.current = true;
      toast({
        title: 'Resume Story?',
        description: `You were at ${progress.percentage}% last time.`,
        action: (
          <Button
            size="sm"
            onClick={() => {
              document.getElementById(`paragraph-${progress.paragraphIndex}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            className="bg-emerald-500 text-white border-2 border-black font-black uppercase text-[10px]"
          >
            Jump to Position
          </Button>
        ),
      });
    }
  }, [progress, toast]);

  const handleJumpToParagraph = (index: number) => {
    document.getElementById(`paragraph-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setIsBookmarkPanelOpen(false);
  };

  const handleVote = (type: 'upvote' | 'downvote') => {
    if (!account) {
      toast({ title: 'Please connect your wallet', description: 'You need to connect your wallet to vote.' });
      return;
    }
    if (type === 'upvote' && voteStatus !== 'upvote') trackInteraction('LIKE');

    if (voteStatus === type) {
      setVoteStatus(null);
      if (type === 'upvote') setUpvotes(prev => prev - 1);
      else setDownvotes(prev => prev - 1);
    } else if (voteStatus !== null) {
      setVoteStatus(type);
      if (type === 'upvote') { setUpvotes(prev => prev + 1); setDownvotes(prev => prev - 1); }
      else { setDownvotes(prev => prev + 1); setUpvotes(prev => prev - 1); }
    } else {
      setVoteStatus(type);
      if (type === 'upvote') setUpvotes(prev => prev + 1);
      else setDownvotes(prev => prev + 1);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !commentText.trim()) return;
    const newComment: Comment = {
      id: Date.now().toString(),
      text: commentText,
      author: account.substring(0, 6) + '...' + account.substring(account.length - 4),
      authorAvatar: `https://api.dicebear.com/7.x/personas/svg?seed=${account}`,
      authorAddress: account,
      timestamp: new Date(),
      likes: 0,
    };
    setComments(prev => [newComment, ...prev]);
    setCommentText('');
    toast({ title: 'Comment added', description: 'Your comment has been added successfully.' });
  };

  const handleCommentLike = (commentId: string) => {
    if (!account) return;
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, likes: c.likes + 1 } : c));
  };

  const handleShare = async () => {
    setIsSharing(true);
    trackInteraction('SHARE');
    try {
      if (navigator.share) {
        await navigator.share({ title: story?.title, text: `Check out ${story?.title}`, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: 'Link copied!', description: 'Story link copied to clipboard' });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setIsSharing(false);
    }
  };

  if (isLoading) return (
    <div className="container mx-auto py-16 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground font-black uppercase">Loading masterpiece...</p>
      </div>
    </div>
  );

  if (!story) return (
    <div className="container mx-auto py-16">
      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader>
          <CardTitle className="text-3xl font-black uppercase">Story Not Found</CardTitle>
          <CardDescription className="font-bold text-lg">The story you're looking for doesn't exist.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/nft-gallery">
            <Button className="border-4 border-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Gallery
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );

  const genre = getGenreBySlug(story.genre);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="container mx-auto py-12 px-4 max-w-7xl">
      <div className="mb-8">
        <Link href="/nft-gallery">
          <Button variant="ghost" className="mb-8 font-black uppercase tracking-tighter hover:bg-slate-100">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Gallery
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}>
              <Card className="overflow-hidden border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                <div className="relative aspect-video w-full overflow-hidden border-b-4 border-black">
                  <Image src={story.coverImage} alt={story.title} fill className="object-cover hover:scale-105 transition-transform duration-700" priority />
                  {story.isTop10 && (
                    <div className="absolute top-6 left-6 bg-yellow-400 border-4 border-black text-black px-4 py-2 font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center">
                      <Award className="h-5 w-5 mr-2" /> Top Rated
                    </div>
                  )}
                </div>

                <CardHeader className="p-8 bg-slate-50 dark:bg-slate-900">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <CardTitle className="text-5xl font-black uppercase italic tracking-tighter leading-none mb-2">
                        {story.title}
                      </CardTitle>
                      <CardDescription className="text-xl font-bold text-slate-600 dark:text-slate-300">
                        A creation by <span className="text-primary underline">{story.author}</span> • {new Date().toLocaleDateString()}
                      </CardDescription>
                    </div>

                    {genre && (
                      <Link href={`/genres/${genre.slug}`}>
                        <Badge className="text-lg py-2 px-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                          style={{ backgroundColor: genre.color, color: 'white' }}>
                          {genre.name}
                        </Badge>
                      </Link>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-8 space-y-8">
                  <div className="prose prose-xl max-w-none dark:prose-invert font-medium italic border-l-8 border-slate-200 pl-8 text-slate-700 dark:text-slate-400">
                    {story.description.split('\n\n').map((p: string, i: number) => <p key={i}>{p}</p>)}
                  </div>

                  <Separator className="h-1 bg-black" />

                  <div className="flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center border-4 border-black bg-white dark:bg-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <Button variant="ghost" onClick={() => handleVote('upvote')}
                          className={cn("rounded-none border-r-4 border-black font-black uppercase px-4", voteStatus === 'upvote' && "bg-emerald-400")}>
                          <ThumbsUp className="h-5 w-5 mr-2" /> {upvotes}
                        </Button>
                        <Button variant="ghost" onClick={() => handleVote('downvote')}
                          className={cn("rounded-none font-black uppercase px-4", voteStatus === 'downvote' && "bg-rose-400")}>
                          <ThumbsDown className="h-5 w-5 mr-2" /> {downvotes}
                        </Button>
                      </div>

                      <Button variant="outline" className="h-12 border-4 border-black rounded-none font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all" onClick={() => setActiveTab('comments')}>
                        <MessageSquare className="h-5 w-5 mr-2" /> {comments.length}
                      </Button>

                      <div className="flex items-center text-lg font-black uppercase">
                        <Eye className="h-6 w-6 mr-2" /> {story.views} <span className="ml-1 text-slate-500">VIEWS</span>
                      </div>
                    </div>

                    <Button variant="outline" className="h-12 border-4 border-black rounded-none font-black uppercase bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all" onClick={handleShare} disabled={isSharing}>
                      <Share className="h-5 w-5 mr-2" /> Share Story
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 h-16 border-4 border-black bg-black p-1 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <TabsTrigger value="details" className="data-[state=active]:bg-white data-[state=active]:text-black text-white font-black uppercase rounded-none h-full transition-all">Story Content</TabsTrigger>
                <TabsTrigger value="comments" className="data-[state=active]:bg-white data-[state=active]:text-black text-white font-black uppercase rounded-none h-full transition-all">Discussion ({comments.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-8">
                <Card className="border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden rounded-none">
                  <CardHeader className="border-b-4 border-black bg-primary">
                    <CardTitle className="text-2xl font-black text-white uppercase italic">The Narrative Experience</CardTitle>
                  </CardHeader>
                  <CardContent className="p-10">
                    <div className="prose prose-2xl dark:prose-invert max-w-none space-y-12">
                      {paragraphs.map((p, i) => (
                        <motion.p key={i} id={`paragraph-${i}`} data-paragraph-index={i}
                          initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                          className={cn(
                            "font-bold text-2xl leading-relaxed transition-all duration-500 border-l-8 pl-10",
                            activeParagraph === i ? "text-primary border-primary bg-primary/5 py-4 translate-x-4" : "border-slate-100 dark:border-slate-800"
                          )}>
                          {p}
                        </motion.p>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 pt-12 border-t-4 border-black">
                      <div className="bg-slate-50 dark:bg-slate-900 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <label className="text-xs font-black uppercase text-slate-500 mb-2 block">Origin Date</label>
                        <p className="text-2xl font-black flex items-center gap-3"><Calendar className="text-primary" /> {new Date().toLocaleDateString()}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <label className="text-xs font-black uppercase text-slate-500 mb-2 block">Generation Engine</label>
                        <p className="text-2xl font-black flex items-center gap-3"><Cpu className="text-primary" /> Groq Ultra LLM</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comments" className="mt-8">
                <Card className="border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden rounded-none">
                  <CardHeader className="border-b-4 border-black bg-slate-50 dark:bg-slate-900">
                    <CardTitle className="text-3xl font-black uppercase tracking-tighter">Community Commentary</CardTitle>
                    <CardDescription className="text-lg font-bold">What others are saying about "{story?.title}"</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <form onSubmit={handleCommentSubmit} className="mb-12 space-y-4">
                      <Textarea placeholder="IMMORTALIZE YOUR THOUGHTS..." value={commentText} onChange={e => setCommentText(e.target.value)}
                        className="min-h-[140px] border-4 border-black rounded-none focus-visible:ring-0 focus-visible:border-primary font-bold text-lg bg-slate-50" />
                      <div className="flex justify-end">
                        <Button type="submit" disabled={!commentText.trim() || !account}
                          className="h-14 px-10 border-4 border-black bg-primary text-white font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none transition-all">
                          Post Transmission
                        </Button>
                      </div>
                    </form>

                    <div className="space-y-8">
                      <AnimatePresence>
                        {comments.map((comment) => (
                          <motion.div key={comment.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="border-4 border-black p-8 bg-white dark:bg-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                            <div className="flex gap-8 relative z-10">
                              <Avatar className="h-20 w-20 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <AvatarImage src={comment.authorAvatar} />
                                <AvatarFallback className="font-black text-2xl">{comment.author[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center">
                                    <h4 className="font-black text-xl uppercase italic tracking-tighter">{comment.author}</h4>
                                    {comment.isVerified && <BadgeCheck className="h-6 w-6 ml-2 text-primary fill-primary" />}
                                  </div>
                                  <span className="font-bold text-xs text-slate-400">{comment.timestamp.toLocaleDateString()}</span>
                                </div>
                                <p className="text-2xl font-bold leading-tight mb-8">"{comment.text}"</p>
                                <Button variant="ghost" onClick={() => handleCommentLike(comment.id)} disabled={!account}
                                  className="border-2 border-black rounded-none h-10 font-black uppercase px-4 bg-slate-50 hover:bg-rose-50 hover:text-rose-500 transition-colors">
                                  <Heart className="h-5 w-5 mr-2" /> {comment.likes}
                                </Button>
                              </div>
                            </div>
                            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-100 -rotate-45 translate-x-12 -translate-y-12 dark:bg-slate-800" />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-12">
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.1 }} className="sticky top-24">
              <Card className="mb-12 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                <CardHeader className="bg-black text-white p-6 border-b-4 border-black">
                  <CardTitle className="text-xl font-black uppercase italic tracking-tighter">Creator Profile</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20 border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <AvatarImage src={`https://api.dicebear.com/7.x/personas/svg?seed=${story.author}`} />
                      <AvatarFallback className="font-black text-2xl">{story.author.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center mb-1">
                        <h3 className="font-black text-2xl uppercase italic tracking-tighter">{story.author}</h3>
                        <BadgeCheck className="h-5 w-5 ml-1 text-primary" />
                      </div>
                      <p className="text-xs font-black uppercase text-slate-400">Arch-Architect of Worlds</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-yellow-400 border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] justify-center">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} className="h-4 w-4 fill-black" />)}
                    <span className="text-xs font-black uppercase ml-2">Elite Rank</span>
                  </div>

                  <p className="font-bold text-sm leading-relaxed italic text-slate-600 dark:text-slate-400">
                    Master of the {genre?.name || 'Story'} medium. Crafting immersive realities since the genesis of GroqTales.
                  </p>

                  <div className="grid grid-cols-3 gap-4 border-4 border-black p-4 bg-slate-50 dark:bg-black text-center">
                    <div><p className="font-black text-xl leading-none">35</p><p className="text-[10px] font-black uppercase text-slate-500">TALES</p></div>
                    <div><p className="font-black text-xl leading-none">2.5k</p><p className="text-[10px] font-black uppercase text-slate-500">KINDRED</p></div>
                    <div><p className="font-black text-xl leading-none">18k</p><p className="text-[10px] font-black uppercase text-slate-500">VISIONS</p></div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <Button className="w-full h-14 border-4 border-black text-black bg-white hover:bg-slate-100 font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all">Follow Architect</Button>
                    <Button className="w-full h-14 border-4 border-black text-white bg-primary hover:primary/90 font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all">Summon Gallery</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                <CardHeader className="bg-primary text-white p-6 border-b-4 border-black">
                  <CardTitle className="text-xl font-black uppercase italic tracking-tighter">Ownership Details</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 border-2 border-black p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <span className="font-black uppercase text-xs text-slate-500">Acquisition Price</span>
                    <span className="text-2xl font-black text-primary italic tracking-tighter">{story.price} ETH</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between text-sm font-black uppercase"><span className="text-slate-400">Blueprint ID</span><span>#{params.id}</span></div>
                    <div className="flex justify-between text-sm font-black uppercase"><span className="text-slate-400">Foundation</span><span>Monad</span></div>
                    <div className="flex justify-between text-sm font-black uppercase"><span className="text-slate-400">Creation Epoch</span><span>Jan 2024</span></div>
                    <div className="flex justify-between text-sm font-black uppercase"><span className="text-slate-400">Legacy Royalty</span><span className="text-emerald-500">10%</span></div>
                  </div>

                  <Separator className="h-1 bg-black" />

                  <Button className="w-full h-16 border-4 border-black text-white bg-primary font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none transition-all text-xl italic tracking-tighter">Acquire Prototype</Button>

                  <Button variant="outline" className="w-full h-14 border-4 border-black font-black uppercase bg-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    onClick={() => router.push(`/create/ai-story?source=story&genre=${encodeURIComponent(story.genre || 'fantasy')}&format=nft`)}>
                    <PenSquare className="h-6 w-6 mr-3" /> Architect Your Own
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Progress & Bookmarking Interface */}
      <ReadingProgressBar percentage={percentage} />

      <div className="fixed bottom-32 right-8 flex flex-col items-center gap-4 z-[1002]">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button onClick={() => { setPendingBookmarkIndex(activeParagraph); setIsNoteDialogOpen(true); }}
            className="h-14 w-14 rounded-full border-4 border-black bg-emerald-500 text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-emerald-600 p-0 flex items-center justify-center transition-all"
            title="Mark Coordinate (Add Bookmark)">
            <Plus className="h-8 w-8 stroke-[3px]" />
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button onClick={() => setIsBookmarkPanelOpen(true)}
            className="h-14 w-14 rounded-full border-4 border-black bg-orange-500 text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-orange-600 p-0 flex items-center justify-center transition-all"
            title="Chronicles (Bookmarks)">
            <List className="h-6 w-6 text-white stroke-[2px]" />
          </Button>
        </motion.div>
      </div>

      <BookmarkPanel isOpen={isBookmarkPanelOpen} onClose={() => setIsBookmarkPanelOpen(false)} bookmarks={bookmarks} onJump={handleJumpToParagraph} onRemove={removeBookmark} onClearAll={clearBookmarks} />

      <AddBookmarkDialog isOpen={isNoteDialogOpen} onClose={() => setIsNoteDialogOpen(false)} paragraphIndex={pendingBookmarkIndex || 0}
        onConfirm={(note) => { if (pendingBookmarkIndex !== null) addBookmark(pendingBookmarkIndex, note); }} />

      {/* Related Narratives */}
      <motion.div initial={{ y: 40, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }} className="mt-24 border-t-8 border-black pt-16">
        <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-12 flex items-center">
          <Award className="mr-6 h-12 w-12 text-primary" /> Divergent Narratives
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12">
          {relatedStories.map((relatedStory: any, index: number) => (
            <motion.div key={relatedStory.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1, duration: 0.3 }} whileHover={{ y: -10 }}>
              <StoryCard story={relatedStory} hideLink={false} showCreateButton={true} />
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <Button className="h-20 px-16 border-4 border-black bg-black text-white hover:bg-slate-900 font-black uppercase italic tracking-tighter text-2xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            onClick={() => router.push(`/create/ai-story?source=stories&format=nft`)}>
            <PenSquare className="h-8 w-8 mr-4" /> Architect Your Own Story
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}