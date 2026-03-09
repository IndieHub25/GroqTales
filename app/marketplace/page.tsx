'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, BookOpen, FileText, Upload, Loader2, Heart, Headphones, Play, Pause, Eye,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://groqtales-backend-api.onrender.com';

interface StoryWithAudio {
  id: string;
  title: string;
  content?: string;
  genre?: string;
  author_name?: string;
  views?: number;
  likes?: number;
  is_minted?: boolean;
  file_url?: string;
  format_type?: string;
  cover_image?: string;
  created_at?: string;
  hasAudio?: boolean;
  audioUrl?: string | null;
}

// ── Mini audio preview player embedded in marketplace cards ──────────────────
function MiniAudioPreview({ story }: { story: StoryWithAudio }) {
  const [audioUrl, setAudioUrl] = useState<string | null>(story.audioUrl || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleToggle = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!audioUrl) {
      // Don't auto-generate — just navigate to story
      return;
    }

    const audio = audioRef.current || new Audio(audioUrl);
    audioRef.current = audio;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.onended = () => setIsPlaying(false);
      await audio.play();
      setIsPlaying(true);
    }
  }, [audioUrl, isPlaying]);

  return (
    <button
      onClick={handleToggle}
      title={audioUrl ? (isPlaying ? 'Pause audio' : 'Play audio excerpt') : 'Open story to generate audio'}
      className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${
        audioUrl
          ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400'
          : 'bg-white/5 border border-white/10 text-white/30 cursor-default'
      }`}
    >
      {isLoading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : isPlaying ? (
        <Pause className="w-3 h-3" />
      ) : (
        <Headphones className="w-3 h-3" />
      )}
    </button>
  );
}

export default function MarketplacePage() {
  const [stories, setStories] = useState<StoryWithAudio[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchMarketplaceItems() {
      // Fetch stories
      const { data, error } = await supabase
        .from('stories')
        .select('id, title, content, genre, author_name, views, likes, is_minted, file_url, format_type, cover_image, created_at')
        .order('created_at', { ascending: false });

      if (!error && data) {
        // Fetch audio availability for all stories in one query
        const storyIds = data.map(s => s.id);
        let audioMap: Record<string, string> = {};

        if (storyIds.length > 0) {
          const { data: audioRows } = await supabase
            .from('story_audio')
            .select('story_id, audio_url')
            .in('story_id', storyIds)
            .eq('chapter_index', 0);

          if (audioRows) {
            audioRows.forEach((r: any) => { audioMap[r.story_id] = r.audio_url; });
          }
        }

        setStories(
          data.map(s => ({
            ...s,
            hasAudio: !!audioMap[s.id],
            audioUrl: audioMap[s.id] || null,
          }))
        );
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
          <Button className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Story
          </Button>
        </Link>
      </div>

      {/* Category cards */}
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
            Explore visual storytelling through comic NFTs with stunning artwork and engaging narratives.
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-950/40 dark:to-yellow-950/40 rounded-xl p-8 border border-amber-200 dark:border-amber-800 shadow-sm transition-all h-full flex flex-col">
          <div className="h-12 w-12 bg-amber-500/20 dark:bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-6 w-6 text-amber-700 dark:text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Text Stories</h2>
          <p className="text-muted-foreground mb-6 flex-grow">
            Discover written treasures from talented authors across genres in our text-based collection.
          </p>
        </div>
      </motion.div>

      {/* Story cards */}
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
            {stories.map((story, idx) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
              >
                <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-white/5 bg-white/[0.03] hover:bg-white/[0.06] hover:-translate-y-1">
                  {/* Cover image area */}
                  <div className="relative h-48 bg-[#0f172a] flex flex-col items-center justify-center overflow-hidden">
                    {/* Minted badge */}
                    <div className="absolute top-2 left-2 z-10">
                      {story.is_minted && (
                        <span className="bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full border border-white/10">
                          NFT
                        </span>
                      )}
                    </div>

                    {/* Audio badge */}
                    <div className="absolute top-2 right-2 z-10">
                      {story.hasAudio && (
                        <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30">
                          <Headphones className="w-2.5 h-2.5" /> Audio
                        </span>
                      )}
                    </div>

                    {story.cover_image || story.file_url ? (
                      <Image
                        src={story.cover_image || story.file_url || ''}
                        alt={story.title}
                        fill
                        className="object-cover opacity-70 group-hover:opacity-90 transition-opacity"
                      />
                    ) : (
                      <div className="text-primary/20 group-hover:text-primary/30 transition-colors">
                        {story.format_type === 'Storybook' ? (
                          <BookOpen className="w-12 h-12" />
                        ) : (
                          <FileText className="w-12 h-12" />
                        )}
                      </div>
                    )}

                    {/* Title overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-white">
                      <h3 className="font-bold text-base line-clamp-1">{story.title}</h3>
                      <p className="text-xs text-white/60">by {story.author_name || 'Anonymous'}</p>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-center text-xs text-muted-foreground gap-3 mb-3">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" /> {story.likes ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {story.views ?? 0}
                      </span>
                      {story.genre && (
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-sm text-[10px] font-medium ml-auto">
                          {story.genre}
                        </span>
                      )}
                    </div>

                    {/* Inline mini audio player (lazy — only when card is hovered or has audio) */}
                    {story.hasAudio && (
                      <div className="flex items-center gap-2 mt-2">
                        <MiniAudioPreview story={story} />
                        <span className="text-[11px] text-white/40">Audio narration available</span>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="p-4 pt-0">
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground group-hover:bg-emerald-600 transition-colors"
                      onClick={() => { window.location.href = `/stories/${story.id}`; }}
                    >
                      Read & Listen <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
