import { UserProfile } from '@/types/profile';

const mockProfile: UserProfile = {
  id: 'amangp',
  username: 'amangp',
  displayName: 'Aman Gupta',
  bio: 'Web3 storyteller exploring AI & blockchain.',
  avatarUrl: '/avatars/alex.jpg',
  isVerified: true,
  stats: {
    storiesCount: 0,
    followers: 0,
    totalViews: 0,
    totalLikes: 0,
  },
};

export function useProfile(username: string) {
  const profile =
    mockProfile.username === username
      ? mockProfile
      : {
          ...mockProfile,
          id: username,
          username,
          displayName: username,
        };

  return {
    profile,
    loading: false,
    error: null,
  };
}
