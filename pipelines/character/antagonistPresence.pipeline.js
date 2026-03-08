/**
 * Antagonist Presence Pipeline
 *
 * Creates an antagonist character and sets their influence level.
 * Influence levels:
 *   0 → no antagonist added
 *   1 → minor   (background threat, limited screen-time)
 *   2 → moderate (recurring obstacle, drives sub-conflicts)
 *   3 → major   (central conflict driver, mirrors protagonist)
 */

export function antagonistPresencePipeline(params, context) {
  const presence = params.antagonistPresence ?? 2

  if (presence <= 0) {
    return context
  }

  const influenceLevels = {
    1: { label: "minor",    traits: ["scheming", "opportunistic"] },
    2: { label: "moderate", traits: ["cunning", "determined", "ruthless"] },
    3: { label: "major",    traits: ["formidable", "intelligent", "obsessive", "charismatic"] }
  }

  const level = influenceLevels[Math.min(presence, 3)] || influenceLevels[2]

  const antagonist = {
    id: "antagonist_1",
    name: "Antagonist",
    role: "antagonist",
    archetype: null,
    depth: null,
    depthScore: 0,
    importance: level.label,
    traits: level.traits,
    flaws: [],
    goals: [],
    background: null,
    profession: null,
    speechStyle: null,
    speechPattern: null,
    motivationClarity: null,
    arc: null
  }

  context.characters.push(antagonist)
  return context
}
