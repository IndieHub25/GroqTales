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
  const [sortBy, setSortBy] = useState<'recent' | 'progress'>('recent');

  useEffect(() => {
    const allProgress = getAllReadingProgress();
    let sortedProgress = Object.values(allProgress)
      .filter(p => p.percentage > 0 && p.percentage < 100);

    if (sortBy === 'recent') {
      sortedProgress.sort((a, b) => b.lastUpdated - a.lastUpdated);
    } else if (sortBy === 'progress') {
      sortedProgress.sort((a, b) => b.percentage - a.percentage);
    }

    const stories = sortedProgress
      .slice(0, 3)
      .map(p => ({
        story: fetchStoryById(p.storyId),
        progress: p
      })).filter(item => !!item.story);

    setInProgressStories(stories);
  }, [sortBy]);

  if (inProgressStories.length === 0) return null;

  return (
    <section className="py-12 bg-white dark:bg-slate-900 border-b-8 border-black">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500 border-4 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tight">Continue Reading</h2>
              <p className="font-bold text-muted-foreground">Pick up where you left off</p>
            </div>
          </div>

          <div className="flex items-center border-4 border-black bg-slate-100 p-1">
            {(['recent', 'progress'] as const).map((option) => (
              <Button
                key={option}
                variant="ghost"
                size="sm"
                onClick={() => setSortBy(option)}
                className={cn(
                  "h-8 rounded-none border-2 border-black font-black uppercase text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all",
                  sortBy === option ? "bg-amber-500 text-white" : "bg-white"
                )}
              >
                {option === 'recent' ? 'Recently Read' : 'Progress %'}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {inProgressStories.map(({ story }) => (
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
