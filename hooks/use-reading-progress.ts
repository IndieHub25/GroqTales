'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface Bookmark {
  id: string;
  paragraphIndex: number;
  note?: string;
  timestamp: number;
}

export interface ReadingProgress {
  storyId: string;
  lastParagraphIndex: number;
  percentage: number;
  bookmarks: Bookmark[];
  lastUpdated: number;
}

const STORAGE_KEY = 'groqtales_reading_progress';

export function useReadingProgress(storyId: string, paragraphCount: number) {
  const [progress, setProgress] = useState<ReadingProgress | null>(null);
  const [activeParagraph, setActiveParagraph] = useState(0);
  const observers = useRef<IntersectionObserver | null>(null);

  // Initialize progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const allProgress = JSON.parse(saved);
      if (allProgress[storyId]) {
        setProgress(allProgress[storyId]);
        setActiveParagraph(allProgress[storyId].lastParagraphIndex);
      }
    }
  }, [storyId]);

  // Save progress to localStorage
  const saveProgress = useCallback((index: number, bookmarks?: Bookmark[]) => {
    const percentage = Math.round(((index + 1) / paragraphCount) * 100);
    const newProgress: ReadingProgress = {
      storyId,
      lastParagraphIndex: index,
      percentage: Math.min(percentage, 100),
      bookmarks: bookmarks || progress?.bookmarks || [],
      lastUpdated: Date.now(),
    };

    setProgress(newProgress);

    const saved = localStorage.getItem(STORAGE_KEY);
    const allProgress = saved ? JSON.parse(saved) : {};
    allProgress[storyId] = newProgress;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
  }, [storyId, paragraphCount, progress?.bookmarks]);

  // Set up Intersection Observer for paragraph tracking
  useEffect(() => {
    if (paragraphCount === 0) return;

    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    };

    observers.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute('data-paragraph-index') || '0');
          setActiveParagraph(index);
          saveProgress(index);
        }
      });
    }, options);

    const elements = document.querySelectorAll('[data-paragraph-index]');
    elements.forEach((el) => observers.current?.observe(el));

    return () => {
      observers.current?.disconnect();
    };
  }, [paragraphCount, saveProgress]);

  // Bookmarking functions
  const addBookmark = useCallback((paragraphIndex: number, note?: string) => {
    const newBookmark: Bookmark = {
      id: Math.random().toString(36).substring(2, 9),
      paragraphIndex,
      note,
      timestamp: Date.now(),
    };

    const updatedBookmarks = [...(progress?.bookmarks || []), newBookmark];
    saveProgress(activeParagraph, updatedBookmarks);
    return newBookmark;
  }, [progress?.bookmarks, activeParagraph, saveProgress]);

  const removeBookmark = useCallback((bookmarkId: string) => {
    const updatedBookmarks = (progress?.bookmarks || []).filter(b => b.id !== bookmarkId);
    saveProgress(activeParagraph, updatedBookmarks);
  }, [progress?.bookmarks, activeParagraph, saveProgress]);

  // Calculate estimated time remaining (based on 200 words per minute)
  const getEstimatedMinutesRemaining = useCallback((wordCount: number) => {
    const wordsPerMinute = 200;
    const remainingPercentage = 1 - (activeParagraph / paragraphCount);
    const remainingWords = wordCount * remainingPercentage;
    return Math.ceil(remainingWords / wordsPerMinute);
  }, [activeParagraph, paragraphCount]);

  return {
    progress,
    activeParagraph,
    addBookmark,
    removeBookmark,
    saveProgress,
    getEstimatedMinutesRemaining,
    percentage: progress?.percentage || 0,
  };
}

export function getAllReadingProgress(): Record<string, ReadingProgress> {
  if (typeof window === 'undefined') return {};
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : {};
}
