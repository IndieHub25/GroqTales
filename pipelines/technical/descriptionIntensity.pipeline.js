/**
 * Description Intensity Pipeline
 *
 * Controls the density of descriptive passages in the narrative.
 * Intensity range 1–10:
 *   1–3  → sparse    (action and dialogue dominate, descriptions are functional)
 *   4–6  → moderate  (descriptions set the scene without lingering)
 *   7–8  → detailed  (rich, immersive descriptions that build atmosphere)
 *   9–10 → lush      (dense, painterly prose where setting is almost a character)
 * Sets word budget ratios, sensory depth, and pacing adjustments.
 */

export function descriptionIntensityPipeline(params, context) {
  const intensity = params.descriptionIntensity || 5

  if (!context.technical) {
    context.technical = {}
  }

  let config

  if (intensity <= 3) {
    config = {
      label: "sparse",
      descriptionBudget: 0.10,
      sensoryDepth: 1,
      description: "Functional descriptions only — just enough to orient the reader",
      allowedTechniques: ["single establishing detail", "action-embedded description"],
      avoidTechniques: ["extended landscape passages", "multi-paragraph settings", "poetic imagery"],
      guidance: "Describe only what matters to the current action. One strong detail per location is enough. Keep the story moving."
    }
  } else if (intensity <= 6) {
    config = {
      label: "moderate",
      descriptionBudget: 0.25,
      sensoryDepth: 3,
      description: "Scene-setting descriptions that ground the reader without slowing pace",
      allowedTechniques: ["multi-sensory snapshots", "character-filtered observations", "environmental mood-setting"],
      avoidTechniques: ["page-long descriptions", "cataloging every detail in a room"],
      guidance: "Open scenes with a grounding paragraph, then let action and dialogue take over. Return to description at emotional beats."
    }
  } else if (intensity <= 8) {
    config = {
      label: "detailed",
      descriptionBudget: 0.40,
      sensoryDepth: 4,
      description: "Rich, immersive descriptions that build atmosphere and emotional texture",
      allowedTechniques: ["extended sensory passages", "symbolic imagery", "environmental foreshadowing", "micro-details"],
      avoidTechniques: ["description that stops the narrative dead"],
      guidance: "Let descriptions do emotional work. A detailed setting should reflect or contrast the characters' inner states."
    }
  } else {
    config = {
      label: "lush",
      descriptionBudget: 0.55,
      sensoryDepth: 5,
      description: "Dense, painterly prose where the world is rendered in vivid, layered detail",
      allowedTechniques: ["all descriptive techniques", "synesthesia", "nested metaphors", "panoramic sweeps"],
      avoidTechniques: [],
      guidance: "Description is a core feature of the prose. Let it breathe. The world should feel tangible enough to touch, smell, and taste."
    }
  }

  context.technical.descriptionIntensity = config

  return context
}
