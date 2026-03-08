/**
 * Protagonist Archetype Pipeline
 *
 * Assigns archetype traits to the protagonist character.
 * Supported archetypes:
 *   hero, antihero, reluctant, trickster,
 *   mentor, rebel, innocent, explorer
 * Each archetype maps to a curated set of personality traits
 * that are merged into the protagonist's existing trait list.
 */

export function protagonistArchetypePipeline(params, context) {
  const archetype = params.protagonistArchetype || "hero"

  // Archetype → trait mapping
  const archetypeTraits = {
    hero:      ["courageous", "selfless", "determined", "honorable"],
    antihero:  ["cynical", "morally ambiguous", "resourceful", "independent"],
    reluctant: ["cautious", "doubtful", "empathetic", "adaptable"],
    trickster: ["witty", "deceptive", "charismatic", "unpredictable"],
    mentor:    ["wise", "patient", "experienced", "guiding"],
    rebel:     ["defiant", "passionate", "iconoclastic", "bold"],
    innocent:  ["naive", "optimistic", "trusting", "curious"],
    explorer:  ["adventurous", "open-minded", "restless", "perceptive"]
  }

  const traits = archetypeTraits[archetype] || archetypeTraits["hero"]

  context.characters = context.characters.map((character) => {
    if (character.role === "protagonist") {
      return {
        ...character,
        archetype: archetype,
        traits: [...character.traits, ...traits]
      }
    }
    return character
  })

  return context
}
