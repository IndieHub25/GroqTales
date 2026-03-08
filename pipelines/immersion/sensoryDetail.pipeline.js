/**
 * Sensory Detail Pipeline
 *
 * Controls the level of sensory descriptions across five channels:
 * sight, sound, smell, touch, and taste.
 * Detail range 1–10:
 *   1–3  → minimal   (sight-only, functional descriptions)
 *   4–6  → moderate  (2–3 senses per scene, grounding details)
 *   7–8  → rich      (4–5 senses, immersive environmental texture)
 *   9–10 → saturated (full sensory immersion, synesthetic layering)
 * Each level defines active channels, frequency, and prose integration guidance.
 */

export function sensoryDetailPipeline(params, context) {
  const detail = params.sensoryDetail || 5

  if (!context.immersion) {
    context.immersion = {}
  }

  const allChannels = [
    { sense: "sight",  cues: ["color", "light quality", "movement", "shape", "distance"] },
    { sense: "sound",  cues: ["ambient noise", "dialogue tone", "silence", "rhythm", "volume"] },
    { sense: "smell",  cues: ["air quality", "food aromas", "decay", "nature scents", "chemical"] },
    { sense: "touch",  cues: ["temperature", "texture", "pressure", "pain", "wind"] },
    { sense: "taste",  cues: ["metallic", "sweet", "bitter", "dry mouth", "aftertaste"] }
  ]

  let config

  if (detail <= 3) {
    config = {
      level: "minimal",
      activeChannels: allChannels.slice(0, 1),
      channelCount: 1,
      frequency: "one sensory detail per scene",
      description: "Functional descriptions — just enough to orient the reader",
      guidance: "Use sight as the primary sense. Add a second sense only at the most critical moments. Keep descriptions brief and purposeful."
    }
  } else if (detail <= 6) {
    config = {
      level: "moderate",
      activeChannels: allChannels.slice(0, 3),
      channelCount: 3,
      frequency: "two to three sensory details per scene",
      description: "Grounding descriptions that make scenes feel real without lingering",
      guidance: "Open each scene with a visual anchor, then layer in sound or smell. Use touch for emotional beats. Rotate senses to avoid repetition."
    }
  } else if (detail <= 8) {
    config = {
      level: "rich",
      activeChannels: allChannels.slice(0, 4),
      channelCount: 4,
      frequency: "multiple sensory details per paragraph in key scenes",
      description: "Immersive, textured environments that engage the reader's body",
      guidance: "Build sensory tapestries — combine two senses in single descriptions. Use unexpected sensory details to make familiar settings feel fresh."
    }
  } else {
    config = {
      level: "saturated",
      activeChannels: allChannels,
      channelCount: 5,
      frequency: "continuous sensory layering throughout",
      description: "Full sensory immersion where the reader inhabits the world physically",
      guidance: "Engage all five senses regularly. Use synesthesia (crossing senses) for heightened moments. The world should feel touchable, audible, and alive on every page."
    }
  }

  context.immersion.sensory = config

  return context
}
