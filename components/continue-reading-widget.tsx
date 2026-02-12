'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getAllReadingProgress, ReadingProgress } from '@/hooks/use-reading-progress';
import { fetchStoryById } from '@/lib/mock-data';
import StoryCard from '@/components/story-card';

export function ContinueReadingWidget() {
  const [inProgressStories, setInProgressStories] = useState<{ story: any; progress: ReadingProgress }[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'progress' | 'almost-finished'>('recent');

  useEffect(() => {
    const allProgress = getAllReadingProgress();
    let sortedProgress = Object.values(allProgress)
      .filter(p => p.percentage > 0 && p.percentage < 100);

    if (sortBy === 'recent') {
      sortedProgress.sort((a, b) => b.lastUpdated - a.lastUpdated);
    } else if (sortBy === 'progress') {
      sortedProgress.sort((a, b) => b.percentage - a.percentage);
    } else if (sortBy === 'almost-finished') {
      // Prioritize stories closest to 100%
      sortedProgress.sort((a, b) => b.percentage - a.percentage);
    }

    const stories = sortedProgress
      .slice(0, 3)
      .map(p => ({
        story: fetchStoryById(p.storyId),
        progress: p
      })).filter(item => item.story !== null);

    setInProgressStories(stories);
  }, [sortBy]);

  if (inProgressStories.length === 0) return null;

  return (
    <section className="py-12 bg-amber-50/50 dark:bg-slate-900/40 border-b-8 border-foreground">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-400 p-2 border-2 border-foreground shadow-[4px_4px_0px_0px_#000]">
              <BookOpen className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight">Pick Up Where You Left Off</h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-muted-foreground mr-2">Sort By:</span>
            {(['recent', 'progress'] as const).map((option) => (
              <Button
                key={option}
                variant={sortBy === option ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy(option)}
                className={cn(
                  "h-8 rounded-none border-2 border-black font-black uppercase text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]",
                  sortBy === option ? "bg-amber-500 text-white" : "bg-white"
                )}
              >
                {option === 'recent' ? 'Recently Read' : 'Progress %'}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {inProgressStories.map(({ story, progress }) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <StoryCard story={story} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
