/**
 * Audience Pipeline Runner
 *
 * Imports all 4 audience pipelines and executes them in sequence.
 * Each pipeline receives the shared params and context, modifies the
 * context, and passes it to the next stage.
 *
 * Usage:
 *   import { runAudiencePipelines } from "./runAudiencePipelines.js"
 *   const updatedContext = runAudiencePipelines(params, context)
 */

import { ageRatingPipeline }              from "./audience/ageRating.pipeline.js"
import { contentWarningsPipeline }        from "./audience/contentWarnings.pipeline.js"
import { genderRepresentationPipeline }   from "./audience/genderRepresentation.pipeline.js"
import { culturalSensitivityPipeline }    from "./audience/culturalSensitivity.pipeline.js"

/**
 * Runs all 4 audience pipelines in sequence.
 *
 * @param {object} params  - The story parameters provided by the user.
 * @param {object} context - The shared context (may already contain data from previous category runners).
 * @returns {object} The updated context with full audience data.
 */
export function runAudiencePipelines(params, context) {
  // Initialize audience-related sections if not already present
  if (!context.audience)  context.audience = {}
  if (!context.warnings)  context.warnings = []

  // Ordered pipeline chain
  const pipelines = [
    ageRatingPipeline,             // 1. Define target audience age group
    contentWarningsPipeline,       // 2. Add content warnings (uses age rating)
    genderRepresentationPipeline,  // 3. Ensure gender balance in cast
    culturalSensitivityPipeline    // 4. Apply cultural sensitivity safeguards
  ]

  // Execute each pipeline sequentially
  for (const pipeline of pipelines) {
    context = pipeline(params, context)
  }

  return context
}
