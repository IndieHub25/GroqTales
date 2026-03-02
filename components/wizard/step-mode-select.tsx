'use client';

import { motion } from 'framer-motion';
import { BookOpen, ImageIcon, Sparkles } from 'lucide-react';
import React, { useEffect } from 'react';

import type { StoryMode } from '@/hooks/use-creation-wizard';
import { cn } from '@/lib/utils';

interface StepModeSelectProps {
  selectedMode: StoryMode | null;
  onSelect: (mode: StoryMode) => void;
  onAnalytics?: (mode: string) => void;
}

const MODES: {
  id: StoryMode;
  icon: React.ReactNode;
  label: string;
  description: string;
}[] = [
  {
    id: 'story',
    icon: <BookOpen className="h-8 w-8" />,
    label: 'Story',
    description:
      'Generate a rich text-based story with AI. Choose genre, characters, and more.',
  },
  {
    id: 'comic',
    icon: <ImageIcon className="h-8 w-8" />,
    label: 'Comic',
    description:
      'Create a visual comic with panel-by-panel AI-generated art and dialogue.',
  },
];

export function StepModeSelect({
  selectedMode,
  onSelect,
  onAnalytics,
}: StepModeSelectProps) {
  useEffect(() => {
    // analytics handled by parent
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          What do you want to create?
        </h2>
        <p className="text-sm text-muted-foreground">
          Choose your creative path:
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {MODES.map((mode) => {
          const isSelected = selectedMode === mode.id;
          return (
            <motion.div
              key={mode.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => {
                  onSelect(mode.id);
                  onAnalytics?.(mode.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(mode.id);
                    onAnalytics?.(mode.id);
                  }
                }}
                className={cn(
                  'w-full h-auto p-6 flex flex-col items-center gap-5 text-center',
                  'border-4 border-foreground bg-card shadow-[6px_6px_0px_0px_hsl(var(--foreground))]',
                  'hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_hsl(var(--foreground))]',
                  'active:translate-y-0 active:shadow-none',
                  'transition-all cursor-pointer',
                  isSelected &&
                    'bg-primary/10 border-primary ring-2 ring-primary ring-inset'
                )}
              >
                <div
                  className="flex items-center justify-center w-16 h-16 bg-foreground text-background shrink-0 border-2 border-foreground/20 shadow-[2px_2px_0px_0px_hsl(var(--foreground))]"
                  aria-hidden="true"
                >
                  {mode.icon}
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl font-bold leading-none">
                    {mode.label}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {mode.description}
                  </p>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-primary p-1.5 border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]"
                  >
                    <svg
                      className="h-4 w-4 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </motion.div>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Empty state */}
      {!selectedMode && (
        <p className="text-center text-xs text-muted-foreground italic">
          Select a mode above to proceed to the next step.
        </p>
      )}
    </div>
  );
}
