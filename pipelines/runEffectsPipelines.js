/**
 * Special Effects Pipeline Runner
 *
 * Imports all 4 special effects pipelines and executes them in sequence.
 * Each pipeline receives the shared params and context, modifies the
 * context, and passes it to the next stage.
 *
 * Usage:
 *   import { runEffectsPipelines } from "./runEffectsPipelines.js"
 *   const updatedContext = runEffectsPipelines(params, context)
 */

import { specialNarrativeDevicePipeline } from "./effects/specialNarrativeDevice.pipeline.js"
import { easterEggsPipeline }             from "./effects/easterEggs.pipeline.js"
import { crossReferencesPipeline }        from "./effects/crossReferences.pipeline.js"
import { genreBlendingPipeline }          from "./effects/genreBlending.pipeline.js"

/**
 * Runs all 4 special effects pipelines in sequence.
 *
 * @param {object} params  - The story parameters provided by the user.
 * @param {object} context - The shared context (may already contain data from all previous category runners).
 * @returns {object} The updated context with full special effects data.
 */
export function runEffectsPipelines(params, context) {
  // Initialize effects section if not already present
  if (!context.effects) context.effects = {}

  // Ordered pipeline chain
  const pipelines = [
    specialNarrativeDevicePipeline, // 1. Apply special storytelling format
    easterEggsPipeline,             // 2. Add hidden references and secrets
    crossReferencesPipeline,        // 3. Connect to other stories or lore
    genreBlendingPipeline           // 4. Mix multiple genres
  ]

  // Execute each pipeline sequentially
  for (const pipeline of pipelines) {
    context = pipeline(params, context)
  }

  return context
}
