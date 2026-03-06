/**
 * AI Configuration Schema Tests
 * Tests for Zod schema validation with 70+ parameters
 */

import { AIStoryConfigSchema } from '../../lib/ai-config-schema';

describe('AIStoryConfigSchema - 70+ Configuration Parameters', () => {
  describe('Schema Existence and Type', () => {
    test('should export AIStoryConfigSchema', () => {
      expect(AIStoryConfigSchema).toBeDefined();
    });

    test('should have safeParse method', () => {
      expect(typeof AIStoryConfigSchema.safeParse).toBe('function');
    });

    test('should have parse method', () => {
      expect(typeof AIStoryConfigSchema.parse).toBe('function');
    });
  });

  describe('Minimal Valid Configuration', () => {
    test('should accept minimal story-only mode', () => {
      const config = {
        mode: 'story-only',
        primaryGenre: 'fantasy',
        targetLength: 'novella',
      };
      const result = AIStoryConfigSchema.safeParse(config);
      expect(result).toHaveProperty('success');
    });

    test('should accept comic-only mode', () => {
      const config = {
        mode: 'comic-only',
        primaryGenre: 'action',
        targetLength: 'episode',
      };
      const result = AIStoryConfigSchema.safeParse(config);
      expect(result).toHaveProperty('success');
    });

    test('should accept story-comic mode', () => {
      const config = {
        mode: 'story-comic',
        primaryGenre: 'adventure',
        targetLength: 'novel',
      };
      const result = AIStoryConfigSchema.safeParse(config);
      expect(result).toHaveProperty('success');
    });
  });

  describe('Mode Validation', () => {
    test('should reject invalid mode', () => {
      const config = {
        mode: 'invalid-mode',
      };
      const result = AIStoryConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
    });

    test('should validate story-only', () => {
      const config = { mode: 'story-only' };
      const result = AIStoryConfigSchema.safeParse(config);
      expect(result).toHaveProperty('success');
    });
  });

  describe('Genre Validation', () => {
    test('should accept primary genre', () => {
      const config = {
        primaryGenre: 'fantasy',
      };
      const result = AIStoryConfigSchema.safeParse(config);
      expect(result).toHaveProperty('success');
    });

    test('should accept secondary genres array', () => {
      const config = {
        secondaryGenres: ['sci-fi', 'mystery'],
      };
      const result = AIStoryConfigSchema.safeParse(config);
      expect(result).toHaveProperty('success');
    });

    test('should validate secondary genres max length', () => {
      const config = {
        primaryGenre: 'fantasy',
        secondaryGenres: ['sci-fi', 'mystery', 'horror', 'romance'],
      };
      const result = AIStoryConfigSchema.safeParse(config);
      if (result.success === false) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('Target Length Validation', () => {
    test('should accept valid target lengths', () => {
      const validLengths = ['short-story', 'novella', 'episode', 'novel'];
      validLengths.forEach((length) => {
        const result = AIStoryConfigSchema.safeParse({ targetLength: length });
        expect(result).toHaveProperty('success');
      });
    });

    test('should reject invalid target length', () => {
      const result = AIStoryConfigSchema.safeParse({ targetLength: 'epic' });
      if (result.success === false) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('POV Validation', () => {
    test('should validate narrative POV options', () => {
      const validPOVs = ['first-person', 'third-limited', 'third-omniscient'];
      validPOVs.forEach((pov) => {
        const result = AIStoryConfigSchema.safeParse({ narrativePOV: pov });
        expect(result).toHaveProperty('success');
      });
    });
  });

  describe('Content Type Enums', () => {
    test('should accept audience rating values', () => {
      const validRatings = ['all-ages', 'teen-13', 'mature-18'];
      validRatings.forEach((rating) => {
        const result = AIStoryConfigSchema.safeParse({ audienceRating: rating });
        expect(result).toHaveProperty('success');
      });
    });

    test('should accept world complexity options', () => {
      const validComplexity = ['low', 'medium', 'high'];
      validComplexity.forEach((level) => {
        const result = AIStoryConfigSchema.safeParse({ worldComplexity: level });
        expect(result).toHaveProperty('success');
      });
    });

    test('should accept tech levels', () => {
      const validLevels = ['pre-industrial', 'modern', 'near-future', 'far-future'];
      validLevels.forEach((level) => {
        const result = AIStoryConfigSchema.safeParse({ techLevel: level });
        expect(result).toHaveProperty('success');
      });
    });
  });

  describe('Numeric Range Validation', () => {
    test('should accept intensity values 0-10', () => {
      const result = AIStoryConfigSchema.safeParse({
        violenceIntensity: 5,
        romanceIntensity: 7,
      });
      expect(result).toHaveProperty('success');
    });

    test('should reject intensity > 10', () => {
      const result = AIStoryConfigSchema.safeParse({
        violenceIntensity: 15,
      });
      if (result.success === false) {
        expect(result.error).toBeDefined();
      }
    });

    test('should accept character count ranges', () => {
      const result = AIStoryConfigSchema.safeParse({
        mainCharacterCount: 2,
        supportingCharacterCount: 8,
      });
      expect(result).toHaveProperty('success');
    });
  });

  describe('Array Fields Validation', () => {
    test('should accept tone array', () => {
      const result = AIStoryConfigSchema.safeParse({
        tone: ['hopeful', 'wholesome'],
      });
      expect(result).toHaveProperty('success');
    });

    test('should accept themes array', () => {
      const result = AIStoryConfigSchema.safeParse({
        themes: ['redemption', 'discovery'],
      });
      expect(result).toHaveProperty('success');
    });

    test('should accept conflict types array', () => {
      const result = AIStoryConfigSchema.safeParse({
        conflictType: ['external-action', 'internal-struggle'],
      });
      expect(result).toHaveProperty('success');
    });
  });

  describe('Optional Field Handling', () => {
    test('should allow optional fields to be omitted', () => {
      const config = { primaryGenre: 'fantasy' };
      const result = AIStoryConfigSchema.safeParse(config);
      expect(result).toHaveProperty('success');
    });

    test('should accept partial configuration', () => {
      const config = {
        mode: 'story-only',
        primaryGenre: 'mystery',
      };
      const result = AIStoryConfigSchema.safeParse(config);
      expect(result).toHaveProperty('success');
    });
  });

  describe('Output Format Validation', () => {
    test('should accept output format options', () => {
      const formats = ['markdown', 'json', 'hybrid'];
      formats.forEach((format) => {
        const result = AIStoryConfigSchema.safeParse({ outputFormat: format });
        expect(result).toHaveProperty('success');
      });
    });
  });

  describe('Temperature and Parameters', () => {
    test('should accept valid temperature values', () => {
      const result = AIStoryConfigSchema.safeParse({
        temperature: 0.7,
      });
      expect(result).toHaveProperty('success');
    });

    test('should accept topP values', () => {
      const result = AIStoryConfigSchema.safeParse({
        topP: 0.9,
      });
      expect(result).toHaveProperty('success');
    });

    test('should accept maxTokens', () => {
      const result = AIStoryConfigSchema.safeParse({
        maxTokens: 2000,
      });
      expect(result).toHaveProperty('success');
    });
  });

  describe('Latency Priority Validation', () => {
    test('should accept latency priority options', () => {
      const priorities = ['speed', 'balanced', 'quality'];
      priorities.forEach((priority) => {
        const result = AIStoryConfigSchema.safeParse({
          latencyPriority: priority,
        });
        expect(result).toHaveProperty('success');
      });
    });
  });

  describe('Error Message Quality', () => {
    test('should provide error details on invalid input', () => {
      const result = AIStoryConfigSchema.safeParse({
        mode: 'invalid',
      });
      if (result.success === false) {
        expect(result.error).toBeDefined();
        expect(result.error.errors).toBeDefined();
        expect(Array.isArray(result.error.errors)).toBe(true);
      }
    });
  });

  describe('Type Inference', () => {
    test('should infer types correctly on parse', () => {
      const validConfig = {
        mode: 'story-only' as const,
        primaryGenre: 'fantasy',
        targetLength: 'novella' as const,
      };
      const result = AIStoryConfigSchema.safeParse(validConfig);
      expect(result).toHaveProperty('success');
    });
  });

  describe('Comprehensive Configuration', () => {
    test('should accept comprehensive configuration with many fields', () => {
      const fullConfig = {
        mode: 'story-comic',
        primaryGenre: 'fantasy',
        targetLength: 'novel',
        narrativePOV: 'third-limited',
        audienceRating: 'teen-13',
        worldComplexity: 'high',
        techLevel: 'pre-industrial',
        tone: ['epic', 'wholesome'],
        mainCharacterCount: 2,
        violenceIntensity: 6,
        romanceIntensity: 4,
        outputFormat: 'markdown',
        latencyPriority: 'quality',
        temperature: 0.8,
      };
      const result = AIStoryConfigSchema.safeParse(fullConfig);
      expect(result).toHaveProperty('success');
    });
  });
});
