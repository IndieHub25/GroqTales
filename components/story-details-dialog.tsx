import {
  Heart,
  Eye,
  MessageSquare,
  Share2,
  Wallet,
  ShoppingCart,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import { useWeb3 } from '@/components/providers/web3-provider';
import StoryCommentsDialog from '@/components/story-comments-dialog';
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
import { useToast } from '@/components/ui/use-toast';

interface StoryDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  story: any;
  onPurchase?: () => void;
  onLike?: () => void;
  isAdmin?: boolean;
}

export default function StoryDetailsDialog({
  isOpen,
  onClose,
  story,
  onPurchase,
  onLike,
  isAdmin = false,
}: StoryDetailsDialogProps) {
  const { account } = useWeb3();
  const { toast } = useToast();
  const [isCommentsOpen, setIsCommentsOpen] = React.useState(false);
  const [commentCount, setCommentCount] = React.useState(
    story.comments?.length || 0
  );

  const handlePurchase = () => {
    if (!account) {
      toast({
        title: 'Connect Wallet',
        description: 'Please connect your wallet to purchase this NFT',
        variant: 'destructive',
      });
      return;
    }

    if (onPurchase) {
      onPurchase();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative">
            {story.image && (
              <div className="aspect-[4/3] relative rounded-lg overflow-hidden">
                <Image
                  src={story.image}
                  alt={story.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  loading="lazy"
                />
              </div>
            )}
            {story.price && (
              <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center">
                <ShoppingCart className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
                {story.price}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={story.authorAvatar} />
                  <AvatarFallback>{story.author[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{story.author}</h3>
                  <p className="text-sm text-muted-foreground">
                    {story.authorUsername ||
                      '@' + story.author.toLowerCase().replace(/\s+/g, '')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {story.genre && (
                  <Badge variant="secondary">{story.genre}</Badge>
                )}
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <p>{story.description || story.content}</p>
            </div>

            {/* Purchase CTA */}
            {story.price && (
              <div className="p-4 bg-accent/20 rounded-lg border border-accent/30">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      Own this unique story as an NFT
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Collect this story and get exclusive benefits from the
                      author.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handlePurchase}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                      size="lg"
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      Buy for {story.price}
                    </Button>
                    <Link href="/nft-marketplace" passHref>
                      <Button variant="outline" size="lg">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Go to Marketplace
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" onClick={onLike}>
                  <Heart className="w-4 h-4 mr-1" />
                  {story.likes || 0}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCommentsOpen(true)}
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  {commentCount}
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-sm text-muted-foreground">
                  <Eye className="w-4 h-4 inline mr-1" />
                  {story.views || 0} views
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogClose className="absolute right-4 top-4" />
      </DialogContent>

      {/* Comments Dialog */}
      <StoryCommentsDialog
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        storyTitle={story.title}
        storyId={story.id || story._id}
        isWalletConnected={!!account}
        isAdmin={isAdmin}
        onCommentCountChange={setCommentCount}
      />
    </Dialog>
  );
}
