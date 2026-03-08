/**
 * Detail Level Pipeline
 *
 * Controls how detailed the generated story output becomes.
 * Level range 1–10:
 *   1–3  → sketch     (broad strokes, summary-level output)
 *   4–6  → standard   (well-rounded scenes with essential detail)
 *   7–8  → detailed   (rich, layered output with nuance in every scene)
 *   9–10 → exhaustive (maximum detail — every scene is fully realized)
 * Sets output density, scene completeness, and expansion rules.
 */

export function detailLevelPipeline(params, context) {
  const level = params.detailLevel || 5

  if (!context.advanced) {
    context.advanced = {}
  }

  let config

  if (level <= 3) {
    config = {
      level: "sketch",
      description: "Broad strokes — summary-level output suitable for outlines or drafts",
      outputDensity: "sparse",
      sceneCompleteness: "partial — key beats only, transitions skipped",
      expansionRules: [
        "summarize instead of rendering full scenes",
        "skip establishing descriptions",
        "compress dialogue to essential exchanges",
        "one paragraph per scene is acceptable"
      ],
      wordMultiplier: 0.5,
      guidance: "Generate the skeleton of the story. Focus on what happens, not how it looks or feels. This is ideal for outlining and rapid iteration."
    }
  } else if (level <= 6) {
    config = {
      level: "standard",
      description: "Well-rounded scenes with essential detail and natural flow",
      outputDensity: "moderate",
      sceneCompleteness: "full — each scene has setup, action, and resolution",
      expansionRules: [
        "render all major scenes fully",
        "include brief establishing descriptions",
        "write dialogue with action beats",
        "transition scenes can be compressed"
      ],
      wordMultiplier: 1.0,
      guidance: "Give each scene the space it needs. Major moments get full treatment. Minor transitions can be efficient. This is the default output quality."
    }
  } else if (level <= 8) {
    config = {
      level: "detailed",
      description: "Rich, layered output with nuance in every scene",
      outputDensity: "high",
      sceneCompleteness: "comprehensive — no scene is skipped or summarized",
      expansionRules: [
        "render every scene including transitions",
        "include environmental and sensory details",
        "dialogue includes subtext and physical behavior",
        "internal monologue during emotional beats",
        "minor characters get moments of depth"
      ],
      wordMultiplier: 1.5,
      guidance: "Treat every scene as important. Transition scenes are opportunities for character depth. The reader should feel the world breathing between major events."
    }
  } else {
    config = {
      level: "exhaustive",
      description: "Maximum detail — every moment is fully realized and rendered",
      outputDensity: "maximum",
      sceneCompleteness: "total — every beat, pause, and glance is captured",
      expansionRules: [
        "no summarization allowed",
        "all five senses engaged in every scene",
        "micro-expressions and body language fully described",
        "background characters have observable behavior",
        "environmental details shift with time and mood",
        "even silence is described"
      ],
      wordMultiplier: 2.0,
      guidance: "Leave nothing to the imagination. This is immersive, literary-grade output where every paragraph could stand alone as a piece of writing. Word count will be significantly higher."
    }
  }

  context.advanced.detailLevel = config

  return context
}
