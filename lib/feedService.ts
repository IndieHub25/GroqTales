import { UserInteraction } from '../models/UserInteraction';
import { Story } from '../models/Story';
import { connectMongoose } from '@/lib/db';

const WEIGHTS = {
  FOLLOWING_CREATOR: 50,
  TAG_MATCH: 20,
  LIKE_HISTORY: 10,
  RECENCY_DECAY: 0.95
};

export async function getPersonalizedFeed(userId: string, page = 1, limit = 10) {
  await connectMongoose();
  const skip = (page - 1) * limit;

  const interactions = await UserInteraction.find({ userId: userId } as any)
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('storyId');

  if (!interactions || interactions.length < 5) {
    return getTrendingFeed(page, limit);
  }

  const tagCounts: Record<string, number> = {};
  
  interactions.forEach((int: any) => {
    const story = int.storyId;
    if (story && story.tags) {
       story.tags.forEach((tag: string) => {
         tagCounts[tag] = (tagCounts[tag] || 0) + int.value;
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

  const query: any = {
    $or: [
      { tags: { $in: topTags } },
      // { authorWallet: { $in: user.following } } 
    ]
  };

  const candidateStories = await Story.find(query)
    .limit(100)
    .lean();

  const scoredStories = candidateStories.map((story: any) => {
    let score = 0;

    const storyTags = Array.isArray(story.tags) ? story.tags : [];
    const matchCount = storyTags.filter((t: string) => topTags.includes(t)).length;
    score += matchCount * WEIGHTS.TAG_MATCH;

    const daysOld = (Date.now() - new Date(story.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    score += (100 - daysOld) * 0.5;

    score += (story.likesCount || 0) * 1; 

    return { ...story, score };
  });

  scoredStories.sort((a: any, b: any) => b.score - a.score);
  
  return scoredStories.slice(skip, skip + limit);
}

async function getTrendingFeed(page: number, limit: number) {
  await connectMongoose();
  const skip = (page - 1) * limit;
  
  return Story.find({})
    .sort({ likesCount: -1, viewsCount: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
}