const express = require('express');
const router = express.Router();
const axios = require('axios');
const logger = require('../utils/logger');

// Proxy requests to Cloudflare Worker

/**
 * @swagger
 * /api/feed:
 *   get:
 *     tags:
 *       - Feed
 *     summary: Get public story feed
 *     description: Retrieves a paginated feed of published stories, proxied from the Cloudflare D1 database via the CF Worker.
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
 *                         type: array
 *                         items:
 *                           type: string
 *                       author_name:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       502:
 *         description: Failed to fetch feed from upstream Worker.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', async (req, res) => {
    try {
        const workerUrl = process.env.CF_WORKER_URL || 'https://groqtales-backend-workers.mantejsingh.workers.dev';

        // Parse query params to pass along
        const limit = req.query.limit || 6;
        const page = req.query.page || 1;

        // Make request to CF Worker
        const response = await axios.get(`${workerUrl}/api/feed?limit=${limit}&page=${page}`, {
            validateStatus: false, // Allow any status code
            timeout: 10000 // 10 second timeout
        });

        res.status(response.status).json(response.data);
    } catch (error) {
        const errMsg = error.message || error.code || 'Unknown error';
        logger.error(`Error fetching feed from Worker: ${errMsg}`);
        res.status(502).json({ error: 'Failed to fetch feed', message: errMsg });
    }
});

module.exports = router;
