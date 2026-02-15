'use client';

import { useState, useEffect, memo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import React from 'react';
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

// Lightweight animation fallbacks with optional framer-motion integration.

const MotionDiv = React.forwardRef((props: any, ref: any) => {
  // eslint-disable-next-line react/display-name
  const [Comp, setComp] = useState<any>(() => (innerProps: any) => (
    <div {...innerProps} ref={ref} />
  ));

  useEffect(() => {
    let mounted = true;
    import('framer-motion')
      .then((mod) => {
        if (!mounted) return;
        if (mod && mod.motion && mod.motion.div) {
          setComp(() => mod.motion.div);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return <Comp {...props} ref={ref} />;
});
MotionDiv.displayName = 'MotionDiv';

const motion = { div: MotionDiv, motion: { div: MotionDiv } };

const AnimatePresence = ({
  children,
  ...rest
}: { children: React.ReactNode } & any) => {
  // eslint-disable-next-line react/display-name
  const [Comp, setComp] = useState<any>(() => ({ children }: any) => (
    <>{children}</>
  ));

  useEffect(() => {
    let mounted = true;
    import('framer-motion')
      .then((mod) => {
        if (!mounted) return;
        if (mod && mod.AnimatePresence) setComp(() => mod.AnimatePresence);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return <Comp {...rest}>{children}</Comp>;
};

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(Boolean(mq.matches));
    update();
    if (mq.addEventListener) mq.addEventListener('change', update);
    else mq.addListener(update);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', update);
      else mq.removeListener(update);
    };
  }, []);

  return reduced;
}

// Simple icon replacements
const Heart = ({ className = '' }: { className?: string }) => (
  <span className={className}>♥</span>
);
const Eye = ({ className = '' }: { className?: string }) => (
  <span className={className}>👁</span>
);
const ShoppingCart = ({ className = '' }: { className?: string }) => (
  <span className={className}>🛒</span>
);
const Search = ({ className = '' }: { className?: string }) => (
  <span className={className}>🔍</span>
);
const Filter = ({ className = '' }: { className?: string }) => (
  <span className={className}>⚙</span>
);
const TrendingUp = ({ className = '' }: { className?: string }) => (
  <span className={className}>📈</span>
);
const Star = ({ className = '' }: { className?: string }) => (
  <span className={className}>⭐</span>
);
const Palette = ({ className = '' }: { className?: string }) => (
  <span className={className}>🎨</span>
);
const BookOpen = ({ className = '' }: { className?: string }) => (
  <span className={className}>📖</span>
);
const Users = ({ className = '' }: { className?: string }) => (
  <span className={className}>👥</span>
);

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
];

// Modal (resolved conflicts)
const NFTDetailModal = memo(({
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
}) => {
  if (!nft) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {nft.title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            by {nft.author}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-800 aspect-[2/3] max-h-[500px]">
              <Image
                src={nft.coverImage}
                alt={nft.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {nft.rarity && (
                <div
                  className={`absolute top-3 right-3 px-3 py-1 rounded-full font-bold text-sm ${
                    nft.rarity === 'Legendary'
                      ? 'bg-yellow-500 text-yellow-900'
                      : nft.rarity === 'Epic'
                        ? 'bg-purple-500 text-white'
                        : nft.rarity === 'Rare'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-500 text-white'
                  }`}
                >
                  {nft.rarity}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => onLike(nft.id)}
                variant="outline"
                className="flex-1"
              >
                <Heart className="w-4 h-4 mr-2" />
                Like ({nft.likes})
              </Button>
              <Button onClick={() => onPurchase(nft.id)} className="flex-1">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Buy Now - {nft.price}
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-slate-700 dark:text-slate-300">
                {nft.description}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">
                Additional Information
              </h3>
              <div className="space-y-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">
                    NFT ID:
                  </span>
                  <span className="font-mono bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">
                    {nft.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">
                    Price:
                  </span>
                  <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                    {nft.price}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">
                    Rarity:
                  </span>
                  <span
                    className={`font-medium px-2 py-1 rounded ${
                      (nft.rarity || 'Common') === 'Legendary'
                        ? 'bg-yellow-500 text-yellow-900'
                        : (nft.rarity || 'Common') === 'Epic'
                          ? 'bg-purple-500 text-white'
                          : (nft.rarity || 'Common') === 'Rare'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-500 text-white'
                    }`}
                  >
                    {nft.rarity || 'Common'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">
                    Status:
                  </span>
                  <span
                    className={`font-medium px-2 py-1 rounded ${nft.isTop10 ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-500 text-white'}`}
                  >
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
NFTDetailModal.displayName = 'NFTDetailModal';

export default function NFTGalleryPage() {
  return <div className="container mx-auto py-8 px-4">NFT Gallery</div>;
}
