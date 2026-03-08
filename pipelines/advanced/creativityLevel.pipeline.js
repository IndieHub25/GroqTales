/**
 * Creativity Level Pipeline
 *
 * Controls the level of creative freedom applied during story generation.
 * Level range 1–10:
 *   1–3  → conservative   (follows established tropes, predictable structure)
 *   4–7  → balanced       (familiar framework with creative surprises)
 *   8–10 → experimental   (breaks conventions, embraces the unexpected)
 * Each mode defines risk tolerance, narrative innovation, and trope handling.
 */

export function creativityLevelPipeline(params, context) {
  const creativity = params.creativityLevel || 5

  if (!context.advanced) {
    context.advanced = {}
  }

  let config

  if (creativity <= 3) {
    config = {
      mode: "conservative",
      description: "Follows established genre conventions and predictable narrative structure",
      riskTolerance: "low — stick to what works",
      tropeHandling: "embrace — use familiar tropes as reader anchors",
      narrativeInnovation: "minimal — structure and pacing follow proven patterns",
      surpriseFrequency: "rare — readers get what they expect",
      guidance: "Prioritize reader comfort and genre expectations. Deliver a well-crafted, familiar experience. Innovation is not the goal — execution is."
    }
  } else if (creativity <= 7) {
    config = {
      mode: "balanced",
      description: "Familiar framework with creative surprises and fresh angles",
      riskTolerance: "moderate — take calculated risks at key moments",
      tropeHandling: "subvert — use genre tropes but twist them in unexpected ways",
      narrativeInnovation: "selective — innovate in one or two dimensions while keeping others grounded",
      surpriseFrequency: "regular — readers are occasionally caught off guard",
      guidance: "Ground the story in recognizable patterns, then surprise the reader at turning points. The best stories feel both familiar and fresh."
    }
  } else {
    config = {
      mode: "experimental",
      description: "Convention-breaking narrative that embraces the unexpected",
      riskTolerance: "high — prioritize originality over safety",
      tropeHandling: "deconstruct — challenge, invert, or discard genre expectations",
      narrativeInnovation: "pervasive — structure, voice, and content may all break norms",
      surpriseFrequency: "constant — the reader should never feel certain about what comes next",
      guidance: "Push boundaries. Try unconventional structures, unreliable narrators, or genre fusion. Not every experiment succeeds — but the ones that do are memorable."
    }
  }

  context.advanced.creativity = config

  return context
}
