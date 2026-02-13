/**
 * @fileoverview Royalty tracking type definitions
 * @description Types for off-chain royalty tracking, creator earnings, and revenue sharing
 * @version 1.0.0
 */

/**
 * Royalty configuration for an NFT or story
 */
export interface RoyaltyConfig {
  _id: string;
  /** Associated NFT ID */
  nftId?: string;
  /** Associated story ID */
  storyId?: string;
  /** Creator's wallet address */
  creatorWallet: string;
  /** Royalty percentage (0-50) */
  royaltyPercentage: number;
  /** Whether this config is active */
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Recorded royalty transaction from an NFT sale
 */
export interface RoyaltyTransaction {
  _id: string;
  /** NFT that was sold */
  nftId: string;
  /** Total sale price in ETH */
  salePrice: number;
  /** Royalty amount paid to creator in ETH */
  royaltyAmount: number;
  /** Royalty percentage applied */
  royaltyPercentage: number;
  /** Wallet address of the seller */
  sellerWallet: string;
  /** Wallet address of the buyer */
  buyerWallet: string;
  /** Wallet address of the original creator */
  creatorWallet: string;
  /** Blockchain transaction hash (if available) */
  txHash?: string;
  /** Transaction status */
  status: RoyaltyTransactionStatus;
  createdAt: Date;
}

/**
 * Royalty transaction status
 */
export type RoyaltyTransactionStatus = 'pending' | 'completed' | 'failed';

/**
 * Aggregated creator earnings
 */
export interface CreatorEarnings {
  _id: string;
  /** Creator's wallet address */
  creatorWallet: string;
  /** Total royalties earned (ETH) */
  totalEarned: number;
  /** Amount awaiting withdrawal (ETH) */
  pendingPayout: number;
  /** Amount already withdrawn (ETH) */
  paidOut: number;
  /** Total number of secondary sales */
  totalSales: number;
  /** Last time earnings were updated */
  lastUpdated: Date;
}

// ── API Response Types ─────────────────────────────────────────────

/**
 * Response from GET /api/royalties/earnings/[wallet]
 */
export interface EarningsResponse {
  success: boolean;
  earnings: CreatorEarnings;
}

/**
 * Response from GET /api/royalties/transactions/[wallet]
 */
export interface TransactionsResponse {
  success: boolean;
  transactions: RoyaltyTransaction[];
  pagination: RoyaltyPagination;
}

/**
 * Pagination metadata for royalty queries
 */
export interface RoyaltyPagination {
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

/**
 * Response from POST /api/royalties/configure
 */
export interface ConfigureRoyaltyResponse {
  success: boolean;
  config: RoyaltyConfig;
}

/**
 * Response from POST /api/royalties/record
 */
export interface RecordTransactionResponse {
  success: boolean;
  transaction: RoyaltyTransaction;
}

/**
 * Request body for POST /api/royalties/configure
 */
export interface ConfigureRoyaltyRequest {
  nftId?: string;
  storyId?: string;
  creatorWallet: string;
  royaltyPercentage: number;
}

/**
 * Request body for POST /api/royalties/record
 */
export interface RecordTransactionRequest {
  nftId: string;
  salePrice: number;
  sellerWallet: string;
  buyerWallet: string;
  txHash?: string;
}
