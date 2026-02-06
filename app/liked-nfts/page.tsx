'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Eye,
  ShoppingCart,
  Palette,
  BookOpen,
  ArrowLeft,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useWeb3 } from '@/components/providers/web3-provider';

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
  isLiked?: boolean;
}

// Import the same NFT data from the gallery
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

function LikedNFTCard({
  nft,
  onPurchase,
}: {
  nft: NFTStory;
  onPurchase: (id: string) => void;
}) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02]">
        <div className="relative">
          <img
            src={nft.coverImage}
            alt={nft.title}
            className="w-full h-64 object-cover"
          />
          {nft.isTop10 && (
            <Badge className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500">
              <Heart className="w-3 h-3 mr-1 text-red-500 fill-current" />
              Top 10
            </Badge>
          )}
          {nft.rarity && (
            <Badge
              variant="outline"
              className={`absolute top-2 right-2 ${getRarityColor(nft.rarity)}`}
            >
              {nft.rarity}
            </Badge>
          )}
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
            <Heart className="w-3 h-3 mr-1 fill-current" />
            Liked
          </div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        </div>

        <CardHeader className="pb-2">
          <CardTitle className="text-lg line-clamp-1">{nft.title}</CardTitle>
          <div className="flex items-center space-x-2">
            <img
              src={nft.authorAvatar}
              alt={nft.author}
              className="w-6 h-6 rounded-full"
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
              <span className="flex items-center space-x-1 text-red-500">
                <Heart className="w-4 h-4 fill-current" />
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

          <Button onClick={() => onPurchase(nft.id)} className="w-full">
            <ShoppingCart className="w-4 h-4 mr-1" />
            Buy Now
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function LikedNFTsPage() {
  const [nfts, setNfts] = useState<NFTStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedNFTs, setLikedNFTs] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { account, connected, connectWallet } = useWeb3();

  useEffect(() => {
    // Load liked NFTs from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('likedNFTs');
      if (saved) {
        setLikedNFTs(new Set(JSON.parse(saved)));
      }
    }
    
    // Load NFTs
    const timer = setTimeout(() => {
      const allNFTs = [...featuredNFTs, ...generateAdditionalNFTs()];
      setNfts(allNFTs);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
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
      if (!account) {
        throw new Error('Wallet disconnected');
      }

      const nft = nfts.find((n) => n.id === id);
      if (!nft) {
        throw new Error('NFT not found');
      }

      toast({
        title: 'Purchase Initiated',
        description: `Starting purchase of "${nft.title}" for ${nft.price}...`,
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: 'Purchase Successful!',
        description: `You successfully purchased "${nft.title}" for ${nft.price}`,
      });

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

  // Filter only liked NFTs
  const likedNFTsArray = nfts.filter(nft => likedNFTs.has(nft.id));
  
  const sortedLikedNFTs = [...likedNFTsArray].sort((a, b) => b.likes - a.likes);

  if (loading) {
    return (
      <div className="container mx-auto py-16">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading Your Liked NFTs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center space-x-2">
          <Heart className="h-8 w-8 text-red-500 fill-current" />
          <span>Your Liked NFTs</span>
        </h1>
        <p className="text-muted-foreground">
          Your collection of favorite story NFTs
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <Button 
          onClick={() => window.location.href = '/nft-gallery'}
          variant="outline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Gallery
        </Button>
        
        {!connected && (
          <Button onClick={connectWallet} variant="outline">
            <Heart className="w-4 h-4 mr-2 text-red-500" />
            Connect Wallet to Purchase
          </Button>
        )}
      </div>

      {sortedLikedNFTs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {sortedLikedNFTs.map((nft) => (
              <LikedNFTCard
                key={nft.id}
                nft={nft}
                onPurchase={handlePurchase}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-16">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">No liked NFTs yet</h3>
          <p className="text-muted-foreground mb-6">
            You haven't liked any NFTs yet. Start exploring and like your favorites!
          </p>
          <Button asChild>
            <a href="/nft-gallery">
              <Heart className="w-4 h-4 mr-2" />
              Browse NFT Gallery
            </a>
          </Button>
        </div>
      )}

      {sortedLikedNFTs.length > 0 && (
        <div className="mt-8 text-center text-muted-foreground">
          Showing {sortedLikedNFTs.length} liked {sortedLikedNFTs.length === 1 ? 'NFT' : 'NFTs'}
        </div>
      )}
    </div>
  );
}