/**
 * Preservation Test - Valid String Parameters
 *
 * **IMPORTANT**: This test should PASS on UNFIXED code.
 * It establishes baseline behavior that must be preserved after the fix.
 *
 * This test validates Preservation Requirements 3.1, 3.2, 3.3:
 * - 3.1: Valid string parameters must continue to be processed correctly
 * - 3.2: Authorization header with Bearer token must continue to authenticate successfully
 * - 3.3: groqService methods must continue to function correctly
 *
 * **Validates: Requirements 3.1, 3.2, 3.3**
 */

const request = require('supertest');
const express = require('express');
const groqRouter = require('../../server/routes/groq');

// Mock the groqService
jest.mock('../../server/services/groqService', () => ({
  generate: jest.fn(async (params) => ({
    content: `Generated story with prompt: ${params.prompt}`,
    model: 'llama-3.3-70b-versatile',
    tokensUsed: { prompt: 50, completion: 100, total: 150 },
  })),
  analyze: jest.fn(async (params) => ({
    content: {
      sentiment: 'positive',
      themes: ['adventure', 'friendship'],
      genres: ['fantasy'],
      readabilityScore: 8,
      wordCount: 500,
      estimatedReadingTime: 3,
      complexity: 'medium',
    },
    tokensUsed: { total: 80 },
  })),
  generateIdeas: jest.fn(async (params) => ({
    content: ['Idea 1', 'Idea 2', 'Idea 3'],
    tokensUsed: { total: 50 },
  })),
  improve: jest.fn(async (params) => ({
    content: `Improved version of: ${params.content}`,
    tokensUsed: { total: 120 },
  })),
  MODELS: {
    PRIMARY: 'llama-3.3-70b-versatile',
    FAST: 'llama-3.1-8b-instant',
    LONG_CONTEXT: 'mistral-saba-24b',
  },
  MODEL_DISPLAY_NAMES: {
    'llama-3.3-70b-versatile': 'Llama 3.3 70B',
    'llama-3.1-8b-instant': 'Llama 3.1 8B',
    'mistral-saba-24b': 'Mistral Saba 24B',
  },
  TOKEN_BUDGETS: {
    short: 500,
    medium: 1000,
    long: 2000,
  },
}));

const groqService = require('../../server/services/groqService');

describe('Preservation: Valid String Parameters', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/groq', groqRouter);
    jest.clearAllMocks();
  });

  describe('Generate Action with Valid String Parameters', () => {
    test('should process valid string prompt correctly', async () => {
      const response = await request(app).post('/api/groq').send({
        action: 'generate',
        prompt: 'Write a story about dragons',
        genre: 'fantasy',
        theme: 'adventure',
        length: 'medium',
      });

      expect(response.status).toBe(200);
      expect(response.body.result).toContain('Generated story');
      expect(groqService.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: 'Write a story about dragons',
          genre: 'fantasy',
          theme: 'adventure',
          length: 'medium',
        })
      );
    });

    test('should process all valid string parameters correctly', async () => {
      const response = await request(app).post('/api/groq').send({
        action: 'generate',
        prompt: 'A tale of magic',
        genre: 'fantasy',
        theme: 'magic and mystery',
        length: 'short',
        tone: 'dark',
        characters: 'A wizard named Merlin',
        setting: 'Medieval castle',
        formatType: 'story',
        model: 'llama-3.3-70b-versatile',
      });

      expect(response.status).toBe(200);
      expect(response.body.result).toBeDefined();
      expect(response.body.model).toBe('llama-3.3-70b-versatile');
      expect(response.body.tokensUsed).toBeDefined();

      const callArgs = groqService.generate.mock.calls[0][0];
      expect(callArgs.prompt).toBe('A tale of magic');
      expect(callArgs.genre).toBe('fantasy');
      expect(callArgs.theme).toBe('magic and mystery');
      expect(callArgs.length).toBe('short');
      expect(callArgs.tone).toBe('dark');
      expect(callArgs.characters).toBe('A wizard named Merlin');
      expect(callArgs.setting).toBe('Medieval castle');
      expect(callArgs.formatType).toBe('story');
      expect(callArgs.model).toBe('llama-3.3-70b-versatile');
    });

    test('should handle theme without prompt', async () => {
      const response = await request(app).post('/api/groq').send({
        action: 'generate',
        theme: 'space exploration',
        genre: 'sci-fi',
        length: 'long',
      });

      expect(response.status).toBe(200);
      expect(groqService.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          theme: 'space exploration',
          genre: 'sci-fi',
          length: 'long',
        })
      );
    });
  });

  describe('Analyze Action with Valid String Parameters', () => {
    test('should analyze content correctly', async () => {
      const response = await request(app).post('/api/groq').send({
        action: 'analyze',
        content:
          'Once upon a time, in a land far away, there lived a brave knight...',
      });

      expect(response.status).toBe(200);
      expect(response.body.result).toBeDefined();
      expect(response.body.result.sentiment).toBe('positive');
      expect(response.body.result.themes).toContain('adventure');
      expect(response.body.tokensUsed).toBeDefined();

      expect(groqService.analyze).toHaveBeenCalledWith(
        expect.objectContaining({
          content:
            'Once upon a time, in a land far away, there lived a brave knight...',
        })
      );
    });

    test('should handle long content strings', async () => {
      const longContent = 'A'.repeat(5000);
      const response = await request(app).post('/api/groq').send({
        action: 'analyze',
        content: longContent,
      });

      expect(response.status).toBe(200);
      expect(groqService.analyze).toHaveBeenCalledWith(
        expect.objectContaining({
          content: longContent,
        })
      );
    });
  });

  describe('Ideas Action with Valid String Parameters', () => {
    test('should generate ideas with genre', async () => {
      const response = await request(app).post('/api/groq').send({
        action: 'ideas',
        genre: 'horror',
        theme: 'haunted house',
        count: 5,
      });

      expect(response.status).toBe(200);
      expect(response.body.result).toHaveLength(3);
      expect(response.body.tokensUsed).toBeDefined();

      expect(groqService.generateIdeas).toHaveBeenCalledWith(
        expect.objectContaining({
          genre: 'horror',
          theme: 'haunted house',
          count: 5,
        })
      );
    });

    test('should generate ideas without genre', async () => {
      const response = await request(app).post('/api/groq').send({
        action: 'ideas',
        count: 3,
      });

      expect(response.status).toBe(200);
      expect(response.body.result).toBeDefined();
      expect(groqService.generateIdeas).toHaveBeenCalled();
    });
  });

  describe('Improve Action with Valid String Parameters', () => {
    test('should improve content with focus area', async () => {
      const response = await request(app).post('/api/groq').send({
        action: 'improve',
        content: 'It was a dark and stormy night.',
        focus: 'descriptive language',
      });

      expect(response.status).toBe(200);
      expect(response.body.result).toContain('Improved version');
      expect(response.body.tokensUsed).toBeDefined();

      expect(groqService.improve).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'It was a dark and stormy night.',
          focusArea: 'descriptive language',
        })
      );
    });

    test('should improve content without focus area', async () => {
      const response = await request(app).post('/api/groq').send({
        action: 'improve',
        content: 'The cat sat on the mat.',
      });

      expect(response.status).toBe(200);
      expect(groqService.improve).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'The cat sat on the mat.',
        })
      );
    });
  });

  describe('Edge Cases with Valid Strings', () => {
    test('should handle empty strings', async () => {
      const response = await request(app).post('/api/groq').send({
        action: 'generate',
        prompt: '',
        theme: 'mystery',
      });

      expect(response.status).toBe(200);
      expect(groqService.generate).toHaveBeenCalled();
    });

    test('should handle special characters in strings', async () => {
      const response = await request(app).post('/api/groq').send({
        action: 'generate',
        prompt: 'A story with "quotes" and \'apostrophes\' & symbols!',
        genre: 'sci-fi',
      });

      expect(response.status).toBe(200);
      expect(groqService.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: 'A story with "quotes" and \'apostrophes\' & symbols!',
        })
      );
    });

    test('should handle unicode characters', async () => {
      const response = await request(app).post('/api/groq').send({
        action: 'generate',
        prompt: 'Une histoire en français avec des émojis 🎭🎨',
        genre: 'fantasy',
      });

      expect(response.status).toBe(200);
      expect(groqService.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: 'Une histoire en français avec des émojis 🎭🎨',
        })
      );
    });
  });
});
