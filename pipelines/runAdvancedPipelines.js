/**
 * Advanced Options Pipeline Runner
 *
 * Imports all 6 advanced option pipelines and executes them in sequence.
 * Each pipeline receives the shared params and context, modifies the
 * context, and passes it to the next stage.
 *
 * Usage:
 *   import { runAdvancedPipelines } from "./runAdvancedPipelines.js"
 *   const updatedContext = runAdvancedPipelines(params, context)
 */

import { creativityLevelPipeline }       from "./advanced/creativityLevel.pipeline.js"
import { coherenceStrictnessPipeline }   from "./advanced/coherenceStrictness.pipeline.js"
import { randomizationSeedPipeline }     from "./advanced/randomizationSeed.pipeline.js"
import { modelTemperaturePipeline }      from "./advanced/modelTemperature.pipeline.js"
import { detailLevelPipeline }           from "./advanced/detailLevel.pipeline.js"
import { guardrailsStrictnessPipeline }  from "./advanced/guardrailsStrictness.pipeline.js"

/**
 * Runs all 6 advanced option pipelines in sequence.
 *
 * @param {object} params  - The story parameters provided by the user.
 * @param {object} context - The shared context (may already contain data from previous category runners).
 * @returns {object} The updated context with full advanced option data.
 */
export function runAdvancedPipelines(params, context) {
  // Initialize advanced-related sections if not already present
  if (!context.advanced)   context.advanced = {}
  if (!context.generation) context.generation = {}

  // Ordered pipeline chain
  const pipelines = [
    creativityLevelPipeline,       // 1. Set creative freedom level
    coherenceStrictnessPipeline,   // 2. Define logical consistency rules
    randomizationSeedPipeline,     // 3. Set reproducibility seed
    modelTemperaturePipeline,      // 4. Control AI generation randomness
    detailLevelPipeline,           // 5. Set output detail density
    guardrailsStrictnessPipeline   // 6. Define safety guardrail strength
  ]

  // Execute each pipeline sequentially
  for (const pipeline of pipelines) {
    context = pipeline(params, context)
  }

  return context
}
