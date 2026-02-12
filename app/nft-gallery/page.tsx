'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Heart,
  Eye,
  ShoppingCart,
  Search,
  Filter,
  TrendingUp,
  Star,
  Palette,
  BookOpen,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { useWeb3 } from '@/components/providers/web3-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

interface NFTStory {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  coverImage: string;
  price: string;
  likes: number;
  views: number;
  genre: string;
  isTop10?: boolean;
  sales?: number;
  description: string;
  rarity?: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

const featuredNFTs: NFTStory[] = [
  {
    id: '1',
    title: "The Last Dragon's Tale",
    author: 'Elena Stormweaver',
    authorAvatar:
      'https://api.dicebear.com/7.x/bottts/svg?seed=Elena&backgroundColor=f3e8ff',
    coverImage:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop&q=80',
    price: '2.5 ETH',
    likes: 1247,
    views: 15420,
    genre: 'Epic Fantasy',
    isTop10: true,
    sales: 156,
    description:
      'An epic tale of the last dragon and the young mage destined to either save or destroy the realm.',
    rarity: 'Legendary',
  },
  {
    id: '2',
    title: 'Neon Shadows',
    author: 'Marcus Cyberpunk',
    authorAvatar:
      'https://api.dicebear.com/7.x/bottts/svg?seed=Marcus&backgroundColor=e0f2fe',
    coverImage:
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=1200&fit=crop&q=80',
    price: '1.8 ETH',
    likes: 892,
    views: 12300,
    genre: 'Cyberpunk',
    isTop10: true,
    sales: 89,
    description:
      'A gritty cyberpunk noir set in Neo-Tokyo where memories are currency and identity is fluid.',
    rarity: 'Epic',
  },
  {
    id: '3',
    title: 'The Quantum Paradox',
    author: 'Dr. Sarah Chen',
    authorAvatar:
      'https://api.dicebear.com/7.x/bottts/svg?seed=Sarah&backgroundColor=fef3c7',
    coverImage:
      'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&h=1200&fit=crop&q=80',
    price: '3.2 ETH',
    likes: 1456,
    views: 18750,
    genre: 'Hard Sci-Fi',
    isTop10: true,
    sales: 203,
    description:
      'A mind-bending exploration of quantum mechanics and parallel universes through the eyes of a brilliant physicist.',
    rarity: 'Legendary',
  },
];

function generateAdditionalNFTs(): NFTStory[] {
  const stableNFTs: NFTStory[] = [
    {
      id: 'nft-4',
      title: 'The Crystal Prophecy',
      author: 'Marcus Brightwater',
      authorAvatar:
        'https://api.dicebear.com/7.x/bottts/svg?seed=Marcus&backgroundColor=e0f2fe',
      coverImage:
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop&q=80',
      price: '1.8 ETH',
      likes: 456,
      views: 2340,
      genre: 'Fantasy',
      sales: 23,
      description:
        'A mystical tale of ancient prophecies and crystal magic that spans across realms.',
      rarity: 'Epic',
    },
    {
      id: 'nft-5',
      title: 'Neon Shadows',
      author: 'Zara Cyberpunk',
      authorAvatar:
        'https://api.dicebear.com/7.x/bottts/svg?seed=Zara&backgroundColor=fef3c7',
      coverImage:
        'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=1200&fit=crop&q=80',
      price: '2.3 ETH',
      likes: 789,
      views: 4567,
      genre: 'Sci-Fi',
      sales: 34,
      description:
        'A cyberpunk thriller set in the neon-lit streets of Neo Tokyo.',
      rarity: 'Legendary',
    },
    {
      id: 'nft-6',
      title: 'The Vanishing Act',
      author: 'Detective Holmes',
      authorAvatar:
        'https://api.dicebear.com/7.x/bottts/svg?seed=Holmes&backgroundColor=f3e8ff',
      coverImage:
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=1200&fit=crop&q=80',
      price: '1.5 ETH',
      likes: 234,
      views: 1890,
      genre: 'Mystery',
      sales: 12,
      description:
        'A gripping mystery about a magician who disappears during his greatest trick.',
      rarity: 'Rare',
    },
    {
      id: 'nft-7',
      title: 'Hearts in Harmony',
      author: 'Isabella Rose',
      authorAvatar:
        'https://api.dicebear.com/7.x/bottts/svg?seed=Isabella&backgroundColor=fce7f3',
      coverImage:
        'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&h=1200&fit=crop&q=80',
      price: '1.2 ETH',
      likes: 567,
      views: 3210,
      genre: 'Romance',
      sales: 45,
      description:
        'A heartwarming romance between two musicians from different worlds.',
      rarity: 'Common',
    },
    {
      id: 'nft-8',
      title: 'The Silent Stalker',
      author: 'Victor Darkwood',
      authorAvatar:
        'https://api.dicebear.com/7.x/bottts/svg?seed=Victor&backgroundColor=f1f5f9',
      coverImage:
        'https://images.unsplash.com/photo-1520637836862-4d197d17c90a?w=800&h=1200&fit=crop&q=80',
      price: '2.7 ETH',
      likes: 345,
      views: 2876,
      genre: 'Thriller',
      sales: 18,
      description:
        'A psychological thriller about a predator who hunts in complete silence.',
      rarity: 'Epic',
    },
    {
      id: 'nft-9',
      title: 'Midnight Terrors',
      author: 'Raven Blackthorne',
      authorAvatar:
        'https://api.dicebear.com/7.x/bottts/svg?seed=Raven&backgroundColor=fef2f2',
      coverImage:
        'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=800&h=1200&fit=crop&q=80',
      price: '1.9 ETH',
      likes: 432,
      views: 3456,
      genre: 'Horror',
      sales: 27,
      description: 'A spine-chilling horror story that will haunt your dreams.',
      rarity: 'Rare',
    },
    {
      id: 'nft-10',
      title: 'Quest for the Golden Compass',
      author: 'Captain Adventure',
      authorAvatar:
        'https://api.dicebear.com/7.x/bottts/svg?seed=Captain&backgroundColor=ecfdf5',
      coverImage:
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1200&fit=crop&q=80',
      price: '2.1 ETH',
      likes: 678,
      views: 4321,
      genre: 'Adventure',
      sales: 31,
      description:
        'An epic adventure across uncharted seas in search of legendary treasure.',
      rarity: 'Legendary',
    },
    {
      id: 'nft-11',
      title: 'The Enchanted Forest',
      author: 'Luna Moonwhisper',
      authorAvatar:
        'https://api.dicebear.com/7.x/bottts/svg?seed=Luna&backgroundColor=f0fdf4',
      coverImage:
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=1200&fit=crop&q=80',
      price: '1.6 ETH',
      likes: 523,
      views: 2987,
      genre: 'Fantasy',
      sales: 19,
      description:
        'A magical journey through an enchanted forest filled with mystical creatures.',
      rarity: 'Epic',
    },
    {
      id: 'nft-12',
      title: 'Digital Dreams',
      author: 'Neo Matrix',
      authorAvatar:
        'https://api.dicebear.com/7.x/bottts/svg?seed=Neo&backgroundColor=eff6ff',
      coverImage:
        'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=1200&fit=crop&q=80',
      price: '2.4 ETH',
      likes: 712,
      views: 5432,
      genre: 'Sci-Fi',
      sales: 42,
      description:
        'A futuristic tale of consciousness uploaded to the digital realm.',
      rarity: 'Legendary',
    },
    {
      id: 'nft-13',
      title: 'The Missing Heiress',
      author: 'Sherlock Modern',
      authorAvatar:
        'https://api.dicebear.com/7.x/bottts/svg?seed=Sherlock&backgroundColor=fefce8',
      coverImage:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop&q=80',
      price: '1.7 ETH',
      likes: 389,
      views: 2654,
      genre: 'Mystery',
      sales: 25,
      description:
        'A modern mystery about a wealthy heiress who vanishes without a trace.',
      rarity: 'Rare',
    },
  ];

  return stableNFTs;
}

const NFTCard = memo(function NFTCard({
  nft,
  onLike,
  onPurchase,
  onClick,
}: {
  nft: NFTStory;
  onLike: (id: string) => void;
  onPurchase: (id: string) => void;
  onClick: (nft: NFTStory) => void;
}) {
  const prefersReducedMotion = useReducedMotion();

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'Legendary':
        return 'text-yellow-500 border-yellow-500';
      case 'Epic':
        return 'text-purple-500 border-purple-500';
      case 'Rare':
        return 'text-blue-500 border-blue-500';
      default:
        return 'text-gray-500 border-gray-500';
    }
  };

  const cardMotionProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
      };

  return (
    <motion.div
      {...cardMotionProps}
      className="group"
    >
      <Card
        className="overflow-hidden hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02] cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onClick(nft);
        }}
      >
        <div className="relative h-64">
          <Image
            src={nft.coverImage}
            alt={nft.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            loading="lazy"
          />
          {nft.isTop10 && (
            <Badge className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 z-10">
              <Star className="w-3 h-3 mr-1" />
              Top 10
            </Badge>
          )}
          {nft.rarity && (
            <Badge
              variant="outline"
              className={`absolute top-2 right-2 z-10 ${getRarityColor(nft.rarity)}`}
            >
              {nft.rarity}
            </Badge>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 z-[1]" />
        </div>

        <CardHeader className="pb-2">
          <CardTitle className="text-lg line-clamp-1">{nft.title}</CardTitle>
          <div className="flex items-center space-x-2">
            <Image
              src={nft.authorAvatar}
              alt={nft.author}
              width={24}
              height={24}
              className="rounded-full"
              loading="lazy"
            />
            <span className="text-sm text-muted-foreground">{nft.author}</span>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {nft.description}
          </p>

          <div className="flex items-center justify-between mb-3">
            <Badge variant="secondary">{nft.genre}</Badge>
            <div className="text-lg font-bold text-primary">{nft.price}</div>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span>{nft.likes}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{nft.views}</span>
              </span>
              {nft.sales && (
                <span className="flex items-center space-x-1">
                  <ShoppingCart className="w-4 h-4" />
                  <span>{nft.sales}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onLike(nft.id); }}
              className="flex-1"
            >
              <Heart className="w-4 h-4 mr-1" />
              Like
            </Button>
            <Button onClick={(e) => { e.stopPropagation(); onPurchase(nft.id); }} className="flex-1">
              <ShoppingCart className="w-4 h-4 mr-1" />
              Buy Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

const NFTDetailModal = memo(function NFTDetailModal({
  nft,
  isOpen,
  onClose,
  onLike,
  onPurchase,
}: {
  nft: NFTStory | null;
  isOpen: boolean;
  onClose: () => void;
  onLike: (id: string) => void;
  onPurchase: (id: string) => void;
}) {
  if (!nft) return null;

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'Legendary':
        return 'bg-yellow-500 text-yellow-900 hover:bg-yellow-600';
      case 'Epic':
        return 'bg-purple-500 text-white hover:bg-purple-600';
      case 'Rare':
        return 'bg-blue-500 text-white hover:bg-blue-600';
      default:
        return 'bg-gray-500 text-white hover:bg-gray-600';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">{nft.title}</DialogTitle>
          <DialogDescription className="text-gray-300">
            by {nft.author}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
          {/* NFT Image Section */}
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden border-2 border-gray-600 aspect-[2/3] max-h-[500px]">
              <Image
                src={nft.coverImage}
                alt={nft.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {nft.isTop10 && (
                <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full font-bold text-sm flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  Top 10
                </div>
              )}
              {nft.rarity && (
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full font-bold text-sm ${
                  nft.rarity === 'Legendary' ? 'bg-yellow-500 text-yellow-900' :
                  nft.rarity === 'Epic' ? 'bg-purple-500 text-white' :
                  nft.rarity === 'Rare' ? 'bg-blue-500 text-white' :
                  'bg-gray-500 text-white'
                }`}>
                  {nft.rarity}
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                onClick={() => onLike(nft.id)}
                variant="outline"
                className="flex-1"
              >
                <Heart className="w-4 h-4 mr-2" />
                Like ({nft.likes})
              </Button>
              <Button 
                onClick={() => onPurchase(nft.id)}
                className="flex-1"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Buy Now - {nft.price}
              </Button>
            </div>
          </div>
          
          {/* NFT Details Section */}
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700 dark:text-gray-300">{nft.description}</p>
            </div>
            
            {/* Stats */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Story Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="font-medium">Likes</span>
                  </div>
                  <div className="text-xl font-bold mt-1">{nft.likes}</div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">Views</span>
                  </div>
                  <div className="text-xl font-bold mt-1">{nft.views}</div>
                </div>
                {nft.sales && (
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <ShoppingCart className="w-4 h-4 text-green-500" />
                      <span className="font-medium">Sales</span>
                    </div>
                    <div className="text-xl font-bold mt-1">{nft.sales}</div>
                  </div>
                )}
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <Palette className="w-4 h-4 text-purple-500" />
                    <span className="font-medium">Genre</span>
                  </div>
                  <div className="text-xl font-bold mt-1">{nft.genre}</div>
                </div>
              </div>
            </div>
            
            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Additional Information</h3>
              <div className="space-y-3 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">NFT ID:</span>
                  <span className="font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{nft.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Price:</span>
                  <span className="font-bold text-green-600 dark:text-green-400 text-lg">{nft.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300 font-medium">Rarity:</span>
                  <span className={`font-medium px-2 py-1 rounded ${
                    (nft.rarity || 'Common') === 'Legendary' ? 'bg-yellow-500 text-yellow-900' :
                    (nft.rarity || 'Common') === 'Epic' ? 'bg-purple-500 text-white' :
                    (nft.rarity || 'Common') === 'Rare' ? 'bg-blue-500 text-white' :
                    'bg-gray-500 text-white'
                  }`}>
                    {nft.rarity || 'Common'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300 font-medium">Status:</span>
                  <span className={`font-medium px-2 py-1 rounded ${
                    nft.isTop10 ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-500 text-white'
                  }`}>
                    {nft.isTop10 ? 'Featured' : 'Available'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

export default function NFTGalleryPage() {
  const [nfts, setNfts] = useState<NFTStory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'price' | 'likes' | 'recent'>('likes');
  const [loading, setLoading] = useState(true);
  const [selectedNFT, setSelectedNFT] = useState<NFTStory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);



  const { toast } = useToast();
  const { account, connected, connectWallet } = useWeb3();

  useEffect(() => {
    // Simulate loading NFTs
    const timer = setTimeout(() => {
      setNfts([...featuredNFTs, ...generateAdditionalNFTs()]);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleLike = async (id: string) => {
    if (!connected) {
      toast({
        title: 'Connect Wallet',
        description: 'Please connect your wallet to like this story',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Check if wallet is still connected
      if (!account) {
        throw new Error('Wallet disconnected');
      }

      // Simulate blockchain interaction
      await new Promise((resolve) => setTimeout(resolve, 500));

      setNfts((prev) =>
        prev.map((nft) =>
          nft.id === id ? { ...nft, likes: nft.likes + 1 } : nft
        )
      );

      toast({
        title: 'Liked!',
        description: 'You successfully liked this story',
      });
    } catch (error) {
      console.error('Like error:', error);
      toast({
        title: 'Like Failed',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to like story. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleNFTClick = useCallback((nft: NFTStory) => {
    setSelectedNFT(nft);
    setIsModalOpen(true);
  }, []);

  const handlePurchase = async (id: string) => {
    if (!connected) {
      toast({
        title: 'Connect Wallet',
        description: 'Please connect your wallet to purchase this NFT',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Check if wallet is still connected
      if (!account) {
        throw new Error('Wallet disconnected');
      }

      // Find the NFT to get price info
      const nft = nfts.find((n) => n.id === id);
      if (!nft) {
        throw new Error('NFT not found');
      }

      toast({
        title: 'Purchase Initiated',
        description: `Starting purchase of "${nft.title}" for ${nft.price}...`,
      });

      // Simulate blockchain transaction
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate transaction success
      toast({
        title: 'Purchase Successful!',
        description: `You successfully purchased "${nft.title}" for ${nft.price}`,
      });

      // Update sales count
      setNfts((prev) =>
        prev.map((nft) =>
          nft.id === id ? { ...nft, sales: (nft.sales || 0) + 1 } : nft
        )
      );
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: 'Purchase Failed',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to complete purchase. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const filteredNFTs = nfts.filter((nft) => {
    const matchesSearch =
      nft.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nft.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || nft.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const sortedNFTs = [...filteredNFTs].sort((a, b) => {
    switch (sortBy) {
      case 'price': {
        // Extract numeric value from price strings (remove "ETH" and other non-numeric characters)
        const priceA = parseFloat(a.price.replace(/[^\d.]/g, '')) || 0;
        const priceB = parseFloat(b.price.replace(/[^\d.]/g, '')) || 0;
        return priceB - priceA;
      }
      case 'likes':
        return b.likes - a.likes;
      case 'recent':
        return (
          parseInt(b.id.split('-')[1] || '0') -
          parseInt(a.id.split('-')[1] || '0')
        );
      default:
        return 0;
    }
  });

  const genres = ['all', ...Array.from(new Set(nfts.map((nft) => nft.genre)))];

  if (loading) {
    return (
      <div className="container mx-auto py-16">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading NFT Gallery...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center space-x-2">
          <Palette className="h-8 w-8 text-primary" />
          <span>NFT Story Gallery</span>
        </h1>
        <p className="text-muted-foreground">
          Discover, collect, and trade unique story NFTs from talented creators
          worldwide
        </p>
      </div>

      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search stories or authors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10
                text-foreground
                placeholder:text-muted-foreground
                dark:text-white
                dark:placeholder:text-gray-400
                bg-background
                dark:bg-muted/30
                border
                border-border
                dark:border-muted"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger
                className="
                w-[150px]
                bg-card
                border-4 border-foreground
                shadow-[6px_6px_0px_0px_var(--shadow-color)]
                font-black uppercase
              "
              >
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent
                className="
                bg-card
                border-4 border-foreground
                shadow-[6px_6px_0px_0px_var(--shadow-color)]
                font-black uppercase
              "
              >
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre === 'all' ? 'All Genres' : genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sortBy}
              onValueChange={(value) =>
                setSortBy(value as 'price' | 'likes' | 'recent')
              }
            >
              <SelectTrigger
                className="
                w-[180px]
                bg-card
                border-4 border-foreground
                shadow-[6px_6px_0px_0px_var(--shadow-color)]
                font-black uppercase
              "
              >
                <SelectValue placeholder="Sort NFTs" />
              </SelectTrigger>
              <SelectContent
                className="
                bg-card
                border-4 border-foreground
                shadow-[6px_6px_0px_0px_var(--shadow-color)]
                font-black uppercase
              "
              >
                <SelectItem value="likes">Most Liked</SelectItem>
                <SelectItem value="price">Highest Price</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {sortedNFTs.length} of {nfts.length} stories
          </p>
          <div className="flex gap-2">
            {!connected && (
              <Button onClick={connectWallet} variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {sortedNFTs.map((nft) => (
            <NFTCard
              key={nft.id}
              nft={nft}
              onLike={handleLike}
              onPurchase={handlePurchase}
              onClick={handleNFTClick}
            />
          ))}
        </AnimatePresence>
      </div>

      {sortedNFTs.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">No stories found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or filters to find more stories.
          </p>
        </div>
      )}

      {/* NFT Detail Modal */}
      <NFTDetailModal
        nft={selectedNFT}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLike={handleLike}
        onPurchase={handlePurchase}
      />
    </div>
  );
}
