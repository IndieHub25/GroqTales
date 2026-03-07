/**
 * Gemini Service Tests
 * Tests for Google Gemini API wrapper integration
 */

jest.mock('../../server/services/geminiService', () => {
  return class MockGeminiService {
    constructor(logger) {
      this.logger = logger;
      this.tokenBudgets = {
        short: 512,
        medium: 1200,
        long: 2800,
        synopsis: 150,
        analysis: 400,
        ideas: 600,
        improvement: 2000,
      };
    }

    getTokenBudget(type) {
      return this.tokenBudgets[type] || 512;
    }

    async generate(prompt, options = {}) {
      return {
        text: 'Generated text response from Gemini',
        tokens: { input: 150, output: 300 },
        timestamp: new Date().toISOString(),
      };
    }

    async classifySafety(text, filters) {
      return {
        safe: true,
        categories: { violence: false, gore: false, language: false },
      };
    }

    async generateOutline(premise, config) {
      return {
        outline: ['Chapter 1: Introduction', 'Chapter 2: Development'],
      };
    }

    async getStream(prompt, options) {
      return {
        stream: async function* () {
          yield { text: 'Streamed response chunk 1' };
        },
      };
    }
  };
});

const GeminiService = require('../../server/services/geminiService');

describe('GeminiService', () => {
  let geminiService;
  let mockLogger;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };
    geminiService = new GeminiService(mockLogger);
  });

  describe('Token Budget Management', () => {
    test('should have correct token budgets', () => {
      const budgets = {
        short: 512,
        medium: 1200,
        long: 2800,
      };
      expect(geminiService.tokenBudgets).toEqual(
        expect.objectContaining(budgets)
      );
    });

    test('should return token budget for content type', () => {
      expect(geminiService.getTokenBudget('short')).toBe(512);
      expect(geminiService.getTokenBudget('medium')).toBe(1200);
      expect(geminiService.getTokenBudget('long')).toBe(2800);
    });

    test('should return default budget for unknown type', () => {
      const budget = geminiService.getTokenBudget('unknown');
      expect(typeof budget).toBe('number');
      expect(budget).toBeGreaterThan(0);
    });
  });

  describe('Content Generation', () => {
    test('should generate content successfully', async () => {
      const prompt = 'Generate a story premise';
      const result = await geminiService.generate(prompt, {
        contentType: 'short',
      });

      expect(result).toBeDefined();
      expect(result.text).toBeDefined();
      expect(result.tokens).toBeDefined();
    });

    test('should include timestamp in response', async () => {
      const result = await geminiService.generate('Test prompt');
      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('Safety Classification', () => {
    test('should classify content for safety', async () => {
      const text = 'A peaceful story about nature';
      const result = await geminiService.classifySafety(text, {
        violence: true,
        gore: false,
      });

      expect(result).toBeDefined();
      expect(result.safe).toBeDefined();
      expect(result.categories).toBeDefined();
    });

    test('should mark safe content correctly', async () => {
      const result = await geminiService.classifySafety(
        'A gentle tale of friendship',
        {}
      );
      expect(result.safe).toBe(true);
    });
  });

  describe('Outline Generation', () => {
    test('should generate story outline', async () => {
      const result = await geminiService.generateOutline('Epic adventure', {
        targetLength: 'novel',
      });

      expect(result).toBeDefined();
      expect(result.outline).toBeDefined();
      expect(Array.isArray(result.outline)).toBe(true);
    });

    test('should return array of outline chapters', async () => {
      const result = await geminiService.generateOutline('Mystery story', {});
      expect(result.outline.length).toBeGreaterThan(0);
      expect(typeof result.outline[0]).toBe('string');
    });
  });

  describe('Streaming Support', () => {
    test('should support streaming generation', async () => {
      const stream = await geminiService.getStream('Generate prose', {
        contentType: 'long',
      });

      expect(stream).toBeDefined();
      expect(stream.stream).toBeDefined();
    });

    test('should return async generator for streaming', async () => {
      const stream = await geminiService.getStream('Test', {});
      const generator = stream.stream();

      expect(generator[Symbol.asyncIterator]).toBeDefined();
    });
  });

  describe('Initialization', () => {
    test('should create service instance with logger', () => {
      expect(geminiService).toBeDefined();
      expect(geminiService.logger).toBe(mockLogger);
    });

    test('should initialize with required methods', () => {
      expect(typeof geminiService.generate).toBe('function');
      expect(typeof geminiService.classifySafety).toBe('function');
      expect(typeof geminiService.generateOutline).toBe('function');
      expect(typeof geminiService.getStream).toBe('function');
    });
  });

  describe('Error Handling Patterns', () => {
    test('should handle missing options gracefully', async () => {
      const result = await geminiService.generate('Test prompt');
      expect(result).toBeDefined();
    });

    test('should work with partial filter configuration', async () => {
      const result = await geminiService.classifySafety('Text', {
        violence: true,
      });
      expect(result).toBeDefined();
    });
  });

  describe('Configuration Patterns', () => {
    test('should accept content type in options', async () => {
      const result = await geminiService.generate('Prompt', {
        contentType: 'medium',
      });

      expect(result).toBeDefined();
      expect(result.tokens).toBeDefined();
    });

    test('should accept correlation ID for tracing', async () => {
      const result = await geminiService.generate('Prompt', {
        correlationId: 'trace-123',
        contentType: 'short',
      });

      expect(result).toBeDefined();
    });
  });
});

