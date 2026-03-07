'use client';

import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Sparkles,
  BookText,
  Zap,
  RotateCcw,
  Copy,
  Check,
  Plus,
  Trash2,
  ArrowLeft,
  Save,
  Download,
  FileText,
  ChevronDown,
  ChevronRight,
  PenSquare,
  Layers,
  Hash,
  AlignLeft,
  GripVertical,
  Settings2,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

import { ParameterPanel } from '@/components/parameter-panel';
import { GuidedTour, AI_STORY_TOUR_STEPS } from '@/components/guided-tour';

// Story Studio components
import { PanelProgressTracker } from './components/panel-progress-tracker';
import { StoryMemoryDisplay } from './components/story-memory-display';

// Services & types
import { PanelLifecycleManager } from '@/lib/services/panel-lifecycle-manager';
import { StoryMemoryManager } from '@/lib/services/story-memory-manager';
import { AIOrchestrationService } from '@/lib/services/ai-orchestration-service';
import { lockGenres } from '@/lib/utils/genre-manager';
import {
  StorySession,
  PanelData,
  PanelParameters,
} from '@/lib/types/story-session';

// ── Types ─────────────────────────────────────────────────────────

type VedaChapter = {
  id: string;
  index: number;
  title: string;
  summary?: string;
  content: string;
  params?: any;
};

interface StoryPrompt {
  title: string;
  mainCharacters: string;
  plotOutline: string;
  setting: string;
  themes: string;
}

const availableGenres = [
  'Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Thriller',
  'Horror', 'Adventure', 'Comedy', 'Drama', 'Historical',
];

// ── Main Component ────────────────────────────────────────────────

export default function AIStoryGeneratorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-black">
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <PenSquare className="w-12 h-12 text-emerald-500" />
          </motion.div>
        </div>
      }
    >
      <AIStoryContent />
    </Suspense>
  );
}

function AIStoryContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // ── Services (stable refs) ──────────────────────────────────────
  const lifecycleRef = useRef(new PanelLifecycleManager());
  const memoryMgrRef = useRef(new StoryMemoryManager());
  const orchestratorRef = useRef(
    new AIOrchestrationService(memoryMgrRef.current)
  );

  // ── Story Session State ──────────────────────────────────────────
  const [session, setSession] = useState<StorySession>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('storyStudioSession');
        if (saved) return JSON.parse(saved) as StorySession;
      } catch { /* start fresh */ }
    }
    return createEmptySession();
  });

  // ── UI State ────────────────────────────────────────────────────
  const [chapters, setChapters] = useState<VedaChapter[]>([
    { id: 'chap-1', index: 1, title: 'Chapter 1', content: '' }
  ]);
  const [activeChapterId, setActiveChapterId] = useState<string>('chap-1');

  const [storyPrompt, setStoryPrompt] = useState<StoryPrompt>({
    title: session.title || '',
    mainCharacters: '',
    plotOutline: '',
    setting: '',
    themes: '',
  });
  
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Fantasy']);
  const [storyDescription, setStoryDescription] = useState('');
  
  const [selectedParameters, setSelectedParameters] = useState<Set<string>>(new Set());
  const [parameterValues, setParameterValues] = useState<Record<string, unknown>>({});
  const [isParamsExpanded, setIsParamsExpanded] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [editorTab, setEditorTab] = useState<'chapter' | 'compiled'>('chapter');
  
  // Initialize with URL param
  useEffect(() => {
    const genreParam = searchParams.get('genre');
    if (genreParam) {
      const formatted = genreParam.charAt(0).toUpperCase() + genreParam.slice(1);
      if (availableGenres.includes(formatted)) {
        setSelectedGenres([formatted]);
      }
    }
  }, [searchParams]);

  // ── Load import from Shakti Spark ───────────────────────────────
  useEffect(() => {
    try {
      const imported = localStorage.getItem('vedascript_import');
      if (imported) {
        const data = JSON.parse(imported);
        if (data.content) {
          setChapters(prev => prev.map(c => c.id === activeChapterId ? { ...c, content: data.content } : c));
        }
        if (data.genre) setSelectedGenres([data.genre]);
        if (data.prompt) setStoryPrompt(prev => ({ ...prev, plotOutline: data.prompt }));
        localStorage.removeItem('vedascript_import');
      }
    } catch { /* ignore */ }
  }, []);

  // ── Derived State ───────────────────────────────────────────────
  const activeChapter = chapters.find(c => c.id === activeChapterId) || chapters[0];
  const completedCount = lifecycleRef.current.getCompletePanelCount(session.panels);
  
  // Calculate total words across all chapters
  const totalWordCount = chapters.reduce((acc, c) => acc + c.content.split(/\s+/).filter(Boolean).length, 0);

  const compiledStory = chapters
    .sort((a, b) => a.index - b.index)
    .map((c) => `## ${c.title}\n\n${c.content}`)
    .join('\n\n---\n\n');

  // ── Handlers ────────────────────────────────────────────────────

  // Chapter Management
  const handleAddChapter = () => {
    const newIndex = chapters.length + 1;
    const newChapter: VedaChapter = {
      id: `chap-${Date.now()}`,
      index: newIndex,
      title: `Chapter ${newIndex}`,
      content: ''
    };
    setChapters([...chapters, newChapter]);
    setActiveChapterId(newChapter.id);
    toast({ title: 'Chapter added', description: `Chapter ${newIndex} created` });
  };

  const handleDuplicateChapter = (chapterId: string) => {
    const chapter = chapters.find(c => c.id === chapterId);
    if (!chapter) return;
    
    const newChapter: VedaChapter = {
      ...chapter,
      id: `chap-${Date.now()}`,
      index: chapters.length + 1,
      title: `${chapter.title} (Copy)`,
    };
    setChapters([...chapters, newChapter]);
    toast({ title: 'Chapter duplicated' });
  };

  const handleDeleteChapter = (chapterId: string) => {
    if (chapters.length <= 1) return;
    
    const newChapters = chapters.filter(c => c.id !== chapterId)
      .map((c, i) => ({ ...c, index: i + 1 })); // Re-index
      
    setChapters(newChapters);
    if (activeChapterId === chapterId) {
      setActiveChapterId(newChapters[0].id);
    }
    toast({ title: 'Chapter removed' });
  };

  const handleChapterReorder = (newOrder: VedaChapter[]) => {
    const reindexed = newOrder.map((c, i) => ({ ...c, index: i + 1 }));
    setChapters(reindexed);
  };

  const updateActiveChapter = (updates: Partial<VedaChapter>) => {
    setChapters(prev => prev.map(c => c.id === activeChapterId ? { ...c, ...updates } : c));
  };

  // Genres
  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(prev => prev.filter(g => g !== genre));
    } else {
      if (selectedGenres.length >= 2) {
        toast({ title: 'Limit reached', description: 'You can choose up to 2 genres.', variant: 'destructive' });
        return;
      }
      setSelectedGenres(prev => [...prev, genre]);
    }
  };

  // Parameters
  const handleParameterChange = useCallback((id: string, value: unknown) => {
    setParameterValues((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleParameterToggle = useCallback((id: string, enabled: boolean) => {
    setSelectedParameters((prev) => {
      const next = new Set(prev);
      enabled ? next.add(id) : next.delete(id);
      return next;
    });
  }, []);

  // Generation
  const handleGeneratePanel = useCallback(async () => {
    const panelIdx = activeChapter.index;

    // Lock genres on Panel 1 completion
    if (panelIdx === 1 && !session.genresLocked && selectedGenres.length > 0) {
      const locked = lockGenres(selectedGenres);
      setSession((prev) => ({ ...prev, genres: [...locked], genresLocked: true }));
    }

    setIsGenerating(true);
    setGenerationError(null);

    const panelParams = parameterValues as PanelParameters;

    try {
      // Use existing service logic but adapt to new state
      const result = await orchestratorRef.current.generatePanel(
        panelIdx,
        panelParams,
        session.storyMemory,
        selectedGenres,
        session.panels
      );

      // Update chapter content
      updateActiveChapter({ content: result.content });
      setEditorTab('chapter');

      // Update session/memory tracking (legacy support for services)
      const newPanel: PanelData = {
        panelIndex: panelIdx,
        title: activeChapter.title,
        parameters: panelParams,
        generatedContent: result.content,
        wordCount: result.wordCount,
        status: 'complete',
        metadata: {
          createdAt: new Date(),
          generatedAt: new Date(),
          tokensUsed: result.tokensUsed,
        },
      };

      const updatedMemory = orchestratorRef.current.updateStoryMemory(
        newPanel,
        session.storyMemory
      );

      setSession((prev) => ({
        ...prev,
        panels: [...prev.panels, newPanel],
        storyMemory: updatedMemory,
        metadata: {
          ...prev.metadata,
          updatedAt: new Date(),
          totalWordCount: prev.metadata.totalWordCount + result.wordCount,
        },
      }));

      toast({
        title: `Chapter Generated!`,
        description: `${result.wordCount} words generated successfully.`,
      });
    } catch (error) {
      const errMsg = (error as Error).message || 'Generation failed';
      setGenerationError(errMsg);
      toast({ title: 'Generation Failed', description: errMsg, variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  }, [activeChapter, session, selectedGenres, parameterValues, toast]);

  const handleCopyStory = async () => {
    try {
      await navigator.clipboard.writeText(compiledStory || activeChapter.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: 'Copied!', description: 'Story copied to clipboard' });
    } catch {
      toast({ title: 'Copy failed', variant: 'destructive' });
    }
  };

  const handleSaveDraft = () => {
    try {
      localStorage.setItem(
        'aiStoryDraft',
        JSON.stringify({
          prompt: storyPrompt,
          chapters,
          selectedParameters: Array.from(selectedParameters),
          parameterValues,
          savedAt: new Date().toISOString(),
        })
      );
      toast({ title: 'Draft saved', description: 'Your work has been saved locally.' });
    } catch {
      toast({ title: 'Save failed', variant: 'destructive' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-black text-white font-sans"
    >
      <GuidedTour steps={AI_STORY_TOUR_STEPS} tourId="ai-story-creation" enabled={true} autoStart={true} />

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(16,185,129,0.06),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(59,130,246,0.05),_transparent_50%)]" />
      </div>

      <div className="relative z-10">
        {/* ═══ TOP BAR ═══ */}
        <div className="border-b border-white/[0.06] bg-black/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="max-w-[1800px] mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <PenSquare className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white tracking-tight">VedaScript Engine</h1>
                  <p className="text-xs text-white/40">Deep narrative control for AI-native stories.</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2" data-tour="save-export">
              <Button size="sm" variant="outline" onClick={handleSaveDraft} className="bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10 rounded-lg">
                <Save className="w-4 h-4 mr-1.5" />
                Save Draft
              </Button>
              <Button size="sm" variant="outline" onClick={handleCopyStory} className="bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10 rounded-lg">
                <Download className="w-4 h-4 mr-1.5" />
                Export
              </Button>
              <Link href="/create">
                <button className="group flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Forge
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* ═══ MAIN LAYOUT ═══ */}
        <div className="max-w-[1800px] mx-auto px-4 py-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

            {/* ── LEFT: Story Structure & Details ── */}
            <div className="lg:col-span-4 space-y-5 sticky top-[72px] h-[calc(100vh-100px)] overflow-y-auto no-scrollbar pointer-events-auto pb-8 pr-2" data-tour="canvas">
              {/* Story Structure */}
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl overflow-hidden shrink-0">
                <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    <span className="font-semibold text-sm text-white/90">Story Structure</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleAddChapter} className="h-6 w-6 hover:bg-white/10">
                    <Plus className="w-4 h-4 text-emerald-400" />
                  </Button>
                </div>
                
                <div className="p-3 space-y-2 max-h-[60vh] overflow-y-auto">
                  <Reorder.Group axis="y" values={chapters} onReorder={handleChapterReorder}>
                    {chapters.map((chapter) => (
                      <Reorder.Item key={chapter.id} value={chapter}>
                        <div 
                          onClick={() => setActiveChapterId(chapter.id)}
                          className={`
                            group relative p-3 rounded-xl border transition-all cursor-pointer select-none
                            ${activeChapterId === chapter.id 
                              ? 'bg-white/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                              : 'bg-white/5 border-white/5 hover:bg-white/[0.07] hover:border-white/10'}
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <GripVertical className="w-4 h-4 text-white/20 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-emerald-400/80 uppercase tracking-wider">
                                  Chapter {chapter.index}
                                </span>
                                {chapters.length > 1 && (
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={(e) => { e.stopPropagation(); handleDuplicateChapter(chapter.id); }} className="p-1 hover:text-white text-white/40">
                                      <Copy className="w-3 h-3" />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteChapter(chapter.id); }} className="p-1 hover:text-red-400 text-white/40">
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                              <input 
                                value={chapter.title}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setChapters(prev => prev.map(c => c.id === chapter.id ? { ...c, title: val } : c));
                                }}
                                className="bg-transparent border-none p-0 text-sm font-semibold text-white/90 w-full focus:ring-0 placeholder:text-white/20"
                                placeholder="Chapter Title"
                                onClick={(e) => e.stopPropagation()} 
                              />
                            </div>
                          </div>
                        </div>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                </div>
              </div>

              {/* Story Details */}
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl overflow-hidden shrink-0" data-tour="story-details">
                <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-sm text-white/90">Story Details</span>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <Label className="text-xs font-semibold text-white/60 mb-1.5 block">Title</Label>
                    <Input
                      placeholder="Your story title..."
                      value={storyPrompt.title}
                      onChange={(e) => setStoryPrompt({ ...storyPrompt, title: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/25 rounded-lg"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <Label className="text-xs font-semibold text-white/60 block">Genres</Label>
                      <span className="text-[10px] text-white/40">{selectedGenres.length}/2 selected</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {availableGenres.map((g) => {
                        const isSelected = selectedGenres.includes(g);
                        return (
                          <button
                            key={g}
                            onClick={() => toggleGenre(g)}
                            className={`
                              px-3 py-1 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5
                              ${isSelected
                                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                                : 'bg-white/5 border-white/10 text-white/50 hover:text-white/80 hover:bg-white/10'}
                            `}
                          >
                            {g}
                            {isSelected && <X className="w-3 h-3 opacity-50" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-white/60 mb-1.5 block">Description</Label>
                    <Textarea
                      placeholder="A brief overview of your story..."
                      value={storyDescription}
                      onChange={(e) => setStoryDescription(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/25 rounded-lg resize-none h-16 text-sm"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* ── RIGHT: Story Content Editor ── */}
            <div className="lg:col-span-8 space-y-4 sticky top-[72px]" data-tour="editor">
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl overflow-hidden">
                {/* Editor Header */}
                <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditorTab('chapter')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        editorTab === 'chapter'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'text-white/50 hover:text-white/80'
                      }`}
                    >
                      Current Chapter
                    </button>
                    <button
                      onClick={() => setEditorTab('compiled')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        editorTab === 'compiled'
                          ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                          : 'text-white/50 hover:text-white/80'
                      }`}
                    >
                      Compiled Story
                    </button>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/30">
                    <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{totalWordCount} words</span>
                  </div>
                </div>

                {/* Editor Body */}
                <div className="min-h-[500px]">
                  {editorTab === 'chapter' ? (
                    <div className="p-5 h-full flex flex-col">
                      <div className="mb-2 flex items-center justify-between text-xs text-white/40">
                         <span>Editing: {activeChapter.title}</span>
                         <span>{activeChapter.content.split(/\s+/).filter(Boolean).length} words</span>
                      </div>
                      <Textarea
                        placeholder={`Write ${activeChapter.title} here...`}
                        value={activeChapter.content}
                        onChange={(e) => updateActiveChapter({ content: e.target.value })}
                        className="flex-1 w-full min-h-[400px] bg-transparent border-0 text-white/90 placeholder:text-white/20 resize-none focus:ring-0 focus-visible:ring-0 text-sm leading-relaxed p-0 font-serif"
                      />
                    </div>
                  ) : (
                    <div className="p-5">
                      {compiledStory.trim() ? (
                        <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-white/80 leading-relaxed font-serif">
                          {compiledStory}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-[400px] text-white/30">
                          <AlignLeft className="w-10 h-10 mb-3 opacity-20" />
                          <p className="text-sm">No content generated yet.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Editor Footer */}
                <div className="px-5 py-4 border-t border-white/[0.06] space-y-3">
                  <AnimatePresence>
                    {generationError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                      >
                        {generationError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleGeneratePanel}
                    disabled={isGenerating}
                    data-tour="generate-btn"
                    className={`
                      w-full py-3 rounded-xl font-bold text-sm
                      bg-gradient-to-r from-emerald-600 to-emerald-700
                      hover:from-emerald-500 hover:to-emerald-600
                      text-white shadow-lg shadow-emerald-500/15
                      border border-emerald-400/15
                      flex items-center justify-center gap-2
                      transition-all duration-300
                      disabled:opacity-40 disabled:cursor-not-allowed
                    `}
                  >
                    {isGenerating ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                          <Zap className="w-4 h-4" />
                        </motion.div>
                        Generating with VedaScript…
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate with VedaScript
                      </>
                    )}
                  </motion.button>

                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyStory}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 border border-white/10 text-white/50 text-sm hover:text-white/80 hover:bg-white/10 transition-all"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                    <button
                      onClick={() => updateActiveChapter({ content: '' })}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/5 border border-red-500/10 text-red-400/60 text-sm hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ── BOTTOM: Advanced VedaScript Parameters ── */}
          <div className="mt-5" data-tour="parameters">
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl overflow-hidden">
              {/* Summary Bar */}
              <div className="px-6 py-5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Settings2 className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white/90">Advanced VedaScript Parameters <span className="text-white/30 font-normal text-sm ml-2">(Optional)</span></h3>
                    <p className="text-sm text-white/40">{selectedParameters.size} active parameters modifying the AI behavior</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setIsParamsExpanded(!isParamsExpanded)}
                  className="bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10"
                >
                  {isParamsExpanded ? 'Hide Parameters' : 'Configure Parameters'}
                  {isParamsExpanded ? <ChevronDown className="w-4 h-4 ml-2" /> : <ChevronRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>

              {/* Collapsible Panel */}
              <AnimatePresence>
                {isParamsExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/[0.06]"
                  >
                    <div className="p-6">
                      <ParameterPanel
                        onParameterChange={handleParameterChange}
                        onParameterToggle={handleParameterToggle}
                        selectedParameters={Array.from(selectedParameters)}
                        defaultPreset="standard"
                        compact={false}
                        showStats={true}
                      />
                    </div>
                    <div className="px-6 py-4 border-t border-white/[0.06] flex justify-end gap-3 bg-black/40 backdrop-blur-md">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setSelectedParameters(new Set());
                          setParameterValues({});
                        }}
                        className="text-white/50 hover:text-white hover:bg-white/10"
                      >
                        Reset to Defaults
                      </Button>
                      <Button
                        onClick={() => setIsParamsExpanded(false)}
                        className="bg-purple-600 hover:bg-purple-500 text-white border-0"
                      >
                        Apply Settings
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function createEmptySession(): StorySession {
  return {
    sessionId: typeof crypto !== 'undefined' ? crypto.randomUUID() : `s-${Date.now()}`,
    title: '',
    panels: [],
    genres: [],
    genresLocked: false,
    storyMemory: {
      characters: [],
      worldBuilding: { setting: '', timePeriod: '', rules: [], locations: [], cultures: [] },
      majorEvents: [],
      unresolvedQuestions: [],
      establishedFacts: [],
      themes: [],
      tone: '',
    },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      totalWordCount: 0,
      estimatedReadingTime: 0,
    },
    status: 'draft',
  };
}
