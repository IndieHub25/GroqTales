/**
 * ETH Mainnet NFT Mint Service
 * Uses the Alchemy client provider and backend signer to mint NFTs on Ethereum mainnet.
 */

const { ethers } = require('ethers');
const logger = require('../utils/logger');
const { provider } = require('./alchemyMainnetClient');

const NFT_CONTRACT_ADDRESS = process.env.ETH_MAINNET_NFT_CONTRACT_ADDRESS;
const SIGNER_PRIVATE_KEY = process.env.ETH_MAINNET_SIGNER_PRIVATE_KEY;

// ABI for MonadStoryNFT contract
const MONAD_STORY_NFT_ABI = [
    "function mintStory(string storyHash, string metadataURI) payable"
];

/**
 * Mints an NFT to the specified address on Ethereum mainnet.
 * @param {string} toAddress The recipient EVM address.
 * @param {string} tokenUri The IPFS URI or metadata URI.
 * @param {Object} [options] Optional mint parameters such as mintPrice and storyHash.
 * @returns {Promise<{txHash: string, status: string}>}
 */
const mintStoryNft = async (toAddress, tokenUri, options = {}) => {
    if (!provider) {
        throw new Error('Alchemy Mainnet Provider is not configured. Cannot mint.');
    }
    if (!SIGNER_PRIVATE_KEY || !ethers.isAddress(NFT_CONTRACT_ADDRESS)) {
        throw new Error('NFT contract address or signer private key missing/invalid.');
    }
    if (!ethers.isAddress(toAddress)) {
        throw new Error('Invalid recipient address.');
    }

    try {
        const signer = new ethers.Wallet(SIGNER_PRIVATE_KEY, provider);
        const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, MONAD_STORY_NFT_ABI, signer);

        logger.info(`Minting ETH mainnet NFT to ${toAddress} with URI ${tokenUri}...`);

        // Documenting toAddress behavior: mintStory mints to msg.sender so the backend retains custody initially.
        if (toAddress.toLowerCase() !== signer.address.toLowerCase()) {
            logger.warn(`Note: mintStory mints to msg.sender (${signer.address}). Backend retains custody initially, not directly transferring to ${toAddress}.`);
        }

        const storyHash = options.storyHash || ethers.id(tokenUri || Date.now().toString());
        const mintPrice = options.mintPrice || 0n;

        // Estimate gas
        const gasEstimate = await contract.mintStory.estimateGas(storyHash, tokenUri, { value: mintPrice });
        // Add 20% buffer to gas estimate
        const gasLimit = (gasEstimate * 120n) / 100n;

        // Send transaction
        const tx = await contract.mintStory(storyHash, tokenUri, { gasLimit, value: mintPrice });

        logger.info(`Mint tx submitted: ${tx.hash}. Waiting for confirmation...`);

        // Wait for 1 confirmation
        await tx.wait(1);

        return {
            txHash: tx.hash,
            status: 'confirmed',
        };

    } catch (error) {
        logger.error('Error minting ETH mainnet NFT:', error);
        if (error.code === 'INSUFFICIENT_FUNDS') {
            throw new Error('Backend signer wallet has insufficient funds for gas.');
        }
        throw new Error(`Minting failed: ${error.reason || error.message}`);
    }
};

module.exports = {
    mintStoryNft
};
