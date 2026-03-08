/**
 * Theme Depth Pipeline
 *
 * Defines how deeply themes are explored in the story.
 * Depth range 1–10:
 *   1–3  → surface        (theme as backdrop, not explicitly explored)
 *   4–6  → moderate       (theme woven into plot and character choices)
 *   7–8  → deep           (theme drives conflict, dialogue, and character arcs)
 *   9–10 → philosophical  (theme is the story's reason for existing, demands reader reflection)
 * Each level defines exploration methods, narrative integration, and reader engagement.
 */

export function themeDepthPipeline(params, context) {
  const depth = params.themeDepth || 5

  if (!context.theme) {
    context.theme = {}
  }

  let config

  if (depth <= 3) {
    config = {
      label: "surface",
      description: "Theme exists as a backdrop — present but not explicitly examined",
      explorationMethods: ["implied through setting", "visible in character types"],
      narrativeIntegration: "theme informs the world but doesn't drive decisions",
      readerEngagement: "passive — reader absorbs theme without effort",
      guidance: "Let the theme be felt, not stated. It should color the world without characters discussing it directly."
    }
  } else if (depth <= 6) {
    config = {
      label: "moderate",
      description: "Theme is woven into plot events and character choices",
      explorationMethods: ["character dilemmas that reflect the theme", "plot events that test thematic ideas", "dialogue that touches on core questions"],
      narrativeIntegration: "theme shapes key decisions and consequences",
      readerEngagement: "active — reader recognizes thematic patterns",
      guidance: "Let characters face situations that embody the theme. Their choices should illuminate different perspectives on the central idea."
    }
  } else if (depth <= 8) {
    config = {
      label: "deep",
      description: "Theme drives conflict, dialogue, and character transformation",
      explorationMethods: ["thematic arguments between characters", "subplots as thematic counterpoints", "symbolism and motifs reinforcing the theme", "character arcs as thematic journeys"],
      narrativeIntegration: "theme is inseparable from the story's structure",
      readerEngagement: "engaged — reader wrestles with the same questions as the characters",
      guidance: "Every major scene should connect to the theme. Characters on opposite sides of the thematic question create the richest conflict."
    }
  } else {
    config = {
      label: "philosophical",
      description: "Theme is the story's reason for existing — it demands reader reflection",
      explorationMethods: ["direct philosophical inquiry through narrative", "competing worldviews embodied by characters", "narrative structure itself reflects the theme", "no easy answers provided — the reader must decide"],
      narrativeIntegration: "theme IS the plot — events exist to explore the central question",
      readerEngagement: "demanding — reader is challenged to form their own position",
      guidance: "The story should leave the reader thinking long after the final page. Present all sides of the argument without favoring one. Trust the reader to draw conclusions."
    }
  }

  context.theme.depth = config

  return context
}
