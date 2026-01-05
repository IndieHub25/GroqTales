'use client';

import {
  Heart,
  Eye,
  MessageSquare,
  Share2,
  BookOpen,
  Download,
  Gift,
  ShoppingCart,
  Sparkles,
  Lock,
} from 'lucide-react';
import React from 'react';

import { useWeb3 } from '@/components/providers/web3-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { truncateAddress } from '@/lib/utils';

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
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  description: string;
  excerpt: string;
  tags: string[];
  isOwned: boolean;
  owner: string;
}

interface TextNFTDetailDialogProps {
  story: TextNFT;
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (story: TextNFT) => void;
}

export function TextNFTDetailDialog({
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
        title: 'Wallet not connected',
        description: 'Please connect your wallet to purchase NFTs.',
        variant: 'destructive',
      });
      return;
    }

    onPurchase(story);
    toast({
      title: 'Purchase initiated',
      description: `Purchasing "${story.title}" for ${story.price} ETH`,
    });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-500 text-white';
      case 'uncommon':
        return 'bg-green-500 text-white';
      case 'rare':
        return 'bg-blue-500 text-white';
      case 'legendary':
        return 'bg-amber-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] p-0 overflow-hidden">
        <div className="flex h-full">
          {/* Story Preview Section */}
          <div className="md:w-1/2 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 relative">
            <div className="p-6 h-full flex flex-col">
              <div className="flex-1 bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
                <div className="mb-4">
                  <Badge className={getRarityColor(story.rarity)}>
                    {story.rarity}
                  </Badge>
                </div>

                <h2 className="text-2xl font-bold mb-4">{story.title}</h2>

                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-muted-foreground mb-4">{story.excerpt}</p>

                  {story.isOwned ? (
                    <div className="space-y-4">
                      <p>
                        Full story content would be displayed here for owners...
                      </p>
                      <Button className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Download Full Story
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Purchase this NFT to read the full story
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Story Details Section */}
          <div className="md:w-1/2 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold mb-2">{story.title}</h1>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={story.authorAvatar} alt={story.author} />
                    <AvatarFallback>{story.author[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{story.author}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{story.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{story.views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{story.wordCount} words</span>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{story.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Genre:</span>
                      <span className="ml-2">{story.genre}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Read Time:</span>
                      <span className="ml-2">{story.readTime}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rarity:</span>
                      <Badge className={`ml-2 ${getRarityColor(story.rarity)}`}>
                        {story.rarity}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Owner:</span>
                      <span className="ml-2 font-mono text-xs">
                        {truncateAddress(story.owner)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {story.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Purchase Section */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-2xl font-bold">{story.price} ETH</div>
                    <div className="text-sm text-muted-foreground">
                      Current Price
                    </div>
                  </div>
                </div>

                {!story.isOwned ? (
                  <Button onClick={handlePurchase} className="w-full" size="lg">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Purchase NFT
                  </Button>
                ) : (
                  <div className="text-center py-4">
                    <Badge variant="secondary" className="text-green-600">
                      <Sparkles className="w-4 h-4 mr-1" />
                      You own this NFT
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
