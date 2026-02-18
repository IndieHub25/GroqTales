/**
 * Stories API Routes
 * Handles story generation, analysis, and management endpoints
 */

const express = require('express');
const router = express.Router();
const Story = require('../models/Story');
const { authRequired } = require('../middleware/auth');

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
    const { page = 1, limit = 10, genre, author } = req.query;
    const query = {};

    if (genre) query.genre = genre;
    if (author) query.author = author;

    const stories = await Story.find(query)
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
    const { title, content, genre } = req.body;

    const story = new Story({
      title,
      content,
      genre,
      author: req.user.id,
    });

    await story.save();

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

module.exports = router;
