const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');
const {
    getEthBalance,
    getErc20Balances,
    getNftsByOwner,
    getTransactions,
    rpc
} = require('../services/alchemyMainnetClient');

// Rate limiting for Alchemy-heavy endpoints
const alchemyLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 60, // 60 requests per 5 minutes per IP
    message: { error: 'Too many requests for blockchain state, please try again later.' }
});

router.use(alchemyLimiter);

// Simple memory cache (short TTL) to keep UI snappy and reduce Alchemy requests
const cache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 1 minute

const cachedCall = async (key, fetchFn) => {
    const cached = cache.get(key);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
        return cached.data;
    }
    const data = await fetchFn();
    cache.set(key, { timestamp: Date.now(), data });
    return data;
};

/**
 * @swagger
 * /api/v1/eth-mainnet/node/health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Check mainnet node health
 */
router.get('/node/health', async (req, res) => {
    try {
        const blockHex = await rpc('eth_blockNumber', []);
        const latestBlock = parseInt(blockHex, 16);

        res.json({
            success: true,
            healthy: true,
            blockNumber: latestBlock
        });
    } catch (error) {
        logger.error('ETH Mainnet node health check failed:', error);
        res.status(503).json({
            success: false,
            healthy: false,
            error: 'Node communication failed'
        });
    }
});

/**
 * @swagger
 * /api/v1/eth-mainnet/wallets/{address}/summary:
 *   get:
 */
router.get('/wallets/:address/summary', async (req, res) => {
    const { address } = req.params;
    try {
        const summary = await cachedCall(`summary_${address}`, async () => {
            const [ethBal, erc20s, nfts, txs] = await Promise.all([
                getEthBalance(address),
                getErc20Balances(address),
                getNftsByOwner(address),
                getTransactions(address, { maxCount: "0xA" }) // Last 10
            ]);

            return {
                ethBalance: ethBal,
                erc20Tokens: erc20s.tokenBalances || [],
                nftCounts: nfts.totalCount || (nfts.ownedNfts ? nfts.ownedNfts.length : 0),
                recentTransactions: txs
            };
        });

        res.json({ success: true, data: summary });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

/**
 * @swagger
 * /api/v1/eth-mainnet/wallets/{address}/nfts:
 *   get:
 */
router.get('/wallets/:address/nfts', async (req, res) => {
    const { address } = req.params;
    try {
        const data = await cachedCall(`nfts_${address}`, () => getNftsByOwner(address));

        // Normalize fields for frontend
        const normalizedNfts = (data.ownedNfts || []).map(nft => {
            const metadata = nft.metadata || nft.rawMetadata || {};
            return {
                contractAddress: nft.contract?.address,
                tokenId: nft.id?.tokenId || nft.tokenId,
                name: nft.title || metadata.name || `Unnamed NFT`,
                image: metadata.image || nft.media?.[0]?.gateway || null,
                collectionName: nft.contractMetadata?.name || 'Unknown Collection',
                raw: nft // provide raw data if frontend needs specific things
            };
        });

        res.json({ success: true, data: normalizedNfts });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

/**
 * @swagger
 * /api/v1/eth-mainnet/wallets/{address}/portfolio:
 *   get:
 */
router.get('/wallets/:address/portfolio', async (req, res) => {
    const { address } = req.params;
    try {
        const portfolio = await cachedCall(`portfolio_${address}`, async () => {
            const [ethBal, erc20s, nfts] = await Promise.all([
                getEthBalance(address),
                getErc20Balances(address),
                getNftsByOwner(address)
            ]);

            return {
                address,
                assets: {
                    eth: {
                        symbol: 'ETH',
                        balanceRaw: ethBal,
                        decimals: 18
                    },
                    tokens: erc20s.tokenBalances || [],
                    nfts: nfts.ownedNfts || []
                },
                meta: {
                    totalTokens: erc20s.tokenBalances ? erc20s.tokenBalances.length : 0,
                    totalNfts: nfts.totalCount || (nfts.ownedNfts ? nfts.ownedNfts.length : 0)
                }
            };
        });

        res.json({ success: true, data: portfolio });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

module.exports = router;
