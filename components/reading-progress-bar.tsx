'use client';

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ReadingProgressBarProps {
  percentage: number;
  className?: string;
}

export function ReadingProgressBar({ percentage, className }: ReadingProgressBarProps) {
  return (
    <div className={cn('fixed top-0 left-0 w-full z-[100] h-2 bg-black/20 dark:bg-white/5 backdrop-blur-md', className)}>
      <Progress
        value={percentage}
        className="h-full rounded-none bg-transparent"
        style={{
          // Custom color for the progress bar to make it feel premium
          // @ts-ignore
          '--progress-foreground': 'linear-gradient(to right, #f59e0b, #ef4444, #f59e0b)',
          boxShadow: '0 0 10px rgba(245, 158, 11, 0.5)'
        }}
      />
    </div>
  );
}
