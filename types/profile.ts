export interface ProfileStats {
  storiesCount: number;
  followers: number;
  totalViews: number;
  totalLikes: number;
}

export interface ProfileStory {
  id: string;
  title: string;
  excerpt: string;
  coverImageUrl: string;
  likes: number;
  comments: number;
  isNFT?: boolean;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  primaryGenre: string;
  avatarUrl?: string;
  isVerified?: boolean;
  stats: ProfileStats;
}
