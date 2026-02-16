/**
 * @fileoverview Enhanced API types and response structures
 * @description Professional API type definitions for enterprise applications
 */

/**
 * Standard API response structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
  pagination?: PaginationMetadata;
  meta?: ResponseMetadata;
}

/**
 * API error structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
  path?: string;
  method?: string;
}

/**
 * Enhanced pagination metadata
 */
export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextPage?: number;
  prevPage?: number;
}

/**
 * Response metadata for API calls
 */
export interface ResponseMetadata {
  timestamp: string;
  version: string;
  requestId?: string;
  duration?: number;
  cached?: boolean;
  rateLimit?: RateLimitInfo;
}

/**
 * Rate limiting information
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

/**
 * Enhanced user types
 */
export interface User extends BaseEntity {
  email: string;
  username: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  walletAddress?: string;
  preferences: UserPreferences;
  stats: UserStats;
  verification: UserVerification;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  content: ContentSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
  updates: boolean;
  comments: boolean;
  likes: boolean;
  follows: boolean;
}

export interface PrivacySettings {
  profileVisible: boolean;
  storiesVisible: boolean;
  activityVisible: boolean;
  showEmail: boolean;
  showWallet: boolean;
}

export interface ContentSettings {
  defaultGenre?: string;
  contentWarnings: boolean;
  explicitContent: boolean;
  autoSave: boolean;
  autoPublish: boolean;
}

export interface UserStats {
  storiesCreated: number;
  storiesPublished: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  nftsMinted: number;
  nftsSold: number;
  totalEarnings: number;
  followers: number;
  following: number;
}

export interface UserVerification {
  email: boolean;
  phone: boolean;
  identity: boolean;
  twitter: boolean;
  discord: boolean;
  github: boolean;
}

/**
 * Enhanced story types
 */
export interface Story extends BaseEntity {
  title: string;
  content: string;
  excerpt?: string;
  genre: string;
  tags: string[];
  authorId: string;
  author?: User;
  status: StoryStatus;
  visibility: StoryVisibility;
  contentRating: ContentRating;
  metadata: StoryMetadata;
  stats: StoryStats;
  nft?: StoryNFT;
  collaborators?: Collaborator[];
  versions?: StoryVersion[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export type StoryStatus = 'draft' | 'published' | 'archived' | 'deleted';
export type StoryVisibility = 'public' | 'private' | 'unlisted' | 'premium';
export type ContentRating = 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17';

export interface StoryMetadata {
  wordCount: number;
  readingTime: number;
  language: string;
  aiGenerated: boolean;
  aiModel?: string;
  aiPrompt?: string;
  coverImage?: string;
  audioUrl?: string;
  videoUrl?: string;
  interactiveElements?: boolean;
  contentWarnings: string[];
  chapters?: Chapter[];
}

export interface StoryStats {
  views: number;
  likes: number;
  dislikes: number;
  comments: number;
  shares: number;
  saves: number;
  rating: number;
  ratingCount: number;
  revenue: number;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
  wordCount: number;
  readingTime: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Collaborator {
  userId: string;
  user?: User;
  role: CollaboratorRole;
  permissions: CollaboratorPermissions;
  addedAt: Date;
  addedBy: string;
}

export type CollaboratorRole = 'co-author' | 'editor' | 'reviewer' | 'viewer';

export interface CollaboratorPermissions {
  canEdit: boolean;
  canDelete: boolean;
  canPublish: boolean;
  canInvite: boolean;
  canMintNFT: boolean;
}

export interface StoryVersion {
  id: string;
  version: number;
  title: string;
  content: string;
  changeLog?: string;
  createdAt: Date;
  createdBy: string;
}

/**
 * Enhanced NFT types
 */
export interface StoryNFT extends BaseEntity {
  storyId: string;
  story?: Story;
  tokenId: string;
  contractAddress: string;
  chain: BlockchainNetwork;
  metadata: NFTMetadata;
  ownership: NFTOwnership;
  marketplace: NFTMarketplace;
  royalties: NFTRoyalties;
  createdAt: Date;
  updatedAt: Date;
}

export type BlockchainNetwork =
  | 'ethereum'
  | 'polygon'
  | 'base'
  | 'monad'
  | 'arbitrum';

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  animationUrl?: string;
  externalUrl?: string;
  attributes: NFTAttribute[];
  properties: NFTProperties;
}

export interface NFTAttribute {
  traitType: string;
  value: string | number;
  displayType?:
    | 'string'
    | 'number'
    | 'boost_number'
    | 'boost_percentage'
    | 'date';
}

export interface NFTProperties {
  category: string;
  subcategory?: string;
  rarity: NFTRarity;
  edition: number;
  totalSupply: number;
  unlockableContent?: boolean;
  transferable: boolean;
}

export type NFTRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic';

export interface NFTOwnership {
  currentOwner: string;
  originalCreator: string;
  transferHistory: NFTTransfer[];
  ownershipProof?: string;
}

export interface NFTTransfer {
  from: string;
  to: string;
  price?: number;
  currency: string;
  transactionHash: string;
  blockNumber: number;
  timestamp: Date;
  marketplace?: string;
}

export interface NFTMarketplace {
  isListed: boolean;
  price?: number;
  currency: string;
  marketplace?: string;
  listingId?: string;
  listedAt?: Date;
  expiresAt?: Date;
  seller?: string;
  offers?: NFTOffer[];
}

export interface NFTOffer {
  id: string;
  bidder: string;
  amount: number;
  currency: string;
  expiresAt: Date;
  createdAt: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

export interface NFTRoyalties {
  percentage: number;
  recipient: string;
  enforced: boolean;
  distributionRules?: RoyaltyDistribution[];
}

export interface RoyaltyDistribution {
  recipient: string;
  percentage: number;
  role: string;
}

/**
 * Activity and interaction types
 */
export interface Activity extends BaseEntity {
  userId: string;
  user?: User;
  type: ActivityType;
  entityType: EntityType;
  entityId: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export type ActivityType =
  | 'story_created'
  | 'story_published'
  | 'story_liked'
  | 'story_commented'
  | 'story_shared'
  | 'nft_minted'
  | 'nft_purchased'
  | 'nft_sold'
  | 'user_followed'
  | 'user_unfollowed';

export type EntityType = 'story' | 'nft' | 'user' | 'comment' | 'collection';

export interface Comment extends BaseEntity {
  content: string;
  authorId: string;
  author?: User;
  entityType: EntityType;
  entityId: string;
  parentId?: string;
  replies?: Comment[];
  stats: CommentStats;
  status: CommentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type CommentStatus =
  | 'active'
  | 'edited'
  | 'deleted'
  | 'hidden'
  | 'flagged';

export interface CommentStats {
  likes: number;
  dislikes: number;
  replies: number;
  reports: number;
}

/**
 * Base entity interface
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Search and filter types
 */
export interface SearchFilters {
  query?: string;
  genre?: string;
  tags?: string[];
  author?: string;
  contentRating?: ContentRating;
  status?: StoryStatus;
  visibility?: StoryVisibility;
  dateRange?: DateRange;
  sortBy?: SortField;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export type SortField =
  | 'createdAt'
  | 'updatedAt'
  | 'publishedAt'
  | 'views'
  | 'likes'
  | 'rating'
  | 'title'
  | 'wordCount';

export type SortOrder = 'asc' | 'desc';

/**
 * Utility types
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;
