
export interface UserProfileUI {
    name: string;
    username: string;
    avatar: string;
    bio: string;
    website: string;
    twitter: string;
    github: string;
    email: string;
    joinDate: string;
    isVerified: boolean;
    storiesCount: number;
    followers: number;
    following: number;
    walletAddress: string;
    badges: string[];
    totalViews: number;
    totalLikes: number;
}

export type EditableProfileFields = Pick<
    UserProfileUI,
    'name' | 'username' | 'bio' | 'website' | 'twitter' | 'github' | 'email'
>;
