'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ReadingProgressBarProps {
  percentage: number;
}

export function ReadingProgressBar({ percentage }: ReadingProgressBarProps) {
  return (
    <div className="fixed top-0 left-0 w-full h-1.5 z-[1001] bg-slate-100 dark:bg-slate-800">
      <motion.div
        className="h-full bg-primary"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
    </div>
  );
}
