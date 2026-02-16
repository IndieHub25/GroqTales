/**
 * @fileoverview Story-related type definitions
 * @description Types for stories, content, and story interactions
 * @version 1.0.0
 */

import { BaseEntity } from './common';

/**
 * Story interface
 */
export interface Story extends BaseEntity {
  /** Story title */
  title: string;
  /** Story content/text */
  content: string;
  /** Story excerpt/summary */
  excerpt: string;
  /** Story author's user ID */
  authorId: string;
  /** Author information */
  author: StoryAuthor;
  /** Story genre */
  genre: string;
  /** Story cover image URL */
  coverImageUrl?: string;
  /** Story images (for visual stories) */
  images?: string[];
  /** Story status */
  status: StoryStatus;
  /** Story type */
  type: StoryType;
  /** Story settings */
  settings: StorySettings;
  /** Story metadata */
  metadata: StoryMetadata;
  /** Story statistics */
  stats: StoryStats;
  /** Story tags */
  tags: string[];
  /** Whether story is featured */
  isFeatured: boolean;
  /** Whether story is an NFT */
  isNft: boolean;
  /** NFT details if applicable */
  nftDetails?: StoryNftDetails;
}

/**
 * Story author information
 */
export interface StoryAuthor {
  /** Author's user ID */
  id: string;
  /** Author's username */
  username: string;
  /** Author's display name */
  displayName?: string;
  /** Author's avatar URL */
  avatarUrl?: string;
  /** Whether author is verified */
  isVerified: boolean;
  /** Author's wallet address */
  walletAddress?: string;
}

/**
 * Story status enumeration
 */
export enum StoryStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
  MODERATED = 'moderated',
}

/**
 * Story type enumeration
 */
export enum StoryType {
  TEXT = 'text',
  VISUAL = 'visual',
  COMIC = 'comic',
  INTERACTIVE = 'interactive',
}

/**
 * Story settings interface
 */
export interface StorySettings {
  /** Whether story is public */
  isPublic: boolean;
  /** Whether comments are enabled */
  commentsEnabled: boolean;
  /** Whether story contains explicit content */
  explicitContent: boolean;
  /** Story visibility settings */
  visibility: 'public' | 'unlisted' | 'private';
  /** Collaboration settings */
  collaboration: {
    allowRemix: boolean;
    allowCollaboration: boolean;
    collaborators: string[];
  };
}

/**
 * Story metadata interface
 */
export interface StoryMetadata {
  /** Estimated reading time in minutes */
  readingTime: number;
  /** Story length metrics */
  length: {
    words: number;
    characters: number;
    pages?: number;
  };
  /** Content warnings */
  contentWarnings: string[];
  /** Story difficulty level */
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  /** Target audience */
  targetAudience?: string[];
  /** Story themes */
  themes: string[];
}

/**
 * Story statistics interface
 */
export interface StoryStats {
  /** Number of views */
  views: number;
  /** Number of likes */
  likes: number;
  /** Number of comments */
  comments: number;
  /** Number of shares */
  shares: number;
  /** Number of bookmarks */
  bookmarks: number;
  /** Average rating (1-5) */
  rating: number;
  /** Number of ratings */
  ratingCount: number;
  /** Revenue generated (if NFT) */
  revenue?: number;
}

/**
 * Story NFT details
 */
export interface StoryNftDetails {
  /** NFT contract address */
  contractAddress: string;
  /** Token ID */
  tokenId: string;
  /** NFT price in ETH */
  price: number;
  /** Whether NFT is for sale */
  isForSale: boolean;
  /** Current owner's wallet address */
  ownerAddress: string;
  /** Minting transaction hash */
  mintTxHash?: string;
  /** NFT metadata URI */
  metadataUri: string;
  /** Royalty percentage for creator */
  royaltyPercentage: number;
}

/**
 * Story comment interface
 */
export interface StoryComment extends BaseEntity {
  /** Story ID this comment belongs to */
  storyId: string;
  /** Comment author's user ID */
  authorId: string;
  /** Comment author information */
  author: StoryAuthor;
  /** Comment content */
  content: string;
  /** Parent comment ID (for replies) */
  parentId?: string;
  /** Comment status */
  status: 'active' | 'deleted' | 'moderated';
  /** Number of likes */
  likes: number;
  /** Nested replies */
  replies?: StoryComment[];
}

/**
 * Story interaction interface
 */
export interface StoryInteraction extends BaseEntity {
  /** Story ID */
  storyId: string;
  /** User ID who performed the interaction */
  userId: string;
  /** Interaction type */
  type: InteractionType;
  /** Interaction metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Story interaction types
 */
export enum InteractionType {
  VIEW = 'view',
  LIKE = 'like',
  COMMENT = 'comment',
  SHARE = 'share',
  BOOKMARK = 'bookmark',
  RATE = 'rate',
  REPORT = 'report',
}

/**
 * Story generation request
 */
export interface StoryGenerationRequest {
  /** Story prompt */
  prompt: string;
  /** Target genre */
  genre: string;
  /** Target length */
  length: 'short' | 'medium' | 'long';
  /** Story style */
  style?: string;
  /** Target audience */
  audience?: string;
  /** Additional parameters */
  parameters?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
  };
}

/**
 * Story generation response
 */
export interface StoryGenerationResponse {
  /** Generated story */
  story: Partial<Story>;
  /** Generation metadata */
  metadata: {
    model: string;
    tokensUsed: number;
    generationTime: number;
    confidence: number;
  };
  /** Generation cost */
  cost?: number;
}

export default {};
