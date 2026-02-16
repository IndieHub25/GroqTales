'use client';

import { formatDistanceToNow } from 'date-fns';
import {
  Heart,
  MessageSquare,
  Share2,
  BookmarkPlus,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Send,
  Sparkles,
  ImageIcon,
  Link2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

type CommunityPost = {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  content: string;
  image?: string;
  createdAt: Date;
  upvotes: number;
  downvotes: number;
  comments: number;
  shares: number;
  userVote?: 'up' | 'down' | null;
  tags: string[];
  storyId?: string;
};

const dummyPosts: CommunityPost[] = [
  {
    id: '1',
    author: {
      name: 'Elena Martinez',
      username: 'ai_storyteller',
      avatar:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      verified: true,
    },
    content:
      'Just published my first AI-generated sci-fi short story on GroqTales! It explores the boundaries between human consciousness and artificial intelligence. Would love to hear your thoughts! #SciFi #AIWriting',
    image:
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    createdAt: new Date(2024, 3, 20),
    upvotes: 124,
    downvotes: 8,
    comments: 32,
    shares: 17,
    tags: ['SciFi', 'AIWriting'],
    storyId: '3',
  },
  {
    id: '2',
    author: {
      name: 'Jordan Thompson',
      username: 'crypto_novelist',
      avatar:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      verified: true,
    },
    content:
      "I'm amazed by how GroqTales has transformed my storytelling process. The integration of blockchain for ownership verification gives me peace of mind when publishing my work. Has anyone else explored the NFT features? #Web3 #CreativeWriting",
    createdAt: new Date(2024, 3, 19),
    upvotes: 89,
    downvotes: 2,
    comments: 41,
    shares: 12,
    tags: ['Web3', 'CreativeWriting'],
  },
  {
    id: '3',
    author: {
      name: 'Indie Hub',
      username: 'indie_hub',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      verified: true,
    },
    content:
      "We're excited to announce a new collaboration with GroqTales to support independent storytellers! Our joint initiative will provide resources, mentorship, and exposure for emerging writers using AI tools. Join our upcoming webinar to learn more! #IndieCreators #AIStories",
    image:
      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    createdAt: new Date(2024, 3, 18),
    upvotes: 357,
    downvotes: 5,
    comments: 84,
    shares: 132,
    tags: ['IndieCreators', 'AIStories'],
  },
  {
    id: '4',
    author: {
      name: 'Samira Khan',
      username: 'fantasy_dreamer',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      verified: false,
    },
    content:
      "Working on a new fantasy series inspired by ancient Persian mythology. GroqTales' genre-specific AI prompts have been incredibly helpful in developing my world-building. Anyone else writing in the fantasy genre want to connect and share tips? #FantasyWriting #Worldbuilding",
    createdAt: new Date(2024, 3, 17),
    upvotes: 76,
    downvotes: 3,
    comments: 29,
    shares: 8,
    tags: ['FantasyWriting', 'Worldbuilding'],
  },
  {
    id: '5',
    author: {
      name: 'Marcus Wilson',
      username: 'tech_wordsmith',
      avatar:
        'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      verified: false,
    },
    content:
      "Just tokenized my first short story collection as NFTs! It's amazing to see readers collecting and trading my stories. The future of publishing is here, and it's on the blockchain. Check out my profile to see my latest releases. #NFTStories #DigitalPublishing",
    image:
      'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    createdAt: new Date(2024, 3, 16),
    upvotes: 112,
    downvotes: 14,
    comments: 27,
    shares: 19,
    tags: ['NFTStories', 'DigitalPublishing'],
    storyId: '5',
  },
];

// List of dummy users with avatars for comments
const dummyUsers = [
  {
    id: 1,
    name: 'Alex Carter',
    avatar:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  },
  {
    id: 2,
    name: 'Sophie Nguyen',
    avatar:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  },
  {
    id: 3,
    name: 'Michael Brown',
    avatar:
      'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  },
  {
    id: 4,
    name: 'Emma Wilson',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  },
  {
    id: 5,
    name: 'Rahul Patel',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  },
  {
    id: 6,
    name: 'Lila Chen',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  },
  {
    id: 7,
    name: 'David Kim',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  },
  {
    id: 8,
    name: 'Isabella Lopez',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  },
  {
    id: 9,
    name: 'Ethan Davis',
    avatar:
      'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  },
  {
    id: 10,
    name: 'Ava Rodriguez',
    avatar:
      'https://images.unsplash.com/photo-1542080681-b52d485c3763?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
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
          size="icon"
          className={
            post.userVote === 'up'
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'hover:text-green-500'
          }
          onClick={() => onVote(post.id, post.userVote === 'up' ? null : 'up')}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">
          {post.upvotes - post.downvotes}
        </span>
        <Button
          variant={post.userVote === 'down' ? 'default' : 'ghost'}
          size="icon"
          className={
            post.userVote === 'down'
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'hover:text-red-500'
          }
          onClick={() =>
            onVote(post.id, post.userVote === 'down' ? null : 'down')
          }
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="flex items-center"
        onClick={() => onCommentClick(post.id)}
      >
        <MessageSquare className="h-4 w-4 mr-1" />
        <span className="text-xs">{post.comments}</span>
      </Button>

      <Button variant="ghost" size="sm" className="flex items-center">
        <Share2 className="h-4 w-4 mr-1" />
        <span className="text-xs">{post.shares}</span>
      </Button>

      <Button variant="ghost" size="icon">
        <BookmarkPlus className="h-4 w-4" />
      </Button>
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
  return (
    <Card className="overflow-hidden hover:border-primary/20 transition-all duration-200 bg-gradient-to-br from-background via-background to-background/80">
      <CardHeader className="p-4 pb-0 flex flex-row items-start justify-between space-y-0">
        <div className="flex items-start space-x-3">
          <Avatar>
            <AvatarImage src={post.author.avatar} alt={post.author.name} />
            <AvatarFallback>{post.author.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center">
              <p className="font-semibold">{post.author.name}</p>
              {post.author.verified && (
                <Badge
                  variant="outline"
                  className="ml-1 bg-blue-500/10 border-blue-500/30 text-blue-500"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  <span className="text-xs">Verified</span>
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              @{post.author.username}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(post.createdAt, { addSuffix: true })}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Follow @{post.author.username}</DropdownMenuItem>
            <DropdownMenuItem>Add to favorites</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500">
              Report content
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-4 pt-3 space-y-3">
        <p className="text-sm whitespace-pre-line">{post.content}</p>
        <div className="flex flex-wrap gap-1">
          {post.tags.map((tag) => (
            <Link href={`/tags/${tag.toLowerCase()}`} key={tag}>
              <Badge
                variant="secondary"
                className="bg-primary/10 hover:bg-primary/20 text-primary"
              >
                #{tag}
              </Badge>
            </Link>
          ))}
        </div>
        {post.image && (
          <div className="relative h-64 w-full rounded-md overflow-hidden mt-2 border border-border">
            <Image
              src={post.image}
              alt="Post attachment"
              fill
              className="object-cover"
            />
          </div>
        )}
        {post.storyId && (
          <Link href={`/stories/${post.storyId}`}>
            <div className="border rounded-md p-3 flex items-center gap-2 bg-card/50 hover:bg-card">
              <BookmarkPlus className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                Read the complete story
              </span>
            </div>
          </Link>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <PostActions
          post={post}
          onVote={onVote}
          onCommentClick={onCommentClick}
        />
      </CardFooter>
    </Card>
  );
}
function CreatePostForm() {
  const [content, setContent] = useState('');

  return (
    <Card className="mb-6 bg-gradient-to-br from-primary/5 via-background to-background">
      <CardHeader className="p-4 pb-0">
        <h3 className="text-lg font-semibold">Share your thoughts</h3>
      </CardHeader>
      <CardContent className="p-4 pt-3">
        <Textarea
          placeholder="What's on your mind?"
          className="resize-none focus-visible:ring-primary/20 bg-background/50"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full"
            >
              <ImageIcon className="h-4 w-4 text-primary" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full"
            >
              <Link2 className="h-4 w-4 text-primary" />
            </Button>
          </div>
          <Button className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90">
            <Send className="h-4 w-4 mr-2" />
            Post
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to get comments based on tag
function getCommentsByTag(tag: string) {
  const generalComments = [
    'Great post!',
    'Really interesting thoughts.',
    'I agree with this.',
    'Thanks for sharing!',
    'This is amazing.',
    'Very insightful.',
    'Love this perspective.',
    'Well said!',
    "Couldn't agree more.",
    'This is so cool!',
    'Wow, what a unique idea!',
    "I'm inspired by this.",
    'This made my day!',
    'Such a creative approach.',
    'I learned something new here.',
  ];
  const sciFiComments = [
    'Love this sci-fi concept!',
    'This tech idea is mind-blowing.',
    'Reminds me of classic cyberpunk.',
    'What an innovative future vision!',
    'The AI elements are fascinating.',
    'This could be the next big sci-fi hit!',
    'Amazing world-building with tech.',
    "I'm hooked on this sci-fi plot.",
    'The futuristic setting is so vivid.',
    "Can't wait to read more about this tech!",
  ];
  const web3Comments = [
    'Blockchain storytelling is the future!',
    "Love how you're using NFTs for stories.",
    'Web3 is changing the creative game.',
    'This decentralized approach is awesome.',
    'So cool to see crypto in publishing.',
    'NFT stories are such a unique concept!',
    "I'm excited about Web3 creativity.",
    'This is revolutionizing authorship.',
    "Can't wait to collect this as an NFT.",
    'Web3 is opening new doors for writers!',
  ];
  const indieComments = [
    'Supporting indie creators all the way!',
    'Love seeing independent stories shine.',
    'Indie writers are the best.',
    'This is why I support indie authors.',
    'Your unique voice stands out.',
    'Indie storytelling is so authentic.',
    'Keep up the amazing indie work!',
    'Indie creators like you inspire me.',
    'This indie project looks fantastic.',
    "Can't wait for more indie content!",
  ];
  const fantasyComments = [
    'This fantasy world is enchanting!',
    'Love the magical elements here.',
    'Your fantasy setting is so immersive.',
    'This feels like an epic fantasy tale.',
    'The mythical creatures are amazing.',
    'I want to live in this fantasy realm!',
    'Such a captivating fantasy story.',
    'The magic system here is intriguing.',
    "Can't wait for the next fantasy chapter.",
    'This fantasy plot is spellbinding!',
  ];
  const nftComments = [
    'Amazing to see stories as NFTs!',
    'Love the idea of collecting stories.',
    'NFT storytelling is so innovative.',
    'This is the future of digital art.',
    'I want to own this story NFT.',
    'Tokenized stories are brilliant.',
    'NFTs add so much value to writing.',
    'This NFT concept is groundbreaking.',
    "Can't wait to trade story NFTs.",
    'Storytelling with NFTs is next-level!',
  ];

  let comments = generalComments;
  if (tag.toLowerCase().includes('sci')) comments = sciFiComments;
  if (tag.toLowerCase().includes('web3')) comments = web3Comments;
  if (
    tag.toLowerCase().includes('indie') ||
    tag.toLowerCase().includes('creator')
  )
    comments = indieComments;
  if (
    tag.toLowerCase().includes('fantasy') ||
    tag.toLowerCase().includes('world')
  )
    comments = fantasyComments;
  if (tag.toLowerCase().includes('nft')) comments = nftComments;

  return comments;
}

// Helper function to generate random comment text based on post tags
function getRandomComment(tag: string) {
  const comments = getCommentsByTag(tag);
  return comments[Math.floor(Math.random() * comments.length)];
}

function CommunityFeed() {
  const [posts, setPosts] = useState<CommunityPost[]>(dummyPosts);
  const [selectedTab, setSelectedTab] = useState('all');
  const [showCreatePost, setShowCreatePost] = useState(false);

  const handleVote = (postId: string, vote: 'up' | 'down' | null) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, userVote: vote } : post
      )
    );
  };

  const handleCommentClick = (postId: string) => {
    console.log('Comment clicked for post:', postId);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Community Feed</h1>
        <Button onClick={() => setShowCreatePost(!showCreatePost)}>
          Create Post
        </Button>
      </div>

      {showCreatePost && <CreatePostForm />}

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">All Posts</TabsTrigger>
          <TabsTrigger value="stories">Stories</TabsTrigger>
          <TabsTrigger value="discussions">Discussions</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onVote={handleVote}
              onCommentClick={handleCommentClick}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default CommunityFeed;
