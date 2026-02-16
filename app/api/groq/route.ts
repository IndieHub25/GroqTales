import { NextRequest, NextResponse } from 'next/server';

import {
  generateStoryContent,
  analyzeStoryContent,
  generateStoryIdeas,
  improveStoryContent,
  testGroqConnection,
  testGroqSpecialModel,
} from '@/lib/groq-service';
export async function POST(request: NextRequest) {
  try {
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
        result = await generateStoryContent({
          theme: prompt,
          genre,
          length,
          tone: updatedOptions?.tone,
          characters: updatedOptions?.characters,
          setting: updatedOptions?.setting,
        });
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
  } catch (error: any) {
    console.error('Groq API error:', error);

    // Return 400 for input validation errors, 500 for everything else
    const isValidationError =
      error.message && error.message.startsWith('Invalid input');
    return NextResponse.json(
      {
        error:
          error.message || 'An error occurred while processing your request',
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
        [GROQ_MODELS.STORY_GENERATION]: 'Llama 3 (70B) - Story Generation',
        [GROQ_MODELS.STORY_ANALYSIS]: 'Llama 3 (8B) - Story Analysis',
        [GROQ_MODELS.CONTENT_IMPROVEMENT]:
          'Mixtral (8x7B) - Content Improvement',
        [GROQ_MODELS.RECOMMENDATIONS]: 'Llama 3 (8B) - Recommendations',
      },
    });
  } catch (error: any) {
    console.error('Error fetching Groq models:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while fetching models' },
      { status: 500 }
    );
  }
}
