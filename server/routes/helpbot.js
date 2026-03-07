/**
 * Helpbot API Route
 * POST /api/helpbot/chat — MADHAVA help-bot (proxies to CF Worker)
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const logger = require('../utils/logger');

// Proxy requests to Cloudflare Worker Helpbot

/**
 * @swagger
 * /api/helpbot/chat:
 *   post:
 *     tags:
 *       - Helpbot
 *     summary: Chat with MADHAVA AI helpbot
 *     description: Sends a user message to the MADHAVA AI helpbot running on Cloudflare Workers AI and returns the bot's response.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 maxLength: 2000
 *                 example: "How do I create a story on GroqTales?"
 *               history:
 *                 type: array
 *                 description: Previous conversation turns for context (max 10).
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, assistant]
 *                     content:
 *                       type: string
 *     responses:
 *       200:
 *         description: Bot response returned successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                   example: "To create a story, navigate to the Create page and..."
 *       500:
 *         description: Failed to communicate with the helpbot.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/chat', async (req, res) => {
    try {
        const workerUrl = process.env.CF_WORKER_URL || 'https://groqtales-backend-workers.mantejsingh.workers.dev';

        const response = await axios.post(`${workerUrl}/api/helpbot/chat`, req.body, {
            validateStatus: false
        });

        res.status(response.status).json(response.data);
    } catch (error) {
        logger.error('Error proxying helpbot chat to Worker:', error.message);
        res.status(500).json({ error: 'Failed to communicate with Helpbot' });
    }
});

module.exports = router;
