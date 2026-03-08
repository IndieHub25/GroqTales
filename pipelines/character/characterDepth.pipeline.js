/**
 * Character Depth Pipeline
 *
 * Adds personality depth levels to every character in the context.
 * Depth levels: "simple" (1), "moderate" (2), "complex" (3).
 * The protagonist always receives the highest requested depth.
 * Other characters receive progressively simpler depth the further
 * down the cast list they appear.
 */

export function characterDepthPipeline(params, context) {
  const depthLevel = params.characterDepth || 2

  const depthLabels = ["simple", "moderate", "complex"]

  context.characters = context.characters.map((character, index) => {
    let assignedDepth

    if (character.role === "protagonist") {
      // Protagonist always gets the full requested depth
      assignedDepth = Math.min(depthLevel, 3)
    } else {
      // Scale depth down for later characters
      const scaled = Math.max(1, depthLevel - Math.floor(index / 2))
      assignedDepth = Math.min(scaled, 3)
    }

    const label = depthLabels[assignedDepth - 1] || "simple"

    return {
      ...character,
      depth: label,
      depthScore: assignedDepth
    }
  })

  return context
}
