/**
 * Character Count Pipeline
 *
 * Generates the main cast of characters based on the characterCount parameter.
 * Each character receives a sequential ID, a placeholder name, and is initialized
 * with empty arrays / null fields so downstream pipelines can populate them.
 * The first character is automatically assigned the "protagonist" role.
 */

export function characterCountPipeline(params, context) {
  const count = params.characterCount || 3

  const characters = []

  for (let i = 0; i < count; i++) {
    characters.push({
      id: "character_" + (i + 1),
      name: "Character " + (i + 1),
      role: i === 0 ? "protagonist" : "main",
      archetype: null,
      depth: null,
      depthScore: 0,
      traits: [],
      flaws: [],
      goals: [],
      background: null,
      profession: null,
      speechStyle: null,
      speechPattern: null,
      motivationClarity: null,
      arc: null
    })
  }

  context.characters = characters
  return context
}
