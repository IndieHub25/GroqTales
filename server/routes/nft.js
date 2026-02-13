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

const { authRequired } = require('../middleware/auth');

// NFT Endpoints

/**
 * @swagger
 * /api/v1/nft:
 *   get:
 *     tags:
 *       - NFT
 *     summary: Get nft list
 *     description: Returns a paginated list of nfts with optional filtering by category adn pricerange.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         required: false
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         required: false
 *         description: Number of stories per page.
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter stories by genre.
 *       - in: query
 *         name: priceRange
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter nfts by pricerange.
 *     responses:
 *       200:
 *         description: NFTs retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   description: List of nfts
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       500:
 *         description: Internal server error.
 */
// GET /api/v1/nft - Get all NFTs with optional filters: category (genre), priceRange
router.get('/', async (req, res) => {
  try {
    // Parse query params with defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { category, priceRange } = req.query;

    // if (!category && !priceRange) {
    //   return res.status(400).json({ error: "At least one filter (category or priceRange) must be provided" });
    // }

    // Build filter query
    let nftFilter = {};

    // Filter on priceRange if provided (expected format "min-max", e.g. "10-100")
    if (priceRange) {
      const [minRaw, maxRaw] = priceRange.split('-');
      const min =
        minRaw !== undefined && minRaw !== '' ? Number(minRaw) : undefined;
      const max =
        maxRaw !== undefined && maxRaw !== '' ? Number(maxRaw) : undefined;
      nftFilter.price = {};
      // Validate both bounds are present, numeric, and min <= max
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

    // If category (genre) filter provided, need to lookup Stories matching genre and filter NFTs by storyId
    if (category) {
      // Find story IDs matching genre (case insensitive)
      const stories = await Story.find(
        { genre: category.toLowerCase() },
        { _id: 1 }
      ).lean();
      const storyIds = stories.map((s) => s._id);

      // If no stories found for category, return empty results early
      if (storyIds.length === 0) {
        return res.json({
          data: [],
          pagination: { page, limit, total: 0, pages: 0 },
        });
      }

      nftFilter.storyId = { $in: storyIds };
    }

    // Query NFTs with filters, pagination & populate story info (optional)
    const total = await Nft.countDocuments(nftFilter);

    const nfts = await Nft.find(nftFilter)
      .sort({ mintedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('storyId', 'title genre author')
      // Look up the Story document referenced by storyId
      // Replace storyId field in the NFT object with an object
      // containing only the title, genre, and author fields from the Story document
      .lean();
    // Just give me plain JavaScript objects — skip the extra Mongoose document

    // Build response
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
 * @swagger
 * /api/v1/nft/mint:
 *   post:
 *     tags:
 *       - NFT
 *     summary: Mint nft
 *     description: Mints a nft with given details
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *             type: object
 *             required:
 *                - storyId
 *                - metadataURI
 *                - metadata
 *             properties:
 *                storyId:
 *                  type: string
 *                metadataURI:
 *                  type: string
 *                metadata:
 *                  type: string
 *                price:
 *                  type: integer
 *                  default: 0
 *     responses:
 *       200:
 *         description: NFTs minted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Internal server error.
 */
// POST /api/v1/nft/mint
router.post('/mint', authRequired, async (req, res) => {
  try {
    const { storyId, metadataURI, metadata, price = 0 } = req.body;

    // Basic validation
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

    // Validate ObjectId format for storyId
    if (!mongoose.Types.ObjectId.isValid(storyId)) {
      return res.status(400).json({ error: 'Invalid storyId' });
    }

    // Generate unique tokenId (e.g., increment or use a UUID lib - here simple timestamp + random)
    const tokenId = uuidv4();

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    // Calculate keccak256 hash of story content (using ethers v6 API)
    const storyHash = ethers.keccak256(ethers.toUtf8Bytes(story.content));

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
    });

    await nft.save();

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
 * @swagger
 * /api/v1/nft/burn/{id}:
 *   delete:
 *     tags:
 *       - NFT
 *     summary: burn nft
 *     description: burns a nft with given id
 *     security:
 *      - BearerAuth: []
 *     parameters:
 *        - in: path
 *          name: id
 *          schema:
 *            type: string
 *          required: true
 *          deafult: 0
 *     responses:
 *       200:
 *         description: NFTs burned successfully.
 *       500:
 *         description: Internal server error.
 */
// DELETE /api/v1/nft/burn/:Id
router.delete('/burn/:Id', authRequired, async (req, res) => {
  try {
    const tokenId = req.params.Id;

    if (!tokenId) {
      return res.status(400).json({ error: 'Token ID is required' });
    }

    // Find the NFT by tokenId
    if (!mongoose.Types.ObjectId.isValid(tokenId)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const nft = await Nft.findById(tokenId);

    if (!nft) {
      return res.status(404).json({ error: 'NFT not found' });
    }

    // Optional: Add ownership check here if you have user auth
    if (nft.owner.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: 'You are not the owner of this NFT' });
    }

    // Delete the NFT document (burn)
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

// NFT Marketplace Endpoints
/**
 * @swagger
 * /api/v1/nft/list/{tokenId}:
 *   patch:
 *     tags:
 *       - NFT
 *     summary: List NFT for sale
 *     description: Lists an NFT for sale by setting its price.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tokenId
 *         required: true
 *         schema:
 *           type: string
 *         description: The token ID of the NFT to list
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - price
 *             properties:
 *               price:
 *                 type: number
 *                 example: 100
 *     responses:
 *       200:
 *         description: NFT listed successfully
 *       400:
 *         description: Invalid input or NFT already listed
 *       403:
 *         description: User is not the owner
 *       404:
 *         description: NFT not found
 *       500:
 *         description: Internal server error
 */
// PATCH /api/v1/nft/list/:tokenId
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

    const nft = await Nft.findOne({ tokenId: tokenId });
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
    // console.log('Error listing NFT:', error);
    logger.error('Error listing NFT', {
      requestId: req.id,
      component: 'nft',
      tokenId: req.params.tokenId,
      userId: req.user?.id,
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/nft/remove/{tokenId}:
 *   patch:
 *     tags:
 *       - NFT
 *     summary: remove NFT from sale
 *     description: removes an NFT from sale
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tokenId
 *         required: true
 *         schema:
 *           type: string
 *         description: The token ID of the NFT to remove
 *     responses:
 *       200:
 *         description: NFT removed successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: User is not the owner
 *       404:
 *         description: NFT not found
 *       500:
 *         description: Internal server error
 */
// PATCH /api/v1/nft/remove/:tokenId
router.patch('/remove/:tokenId', authRequired, async (req, res) => {
  try {
    const tokenId = req.params.tokenId;
    if (!tokenId) {
      return res.status(400).json({ error: 'Token ID is required' });
    }
    const nft = await Nft.findOne({ tokenId: tokenId, isListed: true });
    if (!nft) {
      return res.status(404).json({ error: 'NFT not found' });
    }
    if (nft.owner.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: 'You are not the owner of this NFT' });
    }
    nft.isListed = false;
    nft.price = 0;

    await nft.save();
    return res.json({
      message: `NFT with tokenId ${tokenId} has been removed from listing.`,
      nft,
    });
  } catch (error) {
    // console.log('Error removing NFT from listing:', error);
    logger.error('Error removing NFT', {
      requestId: req.id,
      component: 'nft',
      tokenId: req.params.tokenId,
      userId: req.user?.id,
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/nft/buy/{tokenId}:
 *   patch:
 *     tags:
 *       - NFT
 *     summary: buy NFT from sale
 *     description: buys an NFT from sale
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tokenId
 *         required: true
 *         schema:
 *           type: string
 *         description: The token ID of the NFT to buy
 *     responses:
 *       200:
 *         description: NFT bought successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: User is not the owner
 *       404:
 *         description: NFT not found
 *       500:
 *         description: Internal server error
 */
// PATCH /api/v1/nft/buy/:tokenId
router.patch('/buy/:tokenId', authRequired, async (req, res) => {
  try {
    const tokenId = req.params.tokenId;
    if (!tokenId) {
      return res.status(400).json({ error: 'Token ID is required' });
    }
    const nft = await Nft.findOne({ tokenId: tokenId, isListed: true });
    if (!nft) {
      return res.status(404).json({ error: 'NFT not found' });
    }

    if (nft.owner.toString() === req.user.id) {
      return res.status(400).json({ error: 'You already own this NFT' });
    }

    nft.owner = req.user.id;
    nft.isListed = false;

    await nft.save();

    return res.json({
      message: `NFT with tokenId ${tokenId} has been bought from listing.`,
      nft,
    });
  } catch (error) {
    // console.log('Error buying NFT from listing:', error);
    logger.error('Error buying NFT', {
      requestId: req.id,
      component: 'nft',
      tokenId: req.params.tokenId,
      userId: req.user?.id,
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/nft/update-price/{tokenId}:
 *   patch:
 *     tags:
 *       - NFT
 *     summary: Update price of alisted nft
 *     description: Updates the price of a listed nft
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tokenId
 *         required: true
 *         schema:
 *           type: string
 *         description: The token ID of the NFT to update price
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - price
 *             properties:
 *               price:
 *                 type: number
 *                 example: 100
 *     responses:
 *       200:
 *         description: NFT price updated successfully
 *       400:
 *         description: Invalid input of price is missing
 *       403:
 *         description: User is not the owner
 *       404:
 *         description: NFT not found
 *       500:
 *         description: Internal server error
 */
// PATCH /api/v1/nft/update-price/:tokenId
router.patch('/update-price/:tokenId', authRequired, async (req, res) => {
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
    const nft = await Nft.findOne({
      tokenId: tokenId,
      isListed: true,
    });
    if (!nft) {
      return res.status(404).json({ error: 'NFT not found' });
    }
    if (nft.owner.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: 'You are not the owner of this NFT' });
    }

    nft.price = price;

    await nft.save();

    return res.json({
      message: `NFT proce with tokenId ${tokenId} has been updated.`,
      nft,
    });
  } catch (error) {
    // console.log('Error updating NFT price from listing:', error);
    logger.error('Error updating priceo of NFT', {
      requestId: req.id,
      component: 'nft',
      tokenId: req.params.tokenId,
      userId: req.user?.id,
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
