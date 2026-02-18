'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Bookmark {
  id: string;
  paragraphIndex: number;
  note?: string;
  timestamp: number;
}

export interface ReadingProgress {
  storyId: string;
  paragraphIndex: number;
  percentage: number;
  lastUpdated: number;
  bookmarks: Bookmark[];
}

const STORAGE_KEY = 'groqtales_reading_progress';

export function getAllReadingProgress(): Record<string, ReadingProgress> {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Error reading progress from localStorage', e);
    return {};
  }
}

export function useReadingProgress(storyId: string, totalParagraphs: number) {
  const [progress, setProgress] = useState<ReadingProgress | null>(null);

  // Initialize progress
  useEffect(() => {
    const allProgress = getAllReadingProgress();
    if (allProgress[storyId]) {
      setProgress(allProgress[storyId]);
    } else {
      const initialProgress: ReadingProgress = {
        storyId,
        paragraphIndex: 0,
        percentage: 0,
        lastUpdated: Date.now(),
        bookmarks: [],
      };
      setProgress(initialProgress);
    }
  }, [storyId]);

  const saveProgress = useCallback((paragraphIndex: number, currentBookmarks?: Bookmark[]) => {
    if (totalParagraphs <= 0) return;

    const percentage = Math.round((paragraphIndex / (totalParagraphs - 1)) * 100);
    const updatedProgress: ReadingProgress = {
      storyId,
      paragraphIndex,
      percentage: Math.min(100, Math.max(0, percentage)),
      lastUpdated: Date.now(),
      bookmarks: currentBookmarks || progress?.bookmarks || [],
    };

    setProgress(updatedProgress);

    const allProgress = getAllReadingProgress();
    allProgress[storyId] = updatedProgress;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
  }, [storyId, totalParagraphs, progress?.bookmarks]);

  const addBookmark = useCallback((paragraphIndex: number, note?: string) => {
    const newBookmark: Bookmark = {
      id: Math.random().toString(36).substr(2, 9),
      paragraphIndex,
      note,
      timestamp: Date.now(),
    };

    const updatedBookmarks = [...(progress?.bookmarks || []), newBookmark];
    saveProgress(progress?.paragraphIndex || 0, updatedBookmarks);
  }, [progress, saveProgress]);

  const removeBookmark = useCallback((bookmarkId: string) => {
    const updatedBookmarks = (progress?.bookmarks || []).filter(b => b.id !== bookmarkId);
    saveProgress(progress?.paragraphIndex || 0, updatedBookmarks);
  }, [progress, saveProgress]);

  const clearBookmarks = useCallback(() => {
    saveProgress(progress?.paragraphIndex || 0, []);
  }, [progress, saveProgress]);

  return {
    progress,
    percentage: progress?.percentage || 0,
    activeParagraph: progress?.paragraphIndex || 0,
    saveProgress,
    addBookmark,
    removeBookmark,
    clearBookmarks,
    bookmarks: progress?.bookmarks || [],
  };
}
