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
<<<<<<< HEAD
=======
const RoyaltyConfig = require('../models/RoyaltyConfig');
const RoyaltyTransaction = require('../models/RoyaltyTransaction');
const CreatorEarnings = require('../models/CreatorEarnings');
>>>>>>> c5e035fd8c574bf110626ad9d85b39c59dd7f2d9

const { authRequired } = require('../middleware/auth');

// NFT Endpoints

<<<<<<< HEAD
=======
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
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
 *       400:
 *         description: Invalid priceRange format.
 *       500:
 *         description: Internal server error.
 */

>>>>>>> c5e035fd8c574bf110626ad9d85b39c59dd7f2d9
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
<<<<<<< HEAD
  
    return res.status(500).json({ error: 'Internal server error' });
  }
  
});
=======

    return res.status(500).json({ error: 'Internal server error' });
  }
});
/**
 * @swagger
 * /api/v1/nft/mint:
 *   post:
 *     tags:
 *       - NFT
 *     summary: Mint NFT
 *     description: Mints a new NFT for a story.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - storyId
 *               - metadataURI
 *             properties:
 *               storyId:
 *                 type: string
 *               metadataURI:
 *                 type: string
 *               metadata:
 *                 type: object
 *               price:
 *                 type: number
 *                 default: 0
 *               royaltyPercentage:
 *                 type: number
 *                 default: 5
 *               creatorWallet:
 *                 type: string
 *     responses:
 *       201:
 *         description: NFT minted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid input.
 *       404:
 *         description: Story not found.
 *       500:
 *         description: Internal server error.
 */
>>>>>>> c5e035fd8c574bf110626ad9d85b39c59dd7f2d9

// POST /api/v1/nft/mint
router.post('/mint', authRequired, async (req, res) => {
  try {
<<<<<<< HEAD
    const { storyId, metadataURI, metadata, price = 0 } = req.body;
=======
    const { storyId, metadataURI, metadata, price = 0, royaltyPercentage: rawRoyalty = 5, creatorWallet } = req.body;

    // Validate royaltyPercentage is a valid number
    const royaltyPercentage = Number(rawRoyalty);
    if (!Number.isFinite(royaltyPercentage)) {
      return res.status(400).json({ error: 'royaltyPercentage must be a valid number' });
    }
>>>>>>> c5e035fd8c574bf110626ad9d85b39c59dd7f2d9

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

<<<<<<< HEAD
=======
    const walletAddr = creatorWallet || story.authorWallet || null;

>>>>>>> c5e035fd8c574bf110626ad9d85b39c59dd7f2d9
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
<<<<<<< HEAD
=======
      royaltyPercentage: Math.min(50, Math.max(0, royaltyPercentage)),
      royaltyRecipient: walletAddr,
>>>>>>> c5e035fd8c574bf110626ad9d85b39c59dd7f2d9
    });

    await nft.save();

<<<<<<< HEAD
=======
    // Create default royalty config for the new NFT (non-critical)
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

>>>>>>> c5e035fd8c574bf110626ad9d85b39c59dd7f2d9
    return res.status(201).json(nft);
  } catch (error) {
    logger.error('Error minting NFT', {
      requestId: req.id,
      component: 'nft',
      storyId: req.body.storyId,
      userId: req.user?.id,
    });
<<<<<<< HEAD
  
=======

>>>>>>> c5e035fd8c574bf110626ad9d85b39c59dd7f2d9
    return res.status(500).json({ error: 'Internal server error' });
  }
  
});

<<<<<<< HEAD
=======
/**
 * @swagger
 * /api/v1/nft/burn/{Id}:
 *   delete:
 *     tags:
 *       - NFT
 *     summary: Burn NFT
 *     description: Deletes (burns) an NFT by ID.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: Id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: NFT burned successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid ID.
 *       403:
 *         description: User is not the owner.
 *       404:
 *         description: NFT not found.
 *       500:
 *         description: Internal server error.
 */
>>>>>>> c5e035fd8c574bf110626ad9d85b39c59dd7f2d9
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
<<<<<<< HEAD
  
    return res.status(500).json({ error: 'Internal server error' });
  }
  
});

// NFT Marketplace Endpoints
=======

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
>>>>>>> c5e035fd8c574bf110626ad9d85b39c59dd7f2d9
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
<<<<<<< HEAD
    console.error('Error listing NFT:', error);
    return res.status(500).json({ error: error.message });
  }
});

=======
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
>>>>>>> c5e035fd8c574bf110626ad9d85b39c59dd7f2d9
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
<<<<<<< HEAD
    console.error('Error removing NFT from listing:', error);
    return res.status(500).json({ error: error.message });
  }
});

=======
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
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sellerWallet:
 *                 type: string
 *                 description: Ethereum wallet address of the seller (for royalty tracking)
 *                 example: "0x1234567890abcdef1234567890abcdef12345678"
 *               buyerWallet:
 *                 type: string
 *                 description: Ethereum wallet address of the buyer (for royalty tracking)
 *                 example: "0xabcdef1234567890abcdef1234567890abcdef12"
 *               txHash:
 *                 type: string
 *                 description: Transaction hash 
 *     responses:
 *       200:
 *         description: NFT bought successfully
 *       400:
 *         description: Invalid input or buyer already owns the NFT
 *       404:
 *         description: NFT not found
 *       500:
 *         description: Internal server error
 */
>>>>>>> c5e035fd8c574bf110626ad9d85b39c59dd7f2d9
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

<<<<<<< HEAD
=======
    const previousOwner = nft.owner;
    const salePrice = nft.price;

>>>>>>> c5e035fd8c574bf110626ad9d85b39c59dd7f2d9
    nft.owner = req.user.id;
    nft.isListed = false;

    await nft.save();

<<<<<<< HEAD
=======
    // Record royalty transaction (non-blocking, non-critical)
    const sellerWallet = req.body.sellerWallet;
    const buyerWallet = req.body.buyerWallet;

    // Validate wallet address format
    const walletRegex = /^0x[a-fA-F0-9]{40}$/;
    const validSeller = sellerWallet && walletRegex.test(sellerWallet);
    const validBuyer = buyerWallet && walletRegex.test(buyerWallet);

    if ((sellerWallet && !validSeller) || (buyerWallet && !validBuyer)) {
      logger.warn('Invalid wallet format, skipping royalty tracking', {
        requestId: req.id,
        component: 'nft-royalty',
        tokenId,
        invalidSeller: sellerWallet && !validSeller,
        invalidBuyer: buyerWallet && !validBuyer,
      });
    } else if (validSeller && validBuyer) {
      try {
        const royaltyConfig = await RoyaltyConfig.findOne({
          nftId: nft._id,
          isActive: true,
        });

        if (royaltyConfig) {
          const royaltyAmount = salePrice * (royaltyConfig.royaltyPercentage / 100);

          // Step 1: Create transaction as pending
          const royaltyTx = await RoyaltyTransaction.create({
            nftId: nft._id,
            salePrice,
            royaltyAmount,
            royaltyPercentage: royaltyConfig.royaltyPercentage,
            sellerWallet: sellerWallet.toLowerCase(),
            buyerWallet: buyerWallet.toLowerCase(),
            creatorWallet: royaltyConfig.creatorWallet,
            txHash: req.body.txHash || null,
            status: 'pending',
          });

          try {
            // Step 2: Update creator earnings atomically
            await CreatorEarnings.findOneAndUpdate(
              { creatorWallet: royaltyConfig.creatorWallet },
              {
                $inc: { totalEarned: royaltyAmount, pendingPayout: royaltyAmount, totalSales: 1 },
                $set: { lastUpdated: new Date() },
              },
              { upsert: true }
            );

            // Step 3: Mark transaction as completed
            royaltyTx.status = 'completed';
            await royaltyTx.save();
          } catch (earningsError) {
            // If earnings update fails, mark transaction as failed
            royaltyTx.status = 'failed';
            await royaltyTx.save();
            logger.error('Royalty earnings update failed', {
              requestId: req.id,
              component: 'nft-royalty',
              transactionId: royaltyTx._id,
              error: earningsError.message,
            });
          }
        }
      } catch (royaltyError) {
        logger.error('Royalty tracking failed (non-critical)', {
          requestId: req.id,
          component: 'nft-royalty',
          tokenId,
          error: royaltyError.message,
        });
      }
    } else {
      logger.warn('Skipping royalty tracking - wallet addresses not provided', {
        requestId: req.id,
        component: 'nft-royalty',
        tokenId,
      });
    }

>>>>>>> c5e035fd8c574bf110626ad9d85b39c59dd7f2d9
    return res.json({
      message: `NFT with tokenId ${tokenId} has been bought from listing.`,
      nft,
    });
  } catch (error) {
<<<<<<< HEAD
    console.error('Error buying NFT from listing:', error);
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/v1/nft/update-price/:tokenId
router.patch('/update-price/:tokenId', authRequired, async (req, res) => {
  try {
    const price = req.body.price;
    if (price === undefined || isNaN(price) || price < 0) {
=======
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
 *     summary: Update price of a listed nft
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
 *         description: Invalid input or price is missing
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
>>>>>>> c5e035fd8c574bf110626ad9d85b39c59dd7f2d9
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
<<<<<<< HEAD
      message: `NFT proce with tokenId ${tokenId} has been updated.`,
      nft,
    });
  } catch (error) {
    console.error('Error updating NFT price from listing:', error);
    return res.status(500).json({ error: error.message });
=======
      message: `NFT price with tokenId ${tokenId} has been updated.`,
      nft,
    });
  } catch (error) {
    // console.log('Error updating NFT price from listing:', error);
    logger.error('Error updating price of NFT', {
      requestId: req.id,
      component: 'nft',
      tokenId: req.params.tokenId,
      userId: req.user?.id,
    });
    return res.status(500).json({ error: 'Internal server error' });
>>>>>>> c5e035fd8c574bf110626ad9d85b39c59dd7f2d9
  }
});

module.exports = router;
