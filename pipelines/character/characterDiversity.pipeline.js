/**
 * Character Diversity Pipeline
 *
 * Assigns diverse backgrounds and professions to every character.
 * The characterDiversity parameter controls how many unique options
 * are available — higher values unlock a wider pool of backgrounds
 * and professions, which are distributed round-robin across the cast.
 */

export function characterDiversityPipeline(params, context) {
  const diversity = params.characterDiversity || 2

  const backgrounds = [
    "urban", "rural", "coastal", "nomadic", "mountainous",
    "island", "desert", "forest", "tundra", "subterranean"
  ]

  const professions = [
    "scholar", "soldier", "merchant", "healer", "artisan",
    "diplomat", "farmer", "explorer", "engineer", "performer"
  ]

  // Scale available pool: diversity 1–5 maps to 2–10 options
  const poolSize = Math.min(Math.max(diversity * 2, 2), backgrounds.length)
  const availableBackgrounds = backgrounds.slice(0, poolSize)
  const availableProfessions = professions.slice(0, poolSize)

  context.characters = context.characters.map((character, index) => {
    return {
      ...character,
      background: availableBackgrounds[index % availableBackgrounds.length],
      profession: availableProfessions[index % availableProfessions.length]
    }
  })

  return context
}
