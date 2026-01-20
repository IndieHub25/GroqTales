export interface Profile {
  id: string;
  name: string;
  username: string;
  bio?: string;
  avatar?: string;
  stats: {
    storiesCount: number;
    followers: number;
    totalViews: number;
    totalLikes: number;
  };
}

export interface Story {
  id: string;
  title: string;
  excerpt?: string;
  coverImageUrl?: string;
  isNFT?: boolean;
}
