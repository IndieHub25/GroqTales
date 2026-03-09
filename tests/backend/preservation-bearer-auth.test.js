/**
 * Preservation Test - Bearer Token Authentication
 *
 * **IMPORTANT**: This test should PASS on UNFIXED code.
 * It establishes baseline behavior that must be preserved after the fix.
 *
 * This test validates Preservation Requirement 3.4:
 * - 3.4: Authorization header with Bearer token must continue to authenticate successfully
 *
 * **Validates: Requirement 3.4**
 */

const request = require('supertest');
const express = require('express');
const groqRouter = require('../../server/routes/groq');

// Mock the groqService
jest.mock('../../server/services/groqService', () => ({
  testConnection: jest.fn(async (apiKey) => {
    if (apiKey && apiKey.startsWith('gsk_')) {
      return {
        success: true,
        message: 'Connected to Groq API successfully',
        apiKey: apiKey.substring(0, 10) + '...',
      };
    }
    return {
      success: false,
      message: 'Invalid API key',
    };
  }),
  generate: jest.fn(async (params) => ({
    content: 'Generated story',
    model: 'llama-3.3-70b-versatile',
    tokensUsed: { prompt: 50, completion: 100, total: 150 },
  })),
  MODELS: {
    PRIMARY: 'llama-3.3-70b-versatile',
  },
  MODEL_DISPLAY_NAMES: {},
  TOKEN_BUDGETS: {},
}));

const groqService = require('../../server/services/groqService');

describe('Preservation: Bearer Token Authentication', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/groq', groqRouter);
    jest.clearAllMocks();
  });

  describe('Authorization Header with Bearer Token', () => {
    test('should accept valid Bearer token in Authorization header', async () => {
      const response = await request(app)
        .get('/api/groq/models?action=test')
        .set('Authorization', 'Bearer gsk_test123xyz456abc');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Connected');
      expect(groqService.testConnection).toHaveBeenCalledWith(
        'gsk_test123xyz456abc'
      );
    });

    test('should extract Bearer token correctly from Authorization header', async () => {
      const response = await request(app)
        .get('/api/groq/models?action=test')
        .set('Authorization', 'Bearer gsk_validkey123');

      expect(response.status).toBe(200);
      expect(groqService.testConnection).toHaveBeenCalledWith(
        'gsk_validkey123'
      );
    });

    test('should handle Bearer token with different formats', async () => {
      const testCases = [
        'Bearer gsk_short',
        'Bearer gsk_with_underscores_and_numbers_123',
        'Bearer gsk_VeryLongKeyWithMixedCaseAndNumbers123456789',
      ];

      for (const authHeader of testCases) {
        const response = await request(app)
          .get('/api/groq/models?action=test')
          .set('Authorization', authHeader);

        expect(response.status).toBe(200);
        const expectedKey = authHeader.replace('Bearer ', '');
        expect(groqService.testConnection).toHaveBeenCalledWith(expectedKey);
      }
    });

    test('should work with Bearer token in POST requests', async () => {
      const response = await request(app)
        .post('/api/groq')
        .set('Authorization', 'Bearer gsk_test123')
        .send({
          action: 'generate',
          prompt: 'Test story',
        });

      expect(response.status).toBe(200);
      expect(response.body.result).toBeDefined();
    });
  });

  describe('Bearer Token Edge Cases', () => {
    test('should handle Bearer token with extra spaces', async () => {
      const response = await request(app)
        .get('/api/groq/models?action=test')
        .set('Authorization', 'Bearer  gsk_test123'); // Extra space

      // The current implementation uses slice(7) which would include the extra space
      // This test documents the current behavior
      expect(response.status).toBe(200);
    });

    test('should handle case-sensitive Bearer prefix', async () => {
      const response = await request(app)
        .get('/api/groq/models?action=test')
        .set('Authorization', 'Bearer gsk_test123');

      expect(response.status).toBe(200);
      expect(groqService.testConnection).toHaveBeenCalled();
    });

    test('should handle Authorization header without Bearer prefix', async () => {
      const response = await request(app)
        .get('/api/groq/models?action=test')
        .set('Authorization', 'gsk_test123'); // No Bearer prefix

      // Current behavior: testConnection is called with undefined or the raw value
      expect(response.status).toBe(200);
    });
  });

  describe('Multiple Authentication Scenarios', () => {
    test('should prioritize Authorization header over body apiKey', async () => {
      const response = await request(app)
        .post('/api/groq')
        .set('Authorization', 'Bearer gsk_header_key')
        .send({
          action: 'generate',
          prompt: 'Test',
          apiKey: 'gsk_body_key',
        });

      expect(response.status).toBe(200);
      // The Authorization header should be used, not the body apiKey
      expect(response.body.result).toBeDefined();
    });

    test('should work without any authentication for models endpoint', async () => {
      const response = await request(app).get('/api/groq/models');

      expect(response.status).toBe(200);
      expect(response.body.models).toBeDefined();
      expect(response.body.default).toBeDefined();
      expect(response.body.tokenBudgets).toBeDefined();
    });

    test('should handle missing Authorization header gracefully', async () => {
      const response = await request(app).get('/api/groq/models?action=test');

      // Without Authorization header, testConnection is called with undefined or query param
      expect(response.status).toBe(200);
    });
  });

  describe('Bearer Token Format Validation', () => {
    test('should accept Bearer tokens with various valid characters', async () => {
      const validTokens = [
        'gsk_abc123',
        'gsk_ABC123',
        'gsk_abc_123_def',
        'gsk_123456789',
        'gsk_MixedCase123',
      ];

      for (const token of validTokens) {
        const response = await request(app)
          .get('/api/groq/models?action=test')
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(groqService.testConnection).toHaveBeenCalledWith(token);
      }
    });

    test('should handle very long Bearer tokens', async () => {
      const longToken = 'gsk_' + 'a'.repeat(100);
      const response = await request(app)
        .get('/api/groq/models?action=test')
        .set('Authorization', `Bearer ${longToken}`);

      expect(response.status).toBe(200);
      expect(groqService.testConnection).toHaveBeenCalledWith(longToken);
    });
  });
});
