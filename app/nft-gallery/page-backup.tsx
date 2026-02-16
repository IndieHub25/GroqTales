'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Eye,
  ArrowUpRight,
  Star,
  BarChart3,
  ShoppingCart,
  Search,
} from 'lucide-react';
import Image from 'next/image';
import React, { useState, useEffect, useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
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
import { toast } from '@/hooks/use-toast';

interface NFTStory {
  id: number;
  title: string;
  author: string;
  authorAvatar: string;
  coverImage: string;
  price: string;
  likes: number;
  views: number;
  genre: string;
  description: string;
  sales: number;
  isTop10: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  mintDate: string;
}

interface FilterOptions {
  genre: string;
  priceRange: string;
  rarity: string;
  sortBy: string;
}

/**
 * NFT Gallery Backup Page Component
 * Displays a comprehensive gallery of story NFTs with filtering, sorting, and purchase functionality
 */
export default function NFTGalleryBackup() {
  const [nftData, setNftData] = useState<NFTStory[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<NFTStory | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    genre: 'all',
    priceRange: 'all',
    rarity: 'all',
    sortBy: 'newest',
  });

  // Mock NFT data
  const mockNFTData: NFTStory[] = [
    {
      id: 1,
      title: 'The Quantum Garden',
      author: 'Alex Chen',
      authorAvatar: '/avatars/alex.jpg',
      coverImage: '/stories/quantum-garden.jpg',
      price: '2.5 ETH',
      likes: 342,
      views: 1205,
      genre: 'Science Fiction',
      description:
        'A mesmerizing tale of parallel universes where gardens bloom across dimensions.',
      sales: 15,
      isTop10: true,
      rarity: 'legendary',
      mintDate: '2024-01-15',
    },
    {
      id: 2,
      title: 'Whispers in the Mist',
      author: 'Sarah Johnson',
      authorAvatar: '/avatars/sarah.jpg',
      coverImage: '/stories/whispers-mist.jpg',
      price: '1.8 ETH',
      likes: 256,
      views: 892,
      genre: 'Mystery',
      description:
        'An atmospheric mystery that unfolds in the fog-covered streets of Victorian London.',
      sales: 8,
      isTop10: false,
      rarity: 'epic',
      mintDate: '2024-01-20',
    },
    {
      id: 3,
      title: 'Digital Hearts',
      author: 'Maya Patel',
      authorAvatar: '/avatars/maya.jpg',
      coverImage: '/stories/digital-hearts.jpg',
      price: '3.2 ETH',
      likes: 489,
      views: 1567,
      genre: 'Romance',
      description:
        'A modern love story that bridges the gap between virtual and reality.',
      sales: 22,
      isTop10: true,
      rarity: 'legendary',
      mintDate: '2024-01-10',
    },
    {
      id: 4,
      title: 'The Last Alchemist',
      author: 'David Kim',
      authorAvatar: '/avatars/david.jpg',
      coverImage: '/stories/last-alchemist.jpg',
      price: '1.5 ETH',
      likes: 178,
      views: 634,
      genre: 'Fantasy',
      description:
        'Ancient magic meets modern science in this epic fantasy adventure.',
      sales: 5,
      isTop10: false,
      rarity: 'rare',
      mintDate: '2024-01-25',
    },
    {
      id: 5,
      title: 'Midnight Express',
      author: 'Emma Wilson',
      authorAvatar: '/avatars/emma.jpg',
      coverImage: '/stories/midnight-express.jpg',
      price: '2.1 ETH',
      likes: 312,
      views: 1089,
      genre: 'Thriller',
      description:
        'A high-speed thriller that races through the night on a train to nowhere.',
      sales: 12,
      isTop10: false,
      rarity: 'epic',
      mintDate: '2024-01-18',
    },
  ];

  // Initialize data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setNftData(mockNFTData);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Filter and sort data
  const processedData = useMemo(() => {
    let result = [...nftData];

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.genre.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply genre filter
    if (filters.genre !== 'all') {
      result = result.filter((item) => item.genre === filters.genre);
    }

    // Apply rarity filter
    if (filters.rarity !== 'all') {
      result = result.filter((item) => item.rarity === filters.rarity);
    }

    // Apply price range filter
    if (filters.priceRange !== 'all') {
      result = result.filter((item) => {
        const price = parseFloat(item.price.replace(' ETH', ''));
        switch (filters.priceRange) {
          case 'low':
            return price < 2;
          case 'medium':
            return price >= 2 && price < 3;
          case 'high':
            return price >= 3;
          default:
            return true;
        }
      });
    }

    // Apply tab filter
    switch (activeTab) {
      case 'bestsellers':
        result = result.filter((item) => item.sales > 10);
        break;
      case 'newest':
        result.sort(
          (a, b) =>
            new Date(b.mintDate).getTime() - new Date(a.mintDate).getTime()
        );
        break;
      case 'trending':
        result.sort((a, b) => b.views - a.views);
        break;
      case 'top10':
        result = result.filter((item) => item.isTop10);
        break;
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price-low':
        result.sort(
          (a, b) =>
            parseFloat(a.price.replace(' ETH', '')) -
            parseFloat(b.price.replace(' ETH', ''))
        );
        break;
      case 'price-high':
        result.sort(
          (a, b) =>
            parseFloat(b.price.replace(' ETH', '')) -
            parseFloat(a.price.replace(' ETH', ''))
        );
        break;
      case 'likes':
        result.sort((a, b) => b.likes - a.likes);
        break;
      case 'views':
        result.sort((a, b) => b.views - a.views);
        break;
      default:
        result.sort(
          (a, b) =>
            new Date(b.mintDate).getTime() - new Date(a.mintDate).getTime()
        );
    }

    return result;
  }, [nftData, searchQuery, filters, activeTab]);

  const handlePurchase = (story: NFTStory) => {
    toast({
      title: 'Purchase Initiated',
      description: `Starting purchase process for "${story.title}"...`,
    });
    // Add actual purchase logic here
  };

  const handleLike = (storyId: number) => {
    setNftData((prev) =>
      prev.map((story) =>
        story.id === storyId ? { ...story, likes: story.likes + 1 } : story
      )
    );
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'epic':
        return 'bg-gradient-to-r from-purple-400 to-pink-500';
      case 'rare':
        return 'bg-gradient-to-r from-blue-400 to-cyan-500';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading NFT Gallery...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
            NFT Story Gallery
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover and collect unique story NFTs from talented authors around
            the world
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stories, authors, or genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={filters.genre}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, genre: value }))
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  <SelectItem value="Science Fiction">Sci-Fi</SelectItem>
                  <SelectItem value="Fantasy">Fantasy</SelectItem>
                  <SelectItem value="Mystery">Mystery</SelectItem>
                  <SelectItem value="Romance">Romance</SelectItem>
                  <SelectItem value="Thriller">Thriller</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.rarity}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, rarity: value }))
                }
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Rarity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rarity</SelectItem>
                  <SelectItem value="common">Common</SelectItem>
                  <SelectItem value="rare">Rare</SelectItem>
                  <SelectItem value="epic">Epic</SelectItem>
                  <SelectItem value="legendary">Legendary</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.sortBy}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, sortBy: value }))
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="likes">Most Liked</SelectItem>
                  <SelectItem value="views">Most Viewed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All Stories</TabsTrigger>
            <TabsTrigger value="bestsellers">Bestsellers</TabsTrigger>
            <TabsTrigger value="newest">Newest</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="top10">Top 10</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <AnimatePresence>
              {processedData.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <p className="text-muted-foreground">
                    No stories found matching your criteria.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  {processedData.map((story, index) => (
                    <motion.div
                      key={story.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-2 hover:border-primary/20">
                        <div className="relative">
                          <div className="aspect-[4/3] relative overflow-hidden">
                            <Image
                              src={story.coverImage}
                              alt={story.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder-story.jpg';
                              }}
                            />
                          </div>
                          <div
                            className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold text-white ${getRarityColor(
                              story.rarity
                            )}`}
                          >
                            {story.rarity.charAt(0).toUpperCase() +
                              story.rarity.slice(1)}
                          </div>
                          {story.isTop10 && (
                            <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              Top 10
                            </div>
                          )}
                        </div>

                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
                                {story.title}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                by {story.author}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="w-fit">
                            {story.genre}
                          </Badge>
                        </CardHeader>

                        <CardContent className="pb-2">
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {story.description}
                          </p>

                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Heart className="h-4 w-4" />
                                {story.likes}
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {story.views}
                              </div>
                              <div className="flex items-center gap-1">
                                <BarChart3 className="h-4 w-4" />
                                {story.sales} sold
                              </div>
                            </div>
                          </div>
                        </CardContent>

                        <CardFooter className="pt-2">
                          <div className="w-full space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-primary">
                                {story.price}
                              </span>
                              <Button
                                size="sm"
                                onClick={() => handleLike(story.id)}
                                variant="ghost"
                                className="p-2"
                              >
                                <Heart className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                className="flex-1"
                                onClick={() => handlePurchase(story)}
                              >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Purchase
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedStory(story)}
                              >
                                <ArrowUpRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
