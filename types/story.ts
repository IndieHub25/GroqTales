import { BaseEntity } from './common';

/* =========================================================
   CORE STORY (FULL BACKEND MODEL)
========================================================= */

export interface Story extends BaseEntity {
  title: string;
  content: string;
  excerpt: string;

  authorId: string;
  author: StoryAuthor;

  genre: string;

  coverImageUrl?: string;
  images?: string[];

  status: StoryStatus;
  type: StoryType;

  settings: StorySettings;
  metadata: StoryMetadata;
  stats: StoryStats;

  tags: string[];

  isFeatured: boolean;
  isNft: boolean;

  nftDetails?: StoryNftDetails;
}

/* =========================================================
   LIGHTWEIGHT STORY (FOR UI / PROFILE / CARDS)
========================================================= */

export interface StoryCardData {
  id: string;
  title: string;
  excerpt?: string;
  coverImageUrl?: string;

  views?: number;
  likes?: number;
  comments?: number;

  isNFT?: boolean;
  isDraft?: boolean;
  isFeatured?: boolean;

  createdAt?: string;
}

/* =========================================================
   AUTHOR
========================================================= */

export interface StoryAuthor {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  isVerified: boolean;
  walletAddress?: string;
}

/* =========================================================
   ENUMS
========================================================= */

export enum StoryStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
  MODERATED = 'moderated',
}

export enum StoryType {
  TEXT = 'text',
  VISUAL = 'visual',
  COMIC = 'comic',
  INTERACTIVE = 'interactive',
}

/* =========================================================
   SUPPORTING TYPES
========================================================= */

export interface StorySettings {
  isPublic: boolean;
  commentsEnabled: boolean;
  explicitContent: boolean;
  visibility: 'public' | 'unlisted' | 'private';
  collaboration: {
    allowRemix: boolean;
    allowCollaboration: boolean;
    collaborators: string[];
  };
}

export interface StoryMetadata {
  readingTime: number;
  length: {
    words: number;
    characters: number;
    pages?: number;
  };
  contentWarnings: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  targetAudience?: string[];
  themes: string[];
}

export interface StoryStats {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  bookmarks: number;
  rating: number;
  ratingCount: number;
  revenue?: number;
}

export interface StoryNftDetails {
  contractAddress: string;
  tokenId: string;
  price: number;
  isForSale: boolean;
  ownerAddress: string;
  mintTxHash?: string;
  metadataUri: string;
  royaltyPercentage: number;
}

export default {};
