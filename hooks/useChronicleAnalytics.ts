import { useState, useEffect, useMemo } from 'react';
import { StoryStats } from '../types/analytics';
import { calculateStoryInsights } from '../utils/analyticsEngine';

/**
 * Custom hook to manage and compute story analytics state.
 * @param {any[]} userData - The raw array of story data from the user.
 * @returns {{ insights: StoryStats | null, loading: boolean }} The processed insights and loading state.
 */
export const useChronicleAnalytics = (userData: any[]) => {
  const [insights, setInsights] = useState<StoryStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Stabilize the dependency to prevent infinite loops from array reference changes
  const memoizedData = useMemo(() => JSON.stringify(userData), [userData]);

  useEffect(() => {
    setLoading(true);
    const parsedData = JSON.parse(memoizedData);
    
    if (parsedData && parsedData.length > 0) {
      const results = calculateStoryInsights(parsedData);
      setInsights(results);
    } else {
      setInsights(null);
    }
    
    setLoading(false);
  }, [memoizedData]);

  return { insights, loading };
};