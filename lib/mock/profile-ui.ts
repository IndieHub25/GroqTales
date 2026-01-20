import { UserProfile } from '@/types/profile';
import { StoryCardData } from '@/types/story';

export const mockProfile: UserProfile = {
  id: '1', // ✅ MUST be string
  username: 'amangp',
  displayName: 'Aman Gupta',
  bio: 'GroqTales storyteller',
  primaryGenre: 'Sci-Fi • Web3',
  isVerified: true,
  stats: {
    storiesCount: 12,
    followers: 340,
    totalViews: 1200,
    totalLikes: 560,
  },
};

export const mockStories: StoryCardData[] = [
  {
    id: '1', // ✅ MUST be string
    title: 'The Last Algorithm',
    excerpt: 'In a world where AI surpassed humanity...',
    coverImageUrl: '/stories/algorithm-cover.jpg',
    isNFT: true,
    views: 1200,
    likes: 560,
    comments: 12,
  },
];

export const mockSavedStories: StoryCardData[] = [];
