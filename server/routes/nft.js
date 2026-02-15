/**
 * NFT API Routes
 * Handles NFT minting, trading, and marketplace endpoints
 * currently implemented without blockchain integration and authentication
 * after implementing  user auth , story and marketplace routes proper testring can be done
 */

const express = require('express');
const mongoose = require('mongoose');
const { ethers } = require('ethers');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const logger = require('../utils/logger');

const Nft = require('../models/Nft');
const Story = require('../models/Story');
const RoyaltyConfig = require('../models/RoyaltyConfig');
const RoyaltyTransaction = require('../models/RoyaltyTransaction');
const CreatorEarnings = require('../models/CreatorEarnings');

const { authRequired } = require('../middleware/auth');

// NFT Endpoints

/**
 * @swagger
 * /api/v1/nft:
 *   get:
 *     tags:
 *       - NFT
 *     summary: Get NFT list
 *     description: Returns a paginated list of NFTs with optional filtering by category (story genre) and priceRange.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of NFTs per page.
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter NFTs by story genre.
 *       - in: query
 *         name: priceRange
 *         schema:
 *           type: string
 *           example: "10-100"
 *         description: Filter NFTs by price range (format: min-max).
 *     responses:
 *       200:
 *         description: NFTs retrieved successfully.
 *       400:
 *         description: Invalid priceRange format.
 *       500:
 *         description: Internal server error.
 */

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { category, priceRange } = req.query;

    let nftFilter = {};

    if (priceRange) {
      const [minRaw, maxRaw] = priceRange.split('-');
      const min =
        minRaw !== undefined && minRaw !== '' ? Number(minRaw) : undefined;
      const max =
        maxRaw !== undefined && maxRaw !== '' ? Number(maxRaw) : undefined;

      nftFilter.price = {};

      if (
        (minRaw !== undefined && minRaw !== '' && isNaN(min)) ||
        (maxRaw !== undefined && maxRaw !== '' && isNaN(max)) ||
        (min !== undefined && max !== undefined && min > max)
      ) {
        return res.status(400).json({
          error:
            "Invalid priceRange format. Use 'min-max' with numeric values, and min must be less than or equal to max.",
        });
      }

      if (min !== undefined) nftFilter.price.$gte = min;
      if (max !== undefined) nftFilter.price.$lte = max;
    }

    if (category) {
      const stories = await Story.find(
        { genre: category.toLowerCase() },
        { _id: 1 }
      ).lean();

      const storyIds = stories.map((s) => s._id);

      if (storyIds.length === 0) {
        return res.json({
          data: [],
          pagination: { page, limit, total: 0, pages: 0 },
        });
      }

      nftFilter.storyId = { $in: storyIds };
    }

    const total = await Nft.countDocuments(nftFilter);

    const nfts = await Nft.find(nftFilter)
      .sort({ mintedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('storyId', 'title genre author')
      .lean();

    return res.json({
      data: nfts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching NFTs', {
      requestId: req.id,
      component: 'nft',
    });

    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/v1/nft/mint
 */
router.post('/mint', authRequired, async (req, res) => {
  try {
    const {
      storyId,
      metadataURI,
      metadata,
      price = 0,
      royaltyPercentage: rawRoyalty = 5,
      creatorWallet,
    } = req.body;

    const royaltyPercentage = Number(rawRoyalty);
    if (!Number.isFinite(royaltyPercentage)) {
      return res
        .status(400)
        .json({ error: 'royaltyPercentage must be a valid number' });
    }

    if (!storyId || !metadataURI) {
      return res
        .status(400)
        .json({ error: 'storyId and metadataURI are required' });
    }

    if (
      metadata &&
      (typeof metadata !== 'object' || Object.keys(metadata).length === 0)
    ) {
      return res
        .status(400)
        .json({ error: 'metadata must be a valid JSON object if provided' });
    }

    if (!mongoose.Types.ObjectId.isValid(storyId)) {
      return res.status(400).json({ error: 'Invalid storyId' });
    }

    const tokenId = uuidv4();

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    const storyHash = ethers.keccak256(ethers.toUtf8Bytes(story.content));

    const walletAddr = creatorWallet || story.authorWallet || null;

    const nft = new Nft({
      tokenId,
      storyId,
      storyHash,
      metadataURI,
      metadata,
      mintedAt: new Date(),
      mintedBy: req.user.id,
      owner: req.user.id,
      price,
      isListed: false,
      royaltyPercentage: Math.min(50, Math.max(0, royaltyPercentage)),
      royaltyRecipient: walletAddr,
    });

    await nft.save();

    const walletRegex = /^0x[a-fA-F0-9]{40}$/;
    try {
      if (walletAddr && walletRegex.test(walletAddr)) {
        const config = await RoyaltyConfig.create({
          nftId: nft._id,
          storyId: story._id,
          creatorWallet: walletAddr.toLowerCase(),
          royaltyPercentage: nft.royaltyPercentage,
          isActive: true,
        });
        nft.royaltyConfigId = config._id;
        await nft.save();
      } else if (walletAddr) {
        logger.warn('Invalid creatorWallet format, skipping royalty config', {
          requestId: req.id,
          component: 'nft-royalty',
          nftId: nft._id,
        });
      }
    } catch (royaltyError) {
      logger.error('Failed to create royalty config (non-critical)', {
        requestId: req.id,
        component: 'nft-royalty',
        nftId: nft._id,
        error: royaltyError.message,
      });
    }

    return res.status(201).json(nft);
  } catch (error) {
    logger.error('Error minting NFT', {
      requestId: req.id,
      component: 'nft',
      storyId: req.body.storyId,
      userId: req.user?.id,
    });

    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/v1/nft/burn/:Id
 */
router.delete('/burn/:Id', authRequired, async (req, res) => {
  try {
    const tokenId = req.params.Id;

    if (!tokenId) {
      return res.status(400).json({ error: 'Token ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(tokenId)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const nft = await Nft.findById(tokenId);

    if (!nft) {
      return res.status(404).json({ error: 'NFT not found' });
    }

    if (nft.owner.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: 'You are not the owner of this NFT' });
    }

    await nft.deleteOne();

    return res.json({
      message: `NFT with tokenId ${tokenId} has been burned successfully.`,
    });
  } catch (error) {
    logger.error('Error burning NFT', {
      requestId: req.id,
      component: 'nft',
      tokenId: req.params.Id,
      userId: req.user?.id,
    });

    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/v1/nft/list/:tokenId
 */
router.patch('/list/:tokenId', authRequired, async (req, res) => {
  try {
    const price = Number(req.body.price);
    if (!Number.isFinite(price) || price < 0) {
      return res
        .status(400)
        .json({ error: 'Invalid price or price is missing' });
    }

    const tokenId = req.params.tokenId;
    if (!tokenId) {
      return res.status(400).json({ error: 'Token ID is required' });
    }

    const nft = await Nft.findOne({ tokenId });
    if (!nft) {
      return res.status(404).json({ error: 'NFT not found' });
    }

    if (nft.owner.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: 'You are not the owner of this NFT' });
    }

    if (nft.isListed) {
      return res.status(400).json({ error: 'NFT is already listed' });
    }

    nft.isListed = true;
    nft.price = price;
    await nft.save();

    return res.json({
      message: `NFT with tokenId ${tokenId} is now listed for sale at price ${price}.`,
      nft,
    });
  } catch (error) {
    logger.error('Error listing NFT', {
      requestId: req.id,
      component: 'nft',
      tokenId: req.params.tokenId,
      userId: req.user?.id,
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
