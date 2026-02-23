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
  VerifiedIcon,
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
  const [voteStatus, setVoteStatus] = useState<'upvote' | 'downvote' | null>(
    null
  );
  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);
  const [isSharing, setIsSharing] = useState(false);

  const { toast } = useToast();
  const { account } = useWeb3();

  const { trackInteraction } = useStoryAnalytics(params.id);

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
        setDownvotes(Math.floor((storyData.likes || 100) * 0.2)); // Mock downvotes data

        // Mock comments data
        const mockComments: Comment[] = [
          {
            id: '1',
            text: 'This story is absolutely mesmerizing! The world-building is so detailed.',
            author: 'CreativeMind',
            authorAvatar: `https://api.dicebear.com/7.x/personas/svg?seed=CreativeMind`,
            timestamp: new Date(Date.now() - 8640000), // 1 day ago
            likes: 24,
            isVerified: true,
          },
          {
            id: '2',
            text: "The character development in this piece is outstanding. I felt so connected to the protagonist's journey.",
            author: 'StoryLover',
            authorAvatar: `https://api.dicebear.com/7.x/personas/svg?seed=StoryLover`,
            timestamp: new Date(Date.now() - 172800000), // 2 days ago
            likes: 18,
          },
          {
            id: '3',
            text: "I'm inspired to create my own story after reading this masterpiece!",
            author: 'NewWriter',
            authorAvatar: `https://api.dicebear.com/7.x/personas/svg?seed=NewWriter`,
            timestamp: new Date(Date.now() - 259200000), // 3 days ago
            likes: 12,
          },
        ];

        setComments(mockComments);

        // Fetch related stories
        const relatedData = fetchStoryById(params.id, 4, true);
        setRelatedStories(relatedData || []);
      } catch (error) {
        console.error('Error fetching story:', error);
        toast({
          title: 'Error',
          description: 'Failed to load story details. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id, toast]);

  // Handle upvote/downvote
  const handleVote = (type: 'upvote' | 'downvote') => {
    if (!account) {
      toast({
        title: 'Please connect your wallet',
        description: 'You need to connect your wallet to vote on stories.',
      });
      return;
    }

    if (type === 'upvote' && voteStatus !== 'upvote') {
      trackInteraction('LIKE');
    }

    // If already voted the same way, remove the vote
    if (voteStatus === type) {
      setVoteStatus(null);
      if (type === 'upvote') {
        setUpvotes((prev) => prev - 1);
      } else {
        setDownvotes((prev) => prev - 1);
      }
    }
    // If changing vote
    else if (voteStatus !== null) {
      setVoteStatus(type);
      if (type === 'upvote') {
        setUpvotes((prev) => prev + 1);
        setDownvotes((prev) => prev - 1);
      } else {
        setDownvotes((prev) => prev + 1);
        setUpvotes((prev) => prev - 1);
      }
    }
    // If voting for the first time
    else {
      setVoteStatus(type);
      if (type === 'upvote') {
        setUpvotes((prev) => prev + 1);
      } else {
        setDownvotes((prev) => prev + 1);
      }
    }
    toast({
      title: type === 'upvote' ? 'Upvoted!' : 'Downvoted',
      description: `You have ${
        type === 'upvote' ? 'upvoted' : 'downvoted'
      } this story.`,
    });
  };

  // Handle comment submission
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) {
      toast({
        title: 'Please connect your wallet',
        description: 'You need to connect your wallet to comment on stories.',
      });
      return;
    }
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      text: commentText,
      author:
        account.substring(0, 6) + '...' + account.substring(account.length - 4),
      authorAvatar: `https://api.dicebear.com/7.x/personas/svg?seed=${account}`,
      authorAddress: account,
      timestamp: new Date(),
      likes: 0,
    };

    setComments((prev) => [newComment, ...prev]);
    setCommentText('');

    toast({
      title: 'Comment added',
      description: 'Your comment has been added successfully.',
    });
  };

  // Handle comment like
  const handleCommentLike = (commentId: string) => {
    if (!account) {
      toast({
        title: 'Please connect your wallet',
        description: 'You need to connect your wallet to like comments.',
      });
      return;
    }
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? { ...comment, likes: comment.likes + 1 }
          : comment
      )
    );
  };

  // Handle share
  const handleShare = async () => {
    setIsSharing(true);

    trackInteraction('SHARE');

    try {
      if (navigator.share) {
        await navigator.share({
          title: story?.title,
          text: `Check out this amazing story: ${story?.title}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: 'Link copied!',
          description: 'Story link copied to clipboard',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setIsSharing(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading story details...</p>
        </div>
      </div>
    );
  }
  // Not found state
  if (!story) {
    return (
      <div className="container mx-auto py-16">
        <Card>
          <CardHeader>
            <CardTitle>Story Not Found</CardTitle>
            <CardDescription>
              The story you're looking for doesn't exist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/nft-gallery">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Gallery
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  const genre = getGenreBySlug(story.genre);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-12"
    >
      <div className="mb-8">
        <div className="flex items-center mb-8">
          <Link href="/nft-gallery">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Gallery
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="mb-8 overflow-hidden">
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    src={story.coverImage}
                    alt={story.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                    priority
                  />
                  {story.isTop10 && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-yellow-300 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
                      <Award className="h-3.5 w-3.5 mr-1" />
                      Top Rated
                    </div>
                  )}
                </div>

                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                        {story.title}
                      </CardTitle>
                      <CardDescription className="text-lg">
                        By {story.author} • {new Date().toLocaleDateString()}
                      </CardDescription>
                    </div>

                    <div>
                      {genre && (
                        <Link href={`/genres/${genre.slug}`}>
                          <Badge
                            className="ml-2"
                            style={{
                              backgroundColor: genre.color + '20',
                              color: genre.color,
                              border: `1px solid ${genre.color}`,
                            }}
                          >
                            {genre.name}
                          </Badge>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="prose max-w-none dark:prose-invert">
                    {story.description
                      .split('\n\n')
                      .map((paragraph: string, index: number) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                  </div>

                  <div className="flex items-center justify-between mt-8">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant={
                            voteStatus === 'upvote' ? 'default' : 'outline'
                          }
                          size="sm"
                          onClick={() => handleVote('upvote')}
                          className={
                            voteStatus === 'upvote'
                              ? 'bg-green-600 hover:bg-green-700'
                              : ''
                          }
                        >
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          {upvotes}
                        </Button>
                        <Button
                          variant={
                            voteStatus === 'downvote' ? 'default' : 'outline'
                          }
                          size="sm"
                          onClick={() => handleVote('downvote')}
                          className={
                            voteStatus === 'downvote'
                              ? 'bg-red-600 hover:bg-red-700'
                              : ''
                          }
                        >
                          <ThumbsDown className="h-4 w-4 mr-2" />
                          {downvotes}
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab('comments')}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        {comments.length}
                      </Button>
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-2" />
                        <span>{story.views} views</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                      disabled={isSharing}
                    >
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="mb-8"
              >
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="details">Story Details</TabsTrigger>
                  <TabsTrigger value="comments">
                    Comments ({comments.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            About this Story
                          </h3>
                          <p className="text-muted-foreground">
                            {story.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Created On</h4>
                            <p className="text-sm flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                              {new Date().toLocaleDateString()}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">
                              Generated With
                            </h4>
                            <p className="text-sm flex items-center">
                              <Cpu className="h-4 w-4 mr-2 text-muted-foreground" />
                              Groq LLM
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="comments">
                  <Card>
                    <CardHeader>
                      <CardTitle>Community Discussion</CardTitle>
                      <CardDescription>
                        Join the conversation about "{story.title}"
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleCommentSubmit} className="mb-6">
                        <div className="space-y-4">
                          <Textarea
                            placeholder="Share your thoughts on this story..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="min-h-24"
                          />
                          <div className="flex justify-end">
                            <Button
                              type="submit"
                              disabled={!commentText.trim() || !account}
                              className="theme-gradient-bg"
                            >
                              Post Comment
                            </Button>
                          </div>
                        </div>
                      </form>

                      <div className="space-y-6">
                        <AnimatePresence>
                          {comments.map((comment) => (
                            <motion.div
                              key={comment.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="border rounded-lg p-4"
                            >
                              <div className="flex space-x-4">
                                <Avatar>
                                  <AvatarImage
                                    src={comment.authorAvatar}
                                    alt={`${comment.author}'s avatar`}
                                  />
                                  <AvatarFallback>
                                    {comment.author[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center">
                                    <h4 className="font-medium">
                                      {comment.author}
                                    </h4>
                                    {comment.isVerified && (
                                      <VerifiedIcon className="h-4 w-4 ml-1 text-primary" />
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground mb-2">
                                    {comment.timestamp.toLocaleString()}
                                  </p>
                                  <p className="text-sm mb-3">{comment.text}</p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleCommentLike(comment.id)
                                    }
                                    disabled={!account}
                                  >
                                    <Heart className="h-3.5 w-3.5 mr-1" />
                                    {comment.likes}
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>

          <div>
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="space-y-6"
            >
              <Card className="mb-8 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle>Creator Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar className="h-16 w-16 border-2 border-primary">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/personas/svg?seed=${story.author}`}
                        alt={`${story.author}'s profile picture`}
                      />
                      <AvatarFallback>
                        {story.author.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-semibold text-lg">
                          {story.author}
                        </h3>
                        <VerifiedIcon className="h-4 w-4 ml-1 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Creator • Author • Artist
                      </p>
                      <div className="flex items-center mt-1">
                        <Star className="h-3.5 w-3.5 text-yellow-500 mr-1" />
                        <Star className="h-3.5 w-3.5 text-yellow-500 mr-1" />
                        <Star className="h-3.5 w-3.5 text-yellow-500 mr-1" />
                        <Star className="h-3.5 w-3.5 text-yellow-500 mr-1" />
                        <Star className="h-3.5 w-3.5 text-yellow-500 mr-1" />
                        <span className="text-xs ml-1">5.0 (120 reviews)</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Creative storyteller specializing in{' '}
                    {genre?.name || 'various genres'} with a passion for
                    immersive narratives. Has created over 35 original stories
                    on GroqTales.
                  </p>
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div className="bg-muted/30 rounded p-2">
                      <p className="font-medium">35</p>
                      <p className="text-xs text-muted-foreground">Stories</p>
                    </div>
                    <div className="bg-muted/30 rounded p-2">
                      <p className="font-medium">2.5k</p>
                      <p className="text-xs text-muted-foreground">Followers</p>
                    </div>
                    <div className="bg-muted/30 rounded p-2">
                      <p className="font-medium">18k</p>
                      <p className="text-xs text-muted-foreground">Views</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mb-2">
                    Follow Creator
                  </Button>
                  <Button
                    variant="default"
                    className="w-full theme-gradient-bg"
                  >
                    View All Stories
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>NFT Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price</span>
                      <span className="font-medium">{story.price} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Token ID</span>
                      <span className="font-medium">#{params.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Blockchain</span>
                      <span className="font-medium">Monad</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span className="font-medium">
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Royalty</span>
                      <span className="font-medium">10%</span>
                    </div>

                    <Separator />

                    <Button className="w-full theme-gradient-bg">
                      Purchase NFT
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center"
                      onClick={() => {
                        // Direct navigation with URL parameters
                        const genre = story.genre || 'fantasy';
                        window.location.href = `/create/ai-story?source=story&genre=${encodeURIComponent(
                          genre
                        )}&format=nft`;
                      }}
                    >
                      <PenSquare className="h-4 w-4 mr-2" />
                      Create Your Own Story
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold mb-6">Similar Stories</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedStories.map((relatedStory: any, index: number) => (
              <motion.div
                key={relatedStory.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                whileHover={{ y: -5 }}
              >
                <StoryCard
                  story={relatedStory}
                  hideLink={false}
                  showCreateButton={true}
                />
              </motion.div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button
              className="theme-gradient-bg text-white"
              onClick={() => {
                // Direct navigation with URL parameters
                const genreSlug = genre?.slug || 'fantasy';
                window.location.href = `/create/ai-story?source=stories&genre=${encodeURIComponent(
                  genreSlug
                )}&format=nft`;
              }}
            >
              <PenSquare className="h-4 w-4 mr-2" />
              Create Your Own Story
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
