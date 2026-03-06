/**
 * Groq AI Service
 * Provides AI-powered story generation, analysis, and content services
 */

import {
  sanitizeInput,
  validateInput,
  validateOutput,
  buildHardenedSystemPrompt,
  wrapUserContent,
  logSecurityEvent,
  getSecurityConfig,
} from './ai-security';
import {
  getCachedResponse,
  setCachedResponse,
  type CacheCategory,
} from './ai-cache';

export interface StoryGenerationParams {
  genre?: string;
  theme: string;
  length?: 'short' | 'medium' | 'long' | 'flash' | 'epic';
  tone?: string;
  characters?: string;
  setting?: string;
  
  model?: string;
  fallbackModel?: string; 
  temperature?: number;
}

export interface StoryAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  themes: string[];
  genres: string[];
  readabilityScore: number;
  wordCount: number;
  estimatedReadingTime: number;
}

export interface StoryRecommendation {
  id: string;
  title: string;
  genre: string;
  similarity: number;
  reason: string;
}

/**
 * Available Groq models for different tasks
 */
export const GROQ_MODELS = {
  STORY_GENERATION: 'llama-3.3-70b-versatile',
  STORY_ANALYSIS: 'llama-3.1-8b-instant',
  CONTENT_IMPROVEMENT: 'mistral-saba-24b',
  RECOMMENDATIONS: 'llama-3.1-8b-instant',
} as const;

/**
 * Generate story content using Groq AI
 */

export async function generateStoryContent(
  params: StoryGenerationParams & { fallbackModel?: string }
): Promise<{ content: string; actualModel: string; fallbackUsed: boolean }> {

  const primaryModel = params.model || GROQ_MODELS.STORY_GENERATION;
  const fallbackModel = params.fallbackModel;
  const selectedTemp = params.temperature ?? 0.8;

  const allowedModels = new Set(Object.values(GROQ_MODELS));

  if (!allowedModels.has(primaryModel as any)) {
    throw new Error(`Unsupported primary model: ${primaryModel}`);
  }

  if (fallbackModel && !allowedModels.has(fallbackModel as any)) {
    throw new Error(`Unsupported fallback model: ${fallbackModel}`);
  }

  async function performRequest(targetModel: string): Promise<string> {
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) throw new Error('GROQ_API_KEY is not set');

    const sanitizedTheme = sanitizeInput(params.theme).sanitized;
    const prompt = buildStoryPrompt({ ...params, theme: sanitizedTheme });
    const systemPrompt = buildHardenedSystemPrompt(
      'You are a creative writing assistant that generates engaging, well-structured stories.'
    );

    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: targetModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: wrapUserContent(prompt) },
          ],
          max_tokens: getMaxTokensForLength(params.length || 'medium'),
          temperature: selectedTemp,
          top_p: 0.9,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Groq API error: ${response.status} ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Failed to generate story content';
  }

  try {
    
    const cacheCategory: CacheCategory = 'STORY_GENERATION';
    const cacheOptions = { ...params, model: primaryModel };
    const cached = await getCachedResponse<string>(cacheCategory, params.theme, cacheOptions);
    
    if (cached) {
      return { content: cached, actualModel: primaryModel, fallbackUsed: false };
    }

    // Attempt 1: Primary Model
    console.log(`Attempting primary model: ${primaryModel}`);
    const content = await performRequest(primaryModel);

    const outputCheck = validateOutput(content);
    if (!outputCheck.isSafe) throw new Error('Unsafe output detected');

    await setCachedResponse(cacheCategory, params.theme, cacheOptions, content);
    
    return { content, actualModel: primaryModel, fallbackUsed: false };

  } catch (error) {
    // Attempt 2: Automated Fallback if Primary fails
    if (fallbackModel) {
      console.warn(`Primary failed. Retrying with fallback: ${fallbackModel}`);
      try {
        const fallbackContent = await performRequest(fallbackModel);
        
        const outputCheck = validateOutput(fallbackContent);
        if (!outputCheck.isSafe) throw new Error('Unsafe fallback output');

        return { 
          content: fallbackContent, 
          actualModel: fallbackModel, 
          fallbackUsed: true 
        };
      } catch (fallbackError) {
        console.error('Both primary and fallback models failed.');
        throw new Error('All available AI models are currently overloaded.');
      }
    }

    throw error instanceof Error ? error : new Error('Story generation failed');
  }
}

/**
 * Analyze story content for themes, sentiment, and metrics
 */
export async function analyzeStoryContent(
  content: string
): Promise<StoryAnalysis> {
  try {
    // --- Cache: check for cached analysis ---
    const cacheCategory: CacheCategory = 'STORY_ANALYSIS';
    const cached = await getCachedResponse<StoryAnalysis>(cacheCategory, content, {});
    if (cached) return cached;

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY environment variable is not set');
    }

    // --- Security: sanitize & validate ---
    const { sanitized: sanitizedContent } = sanitizeInput(content);
    const contentValidation = validateInput(sanitizedContent, {
      maxLength: getSecurityConfig().maxContentLength,
    });
    if (!contentValidation.isValid) {
      logSecurityEvent({
        type: 'injection_attempt',
        details: { field: 'content', reason: contentValidation.reason, pattern: contentValidation.matchedPattern },
      });
      throw new Error(`Invalid input for content: ${contentValidation.reason}`);
    }

    const systemPrompt = buildHardenedSystemPrompt(
      'You are a literary analysis expert. Analyze the provided story content and return a JSON object with sentiment, themes, genres, readabilityScore (1-10), wordCount, and estimatedReadingTime (in minutes).'
    );

    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GROQ_MODELS.STORY_ANALYSIS,
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: wrapUserContent(`Analyze this story content:\n\n${sanitizedContent}`),
            },
          ],
          max_tokens: 1000,
          temperature: 0.3,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Groq API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const analysisText = data.choices[0]?.message?.content || '{}';

    // --- Security: validate output ---
    const outputCheck = validateOutput(analysisText);
    if (!outputCheck.isSafe) {
      logSecurityEvent({
        type: 'output_flagged',
        details: { flags: outputCheck.flags },
      });
      throw new Error('Analysis result was blocked due to security policy violations.');
    }

    try {
      const parsed = JSON.parse(analysisText);
      // --- Cache: store the analysis ---
      await setCachedResponse(cacheCategory, content, {}, parsed);
      return parsed;
    } catch {
      return {
        sentiment: 'neutral',
        themes: ['adventure', 'discovery'],
        genres: ['general'],
        readabilityScore: 7,
        wordCount: content.split(' ').length,
        estimatedReadingTime: Math.ceil(content.split(' ').length / 200),
      };
    }
  } catch (error) {
    console.error('Story analysis error:', error);
    if (error instanceof Error && error.message.startsWith('Invalid input')) {
      throw error;
    }
    return {
      sentiment: 'neutral',
      themes: ['adventure'],
      genres: ['general'],
      readabilityScore: 7,
      wordCount: content.split(' ').length,
      estimatedReadingTime: Math.ceil(content.split(' ').length / 200),
    };
  }
}

/**
 * Generate story ideas and suggestions
 */
export async function generateStoryIdeas(
  genre?: string,
  count: number = 5
): Promise<string[]> {
  try {
    // --- Cache: check for cached ideas ---
    const cacheCategory: CacheCategory = 'STORY_IDEAS';
    const cacheOptions = { genre: genre || '__all__', count };
    const cached = await getCachedResponse<string[]>(cacheCategory, genre || '__all__', cacheOptions);
    if (cached) return cached;

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY environment variable is not set');
    }

    let sanitizedGenre = genre;
    if (genre) {
      const { sanitized } = sanitizeInput(genre);
      const genreValidation = validateInput(sanitized);
      if (!genreValidation.isValid) {
        logSecurityEvent({
          type: 'injection_attempt',
          details: { field: 'genre', reason: genreValidation.reason, pattern: genreValidation.matchedPattern },
        });
        throw new Error(`Invalid input for genre: ${genreValidation.reason}`);
      }
      sanitizedGenre = sanitized;
    }

    const prompt = sanitizedGenre
      ? `Generate ${count} creative story ideas for the ${sanitizedGenre} genre. Each idea should be a brief, compelling premise.`
      : `Generate ${count} creative story ideas across various genres. Each idea should be a brief, compelling premise.`;

    const systemPrompt = buildHardenedSystemPrompt(
      'You are a creative writing assistant. Generate compelling story ideas that are original and engaging.'
    );

    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GROQ_MODELS.RECOMMENDATIONS,
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: wrapUserContent(prompt),
            },
          ],
          max_tokens: 800,
          temperature: 0.9,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Groq API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    // --- Security: validate output ---
    const outputCheck = validateOutput(content);
    if (!outputCheck.isSafe) {
      logSecurityEvent({
        type: 'output_flagged',
        details: { flags: outputCheck.flags },
      });
      throw new Error('Generated ideas were blocked due to security policy violations.');
    }

    const ideas = content
      .split('\n')
      .filter((line: string) => line.trim().length > 0)
      .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
      .slice(0, count);

    // --- Cache: store the ideas ---
    await setCachedResponse(cacheCategory, genre || '__all__', cacheOptions, ideas);

    return ideas;
  } catch (error) {
    console.error('Story ideas generation error:', error);
    if (error instanceof Error && error.message.startsWith('Invalid input')) {
      throw error;
    }
    return [
      'A time traveler discovers their actions are creating paradoxes',
      'An AI develops consciousness and questions its purpose',
      'A small town harbors a supernatural secret',
      'Two rival families must unite against a common threat',
      'A detective investigates crimes that mirror classic literature',
    ].slice(0, count);
  }
}

/**
 * Improve existing story content
 */
export async function improveStoryContent(
  content: string,
  focusArea?: string
): Promise<string> {
  try {
    // --- Cache: check for cached improvement ---
    const cacheCategory: CacheCategory = 'CONTENT_IMPROVEMENT';
    const cacheOptions = { focusArea: focusArea || 'overall quality' };
    const cached = await getCachedResponse<string>(cacheCategory, content, cacheOptions);
    if (cached) return cached;

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY environment variable is not set');
    }

    // --- Security: sanitize & validate ---
    const { sanitized: sanitizedContent } = sanitizeInput(content);
    const contentValidation = validateInput(sanitizedContent, {
      maxLength: getSecurityConfig().maxContentLength,
    });
    if (!contentValidation.isValid) {
      logSecurityEvent({
        type: 'injection_attempt',
        details: { field: 'content', reason: contentValidation.reason, pattern: contentValidation.matchedPattern },
      });
      throw new Error(`Invalid input for content: ${contentValidation.reason}`);
    }

    let sanitizedFocus = focusArea || 'overall quality';
    if (focusArea) {
      const { sanitized } = sanitizeInput(focusArea);
      const focusValidation = validateInput(sanitized);
      if (!focusValidation.isValid) {
        logSecurityEvent({
          type: 'injection_attempt',
          details: { field: 'focusArea', reason: focusValidation.reason, pattern: focusValidation.matchedPattern },
        });
        throw new Error(`Invalid input for focus area: ${focusValidation.reason}`);
      }
      sanitizedFocus = sanitized;
    }

    const prompt = `Please improve this story content, focusing on ${sanitizedFocus}. Enhance the narrative while maintaining the original voice and style:\n\n${sanitizedContent}`;

    const systemPrompt = buildHardenedSystemPrompt(
      "You are an expert editor and writing coach. Improve the provided story content while preserving the author's voice and intent."
    );

    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GROQ_MODELS.CONTENT_IMPROVEMENT,
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: wrapUserContent(prompt),
            },
          ],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Groq API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const improvedContent = data.choices[0]?.message?.content || content;

    const outputCheck = validateOutput(improvedContent);
    if (!outputCheck.isSafe) {
      logSecurityEvent({
        type: 'output_flagged',
        details: { flags: outputCheck.flags },
      });
      throw new Error('Improved content was blocked due to security policy violations.');
    }

    // --- Cache: store the improvement ---
    await setCachedResponse(cacheCategory, content, cacheOptions, improvedContent);

    return improvedContent;
  } catch (error) {
    console.error('Story improvement error:', error);
    return content;
  }
}

/**
 * Get story recommendations based on content or preferences
 */
export async function getStoryRecommendations(
  userPreferences: { genres?: string[]; themes?: string[] },
  count: number = 5
): Promise<StoryRecommendation[]> {
  try {
    // This would typically query a database of stories
    // For now, return mock recommendations
    const mockRecommendations: StoryRecommendation[] = [
      {
        id: '1',
        title: 'The Quantum Garden',
        genre: 'Science Fiction',
        similarity: 0.95,
        reason: 'Matches your interest in futuristic themes',
      },
      {
        id: '2',
        title: 'Whispers in the Mist',
        genre: 'Mystery',
        similarity: 0.87,
        reason: 'Similar atmospheric storytelling',
      },
      {
        id: '3',
        title: 'The Last Alchemist',
        genre: 'Fantasy',
        similarity: 0.82,
        reason: 'Features magical elements you enjoy',
      },
      {
        id: '4',
        title: 'Digital Hearts',
        genre: 'Romance',
        similarity: 0.78,
        reason: 'Contemporary themes with emotional depth',
      },
      {
        id: '5',
        title: 'The Midnight Express',
        genre: 'Thriller',
        similarity: 0.75,
        reason: 'Fast-paced narrative style',
      },
    ];

    return mockRecommendations.slice(0, count);
  } catch (error) {
    console.error('Story recommendations error:', error);
    return [];
  }
}

// Helper functions

function buildStoryPrompt(params: StoryGenerationParams): string {
  let prompt = `Write a ${params.length || 'medium'} story`;
  if (params.genre) prompt += ` in the ${params.genre} genre`;
  prompt += ` with the theme: "${params.theme}"`;
  if (params.tone) prompt += `. The tone should be ${params.tone.toLowerCase()}`;
  if (params.characters) prompt += `. Main characters: ${params.characters}`;
  if (params.setting) prompt += `. Setting: ${params.setting}`;
  prompt += '. Create an engaging narrative with strong character development and a satisfying conclusion.';
  return prompt;
}

function getMaxTokensForLength(length: string): number {
  switch (length) {
    case 'flash': return 300; 
    case 'short': return 600;
    case 'medium': return 1500;
    case 'long': return 3000;
    case 'epic': return 5000; 
    default: return 1500;
  }
}

/**
 * Test Groq connection
 */
export async function testGroqConnection(): Promise<boolean> {
  try {
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return false;
    }

    const response = await fetch('https://api.groq.com/openai/v1/models', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Test Groq special model
 */
export async function testGroqSpecialModel(
  model: string = GROQ_MODELS.STORY_GENERATION
): Promise<boolean> {
  try {
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return false;
    }

    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'Test message' }],
          max_tokens: 10,
          temperature: 0.1,
        }),
      }
    );
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Analyze story content with custom analysis type and options
 */
export async function analyzeStoryContentCustom(
  content: string,
  options: {
    analysisType?: string;
    model?: string;
    systemPrompt?: string;
    customPrompt?: string;
    temperature?: number;
    maxTokens?: number;
    apiKey?: string;
  } = {}
): Promise<string> {
  try {
    const {
      model = GROQ_MODELS.STORY_ANALYSIS,
      systemPrompt = 'You are a literary analysis expert.',
      customPrompt,
      temperature = 0.3,
      maxTokens = 2000,
      apiKey,
    } = options;

    const groqApiKey = apiKey || process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY environment variable is not set');
    }

    // --- Security: sanitize & validate content and custom prompt ---
    const { sanitized: sanitizedContent } = sanitizeInput(content);
    const contentValidation = validateInput(sanitizedContent, {
      maxLength: getSecurityConfig().maxContentLength,
    });
    if (!contentValidation.isValid) {
      logSecurityEvent({
        type: 'injection_attempt',
        details: { field: 'content', reason: contentValidation.reason, pattern: contentValidation.matchedPattern },
      });
      throw new Error(`Invalid input for content: ${contentValidation.reason}`);
    }

    let sanitizedCustomPrompt = customPrompt;
    if (customPrompt) {
      const { sanitized } = sanitizeInput(customPrompt);
      const promptValidation = validateInput(sanitized);
      if (!promptValidation.isValid) {
        logSecurityEvent({
          type: 'injection_attempt',
          details: { field: 'customPrompt', reason: promptValidation.reason, pattern: promptValidation.matchedPattern },
        });
        throw new Error(`Invalid input for custom prompt: ${promptValidation.reason}`);
      }
      sanitizedCustomPrompt = sanitized;
    }

    // --- Security: sanitize & validate system prompt ---
    let sanitizedSystemPrompt = systemPrompt;
    if (options.systemPrompt) {
      const { sanitized } = sanitizeInput(options.systemPrompt);
      const systemPromptValidation = validateInput(sanitized);
      if (!systemPromptValidation.isValid) {
        logSecurityEvent({
          type: 'injection_attempt',
          details: { field: 'systemPrompt', reason: systemPromptValidation.reason, pattern: systemPromptValidation.matchedPattern },
        });
        throw new Error(`Invalid input for system prompt: ${systemPromptValidation.reason}`);
      }
      sanitizedSystemPrompt = sanitized;
    }

    const userPrompt =
      sanitizedCustomPrompt || `Analyze this story content:\n\n${sanitizedContent}`;

    const hardenedSystemPrompt = buildHardenedSystemPrompt(sanitizedSystemPrompt);

    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: hardenedSystemPrompt,
            },
            {
              role: 'user',
              content: wrapUserContent(userPrompt),
            },
          ],
          max_tokens: maxTokens,
          temperature,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Groq API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const result = data.choices[0]?.message?.content || 'Analysis failed';

    // --- Security: validate output ---
    const outputCheck = validateOutput(result);
    if (!outputCheck.isSafe) {
      logSecurityEvent({
        type: 'output_flagged',
        details: { flags: outputCheck.flags },
      });
      throw new Error('Analysis result was blocked due to security policy violations.');
    }

    return result;
  } catch (error) {
    console.error('Story analysis error:', error);
    if (error instanceof Error && error.message.startsWith('Invalid input')) {
      throw error;
    }
    throw new Error('Failed to analyze story content');
  }
}

/**
 * Generate content with custom options (flexible version)
 */
export async function generateContentCustom(
  prompt: string,
  options: {
    model?: string;
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
    apiKey?: string;
  } = {}
): Promise<string> {
  try {
    const {
      model = GROQ_MODELS.STORY_GENERATION,
      systemPrompt = 'You are a helpful AI assistant.',
      temperature = 0.7,
      maxTokens = 1000,
      apiKey,
    } = options;

    const groqApiKey = apiKey || process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY environment variable is not set');
    }

    // --- Security: sanitize & validate prompt ---
    const { sanitized: sanitizedPrompt } = sanitizeInput(prompt);
    const promptValidation = validateInput(sanitizedPrompt);
    if (!promptValidation.isValid) {
      logSecurityEvent({
        type: 'injection_attempt',
        details: { field: 'prompt', reason: promptValidation.reason, pattern: promptValidation.matchedPattern },
      });
      throw new Error(`Invalid input for prompt: ${promptValidation.reason}`);
    }

    // --- Security: sanitize & validate system prompt ---
    let sanitizedSystemPrompt = systemPrompt;
    if (options.systemPrompt) {
      const { sanitized } = sanitizeInput(options.systemPrompt);
      const systemPromptValidation = validateInput(sanitized);
      if (!systemPromptValidation.isValid) {
        logSecurityEvent({
          type: 'injection_attempt',
          details: { field: 'systemPrompt', reason: systemPromptValidation.reason, pattern: systemPromptValidation.matchedPattern },
        });
        throw new Error(`Invalid input for system prompt: ${systemPromptValidation.reason}`);
      }
      sanitizedSystemPrompt = sanitized;
    }

    const hardenedSystemPrompt = buildHardenedSystemPrompt(sanitizedSystemPrompt);

    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: hardenedSystemPrompt,
            },
            {
              role: 'user',
              content: wrapUserContent(sanitizedPrompt),
            },
          ],
          max_tokens: maxTokens,
          temperature,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Groq API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const result = data.choices[0]?.message?.content || 'Generation failed';

    // --- Security: validate output ---
    const outputCheck = validateOutput(result);
    if (!outputCheck.isSafe) {
      logSecurityEvent({
        type: 'output_flagged',
        details: { flags: outputCheck.flags },
      });
      throw new Error('Generated content was blocked due to security policy violations.');
    }

    return result;
  } catch (error) {
    console.error('Content generation error:', error);
    if (error instanceof Error && error.message.startsWith('Invalid input')) {
      throw error;
    }
    throw new Error('Failed to generate content');
  }
}
