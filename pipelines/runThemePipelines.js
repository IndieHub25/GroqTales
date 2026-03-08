/**
 * Thematic Elements Pipeline Runner
 *
 * Imports all 5 thematic element pipelines and executes them in sequence.
 * Each pipeline receives the shared params and context, modifies the
 * context, and passes it to the next stage.
 *
 * Usage:
 *   import { runThemePipelines } from "./runThemePipelines.js"
 *   const updatedContext = runThemePipelines(params, context)
 */

import { themeDepthPipeline }      from "./theme/themeDepth.pipeline.js"
import { themeSubtletyPipeline }   from "./theme/themeSubtlety.pipeline.js"
import { symbolismLevelPipeline }  from "./theme/symbolismLevel.pipeline.js"
import { metaphorDensityPipeline } from "./theme/metaphorDensity.pipeline.js"
import { moralComplexityPipeline } from "./theme/moralComplexity.pipeline.js"

/**
 * Runs all 5 thematic element pipelines in sequence.
 *
 * @param {object} params  - The story parameters provided by the user.
 * @param {object} context - The shared context (may already contain character, plot, world, style, and technical data).
 * @returns {object} The updated context with full thematic element data.
 */
export function runThemePipelines(params, context) {
  // Initialize theme-related sections if not already present
  if (!context.theme)     context.theme = {}
  if (!context.symbols)   context.symbols = []
  if (!context.metaphors) context.metaphors = []

  // Ordered pipeline chain
  const pipelines = [
    themeDepthPipeline,      // 1. Define how deeply themes are explored
    themeSubtletyPipeline,   // 2. Control how subtly themes are presented
    symbolismLevelPipeline,  // 3. Generate symbolic elements
    metaphorDensityPipeline, // 4. Control metaphor frequency
    moralComplexityPipeline  // 5. Define moral ambiguity level
  ]

  // Execute each pipeline sequentially
  for (const pipeline of pipelines) {
    context = pipeline(params, context)
  }

  return context
}
