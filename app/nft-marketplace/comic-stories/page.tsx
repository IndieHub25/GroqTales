'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  Sparkles,
  BookOpen,
  ShoppingCart,
  Heart,
  Eye,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

import { ComicNFTDetailDialog } from '@/components/comic-nft-detail-dialog';
import { PageHeader } from '@/components/page-header';
import { useWeb3 } from '@/components/providers/web3-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

interface ComicNFT {
  id: number;
  title: string;
  author: string;
  authorAvatar: string;
  coverImage: string;
  price: string;
  likes: number;
  views: number;
  pages: number;
  genre: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  description: string;
  previewImages: string[];
  isAnimated?: boolean;
  isOwned?: boolean;
  owner?: string;
}
// Mock data for comic NFTs
const mockComicNFTs: ComicNFT[] = [
  {
    id: 1,
    title: 'The Quantum Heroes',
    author: 'ComicArtist42',
    authorAvatar:
      'https://api.dicebear.com/7.x/avataaars/svg?seed=ComicArtist42',
    coverImage:
      'https://images.unsplash.com/photo-1605457867610-e990b283a2a0?w=800&h=1200&fit=crop&q=80',
    price: '0.45 ETH',
    likes: 763,
    views: 3210,
    pages: 24,
    genre: 'Sci-Fi',
    rarity: 'rare',
    description:
      'A team of superheroes with quantum abilities must save the multiverse from collapse.',
    previewImages: [
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=500&fit=crop&q=80',
      'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=800&h=500&fit=crop&q=80',
    ],
    isAnimated: true,
  },
  {
    id: 2,
    title: 'Neon Shadows',
    author: 'CyberInker',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CyberInker',
    coverImage:
      'https://images.unsplash.com/photo-1626379616459-b2ce1d9decbc?w=800&h=1200&fit=crop&q=80',
    price: '0.32 ETH',
    likes: 542,
    views: 2150,
    pages: 18,
    genre: 'Cyberpunk',
    rarity: 'uncommon',
    description:
      'In a neon-lit dystopian future, a hacker uncovers a conspiracy that could change everything.',
    previewImages: [
      'https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?w=800&h=500&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=500&fit=crop&q=80',
    ],
  },
  {
    id: 3,
    title: 'Mythic Realms',
    author: 'FantasyDrawer',
    authorAvatar:
      'https://api.dicebear.com/7.x/avataaars/svg?seed=FantasyDrawer',
    coverImage:
      'https://images.unsplash.com/photo-1534809027769-b00d750a6bac?w=800&h=1200&fit=crop&q=80',
    price: '0.58 ETH',
    likes: 891,
    views: 4120,
    pages: 32,
    genre: 'Fantasy',
    rarity: 'legendary',
    description:
      'A journey through magical realms where ancient myths come to life.',
    previewImages: [
      'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&h=500&fit=crop&q=80',
      'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=800&h=500&fit=crop&q=80',
    ],
    isAnimated: true,
  },
  {
    id: 4,
    title: 'Space Pirates',
    author: 'GalacticArtist',
    authorAvatar:
      'https://api.dicebear.com/7.x/avataaars/svg?seed=GalacticArtist',
    coverImage:
      'https://images.unsplash.com/photo-1543872084-c7bd3822856f?w=800&h=1200&fit=crop&q=80',
    price: '0.29 ETH',
    likes: 420,
    views: 1850,
    pages: 16,
    genre: 'Space Opera',
    rarity: 'common',
    description:
      'Adventures of a band of space pirates as they navigate the dangers of the cosmic frontier.',
    previewImages: [
      'https://images.unsplash.com/photo-1501139083538-0139583c060f?w=800&h=500&fit=crop&q=80',
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=500&fit=crop&q=80',
    ],
  },
  {
    id: 5,
    title: 'Detective Noir',
    author: 'MysteryMaker',
    authorAvatar:
      'https://api.dicebear.com/7.x/avataaars/svg?seed=MysteryMaker',
    coverImage:
      'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=800&h=1200&fit=crop&q=80',
    price: '0.37 ETH',
    likes: 632,
    views: 2740,
    pages: 22,
    genre: 'Mystery',
    rarity: 'uncommon',
    description:
      'A hard-boiled detective navigates the dark alleys of a crime-ridden city to solve an impossible case.',
    previewImages: [
      'https://images.unsplash.com/photo-1453873623425-04e3261e1d3f?w=800&h=500&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555276841-9a2a211438fe?w=800&h=500&fit=crop&q=80',
    ],
  },
  {
    id: 6,
    title: 'Feudal Legends',
    author: 'HistoryIllustrator',
    authorAvatar:
      'https://api.dicebear.com/7.x/avataaars/svg?seed=HistoryIllustrator',
    coverImage:
      'https://images.unsplash.com/photo-1515119678297-471fcf6fe40c?w=800&h=1200&fit=crop&q=80',
    price: '0.41 ETH',
    likes: 712,
    views: 3080,
    pages: 28,
    genre: 'Historical',
    rarity: 'rare',
    description:
      'Epic tales of honor and battle in the age of samurai and warring clans.',
    previewImages: [
      'https://images.unsplash.com/photo-1587853538806-255198ea3ced?w=800&h=500&fit=crop&q=80',
      'https://images.unsplash.com/photo-1519872436884-5700c0586730?w=800&h=500&fit=crop&q=80',
    ],
    isAnimated: true,
  },
];

// Generate more comic NFTs for demonstration
function generateMoreComicNFTs(count: number): ComicNFT[] {
  const genres = [
    'Sci-Fi',
    'Fantasy',
    'Cyberpunk',
    'Mystery',
    'Action',
    'Horror',
    'Comedy',
    'Romance',
  ];
  const rarities: Array<ComicNFT['rarity']> = [
    'common',
    'uncommon',
    'rare',
    'legendary',
  ];

  return Array.from({ length: count }, (_, index) => {
    const id = index + mockComicNFTs.length + 1;
    const genreIndex = Math.floor(Math.random() * genres.length);
    const rarityIndex = Math.floor(Math.random() * rarities.length);
    const genre = genres[genreIndex] || 'Action'; // Fallback to ensure non-undefined
    const rarity = rarities[rarityIndex] || 'common'; // Fallback to ensure non-undefined
    const pages = Math.floor(Math.random() * 20) + 10;
    const isAnimated = Math.random() > 0.7;

    return {
      id,
      title: `Comic #${id}`,
      author: `Creator${id}`,
      authorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Creator${id}`,
      coverImage: `https://picsum.photos/seed/${id}/800/1200`,
      price: `${(Math.random() * 0.5 + 0.1).toFixed(2)} ETH`,
      likes: Math.floor(Math.random() * 1000),
      views: Math.floor(Math.random() * 5000),
      pages,
      genre,
      rarity,
      description: `An exciting ${genre.toLowerCase()} comic with amazing artwork and storytelling.`,
      previewImages: [
        `https://picsum.photos/seed/${id}a/800/500`,
        `https://picsum.photos/seed/${id}b/800/500`,
      ],
      isAnimated,
    };
  });
}
const allComicNFTs = [...mockComicNFTs, ...generateMoreComicNFTs(18)];

export default function ComicStoriesPage() {
  const [comics, setComics] = useState<ComicNFT[]>(allComicNFTs);
  const [filteredComics, setFilteredComics] =
    useState<ComicNFT[]>(allComicNFTs);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedRarity, setSelectedRarity] = useState<
    ComicNFT['rarity'] | null
  >(null);
  const [showAnimatedOnly, setShowAnimatedOnly] = useState(false);
  const [selectedComic, setSelectedComic] = useState<ComicNFT | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const { account } = useWeb3();
  const { toast } = useToast();

  useEffect(() => {
    let result = comics;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (comic) =>
          comic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          comic.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          comic.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    // Apply genre filter
    if (selectedGenre) {
      result = result.filter((comic) => comic.genre === selectedGenre);
    }
    // Apply rarity filter
    if (selectedRarity) {
      result = result.filter((comic) => comic.rarity === selectedRarity);
    }
    // Apply animated filter
    if (showAnimatedOnly) {
      result = result.filter((comic) => comic.isAnimated);
    }
    setFilteredComics(result);
  }, [comics, searchTerm, selectedGenre, selectedRarity, showAnimatedOnly]);

  const getGenres = () => {
    const genres = new Set(comics.map((comic) => comic.genre));
    return Array.from(genres);
  };

  const handleComicClick = (comic: ComicNFT) => {
    setSelectedComic(comic);
    setIsDetailOpen(true);
  };

  const handlePurchase = (comic: ComicNFT) => {
    if (!account) {
      toast({
        title: 'Connect Wallet',
        description: 'Please connect your wallet to purchase this NFT',
        variant: 'destructive',
      });
      return;
    }
    // Update the comic ownership in our state
    const updatedComics = comics.map((c) =>
      c.id === comic.id ? { ...c, isOwned: true, owner: account } : c
    );
    setComics(updatedComics);

    toast({
      title: 'Purchase Complete',
      description: `You now own "${comic.title}"`,
    });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20,
      },
    },
  };

  // Get rarity color
  const getRarityColor = (rarity: ComicNFT['rarity']) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-500 text-white';
      case 'uncommon':
        return 'bg-green-500 text-white';
      case 'rare':
        return 'bg-blue-500 text-white';
      case 'legendary':
        return 'bg-amber-500 text-white';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <PageHeader
          title="Comic Story NFTs"
          description="GroqTales NFT Marketplace"
          icon="book"
        />
      </motion.div>

      {/* Filters Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="my-8 p-6 bg-card rounded-xl border shadow-sm"
      >
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search comics by title, creator or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center">
              <span className="mr-2 text-sm font-medium">Genre:</span>
              <select
                className="p-2 rounded-md border bg-background text-sm"
                value={selectedGenre || ''}
                onChange={(e) => setSelectedGenre(e.target.value || null)}
                aria-label="Select genre"
              >
                <option value="">All Genres</option>
                {getGenres().map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <span className="mr-2 text-sm font-medium">Rarity:</span>
              <select
                className="p-2 rounded-md border bg-background text-sm"
                value={selectedRarity || ''}
                onChange={(e) =>
                  setSelectedRarity(
                    (e.target.value || null) as ComicNFT['rarity'] | null
                  )
                }
                aria-label="Select rarity"
              >
                <option value="">All Rarities</option>
                <option value="common">Common</option>
                <option value="uncommon">Uncommon</option>
                <option value="rare">Rare</option>
                <option value="legendary">Legendary</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAnimatedOnly}
                  onChange={() => setShowAnimatedOnly(!showAnimatedOnly)}
                  className="mr-2"
                />
                <span className="text-sm font-medium">Animated Only</span>
              </label>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Results Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {filteredComics.length}{' '}
            {filteredComics.length === 1 ? 'Comic' : 'Comics'} Available
          </h2>
          <Link href="/nft-marketplace">
            <Button variant="outline" size="sm">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Back to Marketplace
            </Button>
          </Link>
        </div>

        {filteredComics.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-12 text-center"
          >
            <p className="text-muted-foreground">
              No comics found matching your criteria. Try adjusting your
              filters.
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {filteredComics.map((comic) => (
                <motion.div
                  key={comic.id}
                  variants={itemVariants}
                  layout
                  onClick={() => handleComicClick(comic)}
                  onHoverStart={() => setHoveredId(comic.id)}
                  onHoverEnd={() => setHoveredId(null)}
                  whileHover={{
                    y: -10,
                    scale: 1.03,
                    transition: { duration: 0.2 },
                  }}
                  className="cursor-pointer"
                >
                  <Card className="h-full overflow-hidden relative group">
                    <div className="relative overflow-hidden aspect-[3/4]">
                      <Image
                        src={comic.coverImage}
                        alt={comic.title}
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                      {/* Rarity Badge */}
                      <Badge
                        className={`absolute top-2 right-2 capitalize ${getRarityColor(
                          comic.rarity
                        )}`}
                      >
                        {comic.rarity}
                      </Badge>

                      {comic.isAnimated && (
                        <Badge className="absolute top-2 left-2 bg-purple-600 text-white flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          Animated
                        </Badge>
                      )}

                      {/* Preview overlay on hover */}
                      <AnimatePresence>
                        {hoveredId === comic.id && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center"
                          >
                            <Button className="bg-white/90 text-black hover:bg-white">
                              <BookOpen className="mr-2 h-4 w-4" />
                              Preview Comic
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <CardHeader className="p-4 pb-0">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage
                            src={comic.authorAvatar}
                            alt={`${comic.author}'s avatar`}
                          />
                          <AvatarFallback>{comic.author[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">
                          {comic.author}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold mt-2 line-clamp-1">
                        {comic.title}
                      </h3>
                    </CardHeader>

                    <CardContent className="p-4 pt-2">
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {comic.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span>{comic.pages} pages</span>
                        <Badge variant="outline">{comic.genre}</Badge>
                      </div>
                    </CardContent>

                    <CardFooter className="p-4 pt-0 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center">
                          <Heart className="h-3.5 w-3.5 text-red-500 mr-1" />
                          <span className="text-xs">{comic.likes}</span>
                        </div>
                        <div className="flex items-center">
                          <Eye className="h-3.5 w-3.5 text-blue-500 mr-1" />
                          <span className="text-xs">{comic.views}</span>
                        </div>
                      </div>
                      <div className="font-bold text-amber-600">
                        {comic.price}
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Comic Detail Dialog */}
      {selectedComic && (
        <ComicNFTDetailDialog
          comic={selectedComic}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          onPurchase={() => handlePurchase(selectedComic)}
        />
      )}
    </div>
  );
}
