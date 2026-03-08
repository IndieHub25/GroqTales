/**
 * Pacing Speed Pipeline
 *
 * Controls the narrative pacing of the story.
 * Speed range 1–10:
 *   1–3  → slow     (reflective, descriptive, character-driven scenes)
 *   4–7  → balanced (mix of action and introspection)
 *   8–10 → fast     (action-heavy, rapid scene changes, terse prose)
 * Also sets recommended scene length and transition speed.
 */

export function pacingSpeedPipeline(params, context) {
  const speed = params.pacingSpeed || 5

  if (!context.plot) {
    context.plot = {}
  }

  let pacing

  if (speed <= 3) {
    pacing = {
      label: "slow",
      sceneLength: "long",
      transitionSpeed: "gradual",
      descriptionDensity: "high",
      dialogueRatio: 0.3,
      guidance: "Linger on settings, emotions, and internal monologue"
    }
  } else if (speed <= 7) {
    pacing = {
      label: "balanced",
      sceneLength: "medium",
      transitionSpeed: "moderate",
      descriptionDensity: "medium",
      dialogueRatio: 0.5,
      guidance: "Alternate between action sequences and reflective moments"
    }
  } else {
    pacing = {
      label: "fast",
      sceneLength: "short",
      transitionSpeed: "rapid",
      descriptionDensity: "low",
      dialogueRatio: 0.7,
      guidance: "Keep scenes tight, use quick cuts, favor dialogue and action"
    }
  }

  context.plot.pacing = pacing

  return context
}
