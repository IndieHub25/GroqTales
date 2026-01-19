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

const Nft = require('../models/Nft');
const Story = require('../models/Story');

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
      const min = minRaw !== undefined && minRaw !== '' ? Number(minRaw) : undefined;
      const max = maxRaw !== undefined && maxRaw !== '' ? Number(maxRaw) : undefined;
      nftFilter.price = {};
      // Validate both bounds are present, numeric, and min <= max
      if (
        (minRaw !== undefined && minRaw !== '' && isNaN(min)) ||
        (maxRaw !== undefined && maxRaw !== '' && isNaN(max)) ||
        (min !== undefined && max !== undefined && min > max)
      ) {
        return res
          .status(400)
          .json({
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
    res.json({
      data: nfts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/mint', async (req, res) => {
  try {
    const { storyId, metadataURI, metadata, price = 0 } = req.body;

    // Basic validation
    if (!storyId || !metadataURI) {
      return res
        .status(400)
        .json({ error: 'storyId and metadataURI are required' });
    }

    if (metadata && (typeof metadata !== 'object' || Object.keys(metadata).length === 0)) {
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
    const storyHash = ethers.keccak256(
      ethers.toUtf8Bytes(story.content)
    );

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

    res.status(201).json(nft);
  } catch (error) {
    console.error('Error minting NFT:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/burn/:Id', async (req, res) => {
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
    // if (nft.owner.toString() !== req.user.id) {
    //   return res.status(403).json({ error: 'You are not the owner of this NFT' });
    // }

    // Delete the NFT document (burn)
    await nft.deleteOne();

    res.json({
      message: `NFT with tokenId ${tokenId} has been burned successfully.`,
    });
  } catch (error) {
    console.error('Error burning NFT:', error);
    res.status(500).json({ error: error.message });
  }
});

// NFT Marketplace Endpoints

// router.patch('list/:Id', async (req, res) => {});

// router.patch('remove/:Id', async (req, res) => {});

// router.patch('/buy/:Id', async (req, res) => {});

// router.patch('/update-price/:Id', async (req, res) => {});

module.exports = router;
