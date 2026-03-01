/**
 * Stories API Routes
 * Handles story generation, analysis, and management endpoints
 */

const express = require('express');
const router = express.Router();
const Story = require('../models/Story');
const { authRequired } = require('../middleware/auth');
const axios = require('axios');

/**
 * @swagger
 * /api/v1/stories:
 *   get:
 *     tags:
 *       - Stories
 *     summary: Get stories list
 *     description: Returns a paginated list of stories with optional filtering by genre and author.
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
 *         name: genre
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter stories by genre.
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter stories by author.
 *     responses:
 *       200:
 *         description: Stories retrieved successfully.
 *         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 data:
*                   type: array
*                   description: List of stories
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
// GET /api/v1/stories - Get all stories
router.get('/', async (req, res) => {
  try {
    const { genre, author, status } = req.query;
    let page = parseInt(req.query.page, 10);
    if (isNaN(page) || page < 1) page = 1;
    let limit = parseInt(req.query.limit, 10);
    if (isNaN(limit) || limit < 1) limit = 10;
    limit = Math.min(limit, 100);
    const query = {};

    if (genre) query.genre = String(genre);
    if (author) query.author = String(author);
    // Check if user is authenticated admin to allow status override
    let isAdmin = false;
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (token) {
      try {
        const { verifyAccessToken } = require('../utils/jwt.js');
        const decoded = verifyAccessToken(token);
        if (decoded && decoded.role === 'admin') {
          isAdmin = true;
        }
      } catch (err) { }
    }

    if (isAdmin && status && ['pending', 'approved', 'rejected'].includes(String(status))) {
      query.moderationStatus = String(status);
    } else {
      query.moderationStatus = 'approved';
    }

    const stories = await Story.find(query)
      .populate('author', 'username avatar firstName lastName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const count = await Story.countDocuments(query);

    return res.json({
      data: stories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/stories/create:
 *   post:
 *     tags:
 *       - Stories
 *     summary: Create a new story
 *     description: Creates a new story and returns the created story object.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 required: true
 *               content:
 *                 type: string
 *                 required: true
 *               genre:
 *                 type: string
 *                 required: true
 *     responses:
 *       201:
 *         description: Story created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Internal server error.
 */
// POST /api/v1/stories/create - Create new story
router.post('/create', authRequired, async (req, res) => {
  try {
    const { title, content, genre, tags } = req.body;
    let validTags = [];
    if (tags !== undefined) {
      if (!Array.isArray(tags)) {
        return res.status(400).json({ error: 'tags must be an array' });
      }
      validTags = tags;
    }

    const story = new Story({
      title,
      content,
      genre,
      author: req.user.id,
      tags: validTags,
      moderationStatus: 'pending',
    });

    await story.save();

    // Synchronize to Cloudflare D1 database
    try {
      const workerUrl = process.env.CF_WORKER_URL || 'https://groqtales-backend.groqtales.workers.dev';
      // req.user.id or req.user.sub depending on JWT issuer
      const authorId = req.user.sub || req.user.id;

      await axios.post(`${workerUrl}/api/stories`, {
        title,
        content,
        genre: [genre], // assuming D1 expects tags/genres as array maybe
      }, {
        headers: {
          'Authorization': `Bearer ${authorId}`
        }
      });
    } catch (cfError) {
      console.error('Failed to sync story to Cloudflare DB:', cfError.message);
      // We don't throw here to ensure Mongo save isn't rolled back since it succeeded, 
      // but in a robust system this could be handled with a message queue.
    }

    return res.status(201).json(story);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/stories/search/{id}:
 *   get:
 *     tags:
 *       - Stories
 *     summary: get stories by id
 *     description: retunns the story of u=the given id
 *     security:
 *        - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stories retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Internal server error.
 */
// GET /api/v1/stories/search/:id - Get story by ID
router.get('/search/:id', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id).lean();

    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    return res.json(story);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/stories/generate - Generate story with AI
router.post('/generate', authRequired, async (req, res) => {
  try {
    const { prompt, genre, length, style } = req.body;

    // Placeholder implementation - integrate with Groq API
    // This part remains a placeholder as per "What Remains to be Done"
    const generatedStory = {
      id: Date.now().toString(),
      title: 'AI Generated Story',
      content: 'Generated story content based on prompt...',
      genre,
      metadata: {
        prompt,
        length,
        style,
        generatedAt: new Date().toISOString(),
      },
    };

    return res.json(generatedStory);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/stories/:id/analyze - Analyze story content
router.post('/:id/analyze', authRequired, async (req, res) => {
  try {
    const { id } = req.params;

    // Placeholder implementation - integrate with analysis service
    const analysis = {
      storyId: id,
      sentiment: 'positive',
      themes: ['adventure', 'friendship'],
      readabilityScore: 8.5,
      wordCount: 1500,
      analyzedAt: new Date().toISOString(),
    };

    return res.json(analysis);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/v1/stories/:id/moderate - Moderate a story (admin only)
router.patch('/:id/moderate', authRequired, async (req, res) => {
  try {
    // Check if user is admin
    const user = await require('../models/User').findById(req.user.id).lean();
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { status, notes } = req.body;
    // Coerce status to string and validate against an allowlist to prevent NoSQL injection
    const sanitizedStatus = typeof status === 'string' ? status : String(status);
    if (!['approved', 'rejected'].includes(sanitizedStatus)) {
      return res.status(400).json({ error: 'Status must be approved or rejected' });
    }

    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    // Coerce notes to string to prevent NoSQL injection via object payloads
    const sanitizedNotes = typeof notes === 'string' ? notes.slice(0, 2000) : '';

    const story = await Story.findByIdAndUpdate(
      req.params.id,
      {
        moderationStatus: sanitizedStatus,
        moderatorId: req.user.id,
        moderationNotes: sanitizedNotes,
      },
      { new: true }
    ).lean();

    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    return res.json({ success: true, data: story });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
