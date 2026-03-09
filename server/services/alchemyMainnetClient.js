/**
 * Alchemy Ethereum Mainnet Client
 * Provides backend-only JSON-RPC wrappers for Ethereum mainnet data fetches.
 */

const { JsonRpcProvider, isAddress } = require('ethers');
const logger = require('../utils/logger');

const ALCHEMY_RPC_URL = process.env.ALCHEMY_ETH_MAINNET_RPC_URL;
let provider;

if (ALCHEMY_RPC_URL) {
    provider = new JsonRpcProvider(ALCHEMY_RPC_URL);
} else {
    logger.warn('ALCHEMY_ETH_MAINNET_RPC_URL is not set. Ethereum Mainnet features will not work.');
}

/**
 * Validates an Ethereum address, throwing an error if invalid.
 */
const validateAddress = (address) => {
    if (!address || !isAddress(address)) {
        throw new Error('Invalid Ethereum address');
    }
};

/**
 * Execute a raw JSON-RPC call.
 * @param {string} method The RPC method name.
 * @param {Array} params Array of parameters for the call.
 */
const rpc = async (method, params = []) => {
    if (!provider) throw new Error('Alchemy Mainnet Provider not configured');
    try {
        return await provider.send(method, params);
    } catch (error) {
        logger.error(`Alchemy RPC error in ${method}: ${error.code || error.message}`);
        throw new Error(`Failed to execute ${method}`);
    }
};

/**
 * Get ETH balance of an address in Wei.
 */
const getEthBalance = async (address) => {
    validateAddress(address);
    // Returns hex string
    const balanceHex = await rpc('eth_getBalance', [address, 'latest']);
    return BigInt(balanceHex).toString(); // Return decimal string
};

/**
 * Get ERC-20 balances using Alchemy's enhanced API.
 */
const getErc20Balances = async (address) => {
    validateAddress(address);
    // Try using alchemy_getTokenBalances
    try {
        const data = await rpc('alchemy_getTokenBalances', [address]);
        // Optionally fetch token metadata for each non-zero balance
        // For simplicity we return the raw token balances. In a full implementation
        // you might enrich this with alchemy_getTokenMetadata
        return data;
    } catch (e) {
        logger.error('Failed to get ERC20 balances via Alchemy', e);
        return { tokenBalances: [] };
    }
};

/**
 * Get NFTs owned by an address using Alchemy's enhanced API.
 */
const getNftsByOwner = async (address) => {
    validateAddress(address);
    try {
        const data = await rpc('getNFTsForOwner', [{ owner: address, withMetadata: true }]);
        return data;
    } catch (e) {
        logger.error(`Failed to get NFTs via Alchemy: ${e.message}`, e);
        return { ownedNfts: [] };
    }
};

/**
 * Get single NFT metadata using Alchemy's enhanced API.
 */
const getNftMetadata = async (contractAddress, tokenId) => {
    validateAddress(contractAddress);
    try {
        const hexTokenId = tokenId.startsWith('0x') ? tokenId : '0x' + BigInt(tokenId).toString(16);
        const data = await rpc('alchemy_getNftMetadata', [contractAddress, hexTokenId]);
        return data;
    } catch (e) {
        logger.error(`Failed to get NFT metadata for ${contractAddress} ${tokenId}`, e);
        return null;
    }
};

/**
 * Get recent transactions. Etherscam or Alchemy's asset transfers can be used.
 * Here we map it to alchemy_getAssetTransfers
 */
const getTransactions = async (address, paginationArgs = {}) => {
    validateAddress(address);
    try {
        const params = {
            fromBlock: "0x0",
            toBlock: "latest",
            fromAddress: address,
            category: ["external", "erc20", "erc721", "erc1155"],
            maxCount: "0x14", // 20
            ...paginationArgs
        };
        const outgoing = await rpc('alchemy_getAssetTransfers', [params]);

        // In a full app you might also fetch incoming:
        const incomingParams = { ...params, fromAddress: undefined, toAddress: address };
        const incoming = await rpc('alchemy_getAssetTransfers', [incomingParams]);

        return {
            outgoing: outgoing.transfers || [],
            incoming: incoming.transfers || []
        };
    } catch (e) {
        logger.error('Failed to get asset transfers via Alchemy', e);
        return { outgoing: [], incoming: [] };
    }
};

module.exports = {
    provider,
    rpc,
    getEthBalance,
    getErc20Balances,
    getNftsByOwner,
    getNftMetadata,
    getTransactions
};
