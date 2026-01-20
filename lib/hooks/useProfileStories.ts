import { mockStories, mockSavedStories } from '@/lib/mock/profile-ui';
import { StoryCardData } from '@/types/story';

export function useProfileStories(username: string): {
  stories: StoryCardData[];
  saved: StoryCardData[];
  loading: boolean;
} {
  return {
    stories: mockStories,
    saved: mockSavedStories,
    loading: false,
  };
}
