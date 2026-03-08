/**
 * Relationship Complexity Pipeline
 *
 * Generates relationships between characters and stores them in context.relationships.
 * Complexity levels:
 *   1 → linear   (protagonist connects to every other character)
 *   2 → branching (each character connects to the next two characters)
 *   3 → web      (every character is connected to every other character)
 * Relationship types cycle through: ally, rival, mentor-student, friend,
 * enemy, romantic, sibling, reluctant-partner.
 */

export function relationshipComplexityPipeline(params, context) {
  const complexity = params.relationshipComplexity || 1

  const characters = context.characters
  const relationships = []

  const relationshipTypes = [
    "ally", "rival", "mentor-student", "friend",
    "enemy", "romantic", "sibling", "reluctant-partner"
  ]

  if (complexity === 1) {
    // Linear: protagonist connects to every other character
    const protagonist = characters.find((c) => c.role === "protagonist")

    if (protagonist) {
      characters.forEach((character) => {
        if (character.id !== protagonist.id) {
          relationships.push({
            source: protagonist.id,
            target: character.id,
            type: relationshipTypes[relationships.length % relationshipTypes.length],
            strength: "moderate"
          })
        }
      })
    }
  } else if (complexity === 2) {
    // Branching: each character connects to the next two characters
    for (let i = 0; i < characters.length; i++) {
      for (let j = 1; j <= 2; j++) {
        const targetIndex = (i + j) % characters.length
        if (targetIndex !== i) {
          relationships.push({
            source: characters[i].id,
            target: characters[targetIndex].id,
            type: relationshipTypes[relationships.length % relationshipTypes.length],
            strength: "moderate"
          })
        }
      }
    }
  } else if (complexity >= 3) {
    // Web: every character connects to every other character
    for (let i = 0; i < characters.length; i++) {
      for (let j = i + 1; j < characters.length; j++) {
        relationships.push({
          source: characters[i].id,
          target: characters[j].id,
          type: relationshipTypes[relationships.length % relationshipTypes.length],
          strength: relationships.length % 2 === 0 ? "strong" : "weak"
        })
      }
    }
  }

  context.relationships = relationships
  return context
}
