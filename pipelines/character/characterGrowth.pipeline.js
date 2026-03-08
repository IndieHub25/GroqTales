/**
 * Character Growth Pipeline
 *
 * Generates character arcs that define how each character evolves over the story.
 * Arc types:
 *   "static"          — beliefs are tested but hold firm
 *   "learning"        — character gains new knowledge that shifts their worldview
 *   "transformation"  — fundamental change in values, identity, or purpose
 *
 * The protagonist arc scales directly with the characterGrowth parameter.
 * Antagonists tend toward static or learning arcs.
 * Side characters receive varied arcs based on their position and growth level.
 * All arcs are also collected into context.arcs for easy lookup.
 */

export function characterGrowthPipeline(params, context) {
  const growth = params.characterGrowth || 2

  const arcTypes = {
    static: {
      type: "static",
      description: "character remains fundamentally unchanged; their beliefs are tested but hold firm"
    },
    learning: {
      type: "learning",
      description: "character gains new knowledge or skills that shift their worldview"
    },
    transformation: {
      type: "transformation",
      description: "character undergoes a fundamental change in values, identity, or purpose"
    }
  }

  const arcs = []

  context.characters = context.characters.map((character, index) => {
    let arcKey

    if (character.role === "protagonist") {
      // Protagonist arc scales directly with growth
      arcKey = growth >= 3 ? "transformation" : growth === 2 ? "learning" : "static"
    } else if (character.role === "antagonist") {
      // Antagonists tend toward static or learning arcs
      arcKey = growth >= 3 ? "learning" : "static"
    } else {
      // Supporting characters get varied arcs
      const arcRoll = (index + growth) % 3
      arcKey = arcRoll === 0 ? "static" : arcRoll === 1 ? "learning" : "transformation"
    }

    const arc = {
      characterId: character.id,
      characterName: character.name,
      ...arcTypes[arcKey]
    }

    arcs.push(arc)

    return {
      ...character,
      arc: { ...arcTypes[arcKey] }
    }
  })

  context.arcs = arcs
  return context
}
