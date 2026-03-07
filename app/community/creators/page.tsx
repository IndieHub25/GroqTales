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
  Hexagon,
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
    const fetchCreators = async () => {
      try {
        setIsLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${baseUrl}/api/v1/users/top-creators`);
        if (!res.ok) throw new Error('Failed to fetch creators');
        const json = await res.json();
        
        if (json.success && json.data) {
          setCreators(json.data);
        } else {
          setCreators([]);
        }
      } catch (error) {
        console.error('Error fetching creators:', error);
        setCreators([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCreators();
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
      className="w-full relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <Card className="bg-black/60 border border-white/10 backdrop-blur-md rounded-3xl overflow-hidden transition-all duration-300 hover:border-emerald-500/30 relative z-10">
        {creator.featured && (
          <div className="absolute top-3 right-3 z-10">
            <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 font-bold">
              <Star className="h-3 w-3 mr-1.5 fill-emerald-400" />
              Featured
            </Badge>
          </div>
        )}

        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 text-center md:text-left">
            <div className="relative group/avatar cursor-pointer shrink-0">
              <div className="absolute inset-0 bg-emerald-500 rounded-full blur-md opacity-0 group-hover/avatar:opacity-40 transition-opacity" />
              <Link href={`/profile/${creator.username.replace('@', '')}`}>
                <Avatar className="w-24 h-24 border-2 border-white/10 group-hover/avatar:border-emerald-500/40 transition-colors">
                  <AvatarImage
                    src={creator.avatar}
                    alt={`${creator.name}'s profile picture`}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-black text-white">{creator.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>
              {creator.verified && (
                <div
                  className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 border-2 border-black"
                  title="Verified Creator"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
              )}
            </div>

            <div className="flex-1 w-full flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                  <div>
                    <Link href={`/profile/${creator.username.replace('@', '')}`} className="hover:text-emerald-400 transition-colors">
                      <h3 className="font-bold text-2xl text-white tracking-tight">{creator.name}</h3>
                    </Link>
                    <p className="text-sm font-medium text-emerald-400/80">{creator.username}</p>
                  </div>
                  <div>{renderBadge(creator.badge)}</div>
                </div>

                <p className="text-sm text-white/60 mt-3 mb-4 line-clamp-2 max-w-2xl">{creator.bio}</p>
                
                <div className="flex flex-wrap gap-2 mb-5 justify-center md:justify-start">
                  {creator.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 text-xs px-2.5 py-0.5">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="flex flex-col bg-white/5 rounded-xl p-3 border border-white/5 hover:border-white/10 transition-colors">
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-1">Followers</span>
                  <span className="font-bold text-lg text-white">
                    {creator.followers >= 1000 ? `${(creator.followers / 1000).toFixed(1)}k` : creator.followers}
                  </span>
                </div>
                <div className="flex flex-col bg-white/5 rounded-xl p-3 border border-white/5 hover:border-white/10 transition-colors">
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-1">Stories</span>
                  <span className="font-bold text-lg text-white">{creator.stories}</span>
                </div>
                <div className="flex flex-col bg-white/5 rounded-xl p-3 border border-white/5 hover:border-white/10 transition-colors">
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-1">Likes</span>
                  <span className="font-bold text-lg text-white">{creator.totalLikes >= 1000 ? `${(creator.totalLikes / 1000).toFixed(1)}k` : creator.totalLikes}</span>
                </div>
                <div className="flex flex-col bg-white/5 rounded-xl p-3 border border-white/5 hover:border-white/10 transition-colors">
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-1">Rating</span>
                  <span className="font-bold text-lg text-white flex items-center justify-center md:justify-start">
                    {creator.rating}
                    <Star className="h-4 w-4 text-emerald-400 ml-1.5" fill="currentColor" />
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row md:flex-col justify-end gap-3 mt-4 md:mt-0 w-full md:w-32 self-center md:self-stretch items-center">
              <Button asChild className="w-full bg-white text-black hover:bg-white/90 font-bold rounded-xl h-11">
                <Link href={`/profile/${creator.username.replace('@', '')}`}>View Profile</Link>
              </Button>
              <Button variant="outline" className="w-full border-white/10 bg-transparent hover:bg-white/5 text-white font-bold rounded-xl h-11">
                Follow
              </Button>
            </div>
            
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
        <div className="flex-1 w-full relative group">
          <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-white/40 group-focus-within:text-emerald-400 transition-colors" />
          <Input
            type="search"
            placeholder="Search creators by designation or tags..."
            className="pl-11 h-12 bg-black/50 border-white/10 focus-visible:ring-emerald-500 rounded-xl text-white placeholder:text-white/20 transition-all hover:bg-black/70 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Select value={filterOption} onValueChange={setFilterOption}>
            <SelectTrigger className="w-full sm:w-[160px] h-12 bg-black/50 border-white/10 focus:ring-emerald-500 rounded-xl text-white">
              <SelectValue placeholder="Filter Protocols" />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-white/10 text-white backdrop-blur-xl">
              <SelectItem value="all" className="focus:bg-white/10 focus:text-white">Global Feed</SelectItem>
              <SelectItem value="followers" className="focus:bg-white/10 focus:text-white">5000+ Followers</SelectItem>
              <SelectItem value="stories" className="focus:bg-white/10 focus:text-white">10+ Transmissions</SelectItem>
              <SelectItem value="nfts" className="focus:bg-white/10 focus:text-white">5+ Anchored NFTs</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-2 backdrop-blur-sm mx-auto max-w-xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-transparent h-12 p-1 gap-1">
            <TabsTrigger value="all" className="rounded-xl data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 transition-all font-semibold">All Creators</TabsTrigger>
            <TabsTrigger value="featured" className="rounded-xl data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 transition-all font-semibold">Featured</TabsTrigger>
            <TabsTrigger value="verified" className="rounded-xl data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 transition-all font-semibold">Verified</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="bg-white/5 border border-white/10 rounded-3xl animate-pulse">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="w-24 h-24 rounded-full bg-white/10 shrink-0" />
                  <div className="flex-1 w-full space-y-4">
                    <div className="h-8 w-48 bg-white/10 rounded-lg" />
                    <div className="h-5 w-full bg-white/10 rounded-lg" />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                       <div className="h-16 bg-white/10 rounded-xl" />
                       <div className="h-16 bg-white/10 rounded-xl" />
                       <div className="h-16 bg-white/10 rounded-xl" />
                       <div className="h-16 bg-white/10 rounded-xl" />
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
        <div className="text-center py-20 relative group">
          <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full" />
          <div className="bg-white/5 border border-white/10 rounded-3xl p-12 max-w-lg mx-auto backdrop-blur-md relative z-10">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
               <Search className="h-10 w-10 text-white/40" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Signal Lost</h3>
            <p className="text-white/60 mb-8 max-w-sm mx-auto">
              No entities match your current query parameters. Adjust your scanner frequencies and try again.
            </p>
            <Button
              onClick={() => {
                setSearchTerm('');
                setFilterOption('all');
                setActiveTab('all');
              }}
              className="bg-white text-black hover:bg-white/90 font-bold px-8 h-12 rounded-xl"
            >
              Reset Frequencies
            </Button>
          </div>
        </div>
      )}

      {filteredCreators.length > 0 &&
        filteredCreators.length < creators.length && (
          <div className="text-center mt-8 text-sm font-medium text-emerald-400/80 bg-emerald-500/10 inline-block px-4 py-2 rounded-full border border-emerald-500/20 mx-auto w-fit block">
            Displaying {filteredCreators.length} of {creators.length} known entities
          </div>
        )}

      <div className="mt-20 p-10 border border-white/10 rounded-3xl bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-xl" />
        
        <div className="flex items-center justify-center flex-col mb-10 relative z-10">
          <div className="inline-flex items-center justify-center p-3 bg-white/5 border border-white/10 rounded-2xl mb-6">
             <Trophy className="w-8 h-8 text-yellow-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-center">Ascend the Ranks</h2>
          <p className="text-white/60 text-center max-w-2xl text-lg">
            Want to be featured among our Top Creators? Start transmitting quality stories, synthesize with the community, and anchor your content on-chain to elevate your authorization level.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 relative z-10">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center hover:bg-white/10 transition-colors">
            <div className="p-4 bg-emerald-500/10 rounded-xl mb-4">
              <BookOpen className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">Transmit Data</h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Create and cast at least 5 high-fidelity narratives into the network.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center hover:bg-white/10 transition-colors">
            <div className="p-4 bg-blue-500/10 rounded-xl mb-4">
              <TrendingUp className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">Build Nodes</h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Synthesize a loyal community of engaged followers and analysts.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center hover:bg-white/10 transition-colors">
            <div className="p-4 bg-purple-500/10 rounded-xl mb-4">
              <Award className="h-8 w-8 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">Earn Clearance</h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Accumulate citations, positive reviews, and platform achievements.
            </p>
          </div>
        </div>
        
        <div className="flex justify-center relative z-10">
          <Button asChild className="h-14 px-10 bg-white text-black hover:bg-white/90 font-bold text-lg rounded-full shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all">
            <Link href="/create">
              <Hexagon className="h-5 w-5 mr-2" />
              Initialize Sequence
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
