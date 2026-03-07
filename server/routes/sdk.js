/**
 * SDK API Routes
 * Handles SDK endpoints for external integrations and developers
 */

const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /sdk/v1/health:
 *   get:
 *     tags:
 *       - SDK
 *     summary: SDK health check
 *     description: Returns SDK service health and version information.
 *     responses:
 *       200:
 *         description: SDK is healthy.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 sdk_version:
 *                   type: string
 *                   example: v1.0.0
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
// GET /sdk/v1/health - SDK health check
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    sdk_version: process.env.SDK_VERSION || 'v1.0.0',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @swagger
 * /sdk/v1/docs:
 *   get:
 *     tags:
 *       - SDK
 *     summary: SDK documentation index
 *     description: Returns SDK metadata, available endpoints, and a link to full documentation.
 *     responses:
 *       200:
 *         description: SDK docs returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: GroqTales SDK
 *                 version:
 *                   type: string
 *                   example: v1.0.0
 *                 description:
 *                   type: string
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     stories:
 *                       type: string
 *                     ai:
 *                       type: string
 *                     nft:
 *                       type: string
 *                 documentation:
 *                   type: string
 *                   format: uri
 */
// GET /sdk/v1/docs - SDK documentation
router.get('/docs', (req, res) => {
  res.json({
    name: 'GroqTales SDK',
    version: process.env.SDK_VERSION || 'v1.0.0',
    description: 'SDK for integrating GroqTales AI storytelling capabilities',
    endpoints: {
      stories: '/sdk/v1/stories',
      ai: '/sdk/v1/ai',
      nft: '/sdk/v1/nft',
    },
    documentation: 'https://docs.groqtales.com/sdk',
  });
});

// SDK wrapper endpoints
router.use('/stories', require('./stories'));
router.use('/ai', require('./ai'));
router.use('/nft', require('./nft'));

module.exports = router;
