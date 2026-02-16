'use client';

import { motion } from 'framer-motion';
import {
  ThumbsUp,
  MessageSquare,
  Eye,
  TrendingUp,
  BookOpen,
  PenSquare,
} from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import StoryCard from '@/components/story-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

// Generate mock trending stories for the homepage
const getMockTrendingStories = () => {
  const genres = ['Science Fiction', 'Fantasy', 'Mystery', 'Romance', 'Horror'];
  const titles = [
    'The Last Memory Collector',
    'Whispers of the Ancient Forest',
    'Neon Dreams in the Digital Age',
    "The Time Traveler's Daughter",
    'Echoes of Tomorrow',
    'The Silent Symphony',
  ];

  return Array.from({ length: 6 }, (_, i) => ({
    id: `story-${i + 1}`,
    title: titles[i],
    author: {
      name: [
        'Emily Johnson',
        'Michael Chen',
        'Sarah Williams',
        'David Rodriguez',
        'Olivia Taylor',
        'James Wilson',
      ][i],
      avatar: `https://api.dicebear.com/7.x/personas/svg?seed=person${i + 1}`,
    },
    genre: genres[Math.floor(Math.random() * genres.length)],
    likes: Math.floor(Math.random() * 500) + 100,
    comments: Math.floor(Math.random() * 50) + 10,
    views: Math.floor(Math.random() * 5000) + 1000,
    coverImage: `https://picsum.photos/seed/${i + 1}/800/600`,
  }));
};

export function TrendingStories() {
  const [stories, setStories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading stories from an API
    setIsLoading(true);
    setTimeout(() => {
      setStories(getMockTrendingStories());
      setIsLoading(false);
    }, 500);
  }, []);

  const handleCreateSimilar = (genre: string) => {
    // Direct navigation with URL parameters
    if (typeof window !== 'undefined') {
      window.location.href = `/create/ai-story?source=trending&genre=${encodeURIComponent(
        genre
      )}&format=nft`;
    }
  };

  return (
    <section className="py-12">
      <div className="container">
        <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold gradient-heading flex items-center">
              <TrendingUp className="mr-2 h-6 w-6" />
              Trending Stories
            </h2>
            <p className="text-muted-foreground mt-2">
              Discover the most popular stories on GroqTales
            </p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:gap-4">
            <Link href="/stories">
              <Button variant="outline" className="w-full md:w-auto">
                <BookOpen className="mr-2 h-4 w-4" />
                View All
              </Button>
            </Link>
            <Button
              onClick={() => handleCreateSimilar('fantasy')}
              className="w-full md:w-auto theme-gradient-bg text-black dark:text-white"
            >
              <PenSquare className="mr-2 h-4 w-4" />
              Create Story
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-[320px] animate-pulse">
                <div className="h-40 bg-muted rounded-t-lg" />
                <CardContent className="p-4">
                  <div className="h-4 w-2/3 bg-muted rounded mb-2" />
                  <div className="h-4 w-1/2 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{
                  y: -5,
                  transition: { duration: 0.2 },
                }}
                className="h-full"
              >
                <StoryCard story={story} showCreateButton={true} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
