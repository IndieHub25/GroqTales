'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Plus,
  Save,
  RotateCcw,
  Sparkles,
  Upload,
  X,
  Image as ImageIcon,
  User,
  Users,
  Layers,
  Grid3X3,
  Film,
  Maximize2,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Loader2,
  RefreshCw,
  Check,
  Palette,
  Type,
  Settings2,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { generateComicFromSketches } from '@/lib/api-client';

// ─────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────

interface CharacterSketch {
  id: string;
  name: string;
  description: string;
  file: File | null;
  previewUrl: string | null;
}

interface GeneratedPanel {
  panelIndex: number;
  pageNumber: number;
  panelNumber: number;
  imageUrl: string | null;
  caption: string;
  dialogue: string;
  characters: string[];
  cameraDirection: string;
  beat: string;
}

interface GenerationResult {
  comicId: string;
  slug: string;
  title: string;
  panels: GeneratedPanel[];
  totalPages: number;
  panelsPerPage: number;
  stylePreset: string;
  summary: string;
}

type GenerationPhase =
  | 'idle'
  | 'analyzing'
  | 'composing'
  | 'rendering'
  | 'finalizing'
  | 'complete'
  | 'error';

// ─────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────

const ART_STYLES = [
  { value: 'manga', label: 'Manga', icon: '🇯🇵' },
  { value: 'western', label: 'Western Comic', icon: '🦸' },
  { value: 'minimalist', label: 'Minimalist', icon: '◻️' },
  { value: 'noir', label: 'Noir', icon: '🌑' },
  { value: 'watercolor', label: 'Watercolor', icon: '🎨' },
  { value: 'pixel-art', label: 'Pixel Art', icon: '👾' },
];

const LAYOUT_STYLES = [
  { value: 'grid', label: 'Classic Grid', icon: Grid3X3, desc: 'Uniform panel grid' },
  { value: 'cinematic', label: 'Cinematic', icon: Film, desc: 'Wide panoramic panels' },
  { value: 'hero-shots', label: 'Hero Shots', icon: Maximize2, desc: 'Full-page hero moments' },
];

const GENRES = [
  'Fantasy', 'Sci-Fi', 'Comedy', 'Drama', 'Horror',
  'Romance', 'Adventure', 'Mystery', 'Action', 'Slice of Life',
];

const BEAT_SLOTS = ['Intro', 'Conflict', 'Climax', 'Resolution'];

const PHASE_MESSAGES: Record<GenerationPhase, string> = {
  idle: '',
  analyzing: 'Analyzing sketches & building character models…',
  composing: 'Composing panel layouts & story beats…',
  rendering: 'Rendering comic panels with AI…',
  finalizing: 'Finalizing captions & dialogue…',
  complete: 'Comic generated successfully!',
  error: 'Generation failed. Please try again.',
};

// ─────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────

export default function PanelraEnginePage() {
  // ── Character state ──────────────────────────────────────────
  const [hero, setHero] = useState<CharacterSketch>({
    id: 'hero',
    name: '',
    description: '',
    file: null,
    previewUrl: null,
  });

  const [coStars, setCoStars] = useState<CharacterSketch[]>([]);

  // ── Story state ──────────────────────────────────────────────
  const [title, setTitle] = useState('');
  const [logline, setLogline] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [stylePreset, setStylePreset] = useState('manga');

  // ── Layout state ─────────────────────────────────────────────
  const [totalPages, setTotalPages] = useState(4);
  const [panelsPerPage, setPanelsPerPage] = useState(6);
  const [layoutStyle, setLayoutStyle] = useState('grid');
  const [beats, setBeats] = useState<string[]>(['', '', '', '']);

  // ── UI state ─────────────────────────────────────────────────
  const [expandedSections, setExpandedSections] = useState({
    story: true,
    layout: true,
    beats: false,
    characters: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // ── Generation state ─────────────────────────────────────────
  const [phase, setPhase] = useState<GenerationPhase>('idle');
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Refs ──────────────────────────────────────────────────────
  const heroInputRef = useRef<HTMLInputElement>(null);

  // ── Handlers ─────────────────────────────────────────────────

  const handleImageUpload = useCallback(
    (
      file: File,
      setter: (update: (prev: CharacterSketch) => CharacterSketch) => void
    ) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setter((prev) => ({
          ...prev,
          file,
          previewUrl: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const handleHeroFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file, (fn) => setHero(fn(hero)));
  };

  const addCoStar = () => {
    setCoStars((prev) => [
      ...prev,
      {
        id: `costar-${Date.now()}`,
        name: '',
        description: '',
        file: null,
        previewUrl: null,
      },
    ]);
  };

  const removeCoStar = (id: string) => {
    setCoStars((prev) => prev.filter((c) => c.id !== id));
  };

  const updateCoStar = (id: string, field: keyof CharacterSketch, value: any) => {
    setCoStars((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genre)) return prev.filter((g) => g !== genre);
      if (prev.length >= 2) return prev;
      return [...prev, genre];
    });
  };

  const updateBeat = (index: number, value: string) => {
    setBeats((prev) => prev.map((b, i) => (i === index ? value : b)));
  };

  // ── Generate ─────────────────────────────────────────────────

  const handleGenerate = async () => {
    if (!title.trim() || !logline.trim()) {
      setError('Please fill in the comic title and logline.');
      return;
    }

    setError(null);
    setResult(null);

    // Simulate phased progress
    const phases: GenerationPhase[] = ['analyzing', 'composing', 'rendering', 'finalizing'];

    for (const p of phases) {
      setPhase(p);
      await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('logline', logline);
      formData.append('genres', JSON.stringify(selectedGenres));
      formData.append('stylePreset', stylePreset);
      formData.append(
        'layoutConfig',
        JSON.stringify({ pages: totalPages, panelsPerPage, layoutStyle })
      );
      formData.append('beatOutline', JSON.stringify(beats.filter(Boolean)));
      formData.append('heroName', hero.name);
      formData.append('heroDescription', hero.description);

      if (hero.file) {
        formData.append('heroSketch', hero.file);
      }

      const coStarNames = coStars.map((c) => c.name);
      const coStarDescs = coStars.map((c) => c.description);
      formData.append('coStarNames', JSON.stringify(coStarNames));
      formData.append('coStarDescriptions', JSON.stringify(coStarDescs));

      coStars.forEach((c) => {
        if (c.file) formData.append('coStarSketches', c.file);
      });

      const res = await generateComicFromSketches(formData);

      if (res.ok && (res.data as any)?.success) {
        setResult((res.data as any).data);
        setPhase('complete');
      } else {
        throw new Error((res.data as any)?.error || 'Generation failed');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setPhase('error');
    }
  };

  const handleReset = () => {
    setHero({ id: 'hero', name: '', description: '', file: null, previewUrl: null });
    setCoStars([]);
    setTitle('');
    setLogline('');
    setSelectedGenres([]);
    setStylePreset('manga');
    setTotalPages(4);
    setPanelsPerPage(6);
    setLayoutStyle('grid');
    setBeats(['', '', '', '']);
    setPhase('idle');
    setResult(null);
    setError(null);
  };

  const isGenerating = !['idle', 'complete', 'error'].includes(phase);

  // ── Render ───────────────────────────────────────────────────

  return (
    <div className="min-h-screen relative bg-black text-white font-sans overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(59,130,246,0.1),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(168,85,247,0.08),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(249,115,22,0.04),_transparent_60%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        {/* ─── Sticky Top Bar ──────────────────────────────────── */}
        <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/[0.06] px-4 py-3">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/create">
                <button className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm">
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  Forge
                </button>
              </Link>
              <div className="w-px h-6 bg-white/10" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-white">Panelra Engine</h1>
                  <p className="text-xs text-white/40">AI Comic Generation</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {title && (
                <span className="text-xs text-white/30 mr-2 hidden sm:block">
                  {title || 'Untitled Comic'}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-xs border-white/10 text-white/60 hover:text-white bg-white/5"
              >
                <RotateCcw className="w-3 h-3 mr-1.5" />
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* ─── Split-View Studio Layout ────────────────────────────── */}
        <div className="max-w-[1800px] mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* ════════════════════════════════════════════════════
               LEFT SIDEBAR — Configuration Hub (Span 4)
               ════════════════════════════════════════════════════ */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-4 space-y-4 sticky top-[80px] h-[calc(100vh-100px)] overflow-y-auto no-scrollbar pr-2 pb-10"
            >
              {/* Header */}
              <div className="flex items-center gap-2 px-1 mb-2">
                <Settings2 className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-semibold tracking-wider uppercase text-emerald-400/80">Configuration</h2>
              </div>

              {/* Accordion 1: Story Details */}
              <Card className="bg-white/[0.03] border-white/[0.08] backdrop-blur-xl overflow-hidden shadow-lg">
                <button
                  onClick={() => toggleSection('story')}
                  className="w-full flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-2 text-white/90">
                    <Type className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium">Story Basics</span>
                  </div>
                  {expandedSections.story ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronRight className="w-4 h-4 text-white/40" />}
                </button>
                <AnimatePresence>
                  {expandedSections.story && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/[0.06]"
                    >
                      <CardContent className="p-4 space-y-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-white/50">Comic Title</Label>
                          <Input
                            placeholder="My Epic Comic"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="text-sm bg-white/5 border-white/10 placeholder:text-white/20"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-white/50">Logline / Premise</Label>
                          <Textarea
                            placeholder="A brief description of your comic's story…"
                            value={logline}
                            onChange={(e) => setLogline(e.target.value)}
                            className="text-sm bg-white/5 border-white/10 placeholder:text-white/20 resize-none h-20"
                          />
                        </div>

                        {/* Genre Pills */}
                        <div className="space-y-1.5">
                          <Label className="text-xs text-white/50">Genres (up to 2)</Label>
                          <div className="flex flex-wrap gap-1.5">
                            {GENRES.map((g) => (
                              <button
                                key={g}
                                onClick={() => toggleGenre(g)}
                                className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${selectedGenres.includes(g)
                                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                                  : 'bg-white/[0.03] border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
                                  }`}
                              >
                                {g}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Art Style */}
                        <div className="space-y-1.5">
                          <Label className="text-xs text-white/50">Art Style</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {ART_STYLES.map((s) => (
                              <button
                                key={s.value}
                                onClick={() => setStylePreset(s.value)}
                                className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-[11px] transition-all ${stylePreset === s.value
                                  ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
                                  : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:border-white/15'
                                  }`}
                              >
                                <span className="text-base">{s.icon}</span>
                                <span>{s.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>

              {/* Accordion 2: Layout Options */}
              <Card className="bg-white/[0.03] border-white/[0.08] backdrop-blur-xl overflow-hidden shadow-lg">
                <button
                  onClick={() => toggleSection('layout')}
                  className="w-full flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-2 text-white/90">
                    <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-medium">Layout Config</span>
                  </div>
                  {expandedSections.layout ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronRight className="w-4 h-4 text-white/40" />}
                </button>
                <AnimatePresence>
                  {expandedSections.layout && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/[0.06]"
                    >
                      <CardContent className="p-4 space-y-4">
                        {/* Pages / Panels */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs text-white/50">Pages</Label>
                            <Select value={String(totalPages)} onValueChange={(v) => setTotalPages(Number(v))}>
                              <SelectTrigger className="text-sm bg-white/5 border-white/10">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[2, 4, 6, 8, 12].map((n) => (
                                  <SelectItem key={n} value={String(n)}>{n} pages</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-white/50">Panels/Page</Label>
                            <Select value={String(panelsPerPage)} onValueChange={(v) => setPanelsPerPage(Number(v))}>
                              <SelectTrigger className="text-sm bg-white/5 border-white/10">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[3, 4, 6, 8, 9].map((n) => (
                                  <SelectItem key={n} value={String(n)}>{n} panels</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Total estimate */}
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-xs text-emerald-300/80">
                            {totalPages * panelsPerPage} total panels across {totalPages} pages
                          </span>
                        </div>

                        {/* Layout Style */}
                        <div className="space-y-2">
                          <Label className="text-xs text-white/50">Layout Style</Label>
                          <div className="space-y-1.5">
                            {LAYOUT_STYLES.map((l) => {
                              const Icon = l.icon;
                              return (
                                <button
                                  key={l.value}
                                  onClick={() => setLayoutStyle(l.value)}
                                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left ${layoutStyle === l.value
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                                    : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:border-white/15'
                                    }`}
                                >
                                  <Icon className="w-4 h-4 flex-shrink-0" />
                                  <div>
                                    <p className="text-xs font-medium">{l.label}</p>
                                    <p className="text-[10px] opacity-60">{l.desc}</p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>

              {/* Accordion 3: Beat Outline */}
              <Card className="bg-white/[0.03] border-white/[0.08] backdrop-blur-xl overflow-hidden shadow-lg">
                <button
                  onClick={() => toggleSection('beats')}
                  className="w-full flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-2 text-white/90">
                    <Palette className="w-4 h-4 text-pink-400" />
                    <span className="text-sm font-medium">Beat Outline</span>
                    <span className="text-[10px] text-white/30 font-normal lowercase">(optional)</span>
                  </div>
                  {expandedSections.beats ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronRight className="w-4 h-4 text-white/40" />}
                </button>
                <AnimatePresence>
                  {expandedSections.beats && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/[0.06]"
                    >
                      <CardContent className="p-4 space-y-3">
                        {BEAT_SLOTS.map((label, i) => (
                          <div key={label} className="flex items-start flex-col gap-1.5">
                            <div className={`px-2 py-0.5 rounded flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-amber-500/15 text-amber-400' :
                              i === 1 ? 'bg-orange-500/15 text-orange-400' :
                                i === 2 ? 'bg-red-500/15 text-red-400' :
                                  'bg-blue-500/15 text-blue-400'
                              }`}>
                              {i + 1}. {label}
                            </div>
                            <Input
                              placeholder={`Enter beat details…`}
                              value={beats[i]}
                              onChange={(e) => updateBeat(i, e.target.value)}
                              className="text-xs h-8 bg-white/5 border-white/[0.06] placeholder:text-white/15"
                            />
                          </div>
                        ))}
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>

              {/* Accordion 4: Character Sketches (Optional) */}
              <Card className="bg-white/[0.03] border-white/[0.08] backdrop-blur-xl overflow-hidden shadow-lg">
                <button
                  onClick={() => toggleSection('characters')}
                  className="w-full flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-2 text-white/90">
                    <User className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium">Hero & Co-Stars</span>
                    <span className="text-[10px] text-white/30 font-normal lowercase">(optional)</span>
                  </div>
                  {expandedSections.characters ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronRight className="w-4 h-4 text-white/40" />}
                </button>
                <AnimatePresence>
                  {expandedSections.characters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/[0.06]"
                    >
                      <CardContent className="p-4 space-y-5">
                        {/* Hero Section */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-md bg-purple-500/15 flex items-center justify-center">
                              <User className="w-3 h-3 text-purple-400" />
                            </div>
                            <Label className="text-xs font-semibold text-purple-300">Main Hero</Label>
                          </div>

                          <div className="space-y-2">
                            <Input
                              placeholder="Hero name"
                              value={hero.name}
                              onChange={(e) => setHero(prev => ({ ...prev, name: e.target.value }))}
                              className="text-sm bg-white/5 border-white/10 placeholder:text-white/20"
                            />
                            <Textarea
                              placeholder="Brief description of the hero..."
                              value={hero.description}
                              onChange={(e) => setHero(prev => ({ ...prev, description: e.target.value }))}
                              className="text-sm bg-white/5 border-white/10 placeholder:text-white/20 resize-none h-16"
                            />
                          </div>

                          {/* Hero Sketch Upload */}
                          <div className="space-y-1.5">
                            <Label className="text-[11px] text-white/40">Character Sketch</Label>
                            {hero.previewUrl ? (
                              <div className="relative rounded-lg overflow-hidden border border-purple-500/20 bg-purple-500/5">
                                <img src={hero.previewUrl} alt="Hero sketch" className="w-full h-32 object-contain" />
                                <button
                                  onClick={() => setHero(prev => ({ ...prev, file: null, previewUrl: null }))}
                                  className="absolute top-2 right-2 p-1 rounded-md bg-black/60 hover:bg-black/80 transition-colors"
                                >
                                  <X className="w-3 h-3 text-white" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => heroInputRef.current?.click()}
                                className="w-full flex flex-col items-center gap-2 py-6 rounded-lg border-2 border-dashed border-white/10 hover:border-purple-500/30 bg-white/[0.02] hover:bg-purple-500/5 transition-all"
                              >
                                <Upload className="w-5 h-5 text-white/20" />
                                <span className="text-[11px] text-white/30">Upload hero sketch (optional)</span>
                              </button>
                            )}
                            <input
                              ref={heroInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleHeroFileChange}
                              className="hidden"
                            />
                          </div>
                        </div>

                        {/* Separator */}
                        <div className="border-t border-white/[0.06]" />

                        {/* Co-Stars Section */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-md bg-blue-500/15 flex items-center justify-center">
                                <Users className="w-3 h-3 text-blue-400" />
                              </div>
                              <Label className="text-xs font-semibold text-blue-300">Co-Stars</Label>
                              {coStars.length > 0 && (
                                <span className="text-[10px] text-white/30">({coStars.length})</span>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={addCoStar}
                              className="h-7 text-[11px] border-blue-500/20 text-blue-400 bg-blue-500/5 hover:bg-blue-500/10"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add
                            </Button>
                          </div>

                          {coStars.length === 0 && (
                            <p className="text-[11px] text-white/25 text-center py-3">
                              No co-stars added. Click &quot;Add&quot; to include supporting characters.
                            </p>
                          )}

                          {coStars.map((cs) => (
                            <div key={cs.id} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-2">
                              <div className="flex items-center justify-between">
                                <Input
                                  placeholder="Character name"
                                  value={cs.name}
                                  onChange={(e) => updateCoStar(cs.id, 'name', e.target.value)}
                                  className="text-xs h-7 bg-transparent border-0 p-0 text-white/80 placeholder:text-white/20 font-medium focus-visible:ring-0"
                                />
                                <button
                                  onClick={() => removeCoStar(cs.id)}
                                  className="p-1 rounded hover:bg-red-500/10 transition-colors flex-shrink-0"
                                >
                                  <X className="w-3 h-3 text-red-400/60" />
                                </button>
                              </div>
                              <Textarea
                                placeholder="Brief description..."
                                value={cs.description}
                                onChange={(e) => updateCoStar(cs.id, 'description', e.target.value)}
                                className="text-[11px] bg-white/[0.03] border-white/[0.06] placeholder:text-white/15 resize-none h-12"
                              />
                              {/* Co-star sketch upload */}
                              {cs.previewUrl ? (
                                <div className="relative rounded-md overflow-hidden border border-blue-500/20 bg-blue-500/5">
                                  <img src={cs.previewUrl} alt={cs.name} className="w-full h-20 object-contain" />
                                  <button
                                    onClick={() => updateCoStar(cs.id, 'previewUrl', null)}
                                    className="absolute top-1 right-1 p-0.5 rounded bg-black/60 hover:bg-black/80"
                                  >
                                    <X className="w-2.5 h-2.5 text-white" />
                                  </button>
                                </div>
                              ) : (
                                <label className="flex items-center gap-2 py-2 px-3 rounded-md border border-dashed border-white/[0.08] hover:border-blue-500/20 bg-white/[0.01] hover:bg-blue-500/5 cursor-pointer transition-all">
                                  <ImageIcon className="w-3 h-3 text-white/20" />
                                  <span className="text-[10px] text-white/25">Add sketch</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (ev) => {
                                          updateCoStar(cs.id, 'previewUrl', ev.target?.result as string);
                                          updateCoStar(cs.id, 'file', file);
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                  />
                                </label>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>

            </motion.div>

            {/* ════════════════════════════════════════════════════
               MAIN STAGE — Sketches & Generation (Span 8)
               ════════════════════════════════════════════════════ */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-8 space-y-6 pb-20"
            >
              {/* Generate Button */}
              <Card className="bg-white/[0.03] border-white/[0.08] backdrop-blur-xl">
                <CardContent className="py-4">
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !title.trim() || !logline.trim()}
                    className="w-full py-6 text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-blue-500/20 disabled:opacity-40 disabled:shadow-none transition-all"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-5 h-5 mr-2" />
                    )}
                    {isGenerating ? 'Generating…' : 'Generate Comic with Panelra Engine'}
                  </Button>

                  {/* Error display */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs"
                    >
                      {error}
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              {/* Progress States */}
              <AnimatePresence>
                {isGenerating && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Card className="bg-white/[0.03] border-white/[0.08] backdrop-blur-xl overflow-hidden">
                      <CardContent className="py-6">
                        <div className="space-y-4">
                          {/* Progress bar */}
                          <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                              initial={{ width: '0%' }}
                              animate={{
                                width:
                                  phase === 'analyzing' ? '25%' :
                                    phase === 'composing' ? '50%' :
                                      phase === 'rendering' ? '75%' :
                                        phase === 'finalizing' ? '90%' : '100%',
                              }}
                              transition={{ duration: 0.8 }}
                            />
                          </div>

                          {/* Phase steps */}
                          <div className="space-y-2">
                            {(['analyzing', 'composing', 'rendering', 'finalizing'] as GenerationPhase[]).map((p, i) => {
                              const phaseIndex = ['analyzing', 'composing', 'rendering', 'finalizing'].indexOf(phase);
                              const thisIndex = i;
                              const isDone = thisIndex < phaseIndex;
                              const isCurrent = p === phase;

                              return (
                                <div key={p} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isCurrent ? 'bg-blue-500/10 border border-blue-500/20' :
                                  isDone ? 'opacity-50' : 'opacity-20'
                                  }`}>
                                  {isDone ? (
                                    <Check className="w-4 h-4 text-emerald-400" />
                                  ) : isCurrent ? (
                                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                                  ) : (
                                    <div className="w-4 h-4 rounded-full border border-white/20" />
                                  )}
                                  <span className="text-xs text-white/70">
                                    {PHASE_MESSAGES[p]}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Result — Panel Preview Grid */}
              {result && phase === 'complete' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4"
                >
                  {/* Summary */}
                  <Card className="bg-emerald-500/5 border-emerald-500/20 backdrop-blur-xl">
                    <CardContent className="py-3">
                      <div className="flex items-center gap-2 text-emerald-300">
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-medium">{result.summary}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Panel Grid by Page */}
                  {Array.from({ length: result.totalPages }, (_, pageIdx) => {
                    const pagePanels = result.panels.filter((p) => p.pageNumber === pageIdx + 1);
                    return (
                      <Card key={pageIdx} className="bg-white/[0.03] border-white/[0.08] backdrop-blur-xl">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xs flex items-center gap-2 text-white/60">
                            <BookOpen className="w-3.5 h-3.5" />
                            Page {pageIdx + 1}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className={`grid gap-2 ${result.panelsPerPage <= 4 ? 'grid-cols-2' :
                            result.panelsPerPage <= 6 ? 'grid-cols-3' : 'grid-cols-4'
                            }`}>
                            {pagePanels.map((panel) => (
                              <div
                                key={panel.panelIndex}
                                className="group relative rounded-lg border border-white/[0.06] bg-white/[0.02] overflow-hidden hover:border-blue-500/30 transition-all"
                              >
                                {/* Panel image placeholder */}
                                <div className="aspect-[3/4] bg-gradient-to-br from-white/[0.04] to-white/[0.01] flex flex-col items-center justify-center p-2">
                                  <ImageIcon className="w-8 h-8 text-white/10 mb-1" />
                                  <span className="text-[9px] text-white/20 text-center">
                                    {panel.cameraDirection}
                                  </span>
                                </div>

                                {/* Caption */}
                                <div className="p-2 border-t border-white/[0.04]">
                                  <p className="text-[10px] text-white/50 line-clamp-2">{panel.caption}</p>
                                  {panel.characters.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {panel.characters.map((c, ci) => (
                                        <Badge key={ci} variant="outline" className="text-[8px] px-1 py-0 h-4 border-white/10 text-white/30">
                                          {c}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Hover actions */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                                  <button className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors">
                                    <RefreshCw className="w-3 h-3" />
                                  </button>
                                  <button className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors">
                                    <Type className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPhase('idle')}
                      className="flex-1 border-white/10 text-white/60 bg-white/5 hover:text-white"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate
                    </Button>
                    <Button className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white border-0">
                      <Save className="w-4 h-4 mr-2" />
                      Save Comic
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Empty State */}
              {phase === 'idle' && !result && (
                <Card className="bg-white/[0.02] border-white/[0.06] backdrop-blur-xl">
                  <CardContent className="py-12">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-blue-400/50" />
                      </div>
                      <p className="text-sm font-medium text-white/40 mb-1">Your comic will appear here</p>
                      <p className="text-xs text-white/20">
                        Fill in the setup, then hit Generate to create your AI comic
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
