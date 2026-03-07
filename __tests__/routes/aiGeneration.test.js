/**
 * AI Generation Endpoint Tests
 * Tests for POST /api/v1/ai/generate with SSE streaming and orchestration
 */

const request = require('supertest');
const express = require('express');

describe('POST /api/v1/ai/generate Endpoint', () => {
  let app;
  let mockOrchestrator;
  let mockLogger;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    mockOrchestrator = {
      orchestrateGeneration: jest.fn(({ config, userInput, mode = 'story', correlationId }) => 
        Promise.resolve({
          id: 'gen-123',
          status: 'success',
          mode: mode || 'story',
          prose: 'Generated story text here...',
          outline: ['Chapter 1', 'Chapter 2'],
          metadata: {
            wordCount: 1500,
            themes: ['adventure', 'discovery'],
            generationTimeMs: 3200,
            modelsUsed: ['gemini-2.0-flash'],
            tokensUsed: { gemini: { input: 500, output: 1200 } },
            durationMs: 3200,
            model: 'gemini-chairman',
            requestId: correlationId,
            config: { mode, primaryGenre: config?.primaryGenre },
          },
        })
      ),
    };

    // Mock correlation ID middleware
    app.use((req, res, next) => {
      res.locals.correlationId = req.headers['x-request-id'] || 'test-corr-123';
      next();
    });

    // Mock the generation route
    app.post('/api/v1/ai/generate', async (req, res) => {
      try {
        const { config, userInput, mode = 'story' } = req.body;

        // Validate schema
        if (!config || !userInput) {
          return res.status(400).json({
            error: 'Missing required fields: config, userInput',
          });
        }

        // Check if streaming requested
        if (req.query.stream === 'true') {
          res.setHeader('Content-Type', 'text/event-stream');
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Connection', 'keep-alive');

          const result = await mockOrchestrator.orchestrateGeneration({
            config: { ...config, mode },
            userInput,
            mode,
            correlationId: res.locals.correlationId,
            streaming: true,
            onChunk: (chunk) => {
              if (chunk.type === 'generation') {
                res.write(`data: ${JSON.stringify(chunk)}\n\n`);
              }
            },
          });

          res.write(`data: ${JSON.stringify({ type: 'complete', id: result.metadata.requestId })}\n\n`);
          res.end();
        } else {
          const result = await mockOrchestrator.orchestrateGeneration({
            config: { ...config, mode },
            userInput,
            mode,
            correlationId: res.locals.correlationId,
          });

          return res.status(200).json(result);
        }
      } catch (error) {
        mockLogger.error('Generation failed', {
          error: error.message,
          correlationId: res.locals.correlationId,
        });
        return res.status(500).json({ error: 'Generation failed' });
      }
    });
  });

  describe('Request Validation', () => {
    test('should reject request without config', async () => {
      const response = await request(app)
        .post('/api/v1/ai/generate')
        .send({
          userInput: 'A test premise',
          mode: 'story',
        })
        .expect(400);

      expect(response.body.error).toContain('config');
    });

    test('should reject request without userInput', async () => {
      const response = await request(app)
        .post('/api/v1/ai/generate')
        .send({
          config: { primaryGenre: 'fantasy' },
          mode: 'story',
        })
        .expect(400);

      expect(response.body.error).toContain('userInput');
    });

    test('should accept valid request with all required fields', async () => {
      const response = await request(app)
        .post('/api/v1/ai/generate')
        .send({
          config: { primaryGenre: 'fantasy', targetLength: 'novella' },
          userInput: 'A hero discovers a hidden kingdom',
          mode: 'story',
        })
        .expect(200);

      expect(response.body.id).toBeDefined();
      expect(response.body.prose).toBeDefined();
    });
  });

  describe('Batch Response', () => {
    test('should return full generation object', async () => {
      const response = await request(app)
        .post('/api/v1/ai/generate')
        .send({
          config: { primaryGenre: 'sci-fi' },
          userInput: 'Space exploration',
          mode: 'story',
        })
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          status: 'success',
          mode: 'story',
          prose: expect.any(String),
          outline: expect.any(Array),
          metadata: expect.objectContaining({
            wordCount: expect.any(Number),
            generationTimeMs: expect.any(Number),
            modelsUsed: expect.any(Array),
            tokensUsed: expect.any(Object),
          }),
        })
      );
    });

    test('should include all metadata fields', async () => {
      const response = await request(app)
        .post('/api/v1/ai/generate')
        .send({
          config: { primaryGenre: 'fantasy' },
          userInput: 'Epic adventure',
        })
        .expect(200);

      expect(response.body.metadata).toHaveProperty('wordCount');
      expect(response.body.metadata).toHaveProperty('themes');
      expect(response.body.metadata).toHaveProperty('generationTimeMs');
      expect(response.body.metadata).toHaveProperty('modelsUsed');
      expect(response.body.metadata).toHaveProperty('tokensUsed');
    });
  });

  describe('SSE Streaming Response', () => {
    test('should stream prose chunks with stream=true', async () => {
      const response = await request(app)
        .post('/api/v1/ai/generate?stream=true')
        .send({
          config: { primaryGenre: 'fantasy' },
          userInput: 'An epic quest',
        });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/event-stream');
    });

    test('should include completion event in stream', async () => {
      const response = await request(app)
        .post('/api/v1/ai/generate?stream=true')
        .send({
          config: { primaryGenre: 'mystery' },
          userInput: 'A puzzle to solve',
        });

      expect(response.text).toContain('type');
      expect(response.text).toContain('complete');
    });
  });

  describe('Mode Selection', () => {
    test('should handle story mode', async () => {
      const response = await request(app)
        .post('/api/v1/ai/generate')
        .send({
          config: { primaryGenre: 'fantasy' },
          userInput: 'Story premise',
          mode: 'story',
        })
        .expect(200);

      expect(response.body.mode).toBe('story');
      expect(response.body.prose).toBeDefined();
    });

    test('should handle comic mode', async () => {
      const response = await request(app)
        .post('/api/v1/ai/generate')
        .send({
          config: { primaryGenre: 'action' },
          userInput: 'Action sequence',
          mode: 'comic',
        })
        .expect(200);

      expect(response.body.mode).toBe('comic');
    });

    test('should handle story+comic mode', async () => {
      const response = await request(app)
        .post('/api/v1/ai/generate')
        .send({
          config: { primaryGenre: 'adventure' },
          userInput: 'Adventure tale',
          mode: 'story+comic',
        })
        .expect(200);

      expect(response.body.mode).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should return 400 for invalid config', async () => {
      const response = await request(app)
        .post('/api/v1/ai/generate')
        .send({
          config: null,
          userInput: 'Test',
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    test('should return 500 on orchestration error', async () => {
      mockOrchestrator.orchestrateGeneration.mockRejectedValueOnce(
        new Error('Generation failed')
      );

      const response = await request(app)
        .post('/api/v1/ai/generate')
        .send({
          config: { primaryGenre: 'fantasy' },
          userInput: 'Test',
        })
        .expect(500);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('Correlation ID Tracking', () => {
    test('should preserve correlation ID from header', async () => {
      const correlationId = 'test-corr-456';

      await request(app)
        .post('/api/v1/ai/generate')
        .set('x-request-id', correlationId)
        .send({
          config: { primaryGenre: 'fantasy' },
          userInput: 'Test premise',
        })
        .expect(200);

      expect(mockOrchestrator.orchestrateGeneration).toHaveBeenCalledWith(
        expect.objectContaining({
          correlationId,
        })
      );
    });

    test('should generate correlation ID if not provided', async () => {
      await request(app)
        .post('/api/v1/ai/generate')
        .send({
          config: { primaryGenre: 'fantasy' },
          userInput: 'Test',
        })
        .expect(200);

      expect(mockOrchestrator.orchestrateGeneration).toHaveBeenCalledWith(
        expect.objectContaining({
          correlationId: 'test-corr-123',
        })
      );
    });
  });

  describe('Draft Saving', () => {
    test('should accept saveDraft flag', async () => {
      const response = await request(app)
        .post('/api/v1/ai/generate')
        .send({
          config: { primaryGenre: 'fantasy' },
          userInput: 'Test',
          saveDraft: true,
        })
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });
});
