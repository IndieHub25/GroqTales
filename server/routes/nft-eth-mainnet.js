const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { authRequired } = require('../middleware/auth');
const { mintStoryNft } = require('../services/nftMintService');
const logger = require('../utils/logger');

// Basic rate limiting to prevent spamming the mint function
const mintLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 mints per 15 minutes per IP
    message: { error: 'Too many mint requests from this IP, please try again later.' }
});

/**
 * @swagger
 * /api/v1/nft/eth-mainnet/mint:
 *   post:
 *     tags:
 *       - NFT
 *     summary: Mint an NFT on Ethereum Mainnet
 *     description: Mints a story NFT securely using the backend wallet/signer.
 *     security:
 *       - BearerAuth: []
 */
router.post('/mint', authRequired, mintLimiter, async (req, res) => {
    try {
        const { toAddress, storyId, tokenUriOrMetadata } = req.body;

        if (!toAddress || !tokenUriOrMetadata) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters: toAddress, tokenUriOrMetadata'
            });
        }

        logger.info(`User ${req.user.id} requested ETH mainnet mint for story ${storyId || 'N/A'}`);

        // Call the backend mint service
        const result = await mintStoryNft(toAddress, tokenUriOrMetadata);

        return res.status(200).json({
            success: true,
            data: {
                txHash: result.txHash,
                status: result.status,
                storyId,
                message: 'Mint transaction submitted successfully to Ethereum mainnet.'
            }
        });
    } catch (error) {
        logger.error('Error in ETH mainnet mint route:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to mint NFT'
        });
    }
});

module.exports = router;
