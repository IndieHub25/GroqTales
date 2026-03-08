/**
 * Worldbuilding Pipeline Runner
 *
 * Imports all 9 worldbuilding pipelines and executes them in sequence.
 * Each pipeline receives the shared params and context, modifies the
 * context, and passes it to the next stage.
 *
 * Usage:
 *   import { runWorldPipelines } from "./runWorldPipelines.js"
 *   const updatedContext = runWorldPipelines(params, context)
 */

import { settingDetailPipeline }       from "./world/settingDetail.pipeline.js"
import { settingTypePipeline }         from "./world/settingType.pipeline.js"
import { worldMagicSystemPipeline }    from "./world/worldMagicSystem.pipeline.js"
import { technologyLevelPipeline }     from "./world/technologyLevel.pipeline.js"
import { worldHistoryDepthPipeline }   from "./world/worldHistoryDepth.pipeline.js"
import { politicsComplexityPipeline }  from "./world/politicsComplexity.pipeline.js"
import { economicSystemPipeline }      from "./world/economicSystem.pipeline.js"
import { culturalDiversityPipeline }   from "./world/culturalDiversity.pipeline.js"
import { atmospherePipeline }          from "./world/atmosphere.pipeline.js"

/**
 * Runs all 9 worldbuilding pipelines in sequence.
 *
 * @param {object} params  - The story parameters provided by the user.
 * @param {object} context - The shared context (may already contain character and plot data).
 * @returns {object} The updated context with full worldbuilding data.
 */
export function runWorldPipelines(params, context) {
  // Initialize world-related sections if not already present
  if (!context.world)    context.world = {}
  if (!context.cultures) context.cultures = []
  if (!context.history)  context.history = []
  if (!context.systems)  context.systems = {}

  // Ordered pipeline chain
  const pipelines = [
    settingDetailPipeline,       // 1. Set description detail level
    settingTypePipeline,         // 2. Define primary setting type
    worldMagicSystemPipeline,    // 3. Define magic/power system
    technologyLevelPipeline,     // 4. Set technology level
    worldHistoryDepthPipeline,   // 5. Generate world history and lore
    politicsComplexityPipeline,  // 6. Create political systems and factions
    economicSystemPipeline,      // 7. Define economic structures
    culturalDiversityPipeline,   // 8. Generate cultures and traditions
    atmospherePipeline           // 9. Define world mood and atmosphere
  ]

  // Execute each pipeline sequentially
  for (const pipeline of pipelines) {
    context = pipeline(params, context)
  }

  return context
}
