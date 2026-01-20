import { mockProfile } from '@/lib/mock/profile-ui';

export function useProfile(username: string) {
  return {
    profile: mockProfile,
    loading: false,
    error: null,
  };
}
