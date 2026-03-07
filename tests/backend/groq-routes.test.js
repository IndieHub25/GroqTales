/**
 * GroqTales Backend API Route Tests
 *
 * Tests the /api/groq and /api/v1/ai route handlers
 * by mocking groqService and testing Express routes directly.
 *
 * Run: npx jest tests/backend/groq-routes.test.js
 */

jest.mock('../../server/utils/logger', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
}));

const groqService = require('../../server/services/groqService');
jest.mock('../../server/services/groqService');

// Minimal Express test helper
const express = require('express');
const request = require('supertest');

// ============================================================================
// GROQ ROUTE TESTS — /api/groq
// ============================================================================

describe('/api/groq routes', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use('/api/groq', require('../../server/routes/groq'));
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ---------- GET /api/groq/models ----------

    describe('GET /api/groq/models', () => {
        test('returns available models and token budgets', async () => {
            const res = await request(app).get('/api/groq/models').expect(200);

            expect(res.body.models).toBeDefined();
            expect(res.body.default).toBeDefined();
            expect(res.body.tokenBudgets).toBeDefined();
            expect(res.body.modelNames).toBeDefined();
        });

        test('runs connection test when action=test', async () => {
            groqService.testConnection.mockResolvedValueOnce({
                success: true,
                message: 'Connected to Groq API',
            });

            const res = await request(app)
                .get('/api/groq/models?action=test')
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(groqService.testConnection).toHaveBeenCalled();
        });
    });

    // ---------- POST /api/groq ----------

    describe('POST /api/groq', () => {
        test('returns 400 when action is missing', async () => {
            const res = await request(app)
                .post('/api/groq')
                .send({ prompt: 'hello' })
                .expect(400);

            expect(res.body.error).toContain('action');
        });

        test('returns 400 for unknown action', async () => {
            const res = await request(app)
                .post('/api/groq')
                .send({ action: 'unknown' })
                .expect(400);

            expect(res.body.error).toContain('Unknown action');
        });

        test('handles generate action', async () => {
            groqService.generate.mockResolvedValueOnce({
                content: 'Generated story text',
                model: 'llama-3.3-70b-versatile',
                tokensUsed: { prompt: 50, completion: 100, total: 150 },
            });

            const res = await request(app)
                .post('/api/groq')
                .send({ action: 'generate', prompt: 'Write a story' })
                .expect(200);

            expect(res.body.result).toBe('Generated story text');
            expect(res.body.model).toBe('llama-3.3-70b-versatile');
            expect(res.body.tokensUsed.total).toBe(150);
        });

        test('handles analyze action', async () => {
            groqService.analyze.mockResolvedValueOnce({
                content: { sentiment: 'positive', themes: ['love'] },
                tokensUsed: { total: 80 },
            });

            const res = await request(app)
                .post('/api/groq')
                .send({ action: 'analyze', content: 'A love story...' })
                .expect(200);

            expect(res.body.result.sentiment).toBe('positive');
        });

        test('analyze requires content', async () => {
            const res = await request(app)
                .post('/api/groq')
                .send({ action: 'analyze' })
                .expect(400);

            expect(res.body.error).toContain('content');
        });

        test('handles ideas action', async () => {
            groqService.generateIdeas.mockResolvedValueOnce({
                content: ['Idea 1', 'Idea 2', 'Idea 3'],
                tokensUsed: { total: 50 },
            });

            const res = await request(app)
                .post('/api/groq')
                .send({ action: 'ideas', genre: 'sci-fi', count: 3 })
                .expect(200);

            expect(res.body.result).toHaveLength(3);
        });

        test('handles improve action', async () => {
            groqService.improve.mockResolvedValueOnce({
                content: 'Improved text version here.',
                tokensUsed: { total: 120 },
            });

            const res = await request(app)
                .post('/api/groq')
                .send({ action: 'improve', content: 'Original text', focus: 'grammar' })
                .expect(200);

            expect(res.body.result).toContain('Improved');
        });

        test('improve requires content', async () => {
            const res = await request(app)
                .post('/api/groq')
                .send({ action: 'improve' })
                .expect(400);

            expect(res.body.error).toContain('content');
        });

        test('returns 500 on groqService error', async () => {
            groqService.generate.mockRejectedValueOnce(new Error('Groq API timeout'));

            const res = await request(app)
                .post('/api/groq')
                .send({ action: 'generate', prompt: 'test' })
                .expect(500);

            expect(res.body.error).toBe('AI operation failed');
        });
    });
});

// ============================================================================
// AI ROUTE TESTS — /api/v1/ai
// ============================================================================

describe('/api/v1/ai routes', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use('/api/v1/ai', require('../../server/routes/ai'));
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ---------- POST /api/v1/ai/generate ----------

    describe('POST /api/v1/ai/generate', () => {
        test('generates content with prompt', async () => {
            groqService.generate.mockResolvedValueOnce({
                content: 'AI-generated content',
                model: 'llama-3.3-70b-versatile',
                tokensUsed: { prompt: 30, completion: 70, total: 100 },
            });

            const res = await request(app)
                .post('/api/v1/ai/generate')
                .send({
                    prompt: 'Write about Mars',
                    model: 'llama-3.3-70b-versatile',
                    parameters: { temperature: 0.8, maxTokens: 500 },
                })
                .expect(200);

            expect(res.body.content).toBe('AI-generated content');
            expect(res.body.generatedAt).toBeDefined();
            expect(res.body.tokensUsed).toBeDefined();
        });

        test('returns 400 without prompt or theme', async () => {
            const res = await request(app)
                .post('/api/v1/ai/generate')
                .send({ model: 'llama-3.3-70b-versatile' })
                .expect(400);

            expect(res.body.error).toContain('prompt');
        });
    });

    // ---------- POST /api/v1/ai/analyze ----------

    describe('POST /api/v1/ai/analyze', () => {
        test('analyzes content', async () => {
            groqService.analyze.mockResolvedValueOnce({
                content: { sentiment: 'mixed', themes: ['conflict'] },
                tokensUsed: { total: 90 },
            });

            const res = await request(app)
                .post('/api/v1/ai/analyze')
                .send({ content: 'The battle raged on...', analysisType: 'general' })
                .expect(200);

            expect(res.body.results.sentiment).toBe('mixed');
            expect(res.body.type).toBe('general');
            expect(res.body.analyzedAt).toBeDefined();
        });

        test('returns 400 without content', async () => {
            const res = await request(app)
                .post('/api/v1/ai/analyze')
                .send({})
                .expect(400);

            expect(res.body.error).toContain('content');
        });
    });
});
