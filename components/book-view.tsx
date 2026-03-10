'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Mic2, Languages, Zap, Volume2,
  Loader2, RefreshCw, Headphones, BookOpen, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useTTS, BULBUL_SPEAKERS, BULBUL_LANGUAGES, SPEEDS } from '@/hooks/use-tts';
import { createClient } from '@/lib/supabase/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Chapter { index: number; title: string; content: string; }

interface BookViewProps {
  storyId: string;
  title: string;
  author?: string;
  chapters: Chapter[];
  defaultSpeaker?: string;
  defaultLanguage?: string;
  defaultPace?: number;
  compact?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatTime(s: number): string {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

/** Split chapter text into pages of ~1200 chars each (paragraph-aware) */
function paginateContent(text: string, maxChars = 1200): string[] {
  if (!text) return [''];
  const paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
  const pages: string[] = [];
  let current = '';

  for (const para of paragraphs) {
    if (current.length + para.length + 2 > maxChars && current.length > 0) {
      pages.push(current.trim());
      current = para;
    } else {
      current += (current ? '\n\n' : '') + para;
    }
  }
  if (current.trim()) pages.push(current.trim());
  return pages.length > 0 ? pages : [''];
}

// ---------------------------------------------------------------------------
// Waveform Bars
// ---------------------------------------------------------------------------
function WaveformBars({ isPlaying }: { isPlaying: boolean }) {
  return (
    <span className="flex items-end gap-[2px] h-4 w-6">
      {[3, 5, 4, 6, 3].map((h, i) => (
        <span
          key={i}
          className={`w-[3px] rounded-full bg-emerald-400 transition-all ${isPlaying ? 'animate-bounce' : ''}`}
          style={{ height: `${h}px`, animationDelay: `${i * 80}ms`, animationDuration: '600ms' }}
        />
      ))}
    </span>
  );
}

// ---------------------------------------------------------------------------
// TTS Audio Bar (kept intact for the audio controls)
// ---------------------------------------------------------------------------
function TTSAudioBar({
  storyId, chapterIndex, chapterText, compact = false,
}: {
  storyId: string; chapterIndex: number; chapterText: string; compact?: boolean;
}) {
  const supabase = createClient();
  const [token, setToken] = useState<string | undefined>();
  const [showSpeaker, setShowSpeaker] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [showSpeed, setShowSpeed] = useState(false);

  const {
    audioUrl, isPlaying, isGenerating, isLoading, currentTime, duration,
    speaker, languageCode, pace, error,
    play, pause, seek, setSpeed, setSpeaker, setLanguage, generateAudio,
  } = useTTS(storyId, chapterIndex);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setToken(data.session?.access_token);
    });
  }, [supabase.auth]);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) pause(); else if (audioUrl) play();
  }, [isPlaying, audioUrl, play, pause]);

  const handleGenerate = useCallback(() => {
    generateAudio(chapterText, token);
  }, [generateAudio, chapterText, token]);

  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-lg p-2 border border-white/10">
        {audioUrl ? (
          <button onClick={handlePlayPause}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-400 transition-colors"
            title={isPlaying ? 'Pause' : 'Play'} aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <Pause className="w-3 h-3 text-black" /> : <Play className="w-3 h-3 text-black" />}
          </button>
        ) : (
          <button onClick={handleGenerate} disabled={isGenerating}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            title="Generate preview audio" aria-label="Generate preview audio">
            {isGenerating ? <Loader2 className="w-3 h-3 animate-spin text-white" /> : <Headphones className="w-3 h-3 text-white" />}
          </button>
        )}
        {isPlaying && <WaveformBars isPlaying={isPlaying} />}
        <span className="text-xs text-white/50 ml-auto">{audioUrl ? formatTime(currentTime) : 'Tap to preview'}</span>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl">
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/30 via-transparent to-purple-950/20" />
      </div>

      <div className="relative p-4 space-y-3">
        {/* Voice controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <WaveformBars isPlaying={isPlaying} />
          <span className="text-sm font-semibold text-white/80 flex-1 min-w-0 truncate">
            {isGenerating ? 'Generating narration…' : isLoading ? 'Loading audio…' : audioUrl ? 'Narration Ready' : 'AI Narration'}
          </span>

          {/* Speaker */}
          <div className="relative">
            <button onClick={() => { setShowSpeaker(v => !v); setShowLang(false); setShowSpeed(false); }}
              className="flex items-center gap-1 text-xs text-white/60 hover:text-white px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/10">
              <Mic2 className="w-3 h-3" /> {speaker}
            </button>
            {showSpeaker && (
              <div className="absolute right-0 bottom-full mb-1 z-50 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl w-44 max-h-60 overflow-y-auto p-1">
                {BULBUL_SPEAKERS.map(s => (
                  <button key={s} onClick={() => { setSpeaker(s); setShowSpeaker(false); }}
                    className={`w-full text-left text-xs px-3 py-1.5 rounded-lg hover:bg-white/10 ${s === speaker ? 'text-emerald-400 font-semibold' : 'text-white/70'}`}>{s}</button>
                ))}
              </div>
            )}
          </div>

          {/* Language */}
          <div className="relative">
            <button onClick={() => { setShowLang(v => !v); setShowSpeaker(false); setShowSpeed(false); }}
              className="flex items-center gap-1 text-xs text-white/60 hover:text-white px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/10">
              <Languages className="w-3 h-3" /> {languageCode}
            </button>
            {showLang && (
              <div className="absolute right-0 bottom-full mb-1 z-50 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl w-44 overflow-y-auto p-1">
                {BULBUL_LANGUAGES.map(l => (
                  <button key={l.code} onClick={() => { setLanguage(l.code); setShowLang(false); }}
                    className={`w-full text-left text-xs px-3 py-1.5 rounded-lg hover:bg-white/10 ${l.code === languageCode ? 'text-emerald-400 font-semibold' : 'text-white/70'}`}>
                    {l.label} <span className="text-white/30">({l.code})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Speed */}
          <div className="relative">
            <button onClick={() => { setShowSpeed(v => !v); setShowSpeaker(false); setShowLang(false); }}
              className="flex items-center gap-1 text-xs text-white/60 hover:text-white px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/10">
              <Zap className="w-3 h-3" /> {pace}x
            </button>
            {showSpeed && (
              <div className="absolute right-0 bottom-full mb-1 z-50 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl w-28 p-1">
                {SPEEDS.map(sp => (
                  <button key={sp} onClick={() => { setSpeed(sp); setShowSpeed(false); }}
                    className={`w-full text-left text-xs px-3 py-1.5 rounded-lg hover:bg-white/10 ${sp === pace ? 'text-emerald-400 font-semibold' : 'text-white/70'}`}>{sp}x</button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Seek bar */}
        {audioUrl && (
          <div className="flex items-center gap-2">
            <button onClick={() => seek(0)} className="text-white/40 hover:text-white transition-colors"><SkipBack className="w-3 h-3" /></button>
            <input type="range" min={0} max={duration || 100} value={currentTime} onChange={e => seek(Number(e.target.value))}
              className="flex-1 h-1 rounded-full appearance-none cursor-pointer accent-emerald-400" aria-label="Seek" />
            <span className="text-xs text-white/40 tabular-nums w-20 text-right">{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>
        )}

        {/* Play/Generate */}
        <div className="flex items-center gap-3">
          {audioUrl ? (
            <button onClick={handlePlayPause} disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-900 text-black font-semibold text-sm transition-all">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
          ) : (
            <button onClick={handleGenerate} disabled={isGenerating || isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 disabled:opacity-50 text-white font-semibold text-sm transition-all border border-white/20">
              {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : <><Volume2 className="w-4 h-4 text-emerald-400" /> Generate Audio</>}
            </button>
          )}
          {audioUrl && (
            <button onClick={handleGenerate} disabled={isGenerating} title="Regenerate" className="text-white/30 hover:text-white/70 transition-colors">
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            </button>
          )}
          {error && <span className="text-xs text-red-400 ml-auto">{error}</span>}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BookView – Interactive Book with Page Flipping
// ---------------------------------------------------------------------------
export default function BookView({
  storyId, title, author, chapters,
  defaultSpeaker = 'Shubh', defaultLanguage = 'en-IN', defaultPace = 1,
  compact = false, className = '',
}: BookViewProps) {
  const [activeChapter, setActiveChapter] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'left' | 'right'>('right');
  const bookRef = useRef<HTMLDivElement>(null);

  const currentChapter = chapters[activeChapter] || chapters[0];
  const pages = useMemo(
    () => paginateContent(currentChapter?.content || '', 1200),
    [currentChapter?.content]
  );

  // Reset page when chapter changes
  useEffect(() => { setCurrentPage(0); }, [activeChapter]);

  if (compact) {
    return <TTSAudioBar storyId={storyId} chapterIndex={0} chapterText={chapters[0]?.content?.slice(0, 500) || ''} compact />;
  }

  const totalPages = pages.length;
  const hasNext = currentPage < totalPages - 1 || activeChapter < chapters.length - 1;
  const hasPrev = currentPage > 0 || activeChapter > 0;

  const goNext = () => {
    if (isFlipping) return;
    if (currentPage < totalPages - 1) {
      setFlipDirection('right');
      setIsFlipping(true);
      setTimeout(() => { setCurrentPage(p => p + 1); setIsFlipping(false); }, 350);
    } else if (activeChapter < chapters.length - 1) {
      setFlipDirection('right');
      setIsFlipping(true);
      setTimeout(() => { setActiveChapter(c => c + 1); setCurrentPage(0); setIsFlipping(false); }, 350);
    }
  };

  const goPrev = () => {
    if (isFlipping) return;
    if (currentPage > 0) {
      setFlipDirection('left');
      setIsFlipping(true);
      setTimeout(() => { setCurrentPage(p => p - 1); setIsFlipping(false); }, 350);
    } else if (activeChapter > 0) {
      setFlipDirection('left');
      setIsFlipping(true);
      setTimeout(() => {
        setActiveChapter(c => c - 1);
        // We'll set page to last page of previous chapter after state updates
        setCurrentPage(9999); // Will be clamped in render
        setIsFlipping(false);
      }, 350);
    }
  };

  // Clamp page for when going backwards to a previous chapter
  const safeCurrentPage = Math.min(currentPage, totalPages - 1);
  const pageContent = pages[safeCurrentPage] || '';

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentPage, activeChapter, totalPages, isFlipping]);

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* ── THE BOOK ───────────────────────────────────────────────── */}
      <div ref={bookRef} className="relative select-none" style={{ perspective: '2000px' }}>

        {/* Book Outer Shell */}
        <div className="relative mx-auto max-w-4xl">

          {/* Book spine shadow */}
          <div className="absolute left-1/2 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-amber-900/30 to-transparent -translate-x-1/2 z-20 hidden md:block" />

          {/* Book cover / page area */}
          <div className="relative rounded-sm md:rounded-md overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1a1510 0%, #0f0d0a 50%, #1a1510 100%)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}>

            {/* Page texture overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'400\' height=\'400\' viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }} />

            {/* Chapter tabs (above the pages) */}
            {chapters.length > 1 && (
              <div className="flex items-center gap-1 px-4 md:px-8 pt-5 pb-3 border-b border-amber-900/20 overflow-x-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-amber-900/30">
                <BookOpen className="w-4 h-4 text-amber-700/50 mr-2 shrink-0" />
                {chapters.map((ch, idx) => (
                  <button key={idx} onClick={() => { setActiveChapter(idx); setCurrentPage(0); }}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      activeChapter === idx
                        ? 'bg-amber-900/30 text-amber-300 border border-amber-700/40'
                        : 'text-amber-700/60 hover:text-amber-500 hover:bg-amber-900/15'
                    }`}>
                    Ch {idx + 1}
                  </button>
                ))}
              </div>
            )}

            {/* ── Page Content ─────────────────────────────────────── */}
            <div className="relative min-h-[500px] md:min-h-[600px]">

              {/* Flip animation overlay */}
              {isFlipping && (
                <div className={`absolute inset-0 z-30 pointer-events-none ${
                  flipDirection === 'right' ? 'animate-page-flip-right' : 'animate-page-flip-left'
                }`}>
                  <div className="w-full h-full bg-gradient-to-r from-amber-950/40 via-amber-900/10 to-transparent" />
                </div>
              )}

              {/* Page header */}
              <div className="flex items-center justify-between px-6 md:px-12 pt-8 pb-2">
                <span className="text-[10px] uppercase tracking-[0.3em] text-amber-700/40 font-medium">
                  {chapters.length > 1 ? `Chapter ${activeChapter + 1} · ${currentChapter?.title}` : title}
                </span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-amber-700/40 font-medium">
                  {author || 'Unknown Author'}
                </span>
              </div>

              {/* Chapter title on first page */}
              {safeCurrentPage === 0 && (
                <div className="px-6 md:px-12 pt-4 pb-6">
                  {chapters.length > 1 && (
                    <h2 className="text-2xl md:text-3xl font-bold text-amber-200/70 mb-2"
                      style={{ fontFamily: "'Georgia', 'Palatino Linotype', serif" }}>
                      {currentChapter?.title}
                    </h2>
                  )}
                  <div className="w-16 h-px bg-gradient-to-r from-amber-600/40 to-transparent" />
                </div>
              )}

              {/* Text content */}
              <div className="px-6 md:px-12 lg:px-16 pb-20">
                <div className="max-w-none space-y-6">
                  {pageContent.split('\n\n').map((para, i) => (
                    <p key={i}
                      className="text-amber-100/75 leading-[2] text-[0.95rem] md:text-[1.05rem] font-light tracking-wide"
                      style={{
                        fontFamily: "'Georgia', 'Palatino Linotype', 'Book Antiqua', serif",
                        textIndent: i > 0 ? '2em' : undefined,
                      }}>
                      {i === 0 && safeCurrentPage === 0 ? (
                        <>
                          <span className="text-4xl font-bold text-amber-300/80 float-left mr-2 mt-1 leading-none"
                            style={{ fontFamily: "'Georgia', serif" }}>
                            {para.trim()[0]}
                          </span>
                          {para.trim().slice(1)}
                        </>
                      ) : para.trim()}
                    </p>
                  ))}
                </div>
              </div>

              {/* Page footer */}
              <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-5 flex items-center justify-between">
                <div className="w-8" />
                <span className="text-xs text-amber-700/40 tabular-nums font-mono">
                  {safeCurrentPage + 1}
                </span>
                <div className="w-8" />
              </div>

              {/* Bottom page edge shadow */}
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0f0d0a] to-transparent pointer-events-none" />
            </div>
          </div>

          {/* ── Page Navigation Buttons ─────────────────────────── */}
          {hasPrev && (
            <button onClick={goPrev} disabled={isFlipping}
              className="absolute left-0 md:-left-14 top-1/2 -translate-y-1/2 z-40 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/60 border border-white/10 text-white/50 hover:text-white hover:bg-black/80 hover:border-white/20 transition-all disabled:opacity-30 backdrop-blur-sm"
              aria-label="Previous page">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {hasNext && (
            <button onClick={goNext} disabled={isFlipping}
              className="absolute right-0 md:-right-14 top-1/2 -translate-y-1/2 z-40 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/60 border border-white/10 text-white/50 hover:text-white hover:bg-black/80 hover:border-white/20 transition-all disabled:opacity-30 backdrop-blur-sm"
              aria-label="Next page">
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* ── Page indicator ────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-3 mt-4 text-xs text-white/30">
          <span className="tabular-nums">Page {safeCurrentPage + 1} of {totalPages}</span>
          {chapters.length > 1 && (
            <>
              <span className="text-white/10">·</span>
              <span>Chapter {activeChapter + 1} of {chapters.length}</span>
            </>
          )}
          <span className="text-white/10">·</span>
          <span className="text-white/20">Use ← → keys to navigate</span>
        </div>
      </div>

      {/* ── TTS Audio Bar ──────────────────────────────────────── */}
      <TTSAudioBar
        storyId={storyId}
        chapterIndex={activeChapter}
        chapterText={currentChapter?.content || ''}
      />
    </div>
  );
}

export { TTSAudioBar };
