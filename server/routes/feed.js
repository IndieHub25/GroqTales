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

        // Parse pagination and filter params
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 6));
        const genre = req.query.genre ? String(req.query.genre).trim() : null;
        const offset = (page - 1) * limit;

        // Build query
        let query = supabaseAdmin
            .from('stories')
            .select('id, title, description, genre, content, views, likes, created_at, author_id, cover_image_url', 
                    { count: 'exact' });

        // Filter by genre if provided
        if (genre) {
            query = query.eq('genre', genre);
        }

        // Filter for published/approved stories only
        query = query.eq('moderation_status', 'approved');

        // Order by newest first
        query = query.order('created_at', { ascending: false });

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data: stories, error: storiesError, count } = await query;

        if (storiesError) {
            logger.error('Feed query error:', storiesError);
            return res.status(500).json({ error: 'Failed to fetch feed' });
        }

        // Fetch author profiles for each story
        let formattedStories = [];
        if (stories && stories.length > 0) {
            const authorIds = [...new Set(stories.map(s => s.author_id))];
            const { data: profiles, error: profilesError } = await supabaseAdmin
                .from('profiles')
                .select('id, username, display_name, avatar_url')
                .in('id', authorIds);

            if (!profilesError && profiles) {
                const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]));
                formattedStories = stories.map(story => ({
                    id: story.id,
                    title: story.title,
                    description: story.description,
                    genre: story.genre,
                    views: story.views || 0,
                    likes: story.likes || 0,
                    created_at: story.created_at,
                    cover_image_url: story.cover_image_url,
                    author_id: story.author_id,
                    author_name: profileMap[story.author_id]?.display_name || 
                                  profileMap[story.author_id]?.username || 
                                  'Anonymous',
                    author_avatar: profileMap[story.author_id]?.avatar_url || null,
                }));
            } else {
                // Fallback if profile fetch fails
                formattedStories = stories.map(story => ({
                    id: story.id,
                    title: story.title,
                    description: story.description,
                    genre: story.genre,
                    views: story.views || 0,
                    likes: story.likes || 0,
                    created_at: story.created_at,
                    cover_image_url: story.cover_image_url,
                    author_id: story.author_id,
                    author_name: 'Anonymous',
                    author_avatar: null,
                }));
            }
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
