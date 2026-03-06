import { NextRequest, NextResponse } from 'next/server';

import {
  generateStoryContent,
  analyzeStoryContent,
  generateStoryIdeas,
  improveStoryContent,
  testGroqConnection,
  testGroqSpecialModel,
} from '@/lib/groq-service';
import { checkRateLimit, getClientIp, rateLimiters } from '@/lib/rate-limit';
import { ParametersSchema } from '@/lib/schemas/proPanelSchemas';

// Request size limits for security
const MAX_PROMPT_LENGTH = 10000;
const MAX_CONTENT_LENGTH = 50000;
const MAX_REQUEST_SIZE = 100 * 1024; // 100KB

// Enhanced logging utility
function logRequest(
  method: string,
  clientIp: string,
  action: string,
  success: boolean,
  error?: string
) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    method,
    clientIp: clientIp.includes(':') ? clientIp.split(':')[0] : clientIp, // Anonymize IPv6
    action,
    success,
    error,
  };

  if (success) {
    console.log('[groq-api] Request completed:', logEntry);
  } else {
    console.error('[groq-api] Request failed:', logEntry);
  }
}

// Request validation helper
function validateRequestSize(request: NextRequest): NextResponse | null {
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > MAX_REQUEST_SIZE) {
    return NextResponse.json(
      {
        error: 'Request too large',
        maxSize: `${MAX_REQUEST_SIZE / 1024}KB`,
      },
      { status: 413 }
    );
  }
  return null;
}

// Input validation helpers
function validatePrompt(prompt: string): string | null {
  if (!prompt || typeof prompt !== 'string') {
    return 'Prompt is required and must be a string';
  }
  if (prompt.trim().length === 0) {
    return 'Prompt cannot be empty';
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return `Prompt too long (max ${MAX_PROMPT_LENGTH} characters)`;
  }
  return null;
}

function validateContent(content: string): string | null {
  if (!content || typeof content !== 'string') {
    return 'Content is required and must be a string';
  }
  if (content.trim().length === 0) {
    return 'Content cannot be empty';
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    return `Content too long (max ${MAX_CONTENT_LENGTH} characters)`;
  }
  return null;
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  let action = 'unknown';

  try {
    // Check request size first
    const sizeValidation = validateRequestSize(request);
    if (sizeValidation) return sizeValidation;

    // Rate limit: AI generation tier (10 req / 60s per IP)
    const rateLimitResponse = await checkRateLimit(rateLimiters.ai, clientIp);
    if (rateLimitResponse) {
      logRequest('POST', clientIp, action, false, 'Rate limit exceeded');
      return rateLimitResponse;
    }

    let body: any;
    try {
      body = await request.json();
    } catch (parseError) {
      logRequest('POST', clientIp, action, false, 'Invalid JSON');
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const {
      action: requestAction,
      prompt,
      content,
      genre,
      theme,
      length,
      model,
      options,
      focus,
      apiKey,
      proConfig, // Pro Panel configuration
      title, // Story title for Pro Panel generation
    } = body;

    action = requestAction || 'unknown';

    // Validate action
    const validActions = ['generate', 'analyze', 'ideas', 'improve'];
    if (!validActions.includes(action)) {
      logRequest('POST', clientIp, action, false, `Invalid action: ${action}`);
      return NextResponse.json(
        {
          error: 'Invalid action',
          validActions,
        },
        { status: 400 }
      );
    }

    // Create updated options with API key if provided
    const updatedOptions = apiKey ? { ...options, apiKey } : options;
    let result;

    switch (action) {
      case 'generate': {
        const promptError = validatePrompt(prompt);
        if (promptError) {
          logRequest('POST', clientIp, action, false, promptError);
          return NextResponse.json({ error: promptError }, { status: 400 });
        }

        // If proConfig is provided, use Pro Panel generation
        if (proConfig) {
          // Validate the proConfig with detailed error reporting
          const validationResult = ParametersSchema.safeParse(proConfig);
          if (!validationResult.success) {
            const errorDetails = validationResult.error.errors.map(
              (e) => `${e.path.join('.')}: ${e.message}`
            );

            logRequest(
              'POST',
              clientIp,
              action,
              false,
              `Pro Panel validation failed: ${errorDetails.join(', ')}`
            );

            return NextResponse.json(
              {
                error: 'Invalid Pro Panel configuration',
                details: validationResult.error.errors,
                validationSummary: `${validationResult.error.errors.length} validation errors found`,
              },
              { status: 400 }
            );
          }

          // Additional validation for Pro Panel specific fields
          if (
            title &&
            (typeof title !== 'string' || title.trim().length === 0)
          ) {
            logRequest(
              'POST',
              clientIp,
              action,
              false,
              'Invalid title for Pro Panel generation'
            );
            return NextResponse.json(
              {
                error:
                  'Title must be a non-empty string for Pro Panel generation',
              },
              { status: 400 }
            );
          }

          result = await generateStoryContent({
            theme: prompt,
            genre: validationResult.data.toneStyle?.primaryTone || 'general',
            tone: validationResult.data.toneStyle?.proseStyle,
            characters: validationResult.data.characters?.supportingCastSize,
            setting: validationResult.data.world?.settingType,
          });
        } else {
          // Use standard generation with additional validation
          if (genre && typeof genre !== 'string') {
            logRequest('POST', clientIp, action, false, 'Invalid genre type');
            return NextResponse.json(
              { error: 'Genre must be a string' },
              { status: 400 }
            );
          }

          result = await generateStoryContent({
            theme: prompt,
            genre,
            length,
            tone: updatedOptions?.tone,
            characters: updatedOptions?.characters,
            setting: updatedOptions?.setting,
          });
        }
        break;
      }

      case 'analyze': {
        const contentError = validateContent(content);
        if (contentError) {
          logRequest('POST', clientIp, action, false, contentError);
          return NextResponse.json({ error: contentError }, { status: 400 });
        }
        result = await analyzeStoryContent(content);
        break;
      }

      case 'ideas': {
        if (!genre || typeof genre !== 'string' || genre.trim().length === 0) {
          logRequest(
            'POST',
            clientIp,
            action,
            false,
            'Invalid or missing genre'
          );
          return NextResponse.json(
            { error: 'Genre is required and must be a non-empty string' },
            { status: 400 }
          );
        }
        result = await generateStoryIdeas(genre, 5);
        break;
      }

      case 'improve': {
        const contentError = validateContent(content);
        if (contentError) {
          logRequest('POST', clientIp, action, false, contentError);
          return NextResponse.json({ error: contentError }, { status: 400 });
        }

        if (focus && typeof focus !== 'string') {
          logRequest('POST', clientIp, action, false, 'Invalid focus type');
          return NextResponse.json(
            { error: 'Focus must be a string' },
            { status: 400 }
          );
        }

        result = await improveStoryContent(content, focus);
        break;
      }

      default:
        // This should never be reached due to earlier validation
        logRequest(
          'POST',
          clientIp,
          action,
          false,
          `Unhandled action: ${action}`
        );
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    logRequest('POST', clientIp, action, true);
    return NextResponse.json({ result });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));

    // Enhanced error categorization
    let statusCode = 500;
    let errorCategory = 'internal_error';

    if (err.message) {
      if (
        err.message.includes('Invalid input') ||
        err.message.includes('validation')
      ) {
        statusCode = 400;
        errorCategory = 'validation_error';
      } else if (
        err.message.includes('rate limit') ||
        err.message.includes('quota')
      ) {
        statusCode = 429;
        errorCategory = 'rate_limit_error';
      } else if (
        err.message.includes('unauthorized') ||
        err.message.includes('authentication')
      ) {
        statusCode = 401;
        errorCategory = 'auth_error';
      } else if (err.message.includes('timeout')) {
        statusCode = 504;
        errorCategory = 'timeout_error';
      }
    }

    // Comprehensive error logging
    console.error('[groq-api] Request error:', {
      timestamp: new Date().toISOString(),
      clientIp: clientIp.includes(':') ? clientIp.split(':')[0] : clientIp,
      action,
      errorCategory,
      statusCode,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, // Only log stack in dev
    });

    logRequest(
      'POST',
      clientIp,
      action,
      false,
      `${errorCategory}: ${err.message}`
    );

    return NextResponse.json(
      {
        error: err.message || 'An error occurred while processing your request',
        category: errorCategory,
        // Only include details in development
        ...(process.env.NODE_ENV === 'development' && {
          details: err.stack,
        }),
      },
      { status: statusCode }
    );
  }
}

export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request);

  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Handle test action with additional security
    if (action === 'test') {
      // Rate limit test requests as well
      const rateLimitResponse = await checkRateLimit(
        rateLimiters.general,
        clientIp
      );
      if (rateLimitResponse) {
        logRequest('GET', clientIp, 'test', false, 'Rate limit exceeded');
        return rateLimitResponse;
      }

      const useSpecialModel = searchParams.get('special') === 'true';
      const result = useSpecialModel
        ? await testGroqSpecialModel()
        : await testGroqConnection();

      logRequest('GET', clientIp, 'test', true);
      return NextResponse.json(result);
    }

    // Default action: list models
    // Import dynamically to avoid exposing models in the client bundle
    const { GROQ_MODELS } = await import('@/lib/groq-service');

    logRequest('GET', clientIp, 'list-models', true);
    return NextResponse.json({
      models: GROQ_MODELS,
      default: GROQ_MODELS.STORY_GENERATION,
      // Provide human-readable names for the models with enhanced metadata
      modelNames: {
        [GROQ_MODELS.STORY_GENERATION]: 'Llama 3.3 (70B) - Story Generation',
        [GROQ_MODELS.STORY_ANALYSIS]:
          'Llama 3.1 (8B) - Story Analysis & Recommendations',
        [GROQ_MODELS.CONTENT_IMPROVEMENT]:
          'Mixtral (8x7B) - Content Improvement',
      },
      // Additional metadata for Pro Panel
      modelCapabilities: {
        [GROQ_MODELS.STORY_GENERATION]: {
          maxTokens: 32768,
          costTier: 'high',
          qualityTier: 'premium',
          speedTier: 'moderate',
        },
        [GROQ_MODELS.STORY_ANALYSIS]: {
          maxTokens: 8192,
          costTier: 'low',
          qualityTier: 'good',
          speedTier: 'fast',
        },
        [GROQ_MODELS.CONTENT_IMPROVEMENT]: {
          maxTokens: 32768,
          costTier: 'moderate',
          qualityTier: 'high',
          speedTier: 'moderate',
        },
      },
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));

    console.error('[groq-api] GET request error:', {
      timestamp: new Date().toISOString(),
      clientIp: clientIp.includes(':') ? clientIp.split(':')[0] : clientIp,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });

    logRequest('GET', clientIp, 'unknown', false, err.message);

    return NextResponse.json(
      {
        error: err.message || 'An error occurred while fetching models',
        category: 'fetch_error',
      },
      { status: 500 }
    );
  }
}
