/**
 * Feed API Route — Supabase
 * Serves the public story feed directly from Supabase PostgreSQL
 */

const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const logger = require('../utils/logger');

/**
 * @swagger
 * /api/feed:
 *   get:
 *     tags:
 *       - Feed
 *     summary: Get public story feed
 *     description: |
 *       Retrieves a paginated feed of published stories directly from Supabase PostgreSQL.
 *       Stories are ordered by creation date (newest first) and include author profile data.
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 6
 *         description: Number of stories to return.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Optional genre filter.
 *     responses:
 *       200:
 *         description: Feed retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       genre:
 *                         type: string
 *                       author_name:
 *                         type: string
 *                       author_avatar:
 *                         type: string
 *                       views:
 *                         type: integer
 *                       likes:
 *                         type: integer
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *       500:
 *         description: Failed to fetch feed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', async (req, res) => {
    try {
        if (!supabaseAdmin) {
            return res.status(503).json({ error: 'Database not configured' });
        }

        return res.json({
            stories: formattedStories,
            pagination: {
                page,
                limit,
                total: count || 0,
                pages: Math.ceil((count || 0) / limit),
            },
        });
    } catch (error) {
        const errMsg = error.message || 'Unknown error';
        logger.error(`Error fetching feed: ${errMsg}`);
        res.status(500).json({ error: 'Failed to fetch feed', message: errMsg });
    }
});

module.exports = router;
