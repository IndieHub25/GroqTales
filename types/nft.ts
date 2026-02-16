/**
 * @fileoverview NFT and blockchain-related type definitions
 * @description Types for NFT marketplace, transactions, and blockchain interactions
 * @version 1.0.0
 */

import { BaseEntity } from './common';

/**
 * NFT interface
 */
export interface NFT extends BaseEntity {
  /** NFT contract address */
  contractAddress: string;
  /** Token ID */
  tokenId: string;
  /** NFT name */
  name: string;
  /** NFT description */
  description: string;
  /** NFT image URL */
  imageUrl: string;
  /** NFT metadata URI */
  metadataUri: string;
  /** Current owner's wallet address */
  ownerAddress: string;
  /** Creator's wallet address */
  creatorAddress: string;
  /** NFT price in ETH */
  price: number;
  /** Whether NFT is currently for sale */
  isForSale: boolean;
  /** NFT status */
  status: NFTStatus;
  /** NFT type */
  type: NFTType;
  /** NFT attributes/traits */
  attributes: NFTAttribute[];
  /** NFT statistics */
  stats: NFTStats;
  /** Royalty information */
  royalty: RoyaltyInfo;
  /** Associated story ID (if applicable) */
  storyId?: string;
}

/**
 * NFT status enumeration
 */
export enum NFTStatus {
  ACTIVE = 'active',
  SOLD = 'sold',
  BURNED = 'burned',
  SUSPENDED = 'suspended',
}

/**
 * NFT type enumeration
 */
export enum NFTType {
  STORY = 'story',
  COMIC = 'comic',
  ARTWORK = 'artwork',
  COLLECTIBLE = 'collectible',
}

/**
 * NFT attribute interface
 */
export interface NFTAttribute {
  /** Attribute name */
  trait_type: string;
  /** Attribute value */
  value: string | number;
  /** Display type (optional) */
  display_type?: 'boost_number' | 'boost_percentage' | 'number' | 'date';
  /** Maximum value (for numeric traits) */
  max_value?: number;
}

/**
 * NFT statistics interface
 */
export interface NFTStats {
  /** Number of views */
  views: number;
  /** Number of likes */
  likes: number;
  /** Number of transfers */
  transfers: number;
  /** Last sale price */
  lastSalePrice?: number;
  /** Highest sale price */
  highestSalePrice?: number;
  /** Price history */
  priceHistory: PriceHistoryEntry[];
}

/**
 * Price history entry
 */
export interface PriceHistoryEntry {
  /** Sale price */
  price: number;
  /** Sale date */
  date: Date;
  /** Transaction hash */
  txHash: string;
  /** Buyer's address */
  buyer: string;
  /** Seller's address */
  seller: string;
}

/**
 * Royalty information
 */
export interface RoyaltyInfo {
  /** Royalty percentage (0-100) */
  percentage: number;
  /** Royalty recipient address */
  recipient: string;
  /** Whether royalties are enforced */
  enforced: boolean;
}

/**
 * NFT transaction interface
 */
export interface NFTTransaction extends BaseEntity {
  /** Transaction hash */
  txHash: string;
  /** NFT contract address */
  contractAddress: string;
  /** Token ID */
  tokenId: string;
  /** Transaction type */
  type: TransactionType;
  /** From address */
  fromAddress: string;
  /** To address */
  toAddress: string;
  /** Transaction value in ETH */
  value: number;
  /** Gas fee */
  gasFee: number;
  /** Transaction status */
  status: TransactionStatus;
  /** Block number */
  blockNumber: number;
  /** Block timestamp */
  blockTimestamp: Date;
}

/**
 * Transaction type enumeration
 */
export enum TransactionType {
  MINT = 'mint',
  TRANSFER = 'transfer',
  SALE = 'sale',
  LISTING = 'listing',
  DELISTING = 'delisting',
  OFFER = 'offer',
  OFFER_ACCEPTED = 'offer_accepted',
}

/**
 * Transaction status enumeration
 */
export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

/**
 * NFT listing interface
 */
export interface NFTListing extends BaseEntity {
  /** NFT being listed */
  nft: NFT;
  /** Seller's address */
  sellerAddress: string;
  /** Listing price */
  price: number;
  /** Listing currency */
  currency: 'ETH' | 'USDC' | 'DAI';
  /** Listing expiration date */
  expiresAt: Date;
  /** Listing status */
  status: ListingStatus;
  /** Listing type */
  type: ListingType;
}

/**
 * Listing status enumeration
 */
export enum ListingStatus {
  ACTIVE = 'active',
  SOLD = 'sold',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

/**
 * Listing type enumeration
 */
export enum ListingType {
  FIXED_PRICE = 'fixed_price',
  AUCTION = 'auction',
  DUTCH_AUCTION = 'dutch_auction',
}

/**
 * NFT offer interface
 */
export interface NFTOffer extends BaseEntity {
  /** NFT being offered on */
  nftId: string;
  /** Offer maker's address */
  offerMaker: string;
  /** Offer amount */
  amount: number;
  /** Offer currency */
  currency: 'ETH' | 'USDC' | 'DAI';
  /** Offer expiration date */
  expiresAt: Date;
  /** Offer status */
  status: OfferStatus;
}

/**
 * Offer status enumeration
 */
export enum OfferStatus {
  ACTIVE = 'active',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

/**
 * Wallet interface
 */
export interface Wallet {
  /** Wallet address */
  address: string;
  /** Wallet type/provider */
  provider: WalletProvider;
  /** Wallet balance in ETH */
  balance: number;
  /** Connected status */
  isConnected: boolean;
  /** Network information */
  network: NetworkInfo;
}

/**
 * Wallet provider enumeration
 */
export enum WalletProvider {
  METAMASK = 'metamask',
  WALLET_CONNECT = 'wallet_connect',
  COINBASE = 'coinbase',
  INJECTED = 'injected',
}

/**
 * Network information interface
 */
export interface NetworkInfo {
  /** Chain ID */
  chainId: number;
  /** Network name */
  name: string;
  /** Network symbol */
  symbol: string;
  /** RPC URL */
  rpcUrl: string;
  /** Block explorer URL */
  explorerUrl: string;
}

/**
 * Smart contract interface
 */
export interface SmartContract {
  /** Contract address */
  address: string;
  /** Contract name */
  name: string;
  /** Contract ABI */
  abi: any[];
  /** Contract type */
  type: ContractType;
  /** Deployment block */
  deploymentBlock: number;
}

/**
 * Contract type enumeration
 */
export enum ContractType {
  ERC721 = 'ERC721',
  ERC1155 = 'ERC1155',
  MARKETPLACE = 'marketplace',
  ROYALTY = 'royalty',
}

export default {};
