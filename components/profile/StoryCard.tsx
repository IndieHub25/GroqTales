'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageSquare } from 'lucide-react';

type StoryCardProps = {
  story: {
    title: string;
    excerpt: string;
    coverImage: string;
    date: string;
    genre: string;
    likes: number;
    comments: number;
    isNFT?: boolean;
  };
};

export default function StoryCard({ story }: StoryCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
        <img
          src={story.coverImage}
          alt={story.title}
          className="w-full h-full object-cover"
        />

        {story.isNFT && (
          <Badge className="absolute top-2 right-2 z-20">NFT</Badge>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2">{story.title}</h3>
        <p className="text-muted-foreground text-sm mb-3">{story.excerpt}</p>

        <div className="flex justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Heart className="w-4 h-4" aria-hidden="true" />
            {story.likes}
          </span>

          <span className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" aria-hidden="true" />
            {story.comments}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
