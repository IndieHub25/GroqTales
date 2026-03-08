/**
 * Sensory & Immersion Pipeline Runner
 *
 * Imports all 5 sensory and immersion pipelines and executes them in sequence.
 * Each pipeline receives the shared params and context, modifies the
 * context, and passes it to the next stage.
 *
 * Usage:
 *   import { runImmersionPipelines } from "./runImmersionPipelines.js"
 *   const updatedContext = runImmersionPipelines(params, context)
 */

import { sensoryDetailPipeline }      from "./immersion/sensoryDetail.pipeline.js"
import { actionDescriptionPipeline }  from "./immersion/actionDescription.pipeline.js"
import { emotionalDepthPipeline }     from "./immersion/emotionalDepth.pipeline.js"
import { tensionCurvePipeline }       from "./immersion/tensionCurve.pipeline.js"
import { immersionLevelPipeline }     from "./immersion/immersionLevel.pipeline.js"

/**
 * Runs all 5 sensory and immersion pipelines in sequence.
 *
 * @param {object} params  - The story parameters provided by the user.
 * @param {object} context - The shared context (may already contain data from previous category runners).
 * @returns {object} The updated context with full immersion data.
 */
export function runImmersionPipelines(params, context) {
  // Initialize immersion-related sections if not already present
  if (!context.immersion) context.immersion = {}
  if (!context.emotions)  context.emotions = []
  if (!context.tension)   context.tension = []

  // Ordered pipeline chain
  const pipelines = [
    sensoryDetailPipeline,      // 1. Control sensory description channels
    actionDescriptionPipeline,  // 2. Set action scene detail level
    emotionalDepthPipeline,     // 3. Define emotional intensity
    tensionCurvePipeline,       // 4. Generate tension evolution map
    immersionLevelPipeline      // 5. Set overall reader immersion
  ]

  // Execute each pipeline sequentially
  for (const pipeline of pipelines) {
    context = pipeline(params, context)
  }

  return context
}
