'use client';

import { useEffect, useState } from 'react';
import BookView from '@/components/book-view';
import { ArrowLeft, BookOpen, Eye, Heart, Loader2, Tag } from 'lucide-react';
import Link from 'next/link';

interface Chapter {
  index: number;
  title: string;
  content: string;
}

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

    return () => {
      cancelled = true;
    };
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
          <h2 className="text-3xl font-bold">Signal Lost</h2>
          <p className="text-white/40">Story not found.</p>
          <Link
            href="/marketplace"
            className="inline-block mt-4 px-6 py-3 border border-white/20 rounded-full text-sm hover:bg-white/5 transition-colors"
          >
            ← Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const chapters = parseChapters(story);
  const ttsSettings = story.parameters || {};

  return (
    <div className="min-h-screen bg-[#080b11] text-white">
      {/* Hero cover image */}
      {story.cover_image && (
        <div className="relative h-64 md:h-80 w-full overflow-hidden">
          <img
            src={story.cover_image}
            alt={story.title}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#080b11]/60 to-[#080b11]" />
        </div>
      )}

      <div className="container mx-auto px-4 md:px-8 max-w-5xl pb-24">
        {/* Back nav */}
        <nav className="py-6">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>
        </nav>

        {/* Story header */}
        <header className={`mb-10 ${story.cover_image ? '-mt-20 relative z-10' : ''}`}>
          {story.genre && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-500/40 text-emerald-400 bg-emerald-500/10 mb-4">
              <Tag className="w-3 h-3" />
              {story.genre}
            </span>
          )}

          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 leading-tight">
            {story.title}
          </h1>

          <div className="flex items-center gap-4 text-white/40 text-sm flex-wrap">
            {story.author_name && <span>By {story.author_name}</span>}
            {story.views != null && (
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> {story.views.toLocaleString()} views
              </span>
            )}
            {story.likes != null && (
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" /> {story.likes.toLocaleString()} likes
              </span>
            )}
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> {chapters.length} chapter{chapters.length !== 1 ? 's' : ''}
            </span>
          </div>

          {story.description && (
            <p className="mt-5 text-lg text-white/50 leading-relaxed max-w-3xl">
              {story.description}
            </p>
          )}
        </header>

        {/* ── BOOK VIEW with TTS audio controls ──────────────────────────── */}
        <BookView
          storyId={story.id}
          title={story.title}
          author={story.author_name}
          chapters={chapters}
          defaultSpeaker={ttsSettings.defaultSpeaker || 'Shubh'}
          defaultLanguage={ttsSettings.defaultLanguage || 'en-IN'}
          defaultPace={ttsSettings.defaultPace || 1}
        />
      </div>
    </div>
  );
}
