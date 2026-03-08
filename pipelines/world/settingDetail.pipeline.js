/**
 * Setting Detail Pipeline
 *
 * Controls how detailed the world descriptions are.
 * Detail range 1–10:
 *   1–3  → minimal  (broad strokes, sparse descriptions)
 *   4–7  → moderate (key landmarks, notable features, sensory cues)
 *   8–10 → rich     (immersive, layered descriptions with micro-details)
 * Also sets guidance for description density and sensory channels to emphasize.
 */

export function settingDetailPipeline(params, context) {
  const detail = params.settingDetail || 5

  if (!context.world) {
    context.world = {}
  }

  let detailConfig

  if (detail <= 3) {
    detailConfig = {
      level: "minimal",
      descriptionDensity: "sparse",
      sensoryChannels: ["sight"],
      guidance: "Use brief, functional descriptions; let the reader fill in gaps",
      landmarkCount: 1,
      environmentalCues: ["weather"]
    }
  } else if (detail <= 7) {
    detailConfig = {
      level: "moderate",
      descriptionDensity: "balanced",
      sensoryChannels: ["sight", "sound", "smell"],
      guidance: "Describe key locations with enough texture to feel grounded",
      landmarkCount: 3,
      environmentalCues: ["weather", "time-of-day", "season"]
    }
  } else {
    detailConfig = {
      level: "rich",
      descriptionDensity: "immersive",
      sensoryChannels: ["sight", "sound", "smell", "touch", "taste"],
      guidance: "Build layered, lived-in environments with micro-details and history",
      landmarkCount: 6,
      environmentalCues: ["weather", "time-of-day", "season", "ambient-sounds", "light-quality", "textures"]
    }
  }

  context.world.detail = detailConfig

  return context
}
