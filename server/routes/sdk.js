/**
 * SDK API Routes
 * Handles SDK endpoints for external integrations and developers
 */

const express = require('express');
const router = express.Router();

// GET /sdk/v1/health - SDK health check
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    sdk_version: process.env.SDK_VERSION || 'v1.0.0',
    timestamp: new Date().toISOString(),
  });
});

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
