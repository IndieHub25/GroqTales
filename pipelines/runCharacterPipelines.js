/**
 * Character Pipeline Runner
 *
 * Imports all 11 character development pipelines and executes them
 * in the correct sequence. Each pipeline receives the shared params
 * and context, modifies the context, and passes it to the next stage.
 *
 * Usage:
 *   import { runCharacterPipelines } from "./runCharacterPipelines.js"
 *   const context = runCharacterPipelines(params)
 */

import { characterCountPipeline }              from "./character/characterCount.pipeline.js"
import { characterDepthPipeline }               from "./character/characterDepth.pipeline.js"
import { protagonistArchetypePipeline }         from "./character/protagonistArchetype.pipeline.js"
import { antagonistPresencePipeline }           from "./character/antagonistPresence.pipeline.js"
import { sideCharacterCountPipeline }           from "./character/sideCharacterCount.pipeline.js"
import { characterDiversityPipeline }           from "./character/characterDiversity.pipeline.js"
import { relationshipComplexityPipeline }       from "./character/relationshipComplexity.pipeline.js"
import { characterMotivationClarityPipeline }   from "./character/characterMotivationClarity.pipeline.js"
import { characterVoiceDistinctnessPipeline }   from "./character/characterVoiceDistinctness.pipeline.js"
import { characterFlawsPipeline }               from "./character/characterFlaws.pipeline.js"
import { characterGrowthPipeline }              from "./character/characterGrowth.pipeline.js"

/**
 * Runs all 11 character development pipelines in sequence.
 *
 * @param {object} params - The story parameters provided by the user.
 * @returns {object} The fully built character system context containing
 *                   characters, relationships, and arcs.
 */
export function runCharacterPipelines(params) {
  // Initialize the shared context
  let context = {
    characters: [],
    relationships: [],
    arcs: []
  }

  // Ordered pipeline chain — execution order matters
  const pipelines = [
    characterCountPipeline,              // 1.  Generate main characters
    characterDepthPipeline,              // 2.  Assign depth levels
    protagonistArchetypePipeline,        // 3.  Set protagonist archetype + traits
    antagonistPresencePipeline,          // 4.  Add antagonist if present
    sideCharacterCountPipeline,          // 5.  Add supporting characters
    characterDiversityPipeline,          // 6.  Assign backgrounds + professions
    relationshipComplexityPipeline,      // 7.  Build relationship graph
    characterMotivationClarityPipeline,  // 8.  Assign goals + motivations
    characterVoiceDistinctnessPipeline,  // 9.  Assign speech styles
    characterFlawsPipeline,             // 10. Assign personality flaws
    characterGrowthPipeline             // 11. Generate character arcs
  ]

  // Execute each pipeline sequentially
  for (const pipeline of pipelines) {
    context = pipeline(params, context)
  }

  return context
}
