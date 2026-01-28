'use client';

import { motion } from 'framer-motion';
import {
  Users,
  Search,
  BookOpen,
  Star,
  Trophy,
  Bookmark,
  ChevronRight,
  ChevronDown,
  Filter,
  Award,
  Crown,
  ThumbsUp,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Generate mock top creators
const getMockCreators = () => {
  return [
    {
      id: 'creator-1',
      name: 'Alex Morgan',
      username: '@alexwrites',
      avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=alex',
      bio: 'Sci-fi author exploring the boundaries of technology and humanity',
      followers: 12800,
      stories: 24,
      featured: true,
      rating: 4.9,
      tags: ['Science Fiction', 'Cyberpunk', 'AI'],
      badge: 'Elite',
      nfts: 15,
      joined: '2022-05-12',
      achievements: [
        'Story of the Month',
        '1000+ Followers',
        'Featured Author',
      ],
      totalLikes: 35200,
      verified: true,
    },
    {
      id: 'creator-2',
      name: 'Elena Kim',
      username: '@elenakim',
      avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=elena',
      bio: 'Fantasy storyteller weaving magical worlds and complex characters',
      followers: 9400,
      stories: 18,
      featured: true,
      rating: 4.7,
      tags: ['Fantasy', 'Magic', 'Adventure'],
      badge: 'Pro',
      nfts: 12,
      joined: '2022-07-23',
      achievements: ['Rising Star', '10+ NFTs', 'Community Choice'],
      totalLikes: 28700,
      verified: true,
    },
    {
      id: 'creator-3',
      name: 'Marcus Johnson',
      username: '@marcuswrites',
      avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=marcus',
      bio: 'Mystery and thriller author who loves to keep readers guessing',
      followers: 7600,
      stories: 15,
      featured: true,
      rating: 4.8,
      tags: ['Mystery', 'Thriller', 'Suspense'],
      badge: 'Creator',
      nfts: 9,
      joined: '2022-09-05',
      achievements: ['Best Mystery', '5000+ Followers'],
      totalLikes: 18900,
      verified: true,
    },
    {
      id: 'creator-4',
      name: 'Sophia Chen',
      username: '@sophiawrites',
      avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=sophia',
      bio: 'Contemporary fiction focusing on cultural narratives and family',
      followers: 6300,
      stories: 12,
      featured: true,
      rating: 4.6,
      tags: ['Contemporary', 'Cultural', 'Drama'],
      badge: 'Creator',
      nfts: 7,
      joined: '2023-01-17',
      achievements: ["Editor's Choice"],
      totalLikes: 14500,
      verified: true,
    },
    {
      id: 'creator-5',
      name: 'James Wilson',
      username: '@jameswrites',
      avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=james',
      bio: 'Historical fiction writer bringing the past to life through compelling narratives',
      followers: 5800,
      stories: 10,
      featured: false,
      rating: 4.5,
      tags: ['Historical', 'Drama', 'War'],
      badge: 'Creator',
      nfts: 5,
      joined: '2023-02-28',
      achievements: ['Best Historical Fiction'],
      totalLikes: 12300,
      verified: false,
    },
    {
      id: 'creator-6',
      name: 'Olivia Taylor',
      username: '@oliviawrites',
      avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=olivia',
      bio: 'Romance and drama storyteller exploring human connections and emotions',
      followers: 4900,
      stories: 9,
      featured: false,
      rating: 4.4,
      tags: ['Romance', 'Drama', 'Contemporary'],
      badge: 'Creator',
      nfts: 4,
      joined: '2023-03-15',
      achievements: ['Best Romance'],
      totalLikes: 10200,
      verified: false,
    },
    {
      id: 'creator-7',
      name: 'David Rodriguez',
      username: '@davidwrites',
      avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=david',
      bio: 'Speculative fiction author exploring alternate realities and futures',
      followers: 4200,
      stories: 8,
      featured: false,
      rating: 4.3,
      tags: ['Speculative', 'Science Fiction', 'Dystopian'],
      badge: 'Creator',
      nfts: 3,
      joined: '2023-04-22',
      achievements: ['Rising Talent'],
      totalLikes: 8700,
      verified: false,
    },
    {
      id: 'creator-8',
      name: 'Aisha Patel',
      username: '@aishawrites',
      avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=aisha',
      bio: 'YA fiction writer focusing on diverse characters and coming-of-age stories',
      followers: 3800,
      stories: 7,
      featured: false,
      rating: 4.2,
      tags: ['Young Adult', 'Contemporary', 'Coming of Age'],
      badge: 'Creator',
      nfts: 2,
      joined: '2023-05-30',
      achievements: ['New Voice'],
      totalLikes: 7500,
      verified: false,
    },
    {
      id: 'creator-9',
      name: 'Michael Chen',
      username: '@michaelwrites',
      avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=michael',
      bio: 'Horror and supernatural fiction author creating chilling narratives',
      followers: 3500,
      stories: 6,
      featured: false,
      rating: 4.1,
      tags: ['Horror', 'Supernatural', 'Thriller'],
      badge: 'Creator',
      nfts: 2,
      joined: '2023-06-14',
      achievements: ['Best Horror'],
      totalLikes: 6800,
      verified: false,
    },
    {
      id: 'creator-10',
      name: 'Sarah Williams',
      username: '@sarahwrites',
      avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=sarah',
      bio: 'Poet and short story writer focusing on emotional depth and lyrical prose',
      followers: 3200,
      stories: 15,
      featured: false,
      rating: 4.0,
      tags: ['Poetry', 'Literary', 'Short Stories'],
      badge: 'Creator',
      nfts: 1,
      joined: '2023-07-20',
      achievements: ['Best Short Story Collection'],
      totalLikes: 6200,
      verified: false,
    },
  ];
};

export default function CreatorsPage() {
  const [creators, setCreators] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // Simulate loading creators from an API
    setIsLoading(true);
    const timer = setTimeout(() => {
      setCreators(getMockCreators());
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Filter creators based on active tab, search term, and filter option
  const filteredCreators = creators
    .filter((creator) => {
      // First filter by active tab
      if (activeTab === 'featured' && !creator.featured) return false;
      if (activeTab === 'verified' && !creator.verified) return false;

      // Then filter by search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (
          !creator.name.toLowerCase().includes(term) &&
          !creator.username.toLowerCase().includes(term) &&
          !creator.bio.toLowerCase().includes(term) &&
          !creator.tags.some((tag: string) => tag.toLowerCase().includes(term))
        ) {
          return false;
        }
      }
      // Finally, filter by dropdown filter
      if (filterOption === 'followers' && creator.followers < 5000)
        return false;
      if (filterOption === 'stories' && creator.stories < 10) return false;
      if (filterOption === 'nfts' && creator.nfts < 5) return false;

      return true;
    })
    .sort((a, b) => b.followers - a.followers);

  // Function to render creator badges
  const renderBadge = (badge: string) => {
    switch (badge) {
      case 'Elite':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500">
            <Crown className="h-3 w-3 mr-1" />
            Elite
          </Badge>
        );
      case 'Pro':
        return (
          <Badge className="bg-blue-500/20 text-blue-600 border-blue-500">
            <Award className="h-3 w-3 mr-1" />
            Pro
          </Badge>
        );
      default:
        return (
          <Badge className="bg-green-500/20 text-green-600 border-green-500">
            <BookOpen className="h-3 w-3 mr-1" />
            Creator
          </Badge>
        );
    }
  };

  const renderCreatorCard = (creator: any, index: number) => (
    <motion.div
      key={creator.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="w-full"
    >
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-md relative">
        {creator.featured && (
          <div className="absolute top-3 right-3 z-10">
            <Badge className="bg-purple-500/20 text-purple-600 border-purple-500">
              <Star className="h-3 w-3 mr-1 fill-purple-500" />
              Featured
            </Badge>
          </div>
        )}

        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src={creator.avatar} alt={`${creator.name}'s profile picture`} />
                <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {creator.verified && (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-0.5" aria-label="Verified creator">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3 w-3"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{creator.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {creator.username}
                  </p>
                </div>
                <div>{renderBadge(creator.badge)}</div>
              </div>

              <p className="text-sm mt-2 line-clamp-2">{creator.bio}</p>

              <div className="flex flex-wrap gap-1 mt-3">
                {creator.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-2 mt-4">
                <div className="flex flex-col items-center border rounded-md p-2">
                  <span className="text-xs text-muted-foreground">
                    Followers
                  </span>
                  <span className="font-medium">
                    {creator.followers >= 1000
                      ? `${(creator.followers / 1000).toFixed(1)}k`
                      : creator.followers}
                  </span>
                </div>
                <div className="flex flex-col items-center border rounded-md p-2">
                  <span className="text-xs text-muted-foreground">Stories</span>
                  <span className="font-medium">{creator.stories}</span>
                </div>
                <div className="flex flex-col items-center border rounded-md p-2">
                  <span className="text-xs text-muted-foreground">NFTs</span>
                  <span className="font-medium">{creator.nfts}</span>
                </div>
                <div className="flex flex-col items-center border rounded-md p-2">
                  <span className="text-xs text-muted-foreground">Rating</span>
                  <span className="font-medium flex items-center">
                    {creator.rating}
                    <Star
                      className="h-3 w-3 text-yellow-500 ml-1"
                      fill="currentColor"
                    />
                  </span>
                </div>
              </div>

              {creator.achievements.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    Achievements:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {creator.achievements
                      .slice(0, 2)
                      .map((achievement: string, idx: number) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs"
                        >
                          <Trophy className="h-3 w-3 mr-1 text-amber-500" />
                          {achievement}
                        </Badge>
                      ))}
                    {creator.achievements.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{creator.achievements.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/community/creators/${creator.id}`}>
                View Profile
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="default"
              size="sm"
              className="theme-gradient-bg text-white border-0"
            >
              Follow
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search creators by name or tags..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterOption} onValueChange={setFilterOption}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Creators</SelectItem>
              <SelectItem value="followers">5000+ Followers</SelectItem>
              <SelectItem value="stories">10+ Stories</SelectItem>
              <SelectItem value="nfts">5+ NFTs</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-accent/10 rounded-lg p-3">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Creators</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="verified">Verified</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 rounded-full bg-muted" />
                  <div className="flex-1">
                    <div className="h-6 w-32 bg-muted rounded mb-2" />
                    <div className="h-4 w-24 bg-muted rounded mb-4" />
                    <div className="h-4 w-full bg-muted rounded mb-4" />
                    <div className="flex gap-2 mb-4">
                      <div className="h-6 w-16 bg-muted rounded" />
                      <div className="h-6 w-16 bg-muted rounded" />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <div key={j} className="h-14 bg-muted rounded" />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCreators.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredCreators.map((creator, index) =>
            renderCreatorCard(creator, index)
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-muted/20 rounded-lg p-8 max-w-md mx-auto">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Creators Found</h3>
            <p className="text-muted-foreground mb-4">
              We couldn't find any creators matching your search criteria. Try
              adjusting your filters or search terms.
            </p>
            <Button
              onClick={() => {
                setSearchTerm('');
                setFilterOption('all');
                setActiveTab('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      )}

      {filteredCreators.length > 0 &&
        filteredCreators.length < creators.length && (
          <div className="text-center mt-4 text-sm text-muted-foreground">
            Showing {filteredCreators.length} of {creators.length} creators
          </div>
        )}

      <div className="mt-12 p-6 border rounded-lg bg-muted/10">
        <h2 className="text-xl font-bold mb-3">Become a Featured Creator</h2>
        <p className="mb-4 text-muted-foreground">
          Want to be featured among our top creators? Start publishing quality
          stories, engage with the community, and mint your content as NFTs to
          increase your visibility and followers.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="p-4 rounded-lg bg-muted/20 flex flex-col items-center text-center">
            <BookOpen className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-medium mb-1">Publish Stories</h3>
            <p className="text-sm text-muted-foreground">
              Create and share at least 5 high-quality stories
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/20 flex flex-col items-center text-center">
            <TrendingUp className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-medium mb-1">Grow Following</h3>
            <p className="text-sm text-muted-foreground">
              Build a community of engaged followers
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/20 flex flex-col items-center text-center">
            <ThumbsUp className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-medium mb-1">Get Recognized</h3>
            <p className="text-sm text-muted-foreground">
              Earn likes, comments, and positive ratings
            </p>
          </div>
        </div>
        <div className="flex justify-center">
          <Button className="theme-gradient-bg text-white">
            <BookOpen className="h-4 w-4 mr-2" />
            Start Creating
          </Button>
        </div>
      </div>
    </div>
  );
}
