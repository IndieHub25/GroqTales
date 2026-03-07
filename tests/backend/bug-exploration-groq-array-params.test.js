/**
 * Bug Condition Exploration Test - Groq Route Array Parameters
 *
 * **CRITICAL**: This test is EXPECTED TO FAIL on unfixed code.
 * Failure confirms Bug 1 exists (type confusion when parameters are arrays).
 *
 * **DO NOT attempt to fix the test or the code when it fails.**
 *
 * This test validates Requirements 2.1, 2.2:
 * - 2.1: System SHALL validate and normalize parameters to ensure they are strings
 * - 2.2: System SHALL either take first element or reject with 400 error
 */

const request = require('supertest');
const express = require('express');
const groqRouter = require('../../server/routes/groq');

// Mock the groqService to observe what parameters it receives
jest.mock('../../server/services/groqService', () => ({
  generate: jest.fn(async (params) => {
    // This mock will help us verify what parameters are passed
    // If arrays are passed through without normalization, we'll detect it
    return {
      content: 'Generated story',
      model: 'test-model',
      tokensUsed: 100,
    };
  }),
  analyze: jest.fn(async (params) => ({
    content: 'Analysis result',
    tokensUsed: 50,
  })),
  generateIdeas: jest.fn(async (params) => ({
    content: 'Ideas result',
    tokensUsed: 50,
  })),
  improve: jest.fn(async (params) => ({
    content: 'Improved content',
    tokensUsed: 50,
  })),
  MODELS: {
    PRIMARY: 'test-model',
  },
  MODEL_DISPLAY_NAMES: {},
  TOKEN_BUDGETS: {},
}));

const groqService = require('../../server/services/groqService');

describe('Bug Exploration: Array Parameters in Groq Route', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/groq', groqRouter);
    jest.clearAllMocks();
  });

  /**
   * Test 1.1: Array parameter causes type confusion
   *
   * Expected behavior (after fix):
   * - System should normalize array to string (first element)
   * - OR reject with 400 error
   *
   * Current behavior (unfixed):
   * - Array is passed through to groqService.generate()
   * - This causes type confusion
   */
  test('should handle array prompt parameter (Bug 1 - Type Confusion)', async () => {
    const response = await request(app)
      .post('/api/groq')
      .send({
        action: 'generate',
        prompt: ['test1', 'test2'], // Array instead of string
        theme: 'fantasy',
      });

    // After fix, this should either:
    // 1. Return 200 with normalized parameter (first element used)
    // 2. Return 400 with error message about invalid parameter type

    // Check what was passed to groqService
    expect(groqService.generate).toHaveBeenCalled();
    const callArgs = groqService.generate.mock.calls[0][0];

    // EXPECTED BEHAVIOR (after fix): prompt should be a string
    // CURRENT BEHAVIOR (unfixed): prompt is an array
    expect(typeof callArgs.prompt).toBe('string');
    expect(callArgs.prompt).toBe('test1'); // Should use first element

    // Response should be successful
    expect(response.status).toBe(200);
  });

  test('should handle multiple array parameters (Bug 1 - Type Confusion)', async () => {
    const response = await request(app)
      .post('/api/groq')
      .send({
        action: 'generate',
        prompt: ['prompt1', 'prompt2'],
        genre: ['fantasy', 'sci-fi'],
        theme: ['magic', 'technology'],
        length: ['short', 'medium'],
      });

    expect(groqService.generate).toHaveBeenCalled();
    const callArgs = groqService.generate.mock.calls[0][0];

    // All parameters should be normalized to strings
    expect(typeof callArgs.prompt).toBe('string');
    expect(typeof callArgs.genre).toBe('string');
    expect(typeof callArgs.theme).toBe('string');
    expect(typeof callArgs.length).toBe('string');

    expect(response.status).toBe(200);
  });

  test('should handle array parameters in analyze action', async () => {
    const response = await request(app)
      .post('/api/groq')
      .send({
        action: 'analyze',
        content: ['content1', 'content2'],
      });

    expect(groqService.analyze).toHaveBeenCalled();
    const callArgs = groqService.analyze.mock.calls[0][0];

    expect(typeof callArgs.content).toBe('string');
    expect(callArgs.content).toBe('content1');

    expect(response.status).toBe(200);
  });

  test('should handle array parameters in ideas action', async () => {
    const response = await request(app)
      .post('/api/groq')
      .send({
        action: 'ideas',
        genre: ['fantasy', 'sci-fi'],
        theme: ['magic', 'technology'],
      });

    expect(groqService.generateIdeas).toHaveBeenCalled();
    const callArgs = groqService.generateIdeas.mock.calls[0][0];

    expect(typeof callArgs.genre).toBe('string');
    expect(typeof callArgs.theme).toBe('string');

    expect(response.status).toBe(200);
  });

  test('should handle array parameters in improve action', async () => {
    const response = await request(app)
      .post('/api/groq')
      .send({
        action: 'improve',
        content: ['content1', 'content2'],
        focus: ['grammar', 'style'],
      });

    expect(groqService.improve).toHaveBeenCalled();
    const callArgs = groqService.improve.mock.calls[0][0];

    expect(typeof callArgs.content).toBe('string');
    expect(typeof callArgs.focusArea).toBe('string');

    expect(response.status).toBe(200);
  });
});
