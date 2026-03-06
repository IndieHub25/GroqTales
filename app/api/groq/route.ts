import { NextRequest, NextResponse } from 'next/server';

import {
  generateStoryContent,
  analyzeStoryContent,
  generateStoryIdeas,
  improveStoryContent,
  testGroqConnection,
  testGroqSpecialModel,
  generateStoryWithProConfig,
} from '@/lib/groq-service';
import { checkRateLimit, getClientIp, rateLimiters } from '@/lib/rate-limit';
import { ParametersSchema } from '@/lib/schemas/proPanelSchemas';

export async function POST(request: NextRequest) {
  try {
    // Rate limit: AI generation tier (10 req / 60s per IP)
    const clientIp = getClientIp(request);
    const rateLimitResponse = await checkRateLimit(rateLimiters.ai, clientIp);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const {
      action,
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
    // Create updated options with API key if provided
    const updatedOptions = apiKey ? { ...options, apiKey } : options;
    let result;
    switch (action) {
      case 'generate':
        if (!prompt) {
          return NextResponse.json(
            { error: 'Prompt is required' },
            { status: 400 }
          );
        }

        // If proConfig is provided, use Pro Panel generation
        if (proConfig) {
          // Validate the proConfig
          const validationResult = ParametersSchema.safeParse(proConfig);
          if (!validationResult.success) {
            console.warn(
              '[groq/generate] Pro Panel validation failed:',
              validationResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`)
            );
            return NextResponse.json(
              {
                error: 'Invalid Pro Panel configuration',
                details: validationResult.error.errors,
              },
              { status: 400 }
            );
          }

          result = await generateStoryWithProConfig(
            prompt,
            validationResult.data,
            {
              title,
              apiKey: updatedOptions?.apiKey,
            }
          );
        } else {
          // Use standard generation
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
      case 'analyze':
        if (!content) {
          return NextResponse.json(
            { error: 'Content is required' },
            { status: 400 }
          );
        }
        result = await analyzeStoryContent(content);
        break;
      case 'ideas':
        if (!genre) {
          return NextResponse.json(
            { error: 'Genre is required' },
            { status: 400 }
          );
        }
        result = await generateStoryIdeas(genre, 5);
        break;
      case 'improve':
        if (!content) {
          return NextResponse.json(
            { error: 'Content is required' },
            { status: 400 }
          );
        }
        result = await improveStoryContent(content, focus);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    return NextResponse.json({ result });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('[groq] API error:', {
      message: err.message,
      stack: err.stack,
    });

    // Return 400 for input validation errors, 500 for everything else
    const isValidationError =
      err.message && err.message.startsWith('Invalid input');
    return NextResponse.json(
      {
        error: err.message || 'An error occurred while processing your request',
      },
      { status: isValidationError ? 400 : 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    // Handle test action
    if (action === 'test') {
      const useSpecialModel = searchParams.get('special') === 'true';
      const result = useSpecialModel
        ? await testGroqSpecialModel()
        : await testGroqConnection();
      return NextResponse.json(result);
    }
    // Default action: list models
    // Import dynamically to avoid exposing models in the client bundle
    const { GROQ_MODELS } = await import('@/lib/groq-service');
    return NextResponse.json({
      models: GROQ_MODELS,
      default: GROQ_MODELS.STORY_GENERATION,
      // Provide human-readable names for the models
      modelNames: {
        [GROQ_MODELS.STORY_GENERATION]: 'Llama 3.3 (70B) - Story Generation',
        [GROQ_MODELS.STORY_ANALYSIS]: 'Llama 3.1 (8B) - Story Analysis',
        [GROQ_MODELS.CONTENT_IMPROVEMENT]:
          'Mixtral (8x7B) - Content Improvement',
        [GROQ_MODELS.RECOMMENDATIONS]: 'Llama 3.1 (8B) - Recommendations',
      },
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Error fetching Groq models:', err);
    return NextResponse.json(
      { error: err.message || 'An error occurred while fetching models' },
      { status: 500 }
    );
  }
}
