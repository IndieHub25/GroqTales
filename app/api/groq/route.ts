import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/connect'; 
import { 
  getOrchestrationPlan, 
  logOrchestrationEvent, 
  type StoryType, 
  type QualityPreference 
} from '@/lib/ai/orchestrator'; 

import {
  generateStoryContent,
  analyzeStoryContent,
  generateStoryIdeas,
  improveStoryContent,
  testGroqConnection,
  testGroqSpecialModel,
} from '@/lib/groq-service';

export async function POST(request: NextRequest) {
  let currentAction = 'unknown';
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
    currentAction = action;
    switch (action) {
      case 'generate':
        if (!prompt) {
          return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const startTime = Date.now();
        const plan = getOrchestrationPlan(
          (length || 'medium') as StoryType, 
          (updatedOptions?.preference || 'balanced') as QualityPreference
        );

        const generationResult = await generateStoryContent({
          theme: prompt,
          genre,
          length,
          tone: updatedOptions?.tone,
          characters: updatedOptions?.characters,
          setting: updatedOptions?.setting,
          model: plan.model,
          temperature: plan.temperature,
          fallbackModel: plan.fallbackModel // Enable resilience
        });

        const latency = Date.now() - startTime;
        logOrchestrationEvent(plan, latency); 

        try {
          const db = await getDb(); // This triggers the logs above!
          
          if (db) {
            const result = await db.collection('generation_logs').insertOne({
              promptSnippet: prompt.substring(0, 100),
              modelUsed: generationResult.actualModel,
              fallbackTriggered: generationResult.fallbackUsed,
              variantId: plan.promptVariant,
              latencyMs: latency,
              status: 'success',
              timestamp: new Date()
            });
            console.log('Document saved to MongoDB:', result.insertedId);
          }
        } catch (dbError) {
          console.error('Logging failed:', dbError);
        }

        result = generationResult.content;
        break;

      case 'analyze':
        if (!content) return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        result = await analyzeStoryContent(content);
        break;

      case 'ideas':
        if (!genre) return NextResponse.json({ error: 'Genre is required' }, { status: 400 });
        result = await generateStoryIdeas(genre, 5);
        break;

      case 'improve':
        if (!content) return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        result = await improveStoryContent(content, focus);
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    return NextResponse.json({ result });

  } catch (error: any) {
    console.error('Groq API error:', error);

    try { 
      const db = await getDb();
      
      if (db) {
        await db.collection('generation_logs').insertOne({
          status: 'error',
          errorMessage: error.message,
          actionAttempted: currentAction, // Useful for context
          timestamp: new Date()
        });
        console.log('Error logged to MongoDB');
      }
    } catch (logError) {
      console.error('Could not log error to DB:', logError);
    }

    const isValidationError = error.message && error.message.startsWith('Invalid input');
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
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
      const internalToken = request.headers.get('x-internal-token');

      if (!process.env.INTERNAL_API_TOKEN || internalToken !== process.env.INTERNAL_API_TOKEN) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const useSpecialModel = searchParams.get('special') === 'true';

      const result = useSpecialModel
        ? await testGroqSpecialModel()
        : await testGroqConnection();

      return NextResponse.json(result);
    }
    // Default action: list models
    // Import dynamically to avoid exposing models in the client bundle
    const { GROQ_MODELS } = await import('@/lib/groq-service');
    
    const experiments = (await import('@/config/experiments.json')).default;
    const activeConfig = experiments.active_experiments;

    return NextResponse.json({
      models: GROQ_MODELS,
      
      default: activeConfig.primary_story_model, 
      fallbackDefault: activeConfig.fallback_story_model,
      experimentVariant: activeConfig.current_prompt_variant,
      modelNames: {
        [GROQ_MODELS.STORY_GENERATION]: 'Llama 3.3 (70B) - Story Generation',
        [GROQ_MODELS.STORY_ANALYSIS]: 'Llama 3.1 (8B) - Analysis & Recommendations',
        [GROQ_MODELS.CONTENT_IMPROVEMENT]: 'Mixtral (8x7B) - Content Improvement',
      },
    });
  } catch (error: any) {
    console.error('Error fetching Groq models:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}