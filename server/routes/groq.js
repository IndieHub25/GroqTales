/**
 * Groq API Routes
 *
 * Endpoints consumed by the frontend use-groq.ts hook.
 * - GET  /api/groq/models  → available models + defaults
 * - POST /api/groq         → multiplexed action handler
 */

const express = require('express');
const router = express.Router();
const groqService = require('../services/groqService');
const { normalizeParam } = require('../utils/paramNormalizer');

/**
 * @swagger
 * /api/groq/models:
 *   get:
 *     tags:
 *       - AI
 *     summary: List available Groq AI models
 *     description: Returns the set of Groq models available for content generation and analysis.
 *     parameters:
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [test]
 *         description: Set to "test" to run a connection test instead.
 *     responses:
 *       200:
 *         description: Model list or test result.
 */
router.get('/models', async (req, res) => {
    try {
        // Connection test mode
        if (req.query.action === 'test') {
            // Reject query parameter API keys (security vulnerability)
            if (req.query.apiKey) {
                return res.status(400).json({
                    error: 'API key must be provided via Authorization header (Bearer token). Query parameter authentication is not supported for security reasons.'
                });
            }

            const authHeader = req.headers.authorization || '';
            const apiKey = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

            const result = await groqService.testConnection(apiKey);
            return res.json(result);
        }

        // Return available models
        res.json({
            models: groqService.MODELS,
            modelNames: groqService.MODEL_DISPLAY_NAMES,
            default: groqService.MODELS.PRIMARY,
            tokenBudgets: groqService.TOKEN_BUDGETS,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/groq:
 *   post:
 *     tags:
 *       - AI
 *     summary: Groq AI action endpoint
 *     description: |
 *       Multiplexed AI endpoint. Set the `action` field to one of:
 *       `generate`, `analyze`, `ideas`, `improve`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [generate, analyze, ideas, improve]
 *               prompt:
 *                 type: string
 *               content:
 *                 type: string
 *               genre:
 *                 type: string
 *               theme:
 *                 type: string
 *               length:
 *                 type: string
 *                 enum: [short, medium, long]
 *               tone:
 *                 type: string
 *               characters:
 *                 type: string
 *               setting:
 *                 type: string
 *               formatType:
 *                 type: string
 *               model:
 *                 type: string
 *               focus:
 *                 type: string
 *               options:
 *                 type: object
 *     responses:
 *       200:
 *         description: Action completed successfully.
 *       400:
 *         description: Invalid action or missing required fields.
 *       500:
 *         description: Internal server error.
 */
router.post('/', async (req, res) => {
    try {
        const { action, apiKey } = req.body;

        if (!action) {
            return res.status(400).json({ error: 'Missing required field: action' });
        }

        let result;

        switch (action) {
            case 'generate': {
                const { prompt, genre, theme, length, tone, characters, setting, formatType, model, options, title, themes, pipelineParams } = req.body;
                if (!prompt && !theme) {
                    return res.status(400).json({ error: 'Either prompt or theme is required for generation' });
                }

                // --- Pipeline-powered generation (VedaScript Engine) ---
                // If pipelineParams are provided, run full pipeline chain
                try {
                    const { runAllPipelines } = require('../services/pipeline-runner');
                    const { buildPrompt } = require('../services/prompt-builder');

                    // Merge basic params into pipeline params
                    const mergedParams = {
                        ...(pipelineParams || {}),
                        // Map basic form fields to pipeline param names if not already set
                    };

                    // Run all 10 pipeline category runners
                    const context = await runAllPipelines(mergedParams);

                    // Build the Groq prompt from the pipeline context + user input
                    const { systemPrompt, userPrompt, temperature: pipelineTemp, maxTokens: pipelineMaxTokens } = buildPrompt(context, {
                        prompt: normalizeParam(prompt, 'prompt'),
                        title: normalizeParam(title || '', 'title'),
                        genre: normalizeParam(genre, 'genre'),
                        setting: normalizeParam(setting, 'setting'),
                        characters: normalizeParam(characters, 'characters'),
                        themes: normalizeParam(themes || theme, 'themes'),
                    });

                    // Call Groq with pipeline-generated prompt
                    const normalizedModel = normalizeParam(model, 'model');
                    result = await groqService.callGroq({
                        model: normalizedModel || undefined,
                        systemPrompt,
                        userPrompt,
                        maxTokens: pipelineMaxTokens,
                        temperature: pipelineTemp,
                        apiKey,
                    });

                    return res.json({
                        result: result.content,
                        model: result.model,
                        tokensUsed: result.tokensUsed,
                        engine: 'vedascript',
                        pipelineContext: process.env.NODE_ENV === 'development' ? context : undefined,
                    });
                } catch (pipelineError) {
                    // Fallback: if pipeline fails, use the original simple generation
                    console.warn('[Groq Route] Pipeline generation failed, falling back to simple generation:', pipelineError.message);

                    const normalizedPrompt = normalizeParam(prompt, 'prompt');
                    const normalizedGenre = normalizeParam(genre, 'genre');
                    const normalizedTheme = normalizeParam(theme, 'theme');
                    const normalizedLength = normalizeParam(length, 'length');
                    const normalizedTone = normalizeParam(tone, 'tone');
                    const normalizedCharacters = normalizeParam(characters, 'characters');
                    const normalizedSetting = normalizeParam(setting, 'setting');
                    const normalizedFormatType = normalizeParam(formatType, 'formatType');
                    const normalizedModel = normalizeParam(model, 'model');
                    const normalizedOptions = (options && typeof options === 'object' && !Array.isArray(options)) ? options : {};

                    result = await groqService.generate({
                        prompt: normalizedPrompt,
                        genre: normalizedGenre,
                        theme: normalizedTheme,
                        length: normalizedLength || normalizedOptions?.length,
                        tone: normalizedTone,
                        characters: normalizedCharacters,
                        setting: normalizedSetting,
                        formatType: normalizedFormatType,
                        model: normalizedModel || normalizedOptions?.model,
                        temperature: normalizedOptions?.temperature,
                        maxTokens: normalizedOptions?.max_tokens,
                        apiKey,
                    });
                    return res.json({ result: result.content, model: result.model, tokensUsed: result.tokensUsed });
                }
            }

            case 'analyze': {
                const { content } = req.body;
                if (!content) {
                    return res.status(400).json({ error: 'content is required for analysis' });
                }

                // Normalize content parameter
                const normalizedContent = normalizeParam(content, 'content');

                result = await groqService.analyze({ content: normalizedContent, apiKey });
                return res.json({ result: result.content, tokensUsed: result.tokensUsed });
            }

            case 'ideas': {
                const { genre, theme, count } = req.body;

                // Normalize string parameters
                const normalizedGenre = normalizeParam(genre, 'genre');
                const normalizedTheme = normalizeParam(theme, 'theme');

                const rawCount = parseInt(count, 10);
                const safeCount = Number.isFinite(rawCount) ? Math.min(Math.max(rawCount, 1), 20) : 5;
                result = await groqService.generateIdeas({ genre: normalizedGenre, theme: normalizedTheme, count: safeCount, apiKey });
                return res.json({ result: result.content, tokensUsed: result.tokensUsed });
            }

            case 'improve': {
                const { content, focus } = req.body;
                if (!content) {
                    return res.status(400).json({ error: 'content is required for improvement' });
                }

                // Normalize string parameters
                const normalizedContent = normalizeParam(content, 'content');
                const normalizedFocus = normalizeParam(focus, 'focus');

                result = await groqService.improve({ content: normalizedContent, focusArea: normalizedFocus, apiKey });
                return res.json({ result: result.content, tokensUsed: result.tokensUsed });
            }

            default:
                return res.status(400).json({ error: `Unknown action: ${action}. Supported: generate, analyze, ideas, improve` });
        }
    } catch (error) {
        console.error('Groq route error:', error);
        return res.status(500).json({
            error: 'AI operation failed',
            code: 'GROQ_ERROR',
        });
    }
});

module.exports = router;
