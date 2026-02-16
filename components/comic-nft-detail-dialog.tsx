import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Eye,
  Share2,
  Wallet,
  Sparkles,
  MessageSquare,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';

import { useWeb3 } from '@/components/providers/web3-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
}
interface ComicNFTDetailDialogProps {
  comic: ComicNFT;
  isOpen: boolean;
  onClose: () => void;
  onPurchase: () => void;
}

export function ComicNFTDetailDialog({
  comic,
  isOpen,
  onClose,
  onPurchase,
}: ComicNFTDetailDialogProps) {
  const [currentPreviewImage, setCurrentPreviewImage] = useState(0);
  const [activeTab, setActiveTab] = useState('details');
  const { account } = useWeb3();
  const { toast } = useToast();

  const handlePreviewButtonClick = (
    e: React.MouseEvent,
    action: () => void
  ) => {
    e.stopPropagation();
    action();
  };

  const prevPreviewImage = () => {
    setCurrentPreviewImage((prev) =>
      prev === 0 ? comic.previewImages.length - 1 : prev - 1
    );
  };

  const nextPreviewImage = () => {
    setCurrentPreviewImage((prev) =>
      prev === comic.previewImages.length - 1 ? 0 : prev + 1
    );
  };

  const getRarityColor = (
    rarity: 'common' | 'uncommon' | 'rare' | 'legendary'
  ) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-500 text-white';
      case 'uncommon':
        return 'bg-green-500 text-white';
      case 'rare':
        return 'bg-blue-500 text-white';
      case 'legendary':
        return 'bg-purple-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const handlePurchase = () => {
    if (!account) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to make a purchase.',
        variant: 'destructive',
      });
      return;
    }

    onPurchase();
    toast({
      title: 'Purchase initiated',
      description: `Processing purchase of ${comic.title} for ${comic.price}`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[90vh] p-0 overflow-hidden">
        <div className="flex h-full">
          {/* Image Preview Section */}
          <div className="md:w-1/2 bg-black relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPreviewImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative aspect-[3/4] md:h-full"
              >
                <Image
                  src={
                    comic.previewImages[currentPreviewImage] || comic.coverImage
                  }
                  alt={`${comic.title} preview ${currentPreviewImage + 1}`}
                  className="object-contain"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                />

                {/* Preview navigation */}
                {comic.previewImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) =>
                        handlePreviewButtonClick(e, prevPreviewImage)
                      }
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                      aria-label="Previous preview image"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={(e) =>
                        handlePreviewButtonClick(e, nextPreviewImage)
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                      aria-label="Next preview image"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                      {comic.previewImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={(e) =>
                            handlePreviewButtonClick(e, () =>
                              setCurrentPreviewImage(idx)
                            )
                          }
                          className={`w-2 h-2 rounded-full ${
                            currentPreviewImage === idx
                              ? 'bg-white'
                              : 'bg-white/50'
                          }`}
                          aria-label={`Go to preview image ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Rarity and animated badges */}
                <div className="absolute top-2 right-2 flex gap-2">
                  <Badge
                    className={`capitalize ${getRarityColor(comic.rarity)}`}
                  >
                    {comic.rarity}
                  </Badge>

                  {comic.isAnimated && (
                    <Badge className="bg-purple-600 text-white flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Animated
                    </Badge>
                  )}
                </div>

                <div className="absolute bottom-2 left-2 bg-black/80 text-white px-3 py-1 rounded-full text-sm">
                  Page {currentPreviewImage + 1} of{' '}
                  {Math.max(comic.previewImages.length, 1)}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right side: Comic Details */}
          <div className="md:w-1/2 flex flex-col overflow-hidden">
            <DialogHeader className="px-6 pt-6 pb-0">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl font-bold">
                    {comic.title}
                  </DialogTitle>
                  <DialogDescription className="mt-1 flex items-center">
                    <Avatar className="h-5 w-5 mr-2">
                      <AvatarImage src={comic.authorAvatar} />
                      <AvatarFallback>{comic.author[0]}</AvatarFallback>
                    </Avatar>
                    by {comic.author}
                  </DialogDescription>
                </div>

                <Badge variant="outline" className="ml-2">
                  {comic.genre}
                </Badge>
              </div>
            </DialogHeader>

            <Tabs
              defaultValue="details"
              className="flex-1 overflow-hidden flex flex-col"
              onValueChange={setActiveTab}
            >
              <div className="px-6 border-b">
                <TabsList className="mt-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="ownership">Ownership</TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                <TabsContent value="details" className="m-0 h-full">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Description
                      </h3>
                      <p className="text-muted-foreground">
                        {comic.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="border rounded-lg p-3">
                        <div className="text-sm text-muted-foreground">
                          Pages
                        </div>
                        <div className="font-semibold">{comic.pages}</div>
                      </div>
                      <div className="border rounded-lg p-3">
                        <div className="text-sm text-muted-foreground">
                          Price
                        </div>
                        <div className="font-semibold text-amber-600">
                          {comic.price}
                        </div>
                      </div>
                      <div className="border rounded-lg p-3">
                        <div className="text-sm text-muted-foreground">
                          Likes
                        </div>
                        <div className="font-semibold flex items-center">
                          <Heart className="h-4 w-4 text-red-500 mr-1.5" />
                          {comic.likes}
                        </div>
                      </div>
                      <div className="border rounded-lg p-3">
                        <div className="text-sm text-muted-foreground">
                          Views
                        </div>
                        <div className="font-semibold flex items-center">
                          <Eye className="h-4 w-4 text-blue-500 mr-1.5" />
                          {comic.views}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Rarity</h3>
                      <Badge
                        className={`capitalize ${getRarityColor(comic.rarity)}`}
                      >
                        {comic.rarity} Comic NFT
                      </Badge>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {comic.rarity === 'common' &&
                          'Common NFTs are the most abundant in the marketplace.'}
                        {comic.rarity === 'uncommon' &&
                          'Uncommon NFTs are harder to find than common ones.'}
                        {comic.rarity === 'rare' &&
                          'Rare NFTs are limited and highly sought after by collectors.'}
                        {comic.rarity === 'legendary' &&
                          'Legendary NFTs are extremely rare and valuable collectibles.'}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="m-0 h-full">
                  <div className="text-center space-y-4">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Comic Preview</h3>
                    <p className="text-muted-foreground">
                      This comic contains {comic.pages} pages of beautiful
                      artwork.
                      {comic.previewImages.length > 0
                        ? ' Use the navigation on the left to browse through the preview pages.'
                        : ' Purchase this comic to view the full content.'}
                    </p>
                    {comic.isAnimated && (
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        <h4 className="font-medium text-purple-800 dark:text-purple-300 flex items-center justify-center">
                          <Sparkles className="h-4 w-4 mr-2" />
                          Animated Content
                        </h4>
                        <p className="text-sm text-purple-700 dark:text-purple-400 mt-1">
                          This comic features special animated sequences that
                          bring the story to life!
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="ownership" className="m-0 h-full">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Ownership Benefits
                    </h3>
                    <p className="text-muted-foreground">
                      When you purchase this comic NFT, you'll receive:
                    </p>
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
                          Full access to all {comic.pages} pages of the comic
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
                          Ability to resell this NFT on the marketplace
                        </span>
                      </li>
                      {comic.isAnimated && (
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
                            Special animated sequences exclusive to owners
                          </span>
                        </li>
                      )}
                    </ul>
                  </div>
                </TabsContent>
              </div>

              <div className="p-6 border-t mt-auto">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" className="h-9 px-2">
                      <Heart className="h-[18px] w-[18px] text-red-500 mr-1" />
                      Like
                    </Button>
                    <Button variant="ghost" size="sm" className="h-9 px-2">
                      <MessageSquare className="h-[18px] w-[18px] mr-1" />
                      Comment
                    </Button>
                    <Button variant="ghost" size="sm" className="h-9 px-2">
                      <Share2 className="h-[18px] w-[18px] mr-1" />
                      Share
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handlePurchase}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                  size="lg"
                >
                  <Wallet className="mr-2 h-5 w-5" />
                  Purchase for {comic.price}
                </Button>
              </div>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
