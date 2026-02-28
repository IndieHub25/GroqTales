import {
  createPublicClient,
  createWalletClient,
  http,
  defineChain,
  parseAbiItem,
  decodeEventLog,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

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

export interface MintedNFT {
  tokenId: string;
  contractAddress?: string;
  transactionHash: string;
  metadata: StoryMetadata;
  owner?: string;
  tokenURI?: string;
}

// ----------------------------------------------------------------------------
// Monad Network Configuration
// ----------------------------------------------------------------------------
const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: [process.env.MONAD_TEST_RPC_URL || 'https://testnet-rpc.monad.xyz'],
    },
    public: {
      http: [process.env.MONAD_TEST_RPC_URL || 'https://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com' },
  },
});

// ----------------------------------------------------------------------------
// Viem Client Initialization
// ----------------------------------------------------------------------------
// Use NEXT_PUBLIC_STORY_NFT_CONTRACT for the target contract address.
const contractAddress = (process.env.NEXT_PUBLIC_STORY_NFT_CONTRACT || '0x') as `0x${string}`;
const minterPrivateKey = (process.env.MINTER_PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000000') as `0x${string}`;

const account = minterPrivateKey !== '0x' && minterPrivateKey.length === 66
  ? privateKeyToAccount(minterPrivateKey)
  : privateKeyToAccount('0x0000000000000000000000000000000000000000000000000000000000000001');

const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(),
});

const walletClient = createWalletClient({
  account,
  chain: monadTestnet,
  transport: http(),
});

// ERC721 Minimal ABI
const contractAbi = [
  {
    type: 'function',
    name: 'safeMint',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'uri', type: 'string' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'tokenURI',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'Transfer',
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: true, name: 'tokenId', type: 'uint256' },
    ],
  },
] as const;

// ----------------------------------------------------------------------------
// Core Service Functions
// ----------------------------------------------------------------------------

/**
 * Mints a new Story NFT to the target wallet address using viem.
 * Encodes the metadata as a base64 generic tokenURI.
 */
export async function mintStoryNFT(
  metadata: StoryMetadata,
  walletAddress: string
): Promise<MintedNFT> {
  if (minterPrivateKey === '0x' || !minterPrivateKey.startsWith('0x')) {
    throw new Error('MINTER_PRIVATE_KEY is not configured or invalid');
  }

  // Ensure metadata is stringified and base64 encoded for on-chain storage
  const jsonMetadata = JSON.stringify(metadata);
  const base64Metadata = Buffer.from(jsonMetadata).toString('base64');
  const tokenURI = `data:application/json;base64,${base64Metadata}`;

  const destinationAddress = walletAddress as `0x${string}`;

  try {
    console.log(`[Monad-Viem] Preparing to mint to ${destinationAddress}...`);

    // We simulate the transaction first to catch reverts early
    const { request } = await publicClient.simulateContract({
      account,
      address: contractAddress,
      abi: contractAbi,
      functionName: 'safeMint',
      args: [destinationAddress, tokenURI],
    });

    const hash = await walletClient.writeContract(request);
    console.log(`[Monad-Viem] Transaction sent: ${hash}. Awaiting receipt...`);

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status !== 'success') {
      throw new Error(`Transaction reverted: ${hash}`);
    }

    // Parse the logs to find the Transfer event and extract the newly minted tokenId
    const transferEvent = parseAbiItem(
      'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'
    );

    let extractedTokenId = '';

    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: [transferEvent],
          data: log.data,
          topics: log.topics,
        });

        if (decoded.eventName === 'Transfer') {
          // tokenId is the 3rd indexed parameter
          extractedTokenId = decoded.args.tokenId.toString();
          break;
        }
      } catch (err) {
        // Ignore unparseable logs from other contracts or events
        continue;
      }
    }

    if (!extractedTokenId) {
      throw new Error('Failed to extract tokenId from transaction logs');
    }

    console.log(`[Monad-Viem] Successfully minted tokenId ${extractedTokenId}`);

    return {
      tokenId: extractedTokenId,
      contractAddress: contractAddress,
      transactionHash: hash,
      metadata,
      owner: walletAddress,
      tokenURI,
    };
  } catch (error: any) {
    console.error('[Monad-Viem] Minting error:', error);
    throw new Error(`Failed to mint NFT on Monad Testnet: ${error.message}`);
  }
}

/**
 * Fetches the metadata of an existing Story NFT from the blockchain.
 */
export async function getStoryNFT(tokenId: string): Promise<MintedNFT | null> {
  try {
    const uri = await publicClient.readContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: 'tokenURI',
      args: [BigInt(tokenId)],
    });

    if (!uri) return null;

    let metadata: StoryMetadata;

    // Support base64 encoded data URIs
    if (uri.startsWith('data:application/json;base64,')) {
      const base64Data = uri.split(',')[1] || '';
      const jsonString = Buffer.from(base64Data, 'base64').toString('utf-8');
      metadata = JSON.parse(jsonString) as StoryMetadata;
    } else {
      // For standard HTTP IPFS URLs just fetch the metadata
      const res = await fetch(uri);
      metadata = (await res.json()) as StoryMetadata;
    }

    return {
      tokenId,
      contractAddress,
      transactionHash: 'historical',
      metadata,
      tokenURI: uri,
    };
  } catch (error) {
    console.error(`[Monad-Viem] Error fetching getStoryNFT for ${tokenId}:`, error);
    return null;
  }
}

/**
 * Not currently reliably supported without an indexer like The Graph.
 */
export async function getStoryNFTs(
  walletAddress: string
): Promise<MintedNFT[]> {
  console.log('[Monad-Viem] getStoryNFTs called - returning empty array (unsupported without indexer)');
  return [];
}

/**
 * Transfers a story NFT from one address to another (unsupported logic).
 */
export async function transferStoryNFT(
  tokenId: string,
  fromAddress: string,
  toAddress: string
): Promise<string> {
  throw new Error('Transfer logic is not fully implemented in this service yet');
}

/**
 * Retained for backwards compatibility in other modules; directly wraps mintStoryNFT.
 */
export async function generateAndMintAIStory(
  prompt: string,
  ownerAddress: string,
  title: string,
  genre: string,
  apiKey?: string
): Promise<MintedNFT> {
  // Ideally generation happens outside of the blockchain service. We simply construct mock
  // metadata here to satisfy the legacy signature and then mint.
  const metadata: StoryMetadata = {
    title,
    content: "Generated story content for prompt: " + prompt,
    genre,
    author: ownerAddress,
    timestamp: Date.now(),
    aiPrompt: prompt,
  };

  return mintStoryNFT(metadata, ownerAddress);
}
