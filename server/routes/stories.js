/**
 * Stories API Routes
 * Handles story generation, analysis, and management endpoints
 */

const express = require('express');
const router = express.Router();
const Story = require('../models/Story');
const { authRequired } = require('../middleware/auth');

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

// POST /api/v1/stories/create - Create new story
router.post('/create',authRequired, async (req, res) => {
  try {
    const { title, content, genre, author } = req.body;

    const story = new Story({
      title,
      content,
      genre,
      author,
    });

    await story.save();

    return res.status(201).json(story);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

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
