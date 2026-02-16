'use client';

import { ObjectId } from 'mongodb';
import { useState } from 'react';

interface StorySummary {
  _id?: ObjectId | string;
  storyId: ObjectId | string;
  originalContent: string;
  summary: string;
  keyPoints: string[];
  sentiment: string;
  keywords: string[];
  model: string;
  createdAt: Date;
  updatedAt: Date;
}
interface UseStorySummaryResult {
  generateSummary: (
    storyId: string,
    content: string,
    model?: string,
    apiKey?: string
  ) => Promise<StorySummary | null>;
  fetchSummary: (storyId: string) => Promise<StorySummary | null>;
  updateSummary: (
    id: string,
    updates: Partial<StorySummary>,
    regenerate?: boolean,
    content?: string
  ) => Promise<StorySummary | null>;
  deleteSummary: (id: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}
export function useStorySummary(): UseStorySummaryResult {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generate and store a summary for a story
   */

  const generateSummary = async (
    storyId: string,
    content: string,
    model?: string,
    apiKey?: string
  ): Promise<StorySummary | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/story-summaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storyId,
          content,
          model,
          apiKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate summary');
      }
      return data.summary;
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch a summary for a story
   */

  const fetchSummary = async (
    storyId: string
  ): Promise<StorySummary | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/story-summaries?storyId=${storyId}`, {
        method: 'GET',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch summary');
      }
      // Return the first summary if there are multiple (should be only one per story)
      return data.summaries && data.summaries.length > 0
        ? data.summaries[0]
        : null;
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update a story summary
   */

  const updateSummary = async (
    id: string,
    updates: Partial<StorySummary>,
    regenerate: boolean = false,
    content?: string
  ): Promise<StorySummary | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/story-summaries', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          ...updates,
          regenerate,
          content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update summary');
      }
      return data.summary;
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Delete a story summary
   */

  const deleteSummary = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/story-summaries?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete summary');
      }
      return true;
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateSummary,
    fetchSummary,
    updateSummary,
    deleteSummary,
    isLoading,
    error,
  };
}
