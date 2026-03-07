/**
 * AI Story Generation Endpoint
 * POST /api/v1/ai/generate
 * 
 * Generates stories using the Chairman pattern orchestration.
 * Supports both streaming (SSE) and batch responses.
 */

const express = require('express');
const router = express.Router();
const { orchestrateGeneration } = require('../services/ai-orchestrator');

const logger = require('../utils/logger');

/**
 * @swagger
 * /api/v1/ai/generate:
 *   post:
 *     tags:
 *       - AI
 *     summary: Generate story using AI orchestration
 *     description: |
 *       Generates a complete story with Gemini (chairman) and optional Groq subtasks.
 *       Supports:
 *       - Prose story generation
 *       - Comic panel breakdown
 *       - Hybrid story+comic generation
 *       - Streaming or batch response modes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userInput:
 *                 type: string
 *                 description: User-provided premise, prompt, or additional context
 *               config:
 *                 type: object
 *                 description: AI Story Studio configuration (90+ parameters)
 *               streaming:
 *                 type: boolean
 *                 default: true
 *                 description: Enable SSE streaming response
 *               responseFormat:
 *                 type: string
 *                 enum: [json, markdown, html]
 *                 default: markdown
 *                 description: Output format preference
 *     responses:
 *       200:
 *         description: Story generated successfully
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               description: Server-sent events with generation chunks
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GeneratedStory'
 *       400:
 *         description: Invalid request body or configuration
 *       500:
 *         description: Generation failed
 */

router.post('/', async (req, res) => {
    const correlationId = req.correlationId || `gen-${Date.now()}`;
    const startTime = Date.now();

    try {
        // ─────────────────────────────────────────────────────────────
        // PARSE & VALIDATE REQUEST
        // ─────────────────────────────────────────────────────────────

        const { userInput = '', config = {}, streaming = true } = req.body;

        if (typeof userInput !== 'string') {
            return res.status(400).json({
                error: 'Invalid request',
                details: 'userInput must be a string',
            });
        }

        if (typeof config !== 'object') {
            return res.status(400).json({
                error: 'Invalid request',
                details: 'config must be an object',
            });
        }

        logger.info(`[${correlationId}] Generation request received`, {
            hasInput: userInput.length > 0,
            mode: config.mode,
            genre: config.primaryGenre,
            streaming,
        });

        // ─────────────────────────────────────────────────────────────
        // VALIDATE CONFIG (optional, warn on issues)
        // ─────────────────────────────────────────────────────────────

        // Basic validation — don't fail on missing optional fields
        if (!config.mode || !['story-only', 'story-comic', 'comic-only'].includes(config.mode)) {
            config.mode = 'story-only'; // Default
        }

        if (!config.primaryGenre) {
            config.primaryGenre = 'fantasy'; // Default
        }

        // ─────────────────────────────────────────────────────────────
        // SETUP RESPONSE HANDLING
        // ─────────────────────────────────────────────────────────────

        if (streaming) {
            // SSE streaming response
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.setHeader('Access-Control-Allow-Origin', '*');

            const sendChunk = (data) => {
                if (!res.headersSent) {
                    res.writeHead(200, {
                        'Content-Type': 'text/event-stream',
                        'Cache-Control': 'no-cache',
                        'Connection': 'keep-alive',
                        'Access-Control-Allow-Origin': '*',
                    });
                }
                res.write(`data: ${JSON.stringify(data)}\n\n`);
            };

            try {
                const result = await orchestrateGeneration({
                    userInput,
                    config,
                    streaming: true,
                    onChunk: sendChunk,
                    correlationId,
                });

                // Send final result
                sendChunk({
                    type: 'complete',
                    result,
                });

                logger.info(`[${correlationId}] Streaming response complete`, {
                    duration: Date.now() - startTime,
                });

                res.end();
            } catch (error) {
                logger.error(`[${correlationId}] Streaming generation error: ${error.message}`, {
                    stack: error.stack,
                });

                sendChunk({
                    type: 'error',
                    error: error.message,
                });

                res.end();
            }
        } else {
            // Batch (non-streaming) response
            try {
                const result = await orchestrateGeneration({
                    userInput,
                    config,
                    streaming: false,
                    correlationId,
                });

                logger.info(`[${correlationId}] Batch generation complete`, {
                    duration: Date.now() - startTime,
                    wordCount: result.wordCount || 0,
                });

                return res.json({
                    success: true,
                    data: result,
                    requestId: correlationId,
                });
            } catch (error) {
                logger.error(`[${correlationId}] Batch generation error: ${error.message}`, {
                    stack: error.stack,
                });

                return res.status(500).json({
                    success: false,
                    error: 'Generation failed',
                    details: error.message,
                    requestId: correlationId,
                });
            }
        }
    } catch (error) {
        logger.error(`[${correlationId}] Unexpected error: ${error.message}`, {
            stack: error.stack,
        });

        if (!res.headersSent) {
            res.status(500).json({
                error: 'Unexpected error',
                details: error.message,
                requestId: correlationId,
            });
        }
    }
});

module.exports = router;
