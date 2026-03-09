'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, Mic2, Languages, Zap, Volume2, Loader2, RefreshCw, Headphones, BookOpen } from 'lucide-react';
import { useTTS, BULBUL_SPEAKERS, BULBUL_LANGUAGES, SPEEDS } from '@/hooks/use-tts';
import { createClient } from '@/lib/supabase/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Chapter {
  index: number;
  title: string;
  content: string;
}

interface BookViewProps {
  storyId: string;
  title: string;
  author?: string;
  chapters: Chapter[];
  defaultSpeaker?: string;
  defaultLanguage?: string;
  defaultPace?: number;
  compact?: boolean; // compact = mini marketplace card mode
  className?: string;
}

// ---------------------------------------------------------------------------
// Helper: format seconds → mm:ss
// ---------------------------------------------------------------------------
function formatTime(s: number): string {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Mini Waveform Indicator (animated bars when playing)
// ---------------------------------------------------------------------------
function WaveformBars({ isPlaying }: { isPlaying: boolean }) {
  return (
    <span className="flex items-end gap-[2px] h-4 w-6">
      {[3, 5, 4, 6, 3].map((h, i) => (
        <span
          key={i}
          className={`w-[3px] rounded-full bg-emerald-400 transition-all ${
            isPlaying ? 'animate-bounce' : ''
          }`}
          style={{
            height: `${h}px`,
            animationDelay: `${i * 80}ms`,
            animationDuration: '600ms',
          }}
        />
      ))}
    </span>
  );
}

// ---------------------------------------------------------------------------
// TTS Audio Bar
// ---------------------------------------------------------------------------
function TTSAudioBar({
  storyId,
  chapterIndex,
  chapterText,
  compact = false,
}: {
  storyId: string;
  chapterIndex: number;
  chapterText: string;
  compact?: boolean;
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

  // Get auth token for generate action
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setToken(data.session?.access_token);
    });
  }, [supabase.auth]);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else if (audioUrl) {
      play();
    }
  }, [isPlaying, audioUrl, play, pause]);

  const handleGenerate = useCallback(() => {
    generateAudio(chapterText, token);
  }, [generateAudio, chapterText, token]);

  if (compact) {
    // ── COMPACT / MARKETPLACE CARD MINI PLAYER ──────────────────────────────
    return (
      <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-lg p-2 border border-white/10">
        {audioUrl ? (
          <button
            onClick={handlePlayPause}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-400 transition-colors"
            title={isPlaying ? 'Pause' : 'Play excerpt'}
            aria-label={isPlaying ? 'Pause' : 'Play excerpt'}
          >
            {isPlaying ? <Pause className="w-3 h-3 text-black" /> : <Play className="w-3 h-3 text-black" />}
          </button>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            title="Generate preview audio"
            aria-label="Generate preview audio"
          >
            {isGenerating ? <Loader2 className="w-3 h-3 animate-spin text-white" /> : <Headphones className="w-3 h-3 text-white" />}
          </button>
        )}
        {isPlaying && <WaveformBars isPlaying={isPlaying} />}
        <span className="text-xs text-white/50 ml-auto">
          {audioUrl ? formatTime(currentTime) : 'Tap to preview'}
        </span>
      </div>
    );
  }

  // ── FULL TTS AUDIO BAR ────────────────────────────────────────────────────
  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 bg-black/30 backdrop-blur-xl">
      {/* Background gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/30 via-transparent to-purple-950/20 pointer-events-none" />

      <div className="relative p-4 space-y-3">
        {/* Top row: waveform + title + voice controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <WaveformBars isPlaying={isPlaying} />
          <span className="text-sm font-semibold text-white/80 flex-1 min-w-0 truncate">
            {isGenerating ? 'Generating narration…' : isLoading ? 'Loading audio…' : audioUrl ? 'Narration Ready' : 'AI Narration'}
          </span>

          {/* Speaker selector */}
          <div className="relative">
            <button
              onClick={() => { setShowSpeaker(v => !v); setShowLang(false); setShowSpeed(false); }}
              className="flex items-center gap-1 text-xs text-white/60 hover:text-white px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/10"
            >
              <Mic2 className="w-3 h-3" /> {speaker}
            </button>
            {showSpeaker && (
              <div className="absolute right-0 top-full mt-1 z-50 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl w-44 max-h-60 overflow-y-auto p-1">
                {BULBUL_SPEAKERS.map(s => (
                  <button key={s} onClick={() => { setSpeaker(s); setShowSpeaker(false); }}
                    className={`w-full text-left text-xs px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors ${s === speaker ? 'text-emerald-400 font-semibold' : 'text-white/70'}`}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Language selector */}
          <div className="relative">
            <button
              onClick={() => { setShowLang(v => !v); setShowSpeaker(false); setShowSpeed(false); }}
              className="flex items-center gap-1 text-xs text-white/60 hover:text-white px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/10"
            >
              <Languages className="w-3 h-3" /> {languageCode}
            </button>
            {showLang && (
              <div className="absolute right-0 top-full mt-1 z-50 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl w-44 overflow-y-auto p-1">
                {BULBUL_LANGUAGES.map(l => (
                  <button key={l.code} onClick={() => { setLanguage(l.code); setShowLang(false); }}
                    className={`w-full text-left text-xs px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors ${l.code === languageCode ? 'text-emerald-400 font-semibold' : 'text-white/70'}`}>
                    {l.label} <span className="text-white/30">({l.code})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Speed selector */}
          <div className="relative">
            <button
              onClick={() => { setShowSpeed(v => !v); setShowSpeaker(false); setShowLang(false); }}
              className="flex items-center gap-1 text-xs text-white/60 hover:text-white px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/10"
            >
              <Zap className="w-3 h-3" /> {pace}x
            </button>
            {showSpeed && (
              <div className="absolute right-0 top-full mt-1 z-50 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl w-28 p-1">
                {SPEEDS.map(sp => (
                  <button key={sp} onClick={() => { setSpeed(sp); setShowSpeed(false); }}
                    className={`w-full text-left text-xs px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors ${sp === pace ? 'text-emerald-400 font-semibold' : 'text-white/70'}`}>
                    {sp}x
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Seek bar */}
        {audioUrl && (
          <div className="flex items-center gap-2">
            <button onClick={() => seek(0)} className="text-white/40 hover:text-white transition-colors">
              <SkipBack className="w-3 h-3" />
            </button>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={e => seek(Number(e.target.value))}
              className="flex-1 h-1 rounded-full appearance-none cursor-pointer accent-emerald-400"
              aria-label="Seek"
            />
            <span className="text-xs text-white/40 tabular-nums w-20 text-right">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        )}

        {/* Play/Pause + Generate button */}
        <div className="flex items-center gap-3">
          {audioUrl ? (
            <button
              onClick={handlePlayPause}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-900 text-black font-semibold text-sm transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={isGenerating || isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 disabled:opacity-50 text-white font-semibold text-sm transition-all border border-white/20"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating audio narration…
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  Generate Audio Narration
                </>
              )}
            </button>
          )}

          {audioUrl && (
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              title="Regenerate with new voice settings"
              className="text-white/30 hover:text-white/70 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            </button>
          )}

          {error && (
            <span className="text-xs text-red-400 ml-auto">{error}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BookView – main component
// ---------------------------------------------------------------------------
export default function BookView({
  storyId,
  title,
  author,
  chapters,
  defaultSpeaker = 'Shubh',
  defaultLanguage = 'en-IN',
  defaultPace = 1,
  compact = false,
  className = '',
}: BookViewProps) {
  const [activeChapter, setActiveChapter] = useState(0);

  const currentChapter = chapters[activeChapter] || chapters[0];

  if (compact) {
    // ── COMPACT MODE: Used in marketplace cards ────────────────────────────
    return (
      <TTSAudioBar
        storyId={storyId}
        chapterIndex={0}
        chapterText={chapters[0]?.content?.slice(0, 500) || ''}
        compact
      />
    );
  }

  // ── FULL BOOK VIEW ─────────────────────────────────────────────────────────
  return (
    <div className={`w-full space-y-0 ${className}`}>
      {/* Book surface */}
      <div className="relative rounded-3xl overflow-hidden border border-white/[0.06] bg-gradient-to-b from-[#0d1117] to-[#0a0e15] shadow-2xl">
        {/* Paper texture / page glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Chapter tabs */}
        {chapters.length > 1 && (
          <div className="flex items-center gap-1 px-6 pt-6 pb-2 border-b border-white/5 overflow-x-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
            <BookOpen className="w-4 h-4 text-white/30 mr-2 shrink-0" />
            {chapters.map((ch, idx) => (
              <button
                key={idx}
                onClick={() => setActiveChapter(idx)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeChapter === idx
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                }`}
              >
                Ch {idx + 1}: {ch.title}
              </button>
            ))}
          </div>
        )}

        {/* Chapter content */}
        <div className="px-6 md:px-12 py-10 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
          {chapters.length > 1 && (
            <h2 className="text-lg font-semibold text-white/50 mb-6 font-serif">
              Chapter {activeChapter + 1}: {currentChapter?.title}
            </h2>
          )}
          <div className="prose prose-invert prose-lg max-w-none space-y-5">
            {currentChapter?.content?.split('\n\n').map((para, i) => (
              <p
                key={i}
                className="text-white/80 leading-[1.9] text-[1.05rem] font-light tracking-wide first-letter:text-2xl first-letter:font-semibold first-letter:text-white/90 first-letter:mr-0.5 first-letter:float-left first-letter:leading-none"
                style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
              >
                {para.trim()}
              </p>
            ))}
          </div>
        </div>

        {/* Bottom page edge shadow */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0a0e15] to-transparent pointer-events-none" />
      </div>

      {/* TTS Audio Bar — rendered below the book surface */}
      <div className="mt-4">
        <TTSAudioBar
          storyId={storyId}
          chapterIndex={activeChapter}
          chapterText={currentChapter?.content || ''}
        />
      </div>
    </div>
  );
}

export { TTSAudioBar };
