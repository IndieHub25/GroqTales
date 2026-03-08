/**
 * Metaphor Density Pipeline
 *
 * Controls how frequently metaphors and figurative language appear.
 * Density range 1–10:
 *   1–2  → rare       (metaphors almost absent, literal prose dominates)
 *   3–4  → sparse     (occasional metaphors at key emotional moments)
 *   5–6  → moderate   (regular figurative language blended with literal prose)
 *   7–8  → dense      (metaphors are a primary mode of expression)
 *   9–10 → saturated  (nearly every description uses figurative language)
 * Also generates example metaphor types and usage guidance.
 * Metaphor entries are stored in context.metaphors for reference.
 */

export function metaphorDensityPipeline(params, context) {
  const density = params.metaphorDensity || 5

  if (!context.theme) {
    context.theme = {}
  }
  if (!context.metaphors) {
    context.metaphors = []
  }

  // Metaphor type definitions
  const metaphorTypes = [
    { type: "simile",         example: "Her voice was like cracked glass",               placement: "descriptions" },
    { type: "personification", example: "The wind whispered accusations through the pines", placement: "setting" },
    { type: "extended metaphor", example: "The city was a body — its streets the veins, its people the blood", placement: "narration" },
    { type: "implied metaphor", example: "He barked orders at the trembling recruits",     placement: "dialogue tags" },
    { type: "dead metaphor revived", example: "She carried the weight — literally, her shoulders bowed under the pack", placement: "character action" },
    { type: "synesthesia",    example: "The sound of the bell tasted like copper",          placement: "sensory passages" },
    { type: "conceit",        example: "Their love was a siege — long, exhausting, and ultimately about surrender", placement: "thematic moments" },
    { type: "metonymy",       example: "The crown demanded loyalty; the sword enforced it", placement: "world-building" }
  ]

  let config
  let selectedTypes

  if (density <= 2) {
    selectedTypes = metaphorTypes.slice(0, 1)
    config = {
      label: "rare",
      frequency: "one metaphor every few pages",
      description: "Literal prose dominates — metaphors are almost absent",
      guidance: "Save figurative language for the single most important emotional beat. Its rarity will make it powerful."
    }
  } else if (density <= 4) {
    selectedTypes = metaphorTypes.slice(0, 3)
    config = {
      label: "sparse",
      frequency: "one or two metaphors per scene",
      description: "Occasional metaphors appear at key emotional moments",
      guidance: "Use metaphors as highlights — they should feel like intentional strokes of color on a mostly neutral canvas."
    }
  } else if (density <= 6) {
    selectedTypes = metaphorTypes.slice(0, 5)
    config = {
      label: "moderate",
      frequency: "several metaphors per scene, blended with literal prose",
      description: "Regular figurative language woven naturally into the narrative",
      guidance: "Balance metaphorical and literal descriptions. Use figurative language to deepen emotional scenes without overwhelming every paragraph."
    }
  } else if (density <= 8) {
    selectedTypes = metaphorTypes.slice(0, 7)
    config = {
      label: "dense",
      frequency: "metaphors in most paragraphs",
      description: "Metaphors are a primary mode of expression and meaning-making",
      guidance: "Let figurative language carry significant narrative weight. Descriptions should often operate on two levels — literal and symbolic simultaneously."
    }
  } else {
    selectedTypes = metaphorTypes
    config = {
      label: "saturated",
      frequency: "figurative language in nearly every sentence",
      description: "The prose is almost entirely metaphorical — the literal is the exception",
      guidance: "This is poetic, literary-grade prose. Reality is filtered through layers of comparison and imagery. Not every reader will follow — that's by design."
    }
  }

  context.metaphors = selectedTypes.map((m, index) => ({
    id: "metaphor_type_" + (index + 1),
    ...m
  }))

  context.theme.metaphorDensity = {
    ...config,
    availableTypes: context.metaphors
  }

  return context
}
