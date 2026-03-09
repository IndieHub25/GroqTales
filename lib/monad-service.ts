/**
 * @deprecated Use '@/lib/ethereum-service' instead.
 * This file re-exports from the Ethereum service for backward compatibility.
 */
export {
  type StoryMetadata,
  type MintedNFT,
  generateAndMintAIStory,
  getStoryNFT,
  mintStoryNFT,
  transferStoryNFT,
  getStoryNFTs,
} from './ethereum-service';
