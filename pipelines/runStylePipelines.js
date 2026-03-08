/**
 * Tone & Style Pipeline Runner
 *
 * Imports all 8 tone and style pipelines and executes them in sequence.
 * Each pipeline receives the shared params and context, modifies the
 * context, and passes it to the next stage.
 *
 * Usage:
 *   import { runStylePipelines } from "./runStylePipelines.js"
 *   const updatedContext = runStylePipelines(params, context)
 */

import { narrativeVoicePipeline }        from "./style/narrativeVoice.pipeline.js"
import { proseStylePipeline }            from "./style/proseStyle.pipeline.js"
import { dialogueLevelPipeline }         from "./style/dialogueLevel.pipeline.js"
import { dialogueNaturalismPipeline }    from "./style/dialogueNaturalism.pipeline.js"
import { humorLevelPipeline }            from "./style/humorLevel.pipeline.js"
import { humorStylePipeline }            from "./style/humorStyle.pipeline.js"
import { darknessLevelPipeline }         from "./style/darknessLevel.pipeline.js"
import { sentimentTonePipeline }         from "./style/sentimentTone.pipeline.js"

/**
 * Runs all 8 tone and style pipelines in sequence.
 *
 * @param {object} params  - The story parameters provided by the user.
 * @param {object} context - The shared context (may already contain character, plot, and world data).
 * @returns {object} The updated context with full tone and style data.
 */
export function runStylePipelines(params, context) {
  // Initialize style-related sections if not already present
  if (!context.style)    context.style = {}
  if (!context.tone)     context.tone = {}
  if (!context.dialogue) context.dialogue = {}

  // Ordered pipeline chain
  const pipelines = [
    narrativeVoicePipeline,      // 1. Define storytelling POV
    proseStylePipeline,          // 2. Set writing style
    dialogueLevelPipeline,       // 3. Set dialogue-to-narration balance
    dialogueNaturalismPipeline,  // 4. Set dialogue realism level
    humorLevelPipeline,          // 5. Control humor density
    humorStylePipeline,          // 6. Define humor type
    darknessLevelPipeline,       // 7. Control tonal darkness
    sentimentTonePipeline        // 8. Define emotional tone
  ]

  // Execute each pipeline sequentially
  for (const pipeline of pipelines) {
    context = pipeline(params, context)
  }

  return context
}
