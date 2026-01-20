'use client';

import Image from 'next/image';
import { Heart, MessageSquare } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { StoryCardData } from '@/types/story';

interface Props {
  story: StoryCardData;
}

export default function StoryCard({ story }: Props) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition">
      <div className="relative aspect-video bg-muted">
        {story.coverImageUrl && (
          <Image
            src={story.coverImageUrl}
            alt={story.title}
            fill
            className="object-cover"
          />
        )}

        {story.isNFT && <Badge className="absolute top-2 right-2">NFT</Badge>}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1">{story.title}</h3>

        {story.excerpt && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {story.excerpt}
          </p>
        )}

        <div className="flex justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Heart className="w-4 h-4" /> 0
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" /> 0
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
