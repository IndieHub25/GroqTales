/**
 * Plot Pipeline Runner
 *
 * Imports all 12 plot structure pipelines and executes them in sequence.
 * Each pipeline receives the shared params and context, modifies the
 * context, and passes it to the next stage.
 *
 * Usage:
 *   import { runPlotPipelines } from "./runPlotPipelines.js"
 *   const updatedContext = runPlotPipelines(params, context)
 */

import { plotComplexityPipeline }        from "./plot/plotComplexity.pipeline.js"
import { pacingSpeedPipeline }           from "./plot/pacingSpeed.pipeline.js"
import { cliffhangerFrequencyPipeline }  from "./plot/cliffhangerFrequency.pipeline.js"
import { plotStructureTypePipeline }     from "./plot/plotStructureType.pipeline.js"
import { twistCountPipeline }            from "./plot/twistCount.pipeline.js"
import { conflictTypePipeline }          from "./plot/conflictType.pipeline.js"
import { resolutionTypePipeline }        from "./plot/resolutionType.pipeline.js"
import { flashbackUsagePipeline }        from "./plot/flashbackUsage.pipeline.js"
import { foreshadowingLevelPipeline }    from "./plot/foreshadowingLevel.pipeline.js"
import { chapterRolePipeline }           from "./plot/chapterRole.pipeline.js"
import { hookStrengthPipeline }          from "./plot/hookStrength.pipeline.js"
import { endingTypePipeline }            from "./plot/endingType.pipeline.js"

/**
 * Runs all 12 plot structure pipelines in sequence.
 *
 * @param {object} params  - The story parameters provided by the user.
 * @param {object} context - The shared context (may already contain character data).
 * @returns {object} The updated context with full plot structure data.
 */
export function runPlotPipelines(params, context) {
  // Initialize plot-related sections if not already present
  if (!context.plot)       context.plot = {}
  if (!context.twists)     context.twists = []
  if (!context.timeline)   context.timeline = []
  if (!context.structure)  context.structure = {}

  // Ordered pipeline chain — execution order matters
  const pipelines = [
    plotComplexityPipeline,        // 1.  Define story threads and complexity
    pacingSpeedPipeline,           // 2.  Set narrative pacing
    cliffhangerFrequencyPipeline,  // 3.  Configure chapter-ending suspense
    plotStructureTypePipeline,     // 4.  Choose structural template
    twistCountPipeline,            // 5.  Generate plot twist placeholders
    conflictTypePipeline,          // 6.  Define central conflict
    resolutionTypePipeline,        // 7.  Define how conflict resolves
    flashbackUsagePipeline,        // 8.  Insert flashback markers
    foreshadowingLevelPipeline,    // 9.  Add foreshadowing hints
    chapterRolePipeline,           // 10. Define chapter purposes
    hookStrengthPipeline,          // 11. Set opening hook intensity
    endingTypePipeline             // 12. Define ending style
  ]

  // Execute each pipeline sequentially
  for (const pipeline of pipelines) {
    context = pipeline(params, context)
  }

  return context
}
