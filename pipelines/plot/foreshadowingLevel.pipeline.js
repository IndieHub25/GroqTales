/**
 * Foreshadowing Level Pipeline
 *
 * Adds foreshadowing markers that hint at future events.
 * Levels:
 *   1 → subtle   (very light, easily missed hints)
 *   2 → moderate (clear but not obvious signals)
 *   3 → heavy    (strong, recurring motifs and explicit hints)
 * Markers reference twist IDs from context.twists when available,
 * creating a link between foreshadowing and payoff.
 */

export function foreshadowingLevelPipeline(params, context) {
  const level = params.foreshadowingLevel || 2

  if (!context.plot) {
    context.plot = {}
  }

  const subtleHints = [
    "a throwaway line that gains meaning later",
    "a background detail that mirrors the climax",
    "a character's offhand comment that proves prophetic"
  ]

  const moderateHints = [
    "a dream sequence that parallels a future event",
    "a symbolic object introduced early that returns at a key moment",
    "a side character's warning that goes unheeded",
    "a recurring visual motif tied to the central theme"
  ]

  const heavyHints = [
    "an explicit prophecy or prediction",
    "a prologue scene from the future",
    "a character directly stating what they fear will happen",
    "a repeated phrase that becomes the story's thesis",
    "a visible countdown or approaching deadline"
  ]

  let selectedHints = []

  if (level <= 1) {
    selectedHints = subtleHints
  } else if (level === 2) {
    selectedHints = [...subtleHints, ...moderateHints]
  } else {
    selectedHints = [...subtleHints, ...moderateHints, ...heavyHints]
  }

  // Build foreshadowing markers, linking to twists if available
  const twists = context.twists || []
  const markers = selectedHints.map((hint, index) => {
    const marker = {
      id: "foreshadow_" + (index + 1),
      hint: hint,
      intensity: level <= 1 ? "subtle" : level === 2 ? "moderate" : "heavy",
      placement: index < selectedHints.length / 2 ? "early" : "mid"
    }

    // Link to a twist if available
    if (twists.length > 0) {
      marker.linkedTwist = twists[index % twists.length].id
    }

    return marker
  })

  context.plot.foreshadowing = {
    level: level <= 1 ? "subtle" : level === 2 ? "moderate" : "heavy",
    markers: markers
  }

  return context
}
