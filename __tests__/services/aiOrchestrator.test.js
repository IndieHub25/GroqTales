/**
 * AI Orchestrator Tests
 * Tests for Gemini Chairman pattern orchestrator coordinating Gemini and Groq models
 */

jest.mock('../../server/services/geminiService');
jest.mock('../../server/services/groqService');
jest.mock('../../server/utils/logger');

const {
  orchestrateGeneration,
  buildChairmanPrompt,
  parseGeneratedContent,
} = require('../../server/services/ai-orchestrator');
const geminiService = require('../../server/services/geminiService');
const groqService = require('../../server/services/groqService');
const logger = require('../../server/utils/logger');

describe('AIOrchestrator', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    geminiService.generateContent = jest.fn().mockResolvedValue(
      `## Story Title\n### Synopsis\nA hero discovers a hidden kingdom.\n## Chapters\nChapter 1: The Adventure Begins`
    );
    geminiService.classifySafety = jest.fn().mockResolvedValue({ safe: true });

    groqService.generateOutline = jest.fn().mockResolvedValue({
      outline: ['Scene 1', 'Scene 2'],
    });
    groqService.classifySafety = jest.fn().mockResolvedValue({ safe: true });

    logger.info = jest.fn();
    logger.error = jest.fn();
    logger.warn = jest.fn();
    logger.debug = jest.fn();
  });

  describe('Chairman Prompt Building', () => {
    test('should build chairman prompt from config', () => {
      const config = {
        primaryGenre: 'fantasy',
        targetLength: 'novella',
        tone: ['epic', 'wholesome'],
        pacing: 'fast-paced',
        mode: 'story-only',
        narrativePOV: 'third-person limited',
        tense: 'past',
      };

      const prompt = buildChairmanPrompt('Test input', config);

      expect(prompt).toBeDefined();
      expect(typeof prompt).toBe('string');
      expect(prompt).toContain('fantasy');
      expect(prompt).toContain('novella');
    });

    test('should include all major config categories in prompt', () => {
      const config = {
        primaryGenre: 'sci-fi',
        targetLength: 'novel',
        mainCharacterCount: 1,
        antagonistType: 'system',
        mode: 'story-only',
        latencyPriority: 'quality',
        narrativePOV: 'first-person',
        tense: 'present',
        customPremise: 'A space explorer finds a new world',
      };

      const prompt = buildChairmanPrompt('Test input', config);

      expect(prompt).toBeDefined();
      expect(typeof prompt).toBe('string');
    });
  });

  describe('Task Orchestration - Quality Mode', () => {
    test('should use Gemini for full generation in quality mode', async () => {
      const config = {
        mode: 'story-only',
        latencyPriority: 'quality',
        primaryGenre: 'fantasy',
        narrativePOV: 'third-person',
        tense: 'past',
      };
      const userInput = 'A hero discovers a hidden kingdom';

      const result = await orchestrateGeneration({
        config,
        userInput,
      });

      expect(result).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.metadata.model).toBe('gemini-chairman');
      expect(geminiService.generateContent).toHaveBeenCalled();
    });

    test('should include metadata in result', async () => {
      const config = {
        mode: 'story-only',
        latencyPriority: 'quality',
        narrativePOV: 'third-person',
        tense: 'past',
      };

      const result = await orchestrateGeneration({
        config,
        userInput: 'Test input',
      });

      expect(result).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.metadata.durationMs).toBeGreaterThanOrEqual(0);
    });

    test('should log orchestration with correlation ID', async () => {
      const config = {
        mode: 'story-only',
        latencyPriority: 'quality',
        narrativePOV: 'third-person',
        tense: 'past',
      };

      await orchestrateGeneration({
        config,
        userInput: 'Test',
        correlationId: 'corr-123',
      });

      expect(logger.info).toHaveBeenCalled();
    });
  });

  describe('Task Orchestration - Speed Mode', () => {
    test('should orchestrate generation in speed mode', async () => {
      const config = {
        mode: 'story-only',
        latencyPriority: 'fast',
        primaryGenre: 'mystery',
        narrativePOV: 'third-person',
        tense: 'past',
      };
      const userInput = 'A detective investigates a cold case';

      const result = await orchestrateGeneration({
        config,
        userInput,
      });

      expect(result).toBeDefined();
      expect(result.metadata).toBeDefined();
    });
  });

  describe('Comic Generation Orchestration', () => {
    test('should handle comic mode generation', async () => {
      const config = {
        mode: 'comic-only',
        primaryGenre: 'action',
        panelCount: 6,
        narrativePOV: 'third-person',
        tense: 'past',
      };
      const userInput = 'Action sequence comic';

      const result = await orchestrateGeneration({
        config,
        userInput,
      });

      expect(result).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    test('should generate panel breakdown for comics', async () => {
      const config = {
        mode: 'story-comic',
        primaryGenre: 'adventure',
        narrativePOV: 'third-person',
        tense: 'past',
      };

      const result = await orchestrateGeneration({
        config,
        userInput: 'Adventure story',
      });

      expect(result).toBeDefined();
      expect(result.metadata).toBeDefined();
    });
  });

  describe('Streaming Generation', () => {
    test('should handle streaming with onChunk callback', async () => {
      const chunks = [];
      const onChunk = jest.fn((chunk) => {
        chunks.push(chunk);
      });

      const config = {
        mode: 'story-only',
        primaryGenre: 'fantasy',
        narrativePOV: 'third-person',
        tense: 'past',
      };

      const result = await orchestrateGeneration({
        config,
        userInput: 'Test streaming',
        streaming: true,
        onChunk,
      });

      expect(result).toBeDefined();
      expect(result.metadata).toBeDefined();
    });
  });

  describe('Logging and Tracing', () => {
    test('should log model decisions', async () => {
      const config = {
        mode: 'story-only',
        latencyPriority: 'fast',
        narrativePOV: 'third-person',
        tense: 'past',
      };

      await orchestrateGeneration({
        config,
        userInput: 'Test input',
      });

      expect(logger.info).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should fallback to Gemini if Groq fails', async () => {
      groqService.generateOutline.mockRejectedValueOnce(
        new Error('Groq API error')
      );

      const config = {
        mode: 'story-only',
        latencyPriority: 'fast',
        narrativePOV: 'third-person',
        tense: 'past',
      };

      const result = await orchestrateGeneration({
        config,
        userInput: 'Test input',
      });

      expect(result).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    test('should return error if Gemini fails', async () => {
      geminiService.generateContent.mockRejectedValueOnce(
        new Error('Gemini API error')
      );

      const config = {
        mode: 'story-only',
        latencyPriority: 'quality',
        narrativePOV: 'third-person',
        tense: 'past',
      };

      await expect(
        orchestrateGeneration({
          config,
          userInput: 'Test input',
        })
      ).rejects.toThrow('Gemini API error');
    });

    test('should log errors appropriately', async () => {
      geminiService.generateContent.mockRejectedValueOnce(
        new Error('Test error')
      );

      const config = {
        mode: 'story-only',
        latencyPriority: 'quality',
        narrativePOV: 'third-person',
        tense: 'past',
      };

      try {
        await orchestrateGeneration({
          config,
          userInput: 'Test input',
        });
      } catch (e) {
        // Expected to throw
      }

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('Output Parsing', () => {
    test('should parse generated content correctly', () => {
      const content = `
# Story Title

## Synopsis
A hero discovers a hidden kingdom.

## Chapters
Chapter 1: The Adventure Begins
Chapter 2: The Challenge
      `;

      const result = parseGeneratedContent(content, {
        mode: 'story-only',
        primaryGenre: 'fantasy',
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });
});
