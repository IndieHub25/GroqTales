'use client';

import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface Story {
  id: string;
  title: string;
  content: string;
  author: string;
  genre: string;
  imageUrl: string;
  price: number;
  salesCount: number;
  royaltyPercentage?: number;
}
export function NFTGallery() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const response = await fetch('/api/stories');
      const data = await response.json();
      setStories(data);
    } catch (error) {
      console.error('Failed to fetch stories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a filter for best sellers based on a hypothetical salesCount property
  const bestSellers =
    stories
      ?.filter((story) => story.salesCount > 0)
      .sort((a, b) => b.salesCount - a.salesCount) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-6 px-2 py-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-foreground pl-2">NFT Gallery</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {bestSellers.length > 0 ? (
          bestSellers.map((story) => (
            <Card key={story.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="truncate">{story.title}</CardTitle>
                  {story.royaltyPercentage != null && story.royaltyPercentage > 0 && (
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      {story.royaltyPercentage}% Royalty
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative w-full h-48 mb-4">
                  <Image
                    src={story.imageUrl}
                    alt={story.title}
                    fill
                    className="object-cover rounded-md"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    loading="lazy"
                  />
                </div>
                <p className="line-clamp-3">{story.content}</p>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  By {story.author}
                </span>
                <span className="text-sm font-medium">
                  Price: {story.price} ETH
                </span>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center text-muted-foreground">
            No best-selling NFTs available at the moment.
          </div>
        )}
      </div>
    </div>
  );
}
