import { createClient } from '@/lib/supabase/server';

export async function getPersonalizedFeed(userId: string, page = 1, limit = 10) {
  const supabase = createClient();
  const skip = (page - 1) * limit;

  // We fetch interactions directly using Supabase
  const { data: interactions, error: intErr } = await supabase
    .from('user_interactions')
    .select('*, stories(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (intErr || !interactions || interactions.length < 5) {
    return getTrendingFeed(page, limit);
  }

  // Calculate top tags
  const tagCounts: Record<string, number> = {};
  interactions.forEach((int: any) => {
    const story = int.stories;
    if (story && Array.isArray(story.tags)) {
      story.tags.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + (int.value || 1);
      });
    }
  });

  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([tag]) => tag);

  if (topTags.length === 0) {
    return getTrendingFeed(page, limit);
  }

  // Fetch candidate stories containing any of the top tags
  const { data: candidateStories, error: storyErr } = await supabase
    .from('stories')
    .select('*')
    .overlaps('tags', topTags)
    .limit(100);

  if (storyErr || !candidateStories) {
    return getTrendingFeed(page, limit);
  }

  const WEIGHTS = { TAG_MATCH: 20 };
  const scoredStories = candidateStories.map((story: any) => {
    let score = 0;
    const storyTags = Array.isArray(story.tags) ? story.tags : [];
    const matchCount = storyTags.filter((t: string) => topTags.includes(t)).length;
    score += matchCount * WEIGHTS.TAG_MATCH;

    const daysOld = (Date.now() - new Date(story.created_at).getTime()) / (1000 * 60 * 60 * 24);
    score += (100 - daysOld) * 0.5;
    score += (story.likes_count || 0) * 1;

    return { ...story, score };
  });

  scoredStories.sort((a: any, b: any) => b.score - a.score);
  return scoredStories.slice(skip, skip + limit);
}

async function getTrendingFeed(page: number, limit: number) {
  const supabase = createClient();
  const skip = (page - 1) * limit;

  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .order('likes_count', { ascending: false })
    .order('created_at', { ascending: false })
    .range(skip, skip + limit - 1);

  if (error) {
    console.warn('Error fetching trending feed:', error);
    return [];
  }

  return data || [];
}