import { GROQ_MODELS } from '../groq-service';
import experiments from '@/config/experiments.json';

export type StoryType = 'flash' | 'short' | 'medium' | 'long' | 'epic' | 'comic';
export type QualityPreference = 'speed' | 'quality' | 'balanced';

interface OrchestrationResult {
  model: string;
  fallbackModel?: string;
  promptVariant: string;
  temperature: number;
}

export function getOrchestrationPlan(
  type: StoryType,
  preference: QualityPreference = 'balanced'
): OrchestrationResult {
  
  const config = experiments.active_experiments;

  // Speed or Short Content 
  if (preference === 'speed' || type === 'flash') {
    return {
      model: config.fallback_story_model, 
      fallbackModel: config.enable_fallback_logic ? config.primary_story_model : undefined,
      promptVariant: 'v1_concise',
      temperature: 0.7
    };
  }

  // Balanced or High Quality 
  return {
    model: config.primary_story_model,   
    fallbackModel: config.enable_fallback_logic ? config.primary_story_model : undefined, 
    promptVariant: config.current_prompt_variant,
    temperature: preference === 'quality' ? 0.85 : 0.8
  };
}

export function logOrchestrationEvent(plan: OrchestrationResult, latency?: number) {
  console.log(`[Orchestrator] Model: ${plan.model} | Variant: ${plan.promptVariant} | Latency: ${latency || 'N/A'}ms`);
}