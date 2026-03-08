/**
 * Twist Count Pipeline
 *
 * Generates placeholder entries for plot twists based on the twistCount parameter.
 * Each twist is assigned a position within the story (early, mid, late, climax)
 * and an impact level that scales with twist density.
 * Twists are stored in context.twists for downstream pipelines to refine.
 */

export function twistCountPipeline(params, context) {
  const count = params.twistCount || 2

  if (!context.twists) {
    context.twists = []
  }

  // Position distribution across the story
  const positions = ["early", "mid", "mid", "late", "climax"]

  // Impact scales with how many twists there are
  const impactLevels = ["minor", "moderate", "major"]

  const twists = []

  for (let i = 0; i < count; i++) {
    const position = positions[i % positions.length]
    const impact = impactLevels[Math.min(i, impactLevels.length - 1)]

    twists.push({
      id: "twist_" + (i + 1),
      position: position,
      impact: impact,
      revealed: false,
      description: "Plot twist " + (i + 1) + " occurring at " + position + " stage"
    })
  }

  context.twists = twists

  return context
}
