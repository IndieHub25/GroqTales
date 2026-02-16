/*
 * BLOCKCHAIN FUNCTIONALITY TEMPORARILY DISABLED FOR PRODUCTION DEPLOYMENT
 * This file contains NFT minting functionality on the Monad blockchain.
 * It has been commented out to focus on core AI storytelling features.
 *
 * To re-enable blockchain functionality:
 * 1. Uncomment all code in this file
 * 2. Set up proper environment variables for blockchain connection
 * 3. Install required blockchain dependencies
 * 4. Test on appropriate networks before production use
 */

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      error:
        'NFT minting functionality is temporarily disabled. This feature will be available in a future update.',
      disabled: true,
    },
    { status: 503 }
  );
}

/*
// ORIGINAL BLOCKCHAIN CODE - COMMENTED OUT FOR PRODUCTION DEPLOYMENT
// The complete original implementation is preserved below but commented out

import { JsonRpcProvider, Wallet, Contract } from 'ethers';

// Environment variables for Ethereum Mainnet connection
const ETHEREUM_RPC_URL =
  process.env.ETHEREUM_RPC_URL ||
  'https://mainnet.infura.io/v3/80e1a002fae34ced944866a7b286884d';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
const CONTRACT_ADDRESS = process.env.STORY_NFT_ADDRESS || '';

// IPFS configuration
const IPFS_RPC_API = '/ip4/127.0.0.1/tcp/5001';
const IPFS_GATEWAY = 'https://dweb.link';
const IPFS_FALLBACK_GATEWAY = 'https://ipfs.io';
const IPNS_PUBLISHING_KEY =
  'self - k51qzi5uqu5dhindgjwye0f28c6zb6m06gl799ihzivn50kqkl8w0bomgz6rxc';

// Contract ABI for NFT minting
const CONTRACT_ABI = [
  'function mint(address to, string memory tokenURI) external returns (uint256)',
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'function tokenURI(uint256 tokenId) external view returns (string memory)',
  'function mintPrice() external view returns (uint256)',
  'function mintStory(string memory storyHash, string memory metadataURI) external payable returns (uint256)',
  'event StoryMinted(uint256 indexed tokenId)',
];

// Original POST implementation would be here - commented out for production
*/
