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

// POST /api/v1/nft/mint
router.post('/mint', authRequired, async (req, res) => {
  try {
    const { storyId, metadataURI, metadata, price = 0, royaltyPercentage: rawRoyalty = 5, creatorWallet } = req.body;

    // Validate royaltyPercentage is a valid number
    const royaltyPercentage = Number(rawRoyalty);
    if (!Number.isFinite(royaltyPercentage)) {
      return res.status(400).json({ error: 'royaltyPercentage must be a valid number' });
    }

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
    console.error('Error listing NFT:', error);
    return res.status(500).json({ error: error.message });
  }
});

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
    console.error('Error removing NFT from listing:', error);
    return res.status(500).json({ error: error.message });
  }
});

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

    const previousOwner = nft.owner;
    const salePrice = nft.price;

    nft.owner = req.user.id;
    nft.isListed = false;

    await nft.save();

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

    return res.json({
      message: `NFT with tokenId ${tokenId} has been bought from listing.`,
      nft,
    });
  } catch (error) {
    console.error('Error buying NFT from listing:', error);
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/v1/nft/update-price/:tokenId
router.patch('/update-price/:tokenId', authRequired, async (req, res) => {
  try {
    const price = req.body.price;
    if (price === undefined || isNaN(price) || price < 0) {
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
    console.error('Error updating NFT price from listing:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
