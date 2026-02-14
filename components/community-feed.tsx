'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  Share2,
  ChevronUp,
  ChevronDown,
  BookOpen,
  Users,
  TrendingUp,
  Filter,
  Search,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface CommunityPost {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    verified?: boolean;
  };
  content: string;
  title?: string;
  genre?: string[];
  timestamp: Date;
  likes: number;
  comments: number;
  shares: number;
  userVote?: 'up' | 'down' | null;
  userLiked?: boolean;
  type: 'story' | 'discussion' | 'review' | 'announcement';
  storyPreview?: string;
  tags?: string[];
}

interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: Date;
  likes: number;
}

const mockUsers: Array<{
  id: number;
  name: string;
  avatar: string;
}> = [
    {
      id: 1,
      name: 'Alex Chen',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    },
    {
      id: 3,
      name: 'Michael Brown',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    },
    {
      id: 4,
      name: 'Emily Davis',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    },
    {
      id: 5,
      name: 'David Wilson',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    },
  ];

const mockPosts: CommunityPost[] = [
  {
    id: '1',
    author: {
      id: '1',
      name: 'Alex Chen',
      avatar: mockUsers[0]?.avatar || '',
      verified: true,
    },
    title: 'The Chronicles of Ethereal Realms',
    content:
      "Just finished my latest fantasy epic! It's a tale of magic, adventure, and the bonds that transcend worlds. The story follows a young mage who discovers that reality itself is just one layer of an infinite multiverse...",
    genre: ['Fantasy', 'Adventure'],
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    likes: 142,
    comments: 23,
    shares: 8,
    type: 'story',
    storyPreview: 'In the beginning, there was only the Void...',
    tags: ['epic-fantasy', 'multiverse', 'magic'],
    userLiked: false,
    userVote: null,
  },
  {
    id: '2',
    author: {
      id: '2',
      name: 'Sarah Johnson',
      avatar: mockUsers[1]?.avatar || '',
    },
    content:
      "What are everyone's thoughts on AI-generated stories vs human-written ones? I've been experimenting with both and finding interesting parallels in creativity patterns.",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    likes: 89,
    comments: 45,
    shares: 12,
    type: 'discussion',
    tags: ['ai-writing', 'creativity', 'discussion'],
    userLiked: true,
    userVote: 'up',
  },
  {
    id: '3',
    author: {
      id: '3',
      name: 'Michael Brown',
      avatar: mockUsers[2]?.avatar || '',
    },
    title: 'Neon Dreams: A Cyberpunk Tale',
    content:
      'Set in Neo-Tokyo 2087, this story explores the thin line between humanity and technology. When memories can be bought and sold, what defines who we really are?',
    genre: ['Cyberpunk', 'Sci-Fi'],
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    likes: 76,
    comments: 18,
    shares: 5,
    type: 'story',
    storyPreview: 'The neon lights reflected off the rain-slicked streets...',
    tags: ['cyberpunk', 'neo-tokyo', 'identity'],
    userLiked: false,
    userVote: null,
  },
];

function PostActions({
  post,
  onVote,
  onCommentClick,
}: {
  post: CommunityPost;
  onVote: (postId: string, vote: 'up' | 'down' | null) => void;
  onCommentClick: (postId: string) => void;
}) {
  return (
    <div className="flex items-center justify-between text-muted-foreground pt-3 border-t">
      <div className="flex items-center space-x-2">
        <Button
          variant={post.userVote === 'up' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onVote(post.id, post.userVote === 'up' ? null : 'up')}
          className="flex items-center space-x-1"
        >
          <ChevronUp className="h-4 w-4" />
          <span>{post.likes}</span>
        </Button>

        <Button
          variant={post.userVote === 'down' ? 'destructive' : 'ghost'}
          size="sm"
          onClick={() =>
            onVote(post.id, post.userVote === 'down' ? null : 'down')
          }
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCommentClick(post.id)}
          className="flex items-center space-x-1"
        >
          <MessageCircle className="h-4 w-4" />
          <span>{post.comments}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="flex items-center space-x-1"
        >
          <Share2 className="h-4 w-4" />
          <span>{post.shares}</span>
        </Button>
      </div>
    </div>
  );
}

function PostCard({
  post,
  onVote,
  onCommentClick,
}: {
  post: CommunityPost;
  onVote: (postId: string, vote: 'up' | 'down' | null) => void;
  onCommentClick: (postId: string) => void;
}) {
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium">{post.author.name}</h4>
                  {post.author.verified && (
                    <Badge variant="secondary" className="text-xs">
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatTimeAgo(post.timestamp)}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="capitalize">
              {post.type}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {post.title && (
            <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
          )}

          <p className="text-muted-foreground mb-3 leading-relaxed">
            {post.content}
          </p>

          {post.storyPreview && (
            <div className="bg-muted/50 p-3 rounded-lg mb-3 border-l-4 border-primary">
              <p className="text-sm italic">"{post.storyPreview}"</p>
            </div>
          )}

          {post.genre && post.genre.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.genre.map((g) => (
                <Badge key={g} variant="secondary" className="text-xs">
                  {g}
                </Badge>
              ))}
            </div>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          <PostActions
            post={post}
            onVote={onVote}
            onCommentClick={onCommentClick}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function CommunityFeed() {
  const [posts, setPosts] = useState<CommunityPost[]>(mockPosts);
  const [filter, setFilter] = useState<'all' | 'stories' | 'discussions'>(
    'all'
  );
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
  const { toast } = useToast();

  const handleVote = (postId: string, vote: 'up' | 'down' | null) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          const currentVote = post.userVote;
          let newLikes = post.likes;

          // Adjust likes based on vote changes
          if (currentVote === 'up' && vote !== 'up') newLikes--;
          if (currentVote !== 'up' && vote === 'up') newLikes++;

          return {
            ...post,
            userVote: vote,
            likes: newLikes,
          };
        }
        return post;
      })
    );

    if (vote === 'up') {
      toast({
        title: 'Upvoted!',
        description: 'Thanks for supporting the community.',
      });
    }
  };

  const handleCommentClick = (postId: string) => {
    toast({
      title: 'Comments',
      description: 'Comment functionality coming soon!',
    });
  };

  const filteredPosts = posts.filter((post) => {
    if (filter === 'all') return true;
    if (filter === 'stories') return post.type === 'story';
    if (filter === 'discussions') return post.type === 'discussion';
    return true;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'recent') {
      return b.timestamp.getTime() - a.timestamp.getTime();
    } else {
      return b.likes - a.likes;
    }
  });

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Users className="h-8 w-8 text-primary" />
            <span>Community Feed</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Discover stories, join discussions, and connect with fellow creators
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-muted/50 p-4 rounded-lg gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter:</span>
            <div className="flex space-x-1">
              {(['all', 'stories', 'discussions'] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter(f)}
                  className="capitalize"
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Sort:</span>
          <div className="flex space-x-1">
            {(['recent', 'popular'] as const).map((s) => (
              <Button
                key={s}
                variant={sortBy === s ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSortBy(s)}
                className="capitalize"
              >
                {s}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {sortedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onVote={handleVote}
              onCommentClick={handleCommentClick}
            />
          ))}
        </AnimatePresence>
      </div>

      {sortedPosts.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No posts found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or check back later for new content.
          </p>
        </div>
      )}
    </div>
  );
}
