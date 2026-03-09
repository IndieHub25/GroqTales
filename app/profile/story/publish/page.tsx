'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, BookOpen, Tags, ImageIcon, X, Plus, ArrowLeft,
  Send, Loader2, CheckCircle2, AlertCircle, Upload, User, Wand2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useCallback, useRef, useMemo, Suspense } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { NftMintModal } from '@/components/nft-mint-modal';

// ── Types ──────────────────────────────────────────────────────────

interface VedaChapter {
  id: string;
  index: number;
  title: string;
  content: string;
  chapterPrompt?: string;
}

interface StoryData {
  title: string;
  genres: string[];
  chapters: VedaChapter[];
  parameters: Record<string, unknown>;
  selectedParameters: string[];
  storyPrompt: {
    title: string;
    mainCharacters: string;
    plotOutline: string;
    setting: string;
    themes: string;
  };
  isLocked: boolean;
}

// ── Tag Suggestion Helper ──────────────────────────────────────────

function suggestTags(data: StoryData): string[] {
  const raw = new Set<string>();

  // From genres
  data.genres.forEach(g => {
    raw.add(g.toLowerCase().replace(/\s+/g, '-'));
  });

  // From themes
  if (data.storyPrompt?.themes) {
    data.storyPrompt.themes
      .split(/[,;]+/)
      .map(t => t.trim().toLowerCase().replace(/\s+/g, '-'))
      .filter(Boolean)
      .forEach(t => raw.add(t));
  }

  // From setting
  if (data.storyPrompt?.setting) {
    data.storyPrompt.setting
      .split(/[,;]+/)
      .map(s => s.trim().toLowerCase().replace(/\s+/g, '-'))
      .filter(s => s.length > 2 && s.length < 30)
      .forEach(s => raw.add(s));
  }

  // From plot keywords
  if (data.storyPrompt?.plotOutline) {
    const plotKw = data.storyPrompt.plotOutline
      .toLowerCase()
      .replace(/[^a-z\s-]/g, '')
      .split(/\s+/)
      .filter(w => w.length >= 4 && w.length <= 18);
    // pick top 4 most recognizable
    const seed = new Set(['adventure', 'mystery', 'magic', 'quest', 'ancient', 'ritual', 'portal',
      'village', 'dragon', 'prophecy', 'friendship', 'darkness', 'kingdom', 'mythical', 'solstice',
      'coming-of-age', 'chosen', 'forbidden', 'enchanted', 'warrior', 'sorcery', 'legend',
      'creature', 'forest', 'temple', 'artifact', 'battle', 'oath', 'guardian', 'spirit']);
    plotKw.filter(w => seed.has(w)).slice(0, 4).forEach(w => raw.add(w));
  }

  // From character keywords
  if (data.storyPrompt?.mainCharacters) {
    const chars = data.storyPrompt.mainCharacters
      .toLowerCase()
      .split(/[,;]+/)
      .map(c => c.trim().split(/\s+/).pop() || '')
      .filter(c => c.length >= 3);
    chars.slice(0, 2).forEach(c => raw.add(c));
  }

  // Clean and cap at 12
  return Array.from(raw)
    .map(t => t.replace(/[^a-z0-9-]/g, ''))
    .filter(t => t.length >= 2 && t.length <= 30)
    .slice(0, 12);
}

// ── Main Page ──────────────────────────────────────────────────────

export default function PublishStoryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-black">
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <Send className="w-12 h-12 text-blue-500" />
          </motion.div>
        </div>
      }
    >
      <PublishStoryContent />
    </Suspense>
  );
}

function PublishStoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const draftKey = searchParams.get('draftKey') || '';

  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Publish form state
  const [editableTitle, setEditableTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [publishedStoryId, setPublishedStoryId] = useState<string | null>(null);
  const [publishedCoverUrl, setPublishedCoverUrl] = useState<string | null>(null);
  const [publisherName, setPublisherName] = useState('');
  const [showMintModal, setShowMintModal] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // ── Fetch Publisher Name ─────────────────────────────────────────

  useEffect(() => {
    async function fetchProfile() {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token) return;
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://groqtales-backend-api.onrender.com';
        const res = await fetch(`${baseUrl}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        const name = [data.firstName, data.lastName].filter(Boolean).join(' ');
        setPublisherName(name || data.username || 'Creator');
      } catch {}
    }

    fetchProfile();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken' && e.newValue) {
        fetchProfile();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ── Load Story Data ──────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      setLoading(true);
      setLoadError(null);

      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

      // Try cloud draft first
      if (draftKey && token) {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://groqtales-backend-api.onrender.com';
          const res = await fetch(`${baseUrl}/api/v1/drafts?draftKey=${encodeURIComponent(draftKey)}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const json = await res.json();
            const draft = json.draft;
            if (draft?.current?.content) {
              try {
                const parsed: StoryData = JSON.parse(draft.current.content);
                const sd: StoryData = {
                  title: draft.current.title || parsed.storyPrompt?.title || 'Untitled Story',
                  genres: parsed.genres || [],
                  chapters: parsed.chapters || [],
                  parameters: parsed.parameters || {},
                  selectedParameters: parsed.selectedParameters || [],
                  storyPrompt: parsed.storyPrompt || { title: '', mainCharacters: '', plotOutline: '', setting: '', themes: '' },
                  isLocked: parsed.isLocked || false,
                };
                setStoryData(sd);
                setEditableTitle(sd.title);
                setSuggestedTags(suggestTags(sd));
                setLoading(false);
                return;
              } catch { /* fall through to local */ }
            }
          }
        } catch { /* fall through */ }
      }

      // Fall back to localStorage
      try {
        const saved = localStorage.getItem('aiStoryDraft');
        if (saved) {
          const draft = JSON.parse(saved);
          const sd: StoryData = {
            title: draft.prompt?.title || 'Untitled Story',
            genres: draft.selectedGenres || [],
            chapters: draft.chapters || [],
            parameters: draft.parameterValues || {},
            selectedParameters: draft.selectedParameters || [],
            storyPrompt: draft.prompt || { title: '', mainCharacters: '', plotOutline: '', setting: '', themes: '' },
            isLocked: draft.isLocked || false,
          };
          setStoryData(sd);
          setEditableTitle(sd.title);
          setSuggestedTags(suggestTags(sd));
        } else {
          setLoadError('No story draft found. Go back to the VedaScript Engine and generate some content first.');
        }
      } catch {
        setLoadError('Failed to load story data.');
      }
      setLoading(false);
    }
    load();
  }, [draftKey]);

  // ── Tag Handling ─────────────────────────────────────────────────

  const addTag = useCallback((tagToAdd?: string) => {
    const t = (tagToAdd || tagInput).trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (!t || tags.includes(t) || tags.length >= 12) return;
    setTags(prev => [...prev, t]);
    if (!tagToAdd) setTagInput('');
    // remove from suggestions
    setSuggestedTags(prev => prev.filter(s => s !== t));
  }, [tagInput, tags]);

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
    // put back in suggestions if appropriate
    if (storyData) {
      const original = suggestTags(storyData);
      if (original.includes(tag)) {
        setSuggestedTags(prev => [...prev, tag].slice(0, 12));
      }
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(prev => prev.slice(0, -1));
    }
  };

  // ── Cover Image ──────────────────────────────────────────────────

  const handleCoverFile = (file: File) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast({ title: 'Invalid file type', description: 'Please upload a PNG, JPG, or WEBP image.', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max cover image size is 5MB.', variant: 'destructive' });
      return;
    }
    setCoverImage(file);
    setErrors(prev => { const n = { ...prev }; delete n.cover; return n; });
    const reader = new FileReader();
    reader.onload = (e) => setCoverPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleCoverFile(file);
  };

  // ── Publish ──────────────────────────────────────────────────────

  const handlePublish = async () => {
    if (!storyData) return;

    const newErrors: Record<string, string> = {};

    if (!editableTitle.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!coverImage) {
      newErrors.cover = 'Cover image is required before publishing your story.';
    }
    const hasContent = storyData.chapters.some(c => c.content.trim());
    if (!hasContent) {
      newErrors.content = 'At least one chapter must have content.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({ title: 'Validation failed', description: Object.values(newErrors)[0], variant: 'destructive' });
      return;
    }

    setErrors({});

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      toast({ title: 'Not logged in', description: 'Please log in to publish your story.', variant: 'destructive' });
      router.push('/sign-in');
      return;
    }

    setIsPublishing(true);
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://groqtales-backend-api.onrender.com';

    try {
      let coverImageUrl: string | null = null;

      // Upload cover image (mandatory now)
      if (coverImage) {
        const formData = new FormData();
        formData.append('coverImage', coverImage);
        const uploadRes = await fetch(`${baseUrl}/api/v1/stories/upload-cover`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadJson = await uploadRes.json();
          coverImageUrl = uploadJson.url || null;
        } else {
          const uploadErr = await uploadRes.json().catch(() => ({}));
          throw new Error(uploadErr.error || 'Cover image upload failed. Please try again.');
        }
        if (!coverImageUrl) {
          throw new Error('Cover image upload succeeded but no URL was returned. Please try again.');
        }
      }

      // Update storyData title for consistency
      const finalTitle = editableTitle.trim() || storyData.title;

      const compiledContent = storyData.chapters
        .sort((a, b) => a.index - b.index)
        .map(c => `## ${c.title}\n\n${c.content}`)
        .join('\n\n---\n\n');

      const res = await fetch(`${baseUrl}/api/v1/stories/publish-vedascript`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          draftKey,
          title: finalTitle,
          genres: storyData.genres,
          chapters: storyData.chapters,
          parameters: storyData.parameters,
          selectedParameters: storyData.selectedParameters,
          tags,
          coverImageUrl,
          compiledContent,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const sid = json.id || json.data?.id || null;
        setPublishedStoryId(sid);
        setPublishedCoverUrl(coverImageUrl);
        setPublishSuccess(true);
        if (typeof window !== 'undefined') localStorage.removeItem('draftKey');
        toast({ title: '🎉 Story Published!', description: 'Your story is now live on Comicraft.' });
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.message || 'Publish failed');
      }
    } catch (error) {
      const msg = (error as Error).message;
      console.error('Publish error:', error);
      toast({ title: 'Publish failed', description: msg, variant: 'destructive' });
    } finally {
      setIsPublishing(false);
    }
  };

  // ── Compiled Text Preview ────────────────────────────────────────

  const compiledStory = storyData?.chapters
    .sort((a, b) => a.index - b.index)
    .filter(c => c.content.trim())
    .map((c, i) => ({ ...c, displayIndex: i + 1 })) || [];

  const totalWords = compiledStory.reduce(
    (acc, c) => acc + c.content.split(/\s+/).filter(Boolean).length, 0
  );

  // ── Loading / Error ──────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 mx-auto rounded-full border-2 border-blue-500/30 border-t-blue-500"
          />
          <p className="text-white/40 text-sm">Loading your story…</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="text-center max-w-md space-y-5">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Couldn't Load Story</h2>
          <p className="text-white/50 text-sm">{loadError}</p>
          <Link href="/create/ai-story">
            <button className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors">
              Back to VedaScript Engine
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Success State — now has NFT Mint Prompt ──────────────────────

  if (publishSuccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md space-y-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
            className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 flex items-center justify-center"
          >
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Story Published!</h1>
            <p className="text-white/50">Your story is now live on Comicraft.</p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setShowMintModal(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" /> Mint as NFT
            </button>
            <button
              onClick={() => router.push('/profile/me')}
              className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 font-medium transition-all"
            >
              View Profile
            </button>
            {publishedStoryId && (
              <button
                onClick={() => router.push(`/stories/${publishedStoryId}`)}
                className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 font-medium transition-all"
              >
                View Story
              </button>
            )}
          </div>
        </motion.div>

        {/* NFT Mint Modal */}
        <NftMintModal
          isOpen={showMintModal}
          onClose={() => setShowMintModal(false)}
          storyId={publishedStoryId || ''}
          storyTitle={editableTitle}
          storyDescription={storyData?.storyPrompt?.plotOutline}
          coverImageUrl={publishedCoverUrl}
          tags={tags}
          genres={storyData?.genres || []}
        />
      </div>
    );
  }

  // ── Main Publish UI ──────────────────────────────────────────────

  // Filtered suggestions: only show those not already in tags
  const availableSuggestions = suggestedTags.filter(s => !tags.includes(s));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-black text-white font-sans"
    >
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(59,130,246,0.07),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(16,185,129,0.04),_transparent_50%)]" />
      </div>

      <div className="relative z-10">
        {/* ═══ TOP BAR ═══ */}
        <div className="border-b border-white/[0.06] bg-black/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href={`/create/ai-story${draftKey ? `?restore=1` : ''}`}>
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Editing
                </button>
              </Link>
              <div className="h-4 w-px bg-white/10" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Send className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-white tracking-tight">Publish Story</h1>
                  <p className="text-[10px] text-white/30">Finalize and share with the world</p>
                </div>
              </div>
            </div>

            {/* Meta info */}
            <div className="flex items-center gap-4 text-xs text-white/30">
              {storyData?.genres.map(g => (
                <span key={g} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50">{g}</span>
              ))}
              <span>{totalWords.toLocaleString()} words</span>
            </div>
          </div>
        </div>

        {/* ═══ MAIN LAYOUT ═══ */}
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* ── LEFT: Story Preview ── */}
            <div className="lg:col-span-7 xl:col-span-8">
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-semibold text-white/80">Story Preview</span>
                  </div>
                  {/* Editable Title */}
                  <input
                    value={editableTitle}
                    onChange={(e) => {
                      setEditableTitle(e.target.value);
                      setErrors(prev => { const n = { ...prev }; delete n.title; return n; });
                    }}
                    className={`w-full text-2xl font-bold text-white tracking-tight bg-transparent border-b-2 pb-1 focus:outline-none transition-colors ${
                      errors.title ? 'border-red-500/60' : 'border-transparent hover:border-white/10 focus:border-blue-500/40'
                    }`}
                    placeholder="Enter your story title…"
                  />
                  {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}

                  {storyData && storyData.genres.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {storyData.genres.map(g => (
                        <span key={g} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 border border-blue-500/20 text-blue-300">
                          {g}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Compiled story content */}
                <div className="p-6 max-h-[calc(100vh-280px)] overflow-y-auto">
                  {compiledStory.length > 0 ? (
                    <div className="prose prose-invert max-w-none">
                      {compiledStory.map((chapter, idx) => (
                        <div key={chapter.id} className="mb-10">
                          {idx > 0 && <hr className="border-white/10 my-8" />}
                          <h3 className="text-base font-bold text-white/90 mb-4 font-sans flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold">
                              {chapter.displayIndex}
                            </span>
                            {chapter.title}
                          </h3>
                          <div className="whitespace-pre-wrap text-white/70 leading-[1.85] text-sm font-serif">
                            {chapter.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-white/30">
                      <BookOpen className="w-10 h-10 mb-3 opacity-20" />
                      <p className="text-sm">No content yet. Go back and generate chapters.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── RIGHT: Metadata & Publish ── */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-4">

              {/* Cover Image — MANDATORY */}
              <div className={`rounded-2xl bg-white/[0.03] border backdrop-blur-xl overflow-hidden ${errors.cover ? 'border-red-500/40' : 'border-white/[0.08]'}`}>
                <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-semibold text-white/80">Cover Image</span>
                  <span className="text-[10px] text-red-400/80 ml-auto font-semibold">Required · Max 5MB</span>
                </div>

                <div className="p-4">
                  {coverPreview ? (
                    <div className="relative rounded-xl overflow-hidden">
                      <img src={coverPreview} alt="Cover preview" className="w-full h-48 object-cover" />
                      <button
                        onClick={() => { setCoverImage(null); setCoverPreview(null); }}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white/70 hover:text-white hover:bg-black/80 transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`
                        h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer
                        transition-all duration-200
                        ${isDragging
                          ? 'border-purple-500/50 bg-purple-500/5'
                          : errors.cover
                            ? 'border-red-500/40 bg-red-500/5'
                            : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'}
                      `}
                    >
                      <Upload className="w-8 h-8 text-white/20" />
                      <p className="text-xs text-white/40 text-center">
                        Drag & drop or <span className="text-purple-400">browse</span><br />
                        PNG, JPG, WEBP
                      </p>
                    </div>
                  )}
                  {errors.cover && <p className="text-xs text-red-400 mt-2">{errors.cover}</p>}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverFile(f); }}
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
                  <Tags className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-semibold text-white/80">Tags</span>
                  <span className="text-[10px] text-white/30 ml-auto">{tags.length}/12</span>
                </div>

                <div className="p-4 space-y-3">
                  {/* Suggested tags */}
                  {availableSuggestions.length > 0 && tags.length < 12 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Wand2 className="w-3 h-3 text-indigo-400" />
                        <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Suggested</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {availableSuggestions.map(tag => (
                          <button
                            key={tag}
                            onClick={() => addTag(tag)}
                            className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200 transition-all"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tag chips */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <AnimatePresence>
                        {tags.map(tag => (
                          <motion.span
                            key={tag}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 border border-amber-500/20 text-amber-300"
                          >
                            #{tag}
                            <button onClick={() => removeTag(tag)} className="text-amber-400/60 hover:text-amber-300 transition-colors">
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </motion.span>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Tag input */}
                  <div className="flex gap-2">
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      placeholder="Add a tag…"
                      disabled={tags.length >= 12}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-amber-500/40 focus:bg-white/[0.07] transition-all"
                    />
                    <button
                      onClick={() => addTag()}
                      disabled={!tagInput.trim() || tags.length >= 12}
                      className="px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[10px] text-white/25">Press Enter or comma to add a tag</p>
                </div>
              </div>

              {/* Publish info summary */}
              <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] px-5 py-4 space-y-2.5">
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Ready to publish?</h3>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Title</span>
                    <span className={`font-medium truncate ml-4 max-w-[200px] ${editableTitle.trim() ? 'text-white/80' : 'text-red-400'}`}>
                      {editableTitle.trim() || 'Missing'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Chapters</span>
                    <span className="text-white/80 font-medium">{compiledStory.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Words</span>
                    <span className="text-white/80 font-medium">{totalWords.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Tags</span>
                    <span className="text-white/80 font-medium">{tags.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Cover image</span>
                    <span className={`font-medium ${coverImage ? 'text-emerald-400' : 'text-red-400'}`}>
                      {coverImage ? 'Added' : 'Required'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 flex items-center gap-1"><User className="w-3 h-3" /> Author</span>
                    <span className="text-white/80 font-medium truncate ml-4 max-w-[180px]">
                      {publisherName || 'Loading…'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Publish Button */}
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePublish}
                disabled={isPublishing || compiledStory.length === 0}
                className="
                  w-full py-4 rounded-2xl font-bold text-base
                  bg-gradient-to-r from-blue-600 to-blue-700
                  hover:from-blue-500 hover:to-blue-600
                  text-white
                  shadow-[0_4px_24px_rgba(59,130,246,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]
                  hover:shadow-[0_6px_32px_rgba(59,130,246,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]
                  border border-blue-400/25
                  flex items-center justify-center gap-2.5
                  transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Publishing…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Publish Story
                  </>
                )}
              </motion.button>

              <p className="text-center text-[11px] text-white/25">
                Your story will be visible to others on Comicraft.
              </p>
            </div>

          </div>
        </div>
      </div>
    </motion.div>
  );
}
