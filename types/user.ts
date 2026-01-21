/**
 * @fileoverview User-related type definitions
 * @description Types for user authentication, profiles, and user data
 * @version 1.0.0
 */

import { BaseEntity } from './common';

/**
 * User profile interface
 */
export interface UserProfile extends BaseEntity {
  /** Wallet address (primary identifier) */
  walletAddress: string;
  /** Display username */
  username: string;
  /** User's display name */
  displayName?: string;
  /** User's email address */
  email?: string;
  /** Profile avatar URL */
  avatarUrl?: string;
  /** User biography */
  bio?: string;
  /** User's website URL */
  websiteUrl?: string;
  /** Social media links */
  socialLinks?: {
    twitter?: string;
    discord?: string;
    instagram?: string;
  };
  /** User verification status */
  isVerified: boolean;
  /** User role */
  role: UserRole;
  /** User status */
  status: UserStatus;
  /** User preferences */
  preferences: UserPreferences;
  /** User statistics */
  stats: UserStats;
}

/**
 * User role enumeration
 */
export enum UserRole {
  USER = 'user',
  CREATOR = 'creator',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

/**
 * User account status
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
}

/**
 * User preferences interface
 */
export interface UserPreferences {
  /** Theme preference */
  theme: 'light' | 'dark' | 'system';
  /** Email notification settings */
  notifications: {
    email: boolean;
    push: boolean;
    newFollower: boolean;
    storyLike: boolean;
    storyComment: boolean;
    newStoryFromFollowing: boolean;
  };
  /** Privacy settings */
  privacy: {
    showEmail: boolean;
    showWallet: boolean;
    allowDirectMessages: boolean;
  };
  /** Content preferences */
  content: {
    explicitContent: boolean;
    preferredGenres: string[];
    autoplay: boolean;
  };
}

/**
 * User statistics interface
 */
export interface UserStats {
  /** Number of stories created */
  storiesCreated: number;
  /** Number of NFTs owned */
  nftsOwned: number;
  /** Number of NFTs created */
  nftsCreated: number;
  /** Total earnings from sales */
  totalEarnings: number;
  /** Number of followers */
  followers: number;
  /** Number of following */
  following: number;
  /** Total likes received */
  likesReceived: number;
  /** Account creation date */
  memberSince: Date;
}

/**
 * User authentication state
 */
export interface AuthState {
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Current user profile */
  user: UserProfile | null;
  /** Loading state */
  isLoading: boolean;
  /** Authentication error */
  error: string | null;
}

/**
 * User connection status
 */
export interface UserConnection {
  /** Target user ID */
  userId: string;
  /** Connection type */
  type: 'follow' | 'block' | 'mute';
  /** Connection timestamp */
  connectedAt: Date;
}

/**
 * User activity interface
 */
export interface UserActivity extends BaseEntity {
  /** User who performed the activity */
  userId: string;
  /** Activity type */
  type: ActivityType;
  /** Activity target (story, user, etc.) */
  targetId: string;
  /** Target type */
  targetType: string;
  /** Activity metadata */
  metadata?: Record<string, unknown>;
}

/**
 * User activity types
 */
export enum ActivityType {
  STORY_CREATED = 'story_created',
  STORY_LIKED = 'story_liked',
  STORY_COMMENTED = 'story_commented',
  USER_FOLLOWED = 'user_followed',
  NFT_CREATED = 'nft_created',
  NFT_PURCHASED = 'nft_purchased',
  NFT_SOLD = 'nft_sold',
  PROFILE_UPDATED = 'profile_updated',
}



export default {};
