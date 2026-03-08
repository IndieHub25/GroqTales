/**
 * Technical Parameters Pipeline Runner
 *
 * Imports all 7 technical parameter pipelines and executes them in sequence.
 * Each pipeline receives the shared params and context, modifies the
 * context, and passes it to the next stage.
 *
 * Usage:
 *   import { runTechnicalPipelines } from "./runTechnicalPipelines.js"
 *   const updatedContext = runTechnicalPipelines(params, context)
 */

import { targetWordCountPipeline }      from "./technical/targetWordCount.pipeline.js"
import { readingLevelPipeline }         from "./technical/readingLevel.pipeline.js"
import { pointOfViewPipeline }          from "./technical/pointOfView.pipeline.js"
import { verbTensePipeline }            from "./technical/verbTense.pipeline.js"
import { chapterStructurePipeline }     from "./technical/chapterStructure.pipeline.js"
import { descriptionIntensityPipeline } from "./technical/descriptionIntensity.pipeline.js"
import { narrativeTimeSpanPipeline }    from "./technical/narrativeTimeSpan.pipeline.js"

/**
 * Runs all 7 technical parameter pipelines in sequence.
 *
 * @param {object} params  - The story parameters provided by the user.
 * @param {object} context - The shared context (may already contain character, plot, world, and style data).
 * @returns {object} The updated context with full technical parameter data.
 */
export function runTechnicalPipelines(params, context) {
  // Initialize technical section if not already present
  if (!context.technical) context.technical = {}

  // Ordered pipeline chain
  const pipelines = [
    targetWordCountPipeline,      // 1. Define total word count and format
    readingLevelPipeline,         // 2. Set vocabulary complexity
    pointOfViewPipeline,          // 3. Set narrative POV rules
    verbTensePipeline,            // 4. Define narration tense
    chapterStructurePipeline,     // 5. Define chapter formatting style
    descriptionIntensityPipeline, // 6. Control descriptive passage density
    narrativeTimeSpanPipeline     // 7. Define in-story time coverage
  ]

  // Execute each pipeline sequentially
  for (const pipeline of pipelines) {
    context = pipeline(params, context)
  }

  return context
}
