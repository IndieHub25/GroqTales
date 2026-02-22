'use client';

import { motion } from 'framer-motion';
import {
  TrendingUp,
  BookOpen,
  PenSquare,
} from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import StoryCard from '@/components/story-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface TrendingStory {
  id: string;
  title: string;
  author: {
    name: string;
    avatar: string;
  };
  genre: string;
  likes: number;
  comments: number;
  views: number;
  coverImage: string;
}

export function TrendingStories() {
  const [stories, setStories] = useState<TrendingStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrendingStories = async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/feed?limit=6&page=1', { signal });
      if (res.ok) {
        const json = await res.json();
        const feedData = json.data || json.stories || json;

        if (Array.isArray(feedData) && feedData.length > 0) {
          const mapped: TrendingStory[] = feedData.slice(0, 6).map((story: any, i: number) => ({
            id: story._id || story.id || `story-${i + 1}`,
            title: story.title || 'Untitled Story',
            author: {
              name: story.author?.name || story.authorName || 'Anonymous',
              avatar: story.author?.avatar || story.authorAvatar || `https://api.dicebear.com/7.x/personas/svg?seed=author${i + 1}`,
            },
            genre: story.genre || 'General',
            likes: story.likes ?? story.likesCount ?? 0,
            comments: story.comments ?? story.commentsCount ?? 0,
            views: story.views ?? story.viewsCount ?? 0,
            coverImage: story.coverImage || story.image || `https://picsum.photos/seed/${story._id || i}/800/600`,
          }));
          setStories(mapped);
        } else {
          setStories([]);
        }
      } else {
        setError(`Server error: ${res.status} ${res.statusText}`);
        setStories([]);
      }
    } catch (err) {
      // Ignore abort errors (component unmounted)
      if (err instanceof DOMException && err.name === 'AbortError') return;
      console.error('Failed to fetch trending stories:', err);
      setError(err instanceof Error ? err.message : 'Unable to load stories');
      setStories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchTrendingStories(controller.signal);
    return () => controller.abort();
  }, []);

  const handleCreateSimilar = (genre: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = `/create/ai-story?source=trending&genre=${encodeURIComponent(genre)}&format=nft`;
    }
  };

  if (error) {
    return (
      <section className="py-8">
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-xl font-black uppercase text-foreground mb-2">
            Something Went Wrong
          </h3>
          <p className="text-muted-foreground font-bold mb-6">
            {error}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={() => fetchTrendingStories()}
              className="bg-foreground text-background border-4 border-foreground shadow-[4px_4px_0px_0px_var(--shadow-color)] font-black uppercase rounded-none"
            >
              Retry
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-4 border-foreground shadow-[4px_4px_0px_0px_var(--shadow-color)] font-black uppercase rounded-none"
            >
              <Link href="/create/ai-story">
                <PenSquare className="mr-2 h-4 w-4" />
                Create a Story
              </Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-4">
      <div className="container">

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-[320px] animate-pulse border-4 border-foreground/20">
                <div className="h-40 bg-muted" />
                <CardContent className="p-4">
                  <div className="h-4 w-2/3 bg-muted rounded mb-2" />
                  <div className="h-4 w-1/2 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-black uppercase text-foreground mb-2">
              No Stories Yet
            </h3>
            <p className="text-muted-foreground font-bold mb-6">
              Be the first to create a story on GroqTales!
            </p>
            <Button asChild className="bg-[var(--comic-red)] text-white border-4 border-foreground shadow-[4px_4px_0px_0px_var(--shadow-color)] font-black uppercase rounded-none">
              <Link href="/create/ai-story">
                <PenSquare className="mr-2 h-4 w-4" />
                Create Your First Story
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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