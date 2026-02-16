/**
 * Mock Monad Blockchain Integration Service
 *
 * This is a mock service to prevent deployment errors.
 * All blockchain functionality has been disabled for this build.
 */

// Story metadata interface for NFT minting (mock)
export interface StoryMetadata {
  title: string;
  content: string;
  genre: string;
  author: string;
  timestamp: number;
  aiModel?: string;
  tags?: string[];
  description?: string;
  excerpt?: string;
  authorAddress?: string;
  coverImage?: string;
  createdAt?: string;
  aiPrompt?: string;
}

// Minted NFT result interface (mock)
export interface MintedNFT {
  tokenId: string;
  contractAddress?: string;
  transactionHash: string;
  metadata: StoryMetadata;
  owner?: string;
  tokenURI?: string;
}

// Mock function to generate and mint AI story
export async function generateAndMintAIStory(
  prompt: string,
  ownerAddress: string,
  title: string,
  genre: string,
  apiKey?: string
): Promise<MintedNFT> {
  console.log(
    'Mock generateAndMintAIStory called - blockchain functionality disabled'
  );
  throw new Error('Blockchain functionality is disabled in this build');
}

// Mock functions to prevent import errors
export async function getStoryNFT(tokenId: string): Promise<MintedNFT | null> {
  console.log('Mock getStoryNFT called - blockchain functionality disabled');
  return null;
}

export async function mintStoryNFT(
  metadata: StoryMetadata,
  walletAddress: string
): Promise<MintedNFT> {
  console.log('Mock mintStoryNFT called - blockchain functionality disabled');
  throw new Error('Blockchain functionality is disabled in this build');
}

export async function transferStoryNFT(
  tokenId: string,
  fromAddress: string,
  toAddress: string
): Promise<string> {
  console.log(
    'Mock transferStoryNFT called - blockchain functionality disabled'
  );
  throw new Error('Blockchain functionality is disabled in this build');
}

export async function getStoryNFTs(
  walletAddress: string
): Promise<MintedNFT[]> {
  console.log('Mock getStoryNFTs called - blockchain functionality disabled');
  return [];
}
