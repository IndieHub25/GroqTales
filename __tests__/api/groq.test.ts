/**
 * Tests for Enhanced Groq API Route
 * Covers security, validation, and error handling improvements
 */

import { NextRequest } from 'next/server';
import { describe, expect, it, jest, beforeEach } from '@jest/globals';

// Mock the dependencies
jest.mock('@/lib/groq-service');
jest.mock('@/lib/rate-limit');
jest.mock('@/lib/schemas/proPanelSchemas');

import { POST, GET } from '@/app/api/groq/route';
import * as groqService from '@/lib/groq-service';
import * as rateLimit from '@/lib/rate-limit';
import { ParametersSchema } from '@/lib/schemas/proPanelSchemas';

// Test utilities
function createMockRequest(
  method: 'GET' | 'POST',
  body?: any,
  headers: Record<string, string> = {}
) {
  const url = new URL('http://localhost:3000/api/groq');
  return new NextRequest(url, {
    method,
    headers: new Headers({
      'content-type': 'application/json',
      'x-forwarded-for': '127.0.0.1',
      ...headers,
    }),
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe('/api/groq Enhanced Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock rate limiting to pass by default
    (rateLimit.getClientIp as jest.Mock).mockReturnValue('127.0.0.1');
    (rateLimit.checkRateLimit as jest.Mock).mockResolvedValue(null);

    // Mock successful schema validation by default
    (ParametersSchema.safeParse as jest.Mock).mockReturnValue({
      success: true,
      data: {},
    });
  });

  describe('Request Size Validation', () => {
    it('should reject requests that are too large', async () => {
      const request = createMockRequest('POST', { action: 'generate' }, {
        'content-length': '200000', // 200KB, exceeds 100KB limit
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(413);
      expect(data.error).toBe('Request too large');
      expect(data.maxSize).toBe('100KB');
    });

    it('should accept requests within size limit', async () => {
      (groqService.generateStoryContent as jest.Mock).mockResolvedValue('Generated story');

      const request = createMockRequest('POST', {
        action: 'generate',
        prompt: 'Test story prompt',
      }, {
        'content-length': '500', // Well within limit
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Input Validation', () => {
    it('should validate prompt length for generate action', async () => {
      const longPrompt = 'x'.repeat(10001); // Exceeds MAX_PROMPT_LENGTH
      const request = createMockRequest('POST', {
        action: 'generate',
        prompt: longPrompt,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toMatch(/Prompt too long/);
    });

    it('should validate content length for analyze action', async () => {
      const longContent = 'x'.repeat(50001); // Exceeds MAX_CONTENT_LENGTH
      const request = createMockRequest('POST', {
        action: 'analyze',
        content: longContent,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toMatch(/Content too long/);
    });

    it('should reject empty prompts', async () => {
      const request = createMockRequest('POST', {
        action: 'generate',
        prompt: '   ', // Whitespace only
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Prompt cannot be empty');
    });

    it('should validate action parameter', async () => {
      const request = createMockRequest('POST', {
        action: 'invalid_action',
        prompt: 'Test prompt',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid action');
      expect(data.validActions).toEqual(['generate', 'analyze', 'ideas', 'improve']);
    });
  });

  describe('Pro Panel Configuration Validation', () => {
    it('should handle Pro Panel validation failures with detailed errors', async () => {
      (ParametersSchema.safeParse as jest.Mock).mockReturnValue({
        success: false,
        error: {
          errors: [
            { path: ['modelSettings', 'temperature'], message: 'Must be between 0 and 2' },
            { path: ['storyStructure', 'pacing'], message: 'Invalid enum value' },
          ],
        },
      });

      const request = createMockRequest('POST', {
        action: 'generate',
        prompt: 'Test prompt',
        proConfig: { invalid: 'config' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid Pro Panel configuration');
      expect(data.details).toHaveLength(2);
      expect(data.validationSummary).toBe('2 validation errors found');
    });

    it('should validate title for Pro Panel generation', async () => {
      const request = createMockRequest('POST', {
        action: 'generate',
        prompt: 'Test prompt',
        proConfig: {},
        title: '', // Empty title
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Title must be a non-empty string for Pro Panel generation');
    });
  });

  describe('Rate Limiting Integration', () => {
    it('should respect rate limits', async () => {
      const rateLimitResponse = new Response(
        JSON.stringify({ error: 'Too many requests' }),
        { status: 429 }
      );
      (rateLimit.checkRateLimit as jest.Mock).mockResolvedValue(rateLimitResponse);

      const request = createMockRequest('POST', {
        action: 'generate',
        prompt: 'Test prompt',
      });

      const response = await POST(request);

      expect(response.status).toBe(429);
    });
  });

  describe('Error Categorization', () => {
    it('should categorize validation errors correctly', async () => {
      (groqService.generateStoryContent as jest.Mock).mockRejectedValue(
        new Error('Invalid input: prompt too short')
      );

      const request = createMockRequest('POST', {
        action: 'generate',
        prompt: 'Valid prompt',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.category).toBe('validation_error');
    });

    it('should categorize rate limit errors correctly', async () => {
      (groqService.generateStoryContent as jest.Mock).mockRejectedValue(
        new Error('Rate limit exceeded for this API key')
      );

      const request = createMockRequest('POST', {
        action: 'generate',
        prompt: 'Valid prompt',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.category).toBe('rate_limit_error');
    });

    it('should categorize timeout errors correctly', async () => {
      (groqService.generateStoryContent as jest.Mock).mockRejectedValue(
        new Error('Request timeout after 30s')
      );

      const request = createMockRequest('POST', {
        action: 'generate',
        prompt: 'Valid prompt',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(504);
      expect(data.category).toBe('timeout_error');
    });
  });

  describe('JSON Parsing Security', () => {
    it('should handle malformed JSON gracefully', async () => {
      const url = new URL('http://localhost:3000/api/groq');
      const request = new NextRequest(url, {
        method: 'POST',
        headers: new Headers({
          'content-type': 'application/json',
          'x-forwarded-for': '127.0.0.1',
        }),
        body: '{ invalid json }', // Malformed JSON
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid JSON in request body');
    });
  });

  describe('Type Validation', () => {
    it('should validate genre type for standard generation', async () => {
      const request = createMockRequest('POST', {
        action: 'generate',
        prompt: 'Test prompt',
        genre: 123, // Invalid type
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Genre must be a string');
    });

    it('should validate genre for ideas action', async () => {
      const request = createMockRequest('POST', {
        action: 'ideas',
        genre: '', // Empty string
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Genre is required and must be a non-empty string');
    });

    it('should validate focus type for improve action', async () => {
      const request = createMockRequest('POST', {
        action: 'improve',
        content: 'Valid content to improve',
        focus: 123, // Invalid type
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Focus must be a string');
    });
  });

  describe('GET Endpoint Security', () => {
    it('should apply rate limiting to test requests', async () => {
      const rateLimitResponse = new Response(
        JSON.stringify({ error: 'Too many requests' }),
        { status: 429 }
      );
      (rateLimit.checkRateLimit as jest.Mock).mockResolvedValue(rateLimitResponse);

      const url = new URL('http://localhost:3000/api/groq?action=test');
      const request = new NextRequest(url, { method: 'GET' });

      const response = await GET(request);

      expect(response.status).toBe(429);
    });

    it('should return enhanced model metadata', async () => {
      const mockModels = {
        STORY_GENERATION: 'llama-3.3-70b-versatile',
        STORY_ANALYSIS: 'llama-3.1-8b-instant',
        CONTENT_IMPROVEMENT: 'mixtral-8x7b-32768',
        RECOMMENDATIONS: 'llama-3.1-8b-instant',
      };

      (groqService as any).GROQ_MODELS = mockModels;

      const request = createMockRequest('GET');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.models).toEqual(mockModels);
      expect(data.modelCapabilities).toBeDefined();
      expect(data.modelCapabilities[mockModels.STORY_GENERATION]).toMatchObject({
        maxTokens: 32768,
        costTier: 'high',
        qualityTier: 'premium',
        speedTier: 'moderate',
      });
    });
  });

  describe('Logging Behavior', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should log successful requests', async () => {
      (groqService.generateStoryContent as jest.Mock).mockResolvedValue('Generated story');

      const request = createMockRequest('POST', {
        action: 'generate',
        prompt: 'Test prompt',
      });

      await POST(request);

      expect(console.log).toHaveBeenCalledWith(
        '[groq-api] Request completed:',
        expect.objectContaining({
          action: 'generate',
          success: true,
          clientIp: '127.0.0.1',
        })
      );
    });

    it('should log failed requests with error details', async () => {
      const request = createMockRequest('POST', {
        action: 'generate',
        prompt: '', // Invalid empty prompt
      });

      await POST(request);

      expect(console.error).toHaveBeenCalledWith(
        '[groq-api] Request failed:',
        expect.objectContaining({
          action: 'generate',
          success: false,
          error: 'Prompt cannot be empty',
        })
      );
    });
  });
});