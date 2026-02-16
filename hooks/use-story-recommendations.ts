'use client';

import { useState } from 'react';

interface RecommendationOptions {
  storyId: string;
  content?: string | undefined;
  keywords?: string[] | undefined;
  genre?: string | undefined;
  limit?: number;
  model?: string | undefined;
  apiKey?: string | undefined;
}
interface UseStoryRecommendationsResult {
  getRecommendations: (options: RecommendationOptions) => Promise<any[]>;
  recommendations: any[];
  isLoading: boolean;
  error: string | null;
}
export function useStoryRecommendations(): UseStoryRecommendationsResult {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get recommendations based on a story's characteristics
   */

  const getRecommendations = async (
    options: RecommendationOptions
  ): Promise<any[]> => {
    const {
      storyId,
      content,
      keywords,
      genre,
      limit = 5,
      model,
      apiKey,
    } = options;

    if (!storyId) {
      setError('Story ID is required');
      return [];
    }
    // Require at least one of content, keywords, or genre
    if (!content && (!keywords || keywords.length === 0) && !genre) {
      setError('At least one of content, keywords, or genre is required');
      return [];
    }
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/story-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storyId,
          content,
          keywords,
          genre,
          limit,
          model,
          apiKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get recommendations');
      }
      setRecommendations(data.recommendations || []);
      return data.recommendations || [];
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getRecommendations,
    recommendations,
    isLoading,
    error,
  };
}
