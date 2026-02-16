'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Book,
  ShoppingCart,
  FileText,
  Clock,
  Heart,
  Eye,
  ArrowUpDown,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface TextNFT {
  id: number;
  title: string;
  author: string;
  authorAvatar: string;
  coverImage: string;
  price: string;
  likes: number;
  views: number;
  wordCount: number;
  genre: string;
  readTime: string;
  description: string;
  excerpt: string;
  tags: string[];
  isOwned: boolean;
  owner: string;
}
// Mock data for text story NFTs
const textNFTs: TextNFT[] = [
  {
    id: 1,
    title: 'The Silent Echo',
    author: 'WordWeaver',
    authorAvatar: 'https://api.dicebear.com/7.x/micah/svg?seed=WordWeaver',
    coverImage:
      'https://images.unsplash.com/photo-1579547621706-1a9c79d5c9f1?w=800&h=1200&fit=crop&q=80',
    price: '0.25 ETH',
    likes: 543,
    views: 2100,
    wordCount: 12500,
    genre: 'Mystery',
    readTime: '35 min',
    description:
      "A psychological thriller about a detective who discovers that the crime he's investigating may have been committed by himself in a dissociative state.",
    excerpt:
      'The rain fell like whispered confessions against the window pane as Detective Morrows stared at the evidence board. Something familiar lurked in the handwriting analysis, something that sent chills down his spine...',
    tags: ['mystery', 'thriller', 'psychological'],
    isOwned: false,
    owner: '',
  },
  {
    id: 2,
    title: 'Quantum Whispers',
    author: 'PhysicsPhiction',
    authorAvatar: 'https://api.dicebear.com/7.x/micah/svg?seed=PhysicsPhiction',
    coverImage:
      'https://images.unsplash.com/photo-1534841090574-cba2d662b62e?w=800&h=1200&fit=crop&q=80',
    price: '0.18 ETH',
    likes: 328,
    views: 1230,
    wordCount: 8700,
    genre: 'Sci-Fi',
    readTime: '25 min',
    description:
      "When a physicist develops a way to hear quantum particles, she discovers they're carrying messages from parallel universes.",
    excerpt:
      "Dr. Lin adjusted the frequency on her quantum resonator. The static cleared, and for the first time in human history, someone heard the voice of a particle. 'Help us,' it said distinctly, 'your world is next.'",
    tags: ['sci-fi', 'quantum physics', 'parallel worlds'],
    isOwned: false,
    owner: '',
  },
  {
    id: 3,
    title: 'Gossamer Dreams',
    author: 'NightScribe',
    authorAvatar: 'https://api.dicebear.com/7.x/micah/svg?seed=NightScribe',
    coverImage:
      'https://images.unsplash.com/photo-1633296546629-ec2b3142384c?w=800&h=1200&fit=crop&q=80',
    price: '0.31 ETH',
    likes: 712,
    views: 3405,
    wordCount: 15200,
    genre: 'Fantasy',
    readTime: '45 min',
    description:
      'A weaver discovers she can embroider dreams into reality, but each creation comes with an unforeseen consequence.',
    excerpt:
      "Eliza's needle glinted in the candlelight as she wove the golden thread through the tapestry. As the final stitch fell into place, the phoenix she had embroidered lifted from the cloth, its wings trailing fire across her small cottage...",
    tags: ['fantasy', 'magic', 'consequences'],
    isOwned: false,
    owner: '',
  },
  {
    id: 4,
    title: 'Analog Heart',
    author: 'RetroFuturist',
    authorAvatar: 'https://api.dicebear.com/7.x/micah/svg?seed=RetroFuturist',
    coverImage:
      'https://images.unsplash.com/photo-1610513519265-947f119a2141?w=800&h=1200&fit=crop&q=80',
    price: '0.22 ETH',
    likes: 489,
    views: 1875,
    wordCount: 10300,
    genre: 'Cyberpunk',
    readTime: '30 min',
    description:
      'In a world where human emotions are digitized and traded, one woman discovers her emotions are stubbornly analog.',
    excerpt:
      "Everyone had their EmoCores installed by age thirteen. But when they tried to install mine, the technician's face went pale. 'It's rejecting the digital interface,' he whispered to my parents. 'Her emotions... they're analog.'",
    tags: ['cyberpunk', 'emotions', 'technology'],
    isOwned: false,
    owner: '',
  },
  {
    id: 5,
    title: 'The Last Letter',
    author: 'HistoryPen',
    authorAvatar: 'https://api.dicebear.com/7.x/micah/svg?seed=HistoryPen',
    coverImage:
      'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=800&h=1200&fit=crop&q=80',
    price: '0.28 ETH',
    likes: 602,
    views: 2760,
    wordCount: 13800,
    genre: 'Historical Fiction',
    readTime: '40 min',
    description:
      "A long-lost letter from World War II changes the course of a family's history when it's discovered generations later.",
    excerpt:
      "The attic smelled of dust and secrets. As Maria unfolded the brittle yellow paper, the handwriting of her great-grandmother materialized like a ghost. 'My dearest Wilhelm,' it began, 'if you are reading this, then what I have done has saved your life, but cost me mine...'",
    tags: ['historical', 'wwii', 'family secrets'],
    isOwned: false,
    owner: '',
  },
  {
    id: 6,
    title: 'Ephemeral',
    author: 'MindScriptor',
    authorAvatar: 'https://api.dicebear.com/7.x/micah/svg?seed=MindScriptor',
    coverImage:
      'https://images.unsplash.com/photo-1628788835388-415ee2fa9576?w=800&h=1200&fit=crop&q=80',
    price: '0.33 ETH',
    likes: 745,
    views: 3215,
    wordCount: 9500,
    genre: 'Philosophy',
    readTime: '28 min',
    description:
      'A philosopher develops a drug that allows people to experience time non-linearly, with profound implications for human understanding.',
    excerpt:
      "Dr. Eliana Wright held the small blue pill between her fingers. 'This will temporarily untether you from sequential time,' she explained. 'You'll experience past, present, and future simultaneously. Are you prepared for that kind of perspective?'",
    tags: ['philosophy', 'time', 'consciousness'],
    isOwned: false,
    owner: '',
  },
];

// Generate more text NFTs for demonstration
function generateMoreTextNFTs(count: number): TextNFT[] {
  const genres = [
    'Mystery',
    'Sci-Fi',
    'Fantasy',
    'Cyberpunk',
    'Historical Fiction',
    'Philosophy',
    'Romance',
    'Horror',
    'Thriller',
  ];

  return Array.from({ length: count }, (_, index) => {
    const id = index + textNFTs.length + 1;
    const genre =
      genres[Math.floor(Math.random() * genres.length)] || 'Fantasy';
    const wordCount = Math.floor(Math.random() * 15000) + 5000;
    const readTime = `${Math.ceil(wordCount / 300)} min`;

    return {
      id,
      title: `Story #${id}`,
      author: `Author${id}`,
      authorAvatar: `https://api.dicebear.com/7.x/micah/svg?seed=Author${id}`,
      coverImage: `https://picsum.photos/seed/${id}/800/1200`,
      price: `${(Math.random() * 0.3 + 0.1).toFixed(2)} ETH`,
      likes: Math.floor(Math.random() * 1000),
      views: Math.floor(Math.random() * 5000),
      wordCount,
      genre,
      readTime,
      description: `A compelling ${genre.toLowerCase()} story that will keep you engaged throughout the reading experience.`,
      excerpt: `This is an excerpt from Story #${id}. The beginning of what promises to be an exciting journey through this ${genre.toLowerCase()} tale...`,
      tags: [genre.toLowerCase(), 'fiction', `tag${id}`],
      isOwned: false,
      owner: '',
    };
  });
}
const allTextNFTs = [...textNFTs, ...generateMoreTextNFTs(18)];

interface TextNFTDetailDialogProps {
  story: TextNFT;
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (story: TextNFT) => void;
}

function TextNFTDetailDialog({
  story,
  isOpen,
  onClose,
  onPurchase,
}: TextNFTDetailDialogProps) {
  const { account } = useWeb3();
  const { toast } = useToast();

  const handlePurchase = () => {
    if (!account) {
      toast({
        title: 'Connect Wallet',
        description: 'Please connect your wallet to purchase this NFT',
        variant: 'destructive',
      });
      // Trigger wallet connection
      document.getElementById('connect-wallet-button')?.click();
      return;
    }
    toast({
      title: 'Processing Payment',
      description: 'Completing your purchase transaction...',
    });

    // Simulate transaction processing
    setTimeout(() => {
      toast({
        title: 'Purchase Successful!',
        description: `You now own "${story.title}"`,
      });

      // Close current dialog
      onClose();

      // Call the parent component's purchase handler
      onPurchase(story);
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col top-0 translate-y-0 mt-4">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              {story.title}
            </DialogTitle>
            <Badge>{story.genre}</Badge>
          </div>
          <DialogDescription className="flex items-center mt-2">
            <Avatar className="h-5 w-5 mr-2">
              <AvatarImage src={story.authorAvatar} alt={story.author} />
              <AvatarFallback>{story.author[0]}</AvatarFallback>
            </Avatar>
            by {story.author}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col md:flex-row gap-6 mt-4 flex-1 overflow-auto">
          <div className="md:w-1/3">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
              <Image
                src={story.coverImage}
                alt={story.title}
                className="object-cover"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="border rounded p-2 text-center">
                <p className="text-xs text-muted-foreground">Word Count</p>
                <p className="font-medium">
                  {story.wordCount.toLocaleString()}
                </p>
              </div>
              <div className="border rounded p-2 text-center">
                <p className="text-xs text-muted-foreground">Read Time</p>
                <p className="font-medium">{story.readTime}</p>
              </div>
              <div className="border rounded p-2 text-center">
                <p className="text-xs text-muted-foreground">Likes</p>
                <p className="font-medium">{story.likes}</p>
              </div>
              <div className="border rounded p-2 text-center">
                <p className="text-xs text-muted-foreground">Views</p>
                <p className="font-medium">{story.views}</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex flex-wrap gap-1">
                {story.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="md:w-2/3 flex flex-col overflow-hidden">
            <Tabs
              defaultValue="excerpt"
              className="flex-1 overflow-hidden flex flex-col"
            >
              <TabsList>
                <TabsTrigger value="excerpt">Excerpt</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
              </TabsList>
              <div className="flex-1 overflow-y-auto mt-4">
                <TabsContent value="excerpt" className="m-0 h-full">
                  <div className="prose dark:prose-invert max-w-none">
                    <h3 className="text-lg font-semibold mb-2">
                      Story Excerpt
                    </h3>
                    <div className="bg-muted p-6 rounded-lg border border-border italic">
                      {story.excerpt}
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">
                      Purchase this NFT to read the full story and get permanent
                      access to the complete work.
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="about" className="m-0 h-full">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        About This Story
                      </h3>
                      <p className="text-muted-foreground">
                        {story.description}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Ownership Benefits
                      </h3>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <div className="mr-2 mt-0.5 h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center">
                            <svg
                              className="h-3 w-3 text-green-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                          <span>
                            Full access to the complete story (
                            {story.wordCount.toLocaleString()} words)
                          </span>
                        </li>
                        <li className="flex items-start">
                          <div className="mr-2 mt-0.5 h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center">
                            <svg
                              className="h-3 w-3 text-green-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                          <span>
                            Digital ownership verified on the blockchain
                          </span>
                        </li>
                        <li className="flex items-start">
                          <div className="mr-2 mt-0.5 h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center">
                            <svg
                              className="h-3 w-3 text-green-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                          <span>
                            Direct contact with the author for feedback and
                            discussions
                          </span>
                        </li>
                        <li className="flex items-start">
                          <div className="mr-2 mt-0.5 h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center">
                            <svg
                              className="h-3 w-3 text-green-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                          <span>
                            Ability to resell this NFT on the marketplace
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>

            <div className="mt-6 pt-4 border-t">
              <Button
                onClick={handlePurchase}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                size="lg"
              >
                Purchase for {story.price}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export default function TextStoriesPage() {
  const [stories, setStories] = useState<TextNFT[]>(allTextNFTs);
  const [filteredStories, setFilteredStories] =
    useState<TextNFT[]>(allTextNFTs);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<
    'price-asc' | 'price-desc' | 'length' | 'popular'
  >('popular');
  const [minWordCount, setMinWordCount] = useState<number | ''>('');
  const [maxWordCount, setMaxWordCount] = useState<number | ''>('');
  const [selectedStory, setSelectedStory] = useState<TextNFT | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { account } = useWeb3();
  const { toast } = useToast();

  useEffect(() => {
    let result = stories;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (story) =>
          story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          story.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          story.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          story.tags.some((tag) => tag.includes(searchTerm.toLowerCase()))
      );
    }
    // Apply genre filter
    if (selectedGenre) {
      result = result.filter((story) => story.genre === selectedGenre);
    }
    // Apply word count filters
    if (minWordCount !== '') {
      result = result.filter(
        (story) => story.wordCount >= Number(minWordCount)
      );
    }
    if (maxWordCount !== '') {
      result = result.filter(
        (story) => story.wordCount <= Number(maxWordCount)
      );
    }
    // Apply sorting
    switch (sortBy) {
      case 'price-asc':
        result = [...result].sort(
          (a, b) => parseFloat(a.price) - parseFloat(b.price)
        );
        break;
      case 'price-desc':
        result = [...result].sort(
          (a, b) => parseFloat(b.price) - parseFloat(a.price)
        );
        break;
      case 'length':
        result = [...result].sort((a, b) => b.wordCount - a.wordCount);
        break;
      case 'popular':
      default:
        result = [...result].sort(
          (a, b) => b.likes + b.views - (a.likes + a.views)
        );
        break;
    }
    setFilteredStories(result);
  }, [stories, searchTerm, selectedGenre, sortBy, minWordCount, maxWordCount]);

  const getGenres = () => {
    const genres = new Set(stories.map((story) => story.genre));
    return Array.from(genres);
  };

  const handleStoryClick = (story: TextNFT) => {
    setSelectedStory(story);
    setIsDetailOpen(true);
  };

  const handlePurchase = (story: TextNFT) => {
    if (!account) {
      toast({
        title: 'Connect Wallet',
        description: 'Please connect your wallet to purchase this NFT',
        variant: 'destructive',
      });
      return;
    }
    // Update the story ownership in our state
    const updatedStories = stories.map((s) =>
      s.id === story.id ? { ...s, isOwned: true, owner: account } : s
    );
    setStories(updatedStories);

    toast({
      title: 'Purchase Complete',
      description: `You now own "${story.title}"`,
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

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <PageHeader
          title="Text Story NFTs"
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
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search stories by title, author, description or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <span className="mr-2 text-sm font-medium">Genre:</span>
              <select
                className="p-2 rounded-md border bg-background text-sm flex-1"
                value={selectedGenre || ''}
                onChange={(e) => setSelectedGenre(e.target.value || null)}
                aria-label="Filter by genre"
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
              <span className="mr-2 text-sm font-medium">Sort by:</span>
              <select
                className="p-2 rounded-md border bg-background text-sm flex-1"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort stories"
              >
                <option value="popular">Most Popular</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="length">Longest Stories</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Word Count:</span>
              <Input
                type="number"
                placeholder="Min"
                value={minWordCount}
                onChange={(e) =>
                  setMinWordCount(e.target.value ? Number(e.target.value) : '')
                }
                className="w-24"
                min="0"
                aria-label="Minimum word count"
              />
              <span>-</span>
              <Input
                type="number"
                placeholder="Max"
                value={maxWordCount}
                onChange={(e) =>
                  setMaxWordCount(e.target.value ? Number(e.target.value) : '')
                }
                className="w-24"
                min="0"
                aria-label="Maximum word count"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Results Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {filteredStories.length}{' '}
            {filteredStories.length === 1 ? 'Story' : 'Stories'} Available
          </h2>
          <Link href="/nft-marketplace">
            <Button variant="outline" size="sm">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Back to Marketplace
            </Button>
          </Link>
        </div>

        {filteredStories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-12 text-center"
          >
            <p className="text-muted-foreground">
              No stories found matching your criteria. Try adjusting your
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
              {filteredStories.map((story) => (
                <motion.div
                  key={story.id}
                  variants={itemVariants}
                  layout
                  onClick={() => handleStoryClick(story)}
                  whileHover={{
                    y: -10,
                    scale: 1.03,
                    transition: { duration: 0.2 },
                  }}
                  className="cursor-pointer"
                >
                  <Card className="h-full flex flex-col overflow-hidden group">
                    <div className="relative overflow-hidden">
                      <div className="aspect-[3/4] relative">
                        <Image
                          src={story.coverImage}
                          alt={story.title}
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white font-bold text-lg line-clamp-2 drop-shadow-md">
                          {story.title}
                        </h3>
                        <p className="text-white/80 text-sm mt-1 drop-shadow-md">
                          by {story.author}
                        </p>
                      </div>
                    </div>

                    <CardContent className="flex-grow p-4 bg-card">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <FileText className="h-4 w-4" />
                        <span>{story.wordCount.toLocaleString()} words</span>
                        <span className="mx-1">•</span>
                        <Clock className="h-4 w-4" />
                        <span>{story.readTime}</span>
                      </div>

                      <p className="text-sm line-clamp-3">
                        {story.description}
                      </p>
                    </CardContent>

                    <CardFooter className="border-t p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center">
                          <Heart className="h-3.5 w-3.5 text-red-500 mr-1" />
                          <span className="text-xs">{story.likes}</span>
                        </div>
                        <div className="flex items-center">
                          <Eye className="h-3.5 w-3.5 text-blue-500 mr-1" />
                          <span className="text-xs">{story.views}</span>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400"
                      >
                        {story.price}
                      </Badge>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Story Detail Dialog */}
      {selectedStory && (
        <TextNFTDetailDialog
          story={selectedStory}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          onPurchase={handlePurchase}
        />
      )}
    </div>
  );
}
