'use client';

import { useEffect, useState } from 'react';
import BookView from '@/components/book-view';
import StoryEngagement from '@/components/story-engagement';
import { ArrowLeft, BookOpen, Eye, Heart, Loader2, Tag } from 'lucide-react';
import Link from 'next/link';

interface Chapter { index: number; title: string; content: string; }

interface Story {
  id: string;
  title: string;
  genre?: string;
  author_name?: string;
  description?: string;
  cover_image?: string;
  views?: number;
  likes?: number;
  content?: string;
  parameters?: { defaultSpeaker?: string; defaultLanguage?: string; defaultPace?: number };
}

function parseChapters(story: Story): Chapter[] {
  if (!story.content) return [{ index: 0, title: story.title, content: story.description || '' }];
  if (typeof story.content === 'string') {
    try {
      const parsed = JSON.parse(story.content);
      if (Array.isArray(parsed)) {
        return parsed.map((ch: any, i: number) => ({
          index: ch.index ?? i,
          title: ch.title || `Chapter ${i + 1}`,
          content: ch.content || '',
        }));
      }
    } catch {}
    return [{ index: 0, title: story.title, content: story.content }];
  }
  return [{ index: 0, title: story.title, content: story.description || '' }];
}

export default function StoryClient({ id }: { id: string }) {
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchStory() {
      setNotFound(false);
      setLoading(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://groqtales-backend-api.onrender.com';
        const res = await fetch(`${baseUrl}/api/v1/stories/${id}`);
        if (!res.ok) throw new Error('Story not found');
        const data = await res.json();
        if (cancelled) return;
        setStory(data);
      } catch {
        if (cancelled) return;
        setNotFound(true);
      }
      setLoading(false);
    }
    fetchStory();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080b11] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (notFound || !story) {
    return (
      <div className="min-h-screen bg-[#080b11] flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold" style={{ textTransform: 'none' }}>Story Not Found</h2>
          <p className="text-white/40" style={{ fontWeight: 400 }}>This story may have been removed or doesn't exist.</p>
          <Link href="/gallery"
            className="inline-block mt-4 px-6 py-3 border border-white/20 rounded-full text-sm hover:bg-white/5 transition-colors"
            style={{ fontWeight: 500 }}>
            ← Back to Gallery
          </Link>
        </div>
      </div>
    );
  }

  const chapters = parseChapters(story);
  const ttsSettings = story.parameters || {};

  return (
    <div className="min-h-screen bg-[#080b11] text-white">

      {/* ── Compact Header Bar ───────────────────────────────── */}
      <div className="sticky top-0 z-50 bg-[#080b11]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="container mx-auto max-w-6xl px-4 md:px-8">
          <div className="flex items-center gap-4 h-14">
            <Link href="/gallery"
              className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors shrink-0"
              style={{ fontWeight: 500 }}>
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Gallery</span>
            </Link>

            <div className="h-5 w-px bg-white/10" />

            <div className="flex items-center gap-3 min-w-0 flex-1">
              {story.genre && (
                <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 shrink-0"
                  style={{ fontWeight: 700 }}>
                  {story.genre}
                </span>
              )}
              <span className="text-sm text-white/60 truncate" style={{ fontWeight: 500, textTransform: 'none' }}>
                {story.title}
              </span>
            </div>

            <div className="flex items-center gap-3 text-white/30 text-xs shrink-0" style={{ fontWeight: 400 }}>
              {story.views != null && (
                <span className="hidden md:flex items-center gap-1">
                  <Eye className="w-3 h-3" /> {story.views.toLocaleString()}
                </span>
              )}
              {story.likes != null && (
                <span className="hidden md:flex items-center gap-1">
                  <Heart className="w-3 h-3" /> {story.likes.toLocaleString()}
                </span>
              )}
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> {chapters.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Story Title Section ──────────────────────────────── */}
      <section className="container mx-auto max-w-4xl px-4 md:px-8 pt-10 pb-6 text-center">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3"
          style={{ fontFamily: "'Georgia', serif", textTransform: 'none', lineHeight: 1.2 }}>
          {story.title}
        </h1>
        {story.author_name && (
          <p className="text-base text-white/40 mb-2" style={{ fontWeight: 400, textTransform: 'none' }}>
            by {story.author_name}
          </p>
        )}
        {story.description && (
          <p className="text-sm text-white/30 leading-relaxed max-w-2xl mx-auto mt-4"
            style={{ fontWeight: 400, textTransform: 'none' }}>
            {story.description}
          </p>
        )}
      </section>

      {/* ── Interactive Book ──────────────────────────────────── */}
      <section className="container mx-auto max-w-6xl px-4 md:px-16 pb-10">
        <BookView
          storyId={story.id}
          title={story.title}
          author={story.author_name}
          chapters={chapters}
          defaultSpeaker={ttsSettings.defaultSpeaker || 'Shubh'}
          defaultLanguage={ttsSettings.defaultLanguage || 'en-IN'}
          defaultPace={ttsSettings.defaultPace || 1}
        />
      </section>

      {/* ── Engagement Section ───────────────────────────────── */}
      <section className="border-t border-white/[0.06] bg-[#060912]">
        <div className="container mx-auto max-w-4xl px-4 md:px-8 py-10">
          <StoryEngagement storyId={story.id} />
        </div>
      </section>
    </div>
  );
}
