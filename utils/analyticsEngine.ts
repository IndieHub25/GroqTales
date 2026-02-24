import { StoryStats } from '../types/analytics';

/**
 * Calculates aggregated story statistics from the provided story array.
 * Includes total count, word summation, and genre distribution.
 * @param {any[]} stories - The list of story objects to analyze.
 * @returns {StoryStats} An object containing the computed storytelling metrics.
 */
export const calculateStoryInsights = (stories: any[]): StoryStats => {
  if (!stories || stories.length === 0) {
    return {
      totalStories: 0,
      totalWordCount: 0,
      averageWordsPerStory: 0,
      genreBreakdown: {},
      lastGeneratedDate: new Date().toISOString(),
    };
  }

  const totalWords = stories.reduce((acc, s) => acc + (s.wordCount || 0), 0);
  const genreMap: Record<string, number> = {};

  stories.forEach((story) => {
    // Fallback for missing genres to avoid 'undefined' keys
    const genreKey = story.genre || 'Uncategorized';
    genreMap[genreKey] = (genreMap[genreKey] || 0) + 1;
  });

  // Calculate the most recent creation date
  const latestDate = stories
    .map(s => s.createdAt)
    .filter(Boolean)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

  return {
    totalStories: stories.length,
    totalWordCount: totalWords,
    averageWordsPerStory: Math.round(totalWords / stories.length),
    genreBreakdown: genreMap,
    lastGeneratedDate: latestDate || new Date().toISOString(),
  };
};