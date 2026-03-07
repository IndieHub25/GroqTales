/**
 * Bug Condition Exploration Test - Query Parameter API Key
 * 
 * **CRITICAL**: This test is EXPECTED TO FAIL on unfixed code.
 * Failure confirms Bug 2 exists (API keys accepted via query parameters).
 * 
 * **DO NOT attempt to fix the test or the code when it fails.**
 * 
 * This test validates Requirements 2.3, 2.4:
 * - 2.3: System SHALL only accept API keys from Authorization header
 * - 2.4: System SHALL reject query parameter API keys with error message
 */

const request = require('supertest');
const express = require('express');
const groqRouter = require('../../server/routes/groq');

// Mock the groqService
jest.mock('../../server/services/groqService', () => ({
  testConnection: jest.fn(async (apiKey) => {
    // This mock will help us verify if the API key from query param is accepted
    if (apiKey) {
      return {
        success: true,
        message: 'Connected to Groq API',
        apiKeySource: 'received' // Indicates API key was passed
      };
    }
    return {
      success: false,
      message: 'No API key provided'
    };
  }),
  MODELS: {
    PRIMARY: 'test-model'
  },
  MODEL_DISPLAY_NAMES: {},
  TOKEN_BUDGETS: {}
}));

const groqService = require('../../server/services/groqService');

describe('Bug Exploration: Query Parameter API Key', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/groq', groqRouter);
    jest.clearAllMocks();
  });

  /**
   * Test 1.2: Query parameter API key is accepted (security vulnerability)
   * 
   * Expected behavior (after fix):
   * - System should reject API key from query parameter
   * - Return 400 error with message about using Authorization header
   * 
   * Current behavior (unfixed):
   * - API key is accepted from query string
   * - This exposes the key in URLs, logs, and browser history
   */
  test('should reject API key from query parameter (Bug 2 - Security Vulnerability)', async () => {
    const response = await request(app)
      .get('/api/groq/models?action=test&apiKey=gsk_test123xyz')
      .expect(400); // After fix, should return 400

    // After fix, should return error message
    expect(response.body.error).toBeDefined();
    expect(response.body.error).toMatch(/authorization|header/i);
    
    // groqService.testConnection should NOT be called with query param API key
    // OR if called, the route should reject before passing it through
    if (groqService.testConnection.mock.calls.length > 0) {
      const apiKeyArg = groqService.testConnection.mock.calls[0][0];
      // After fix, API key should be null or undefined
      expect(apiKeyArg).toBeNull();
    }
  });

  test('should accept API key from Authorization header (valid method)', async () => {
    const response = await request(app)
      .get('/api/groq/models?action=test')
      .set('Authorization', 'Bearer gsk_test123xyz')
      .expect(200);

    // This should work - Authorization header is the correct method
    expect(groqService.testConnection).toHaveBeenCalled();
    const apiKeyArg = groqService.testConnection.mock.calls[0][0];
    expect(apiKeyArg).toBe('gsk_test123xyz');
    expect(response.body.success).toBe(true);
  });

  test('should reject when both query param and header are provided (query param should be rejected)', async () => {
    const response = await request(app)
      .get('/api/groq/models?action=test&apiKey=query_key')
      .set('Authorization', 'Bearer header_key')
      .expect(400); // Should reject because query param is present

    // After fix, should return error about query parameter usage
    expect(response.body.error).toBeDefined();
    expect(response.body.error).toMatch(/query|parameter/i);
  });

  test('should document security risk of query parameter API keys', () => {
    // This test documents the security risks
    const securityRisks = [
      'API keys in URLs are visible in browser history',
      'API keys in URLs are logged by web servers',
      'API keys in URLs are logged by proxy servers',
      'API keys in URLs appear in referrer headers',
      'API keys in URLs can be captured by network monitoring tools',
      'API keys in URLs can be shared accidentally via copy-paste'
    ];

    // After fix, query parameter API keys should be rejected to prevent these risks
    expect(securityRisks.length).toBeGreaterThan(0);
  });
});
