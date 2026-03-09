/**
 * NFT Contract Service — On-chain interactions with ComiCraftStoryNFT
 *
 * Handles minting, ownership queries, and metadata URI lookups.
 * Uses the platform signer for write operations.
 */

const { ethers } = require('ethers');
const { getProvider, getSigner, mapWeb3Error } = require('./web3Service');
const logger = require('../utils/logger');

// Minimal ABI for ComiCraftStoryNFT — only functions we call from the backend
const STORY_NFT_ABI = [
    'function mintStory(string memory storyHash, string memory metadataURI) payable returns (uint256)',
    'function burnStory(uint256 tokenId) returns (bool)',
    'function ownerOf(uint256 tokenId) view returns (address)',
    'function tokenURI(uint256 tokenId) view returns (string)',
    'function getStoryContent(uint256 tokenId) view returns (string)',
    'function mintPrice() view returns (uint256)',
    'function totalSupply() view returns (uint256)',
    'function balanceOf(address owner) view returns (uint256)',
    'function getApproved(uint256 tokenId) view returns (address)',
    'function approve(address to, uint256 tokenId)',
    'event StoryMinted(uint256 indexed tokenId, address indexed owner, string storyHash, string metadataURI)',
    'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
];

/**
 * Get an ethers Contract instance for the story NFT collection.
 * @param {boolean} [withSigner=false]
 * @returns {import('ethers').Contract}
 */
function getNftContract(withSigner = false) {
    const address = process.env.STORY_NFT_CONTRACT_ADDRESS;
    if (!address) {
        throw new Error('STORY_NFT_CONTRACT_ADDRESS environment variable is not set');
    }
    if (!ethers.isAddress(address)) {
        throw new Error(`Invalid STORY_NFT_CONTRACT_ADDRESS: ${address}`);
    }

    const providerOrSigner = withSigner ? getSigner() : getProvider();
    return new ethers.Contract(address, STORY_NFT_ABI, providerOrSigner);
}

/**
 * Mint a story NFT on-chain.
 * @param {string} storyHash    Keccak256 hash of the story content.
 * @param {string} metadataURI  IPFS/Arweave URI for NFT metadata JSON.
 * @returns {Promise<{ tokenId: string, txHash: string, blockNumber: number }>}
 */
async function mintStoryNFT(storyHash, metadataURI) {
    if (!storyHash || !metadataURI) {
        throw new Error('storyHash and metadataURI are required for minting');
    }

    const contract = getNftContract(true);

    try {
        // Get mint price
        const mintPrice = await contract.mintPrice();

        const tx = await contract.mintStory(storyHash, metadataURI, {
            value: mintPrice,
        });

        logger.info('NFT mint transaction sent', {
            component: 'nft-contract',
            txHash: tx.hash,
            storyHash,
        });

        const receipt = await tx.wait();

        if (receipt.status === 0) {
            throw new Error(`Mint transaction reverted: ${tx.hash}`);
        }

        // Parse the StoryMinted event to get the tokenId
        let tokenId = null;
        for (const log of receipt.logs) {
            try {
                const parsed = contract.interface.parseLog({
                    topics: log.topics,
                    data: log.data,
                });
                if (parsed?.name === 'StoryMinted') {
                    tokenId = parsed.args.tokenId.toString();
                    break;
                }
            } catch {
                // Skip logs that don't match our ABI
            }
        }

        // Fallback: parse Transfer event
        if (!tokenId) {
            for (const log of receipt.logs) {
                try {
                    const parsed = contract.interface.parseLog({
                        topics: log.topics,
                        data: log.data,
                    });
                    if (parsed?.name === 'Transfer' && parsed.args.from === ethers.ZeroAddress) {
                        tokenId = parsed.args.tokenId.toString();
                        break;
                    }
                } catch {
                    // Skip
                }
            }
        }

        logger.info('NFT minted successfully', {
            component: 'nft-contract',
            tokenId,
            txHash: tx.hash,
            blockNumber: receipt.blockNumber,
        });

        return {
            tokenId,
            txHash: tx.hash,
            blockNumber: receipt.blockNumber,
        };
    } catch (error) {
        const mapped = mapWeb3Error(error);
        logger.error('NFT mint failed', {
            component: 'nft-contract',
            storyHash,
            error: mapped.message,
            code: mapped.code,
        });
        throw mapped;
    }
}

/**
 * Get the on-chain owner of an NFT.
 * @param {string|number} tokenId
 * @returns {Promise<string>} Owner address
 */
async function getTokenOwner(tokenId) {
    const contract = getNftContract(false);
    try {
        return await contract.ownerOf(tokenId);
    } catch (error) {
        // Token may not exist
        if (error.message?.includes('nonexistent token') || error.message?.includes('invalid token')) {
            return null;
        }
        throw error;
    }
}

/**
 * Get the metadata URI for a token.
 * @param {string|number} tokenId
 * @returns {Promise<string>}
 */
async function getTokenURI(tokenId) {
    const contract = getNftContract(false);
    return contract.tokenURI(tokenId);
}

/**
 * Get the story content hash stored on-chain.
 * @param {string|number} tokenId
 * @returns {Promise<string>}
 */
async function getStoryContent(tokenId) {
    const contract = getNftContract(false);
    return contract.getStoryContent(tokenId);
}

/**
 * Get the current mint price.
 * @returns {Promise<string>} Price in ether units
 */
async function getMintPrice() {
    const contract = getNftContract(false);
    const price = await contract.mintPrice();
    return ethers.formatEther(price);
}

/**
 * Approve the marketplace to transfer an NFT.
 * @param {string|number} tokenId
 * @param {string} marketplaceAddress
 * @returns {Promise<string>} Transaction hash
 */
async function approveForMarketplace(tokenId, marketplaceAddress) {
    if (!ethers.isAddress(marketplaceAddress)) {
        throw new Error(`Invalid marketplace address: ${marketplaceAddress}`);
    }

    const contract = getNftContract(true);

    try {
        const tx = await contract.approve(marketplaceAddress, tokenId);
        const receipt = await tx.wait();

        logger.info('NFT approved for marketplace', {
            component: 'nft-contract',
            tokenId: tokenId.toString(),
            marketplace: marketplaceAddress,
            txHash: tx.hash,
        });

        return tx.hash;
    } catch (error) {
        const mapped = mapWeb3Error(error);
        logger.error('NFT approval failed', {
            component: 'nft-contract',
            tokenId: tokenId.toString(),
            error: mapped.message,
        });
        throw mapped;
    }
}

module.exports = {
    getNftContract,
    mintStoryNFT,
    getTokenOwner,
    getTokenURI,
    getStoryContent,
    getMintPrice,
    approveForMarketplace,
};
