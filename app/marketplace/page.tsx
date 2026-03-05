'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  Heart,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

export default function MarketplacePage() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchMarketplaceItems() {
      // Fetch all stories for the marketplace, ideally those intended for sale or minting
      const { data, error } = await supabase
        .from('stories')
        .select(`
          id,
          title,
          content,
          genre,
          author_id,
          author_name,
          views,
          likes,
          is_minted,
          file_url,
          format_type,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setStories(data);
      }
      setLoading(false);
    }
    fetchMarketplaceItems();
  }, [supabase]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <PageHeader
          title="Marketplace"
          description="Discover, Read, and Trade Digital Stories"
          icon="shopping-cart"
        />
        <Link href="/upload">
          <Button
            className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload Story
          </Button>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 mb-12"
      >
        <div className="bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-950/40 dark:to-indigo-950/40 rounded-xl p-8 border border-purple-200 dark:border-purple-800 shadow-sm transition-all h-full flex flex-col">
          <div className="h-12 w-12 bg-purple-500/20 dark:bg-purple-500/10 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="h-6 w-6 text-purple-700 dark:text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Comic Stories</h2>
          <p className="text-muted-foreground mb-6 flex-grow">
            Explore visual storytelling through comic NFTs with stunning
            artwork and engaging narratives.
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-950/40 dark:to-yellow-950/40 rounded-xl p-8 border border-amber-200 dark:border-amber-800 shadow-sm transition-all h-full flex flex-col">
          <div className="h-12 w-12 bg-amber-500/20 dark:bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-6 w-6 text-amber-700 dark:text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Text Stories</h2>
          <p className="text-muted-foreground mb-6 flex-grow">
            Discover written treasures from talented authors across genres in
            our text-based collection.
          </p>
        </div>
      </motion.div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-8">Latest Community Additions</h2>
        
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center p-12 border border-dashed border-white/20 rounded-xl">
            <p className="text-muted-foreground">No stories found in the marketplace yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {stories.map((story) => (
              <Card
                key={story.id}
                className="overflow-hidden hover:shadow-md transition-shadow border-white/5 bg-white/5"
              >
                <div className="relative h-48 bg-[#0f172a] flex flex-col items-center justify-center">
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full z-10 border border-white/10">
                    {story.is_minted ? 'Minted NFT' : 'Available'}
                  </div>
                  {story.file_url ? (
                    <Image
                      src={story.file_url}
                      alt={story.title}
                      fill
                      className="object-cover opacity-80"
                    />
                  ) : (
                    <div className="text-primary/30">
                      {story.format_type === 'Storybook' ? (
                        <BookOpen className="w-12 h-12" />
                      ) : (
                        <FileText className="w-12 h-12" />
                      )}
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/70 to-transparent text-white">
                    <h3 className="font-bold text-lg line-clamp-1">
                      {story.title}
                    </h3>
                    <p className="text-xs text-white/70">by {story.author_name || 'Anonymous'}</p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center text-xs text-muted-foreground gap-4 mb-3">
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" /> {story.likes}
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> {story.views}
                    </div>
                    {story.format_type && (
                      <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-sm">
                        {story.format_type}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-foreground/80 line-clamp-2 mt-2">
                    {story.content || 'A captivating story waits inside...'}
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => {
                        window.location.href = `/story/${story.id}`;
                    }}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
