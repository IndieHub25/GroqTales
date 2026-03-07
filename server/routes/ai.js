/**
 * AI API Routes — Live Groq Integration
 * Handles AI-powered story generation, analysis, and enhancement
 */

const express = require('express');
const router = express.Router();
const groqService = require('../services/groqService');

/**
 * @swagger
 * /api/v1/ai/generate:
 *   post:
 *     tags:
 *       - AI
 *     summary: Generate content with AI
 *     description: |
 *       Uses Groq AI to generate story content, comic scripts, novel chapters,
 *       or other creative text based on a prompt and parameters.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 example: "Write a sci-fi opening paragraph about Mars colonization"
 *               model:
 *                 type: string
 *                 default: llama-3.3-70b-versatile
 *               formatType:
 *                 type: string
 *                 enum: [story, comic, novel, storybook]
 *                 default: story
 *               parameters:
 *                 type: object
 *                 properties:
 *                   temperature:
 *                     type: number
 *                     minimum: 0
 *                     maximum: 1
 *                     default: 0.8
 *                   maxTokens:
 *                     type: integer
 *                     default: 1200
 *                   genre:
 *                     type: string
 *                   theme:
 *                     type: string
 *                   length:
 *                     type: string
 *                     enum: [short, medium, long]
 *                   tone:
 *                     type: string
 *                   characters:
 *                     type: string
 *                   setting:
 *                     type: string
 *     responses:
 *       200:
 *         description: Content generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: string
 *                 model:
 *                   type: string
 *                 tokensUsed:
 *                   type: object
 *                   properties:
 *                     prompt:
 *                       type: integer
 *                     completion:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                 generatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Missing required prompt.
 *       500:
 *         description: AI generation failed.
 */
router.post('/generate', async (req, res) => {
  try {
    const { prompt, model, formatType, parameters = {} } = req.body;

    if (!prompt && !parameters.theme) {
      return res.status(400).json({ error: 'prompt or parameters.theme is required' });
    }

    const result = await groqService.generate({
      prompt,
      genre: parameters.genre,
      theme: parameters.theme,
      length: parameters.length,
      tone: parameters.tone,
      characters: parameters.characters,
      setting: parameters.setting,
      formatType: formatType || 'story',
      model,
      temperature: parameters.temperature,
      maxTokens: parameters.maxTokens,
    });

    res.json({
      content: result.content,
      model: result.model,
      tokensUsed: result.tokensUsed,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI generate error:', error);
    res.status(500).json({ error: error.message || 'AI generation failed' });
  }
});

/**
 * @swagger
 * /api/v1/ai/analyze:
 *   post:
 *     tags:
 *       - AI
 *     summary: Analyze content with AI
 *     description: |
 *       Performs AI-powered analysis on text content, returning structured JSON
 *       with sentiment, themes, genres, readability score, word count, and complexity.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: "The spaceship drifted silently through the asteroid belt..."
 *               analysisType:
 *                 type: string
 *                 enum: [general, sentiment, themes, readability]
 *                 default: general
 *     responses:
 *       200:
 *         description: Analysis completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                 results:
 *                   type: object
 *                   properties:
 *                     sentiment:
 *                       type: string
 *                     themes:
 *                       type: array
 *                       items:
 *                         type: string
 *                     complexity:
 *                       type: string
 *                     readabilityScore:
 *                       type: number
 *                     wordCount:
 *                       type: integer
 *                     estimatedReadingTime:
 *                       type: number
 *                 tokensUsed:
 *                   type: object
 *                 analyzedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Missing required content.
 *       500:
 *         description: Analysis failed.
 */
router.post('/analyze', async (req, res) => {
  try {
    const { content, analysisType } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'content is required' });
    }

    const result = await groqService.analyze({ content, analysisType });

    res.json({
      type: analysisType || 'general',
      results: result.content,
      tokensUsed: result.tokensUsed,
      analyzedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI analyze error:', error);
    res.status(500).json({ error: error.message || 'Analysis failed' });
  }
});

module.exports = router;
