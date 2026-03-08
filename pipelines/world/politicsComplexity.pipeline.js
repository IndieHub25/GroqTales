/**
 * Politics Complexity Pipeline
 *
 * Creates political systems and factions within the story world.
 * Complexity levels:
 *   1 → simple    (single ruling body, clear hierarchy)
 *   2 → moderate  (two or three competing factions)
 *   3 → complex   (multiple factions with alliances and rivalries)
 *   4 → intricate (layered bureaucracies, secret societies, shifting alliances)
 * Generates factions with goals, alignment, and inter-faction relationships.
 */

export function politicsComplexityPipeline(params, context) {
  const complexity = params.politicsComplexity || 2

  if (!context.world) {
    context.world = {}
  }

  const factionPool = [
    { name: "The Crown",          type: "monarchy",    alignment: "lawful",  goal: "maintain order and dynasty" },
    { name: "The People's Voice", type: "populist",    alignment: "chaotic", goal: "overthrow the ruling class" },
    { name: "The Merchant Guild", type: "economic",    alignment: "neutral", goal: "control trade and accumulate wealth" },
    { name: "The Iron Order",     type: "military",    alignment: "lawful",  goal: "enforce law through strength" },
    { name: "The Silent Circle",  type: "secret",      alignment: "chaotic", goal: "manipulate events from the shadows" },
    { name: "The Elder Council",  type: "theocratic",  alignment: "neutral", goal: "preserve ancient traditions and wisdom" },
    { name: "The Free Frontier",  type: "separatist",  alignment: "chaotic", goal: "achieve independence from central rule" },
    { name: "The Accord",         type: "diplomatic",  alignment: "lawful",  goal: "broker peace and balance power" }
  ]

  // Scale the number of factions with complexity
  const factionCount = Math.min(complexity <= 1 ? 1 : complexity <= 2 ? 3 : complexity <= 3 ? 5 : 7, factionPool.length)
  const factions = factionPool.slice(0, factionCount).map((faction, index) => ({
    id: "faction_" + (index + 1),
    ...faction,
    influence: index === 0 ? "dominant" : index <= 1 ? "major" : "minor"
  }))

  // Generate inter-faction relationships for complexity >= 3
  const factionRelationships = []

  if (complexity >= 3 && factions.length >= 3) {
    for (let i = 0; i < factions.length; i++) {
      for (let j = i + 1; j < factions.length; j++) {
        // Alternate between alliances and rivalries
        const relType = (i + j) % 3 === 0 ? "alliance" : (i + j) % 3 === 1 ? "rivalry" : "uneasy truce"
        factionRelationships.push({
          factionA: factions[i].id,
          factionB: factions[j].id,
          type: relType
        })
      }
    }
  }

  const governmentTypes = {
    1: "monarchy",
    2: "oligarchy",
    3: "republic with shadow factions",
    4: "fragmented — multiple competing authorities"
  }

  context.world.politics = {
    complexity: complexity <= 1 ? "simple" : complexity <= 2 ? "moderate" : complexity <= 3 ? "complex" : "intricate",
    government: governmentTypes[Math.min(complexity, 4)],
    factions: factions,
    factionRelationships: factionRelationships
  }

  return context
}
