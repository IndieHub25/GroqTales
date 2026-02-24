/**
 * Represents the aggregated statistical data for a user's storytelling history.
 */
export interface StoryStats {
  totalStories: number;
  totalWordCount: number; 
  averageWordsPerStory: number;
  genreBreakdown: Record<string, number>;
  lastGeneratedDate: string;
}