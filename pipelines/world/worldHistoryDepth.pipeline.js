/**
 * World History Depth Pipeline
 *
 * Generates world history and lore entries based on the worldHistoryDepth parameter.
 * Depth levels:
 *   1 → shallow   (brief founding myth, one era)
 *   2 → moderate  (multiple eras, key wars, notable figures)
 *   3 → deep      (detailed timeline, cultural shifts, legendary events)
 *   4 → epic      (exhaustive lore, competing historical accounts, artifacts)
 * History entries are stored in context.history for downstream use.
 */

export function worldHistoryDepthPipeline(params, context) {
  const depth = params.worldHistoryDepth || 2

  if (!context.world) {
    context.world = {}
  }
  if (!context.history) {
    context.history = []
  }

  const eras = [
    { name: "The Founding Age",   type: "origin",    description: "The world's creation myth or earliest recorded period" },
    { name: "The Age of Expansion", type: "growth",  description: "Civilizations spread, borders formed, trade routes established" },
    { name: "The Great Conflict",  type: "war",      description: "A defining war or cataclysm that reshaped the world" },
    { name: "The Reconstruction",  type: "recovery", description: "Societies rebuilt, new alliances forged, lessons learned" },
    { name: "The Golden Era",      type: "peak",     description: "Height of culture, knowledge, and prosperity" },
    { name: "The Decline",         type: "decay",    description: "Corruption, stagnation, or external threats erode stability" },
    { name: "The Current Age",     type: "present",  description: "The time in which the story takes place" }
  ]

  // Scale eras based on depth
  const eraCount = Math.min(depth <= 1 ? 2 : depth <= 2 ? 4 : depth <= 3 ? 6 : 7, eras.length)
  const selectedEras = eras.slice(0, eraCount)

  const notableFigures = [
    { name: "The First Ruler",     role: "founder",  legacy: "established the original kingdom or order" },
    { name: "The Great General",   role: "military", legacy: "won the defining conflict of the age" },
    { name: "The Heretic Scholar", role: "thinker",  legacy: "challenged established beliefs and changed society" },
    { name: "The Lost Prophet",    role: "mystic",   legacy: "predicted events that came to pass centuries later" },
    { name: "The Iron Merchant",   role: "economic", legacy: "built the trade networks that connected nations" }
  ]

  // Figure count scales with depth
  const figureCount = Math.min(depth, notableFigures.length)
  const selectedFigures = notableFigures.slice(0, figureCount)

  const legendaryEvents = []

  if (depth >= 3) {
    legendaryEvents.push(
      { name: "The Sundering",       type: "cataclysm",  description: "A world-altering event that split continents or realms" },
      { name: "The Oath of Nations",  type: "treaty",     description: "A legendary pact that defined the current political order" },
      { name: "The Vanishing",        type: "mystery",    description: "An entire civilization disappeared without explanation" }
    )
  }

  if (depth >= 4) {
    legendaryEvents.push(
      { name: "The Forbidden Discovery", type: "revelation", description: "Knowledge so dangerous it was sealed away" },
      { name: "The Return of the Old",   type: "resurgence", description: "Ancient forces re-emerged to challenge the current order" }
    )
  }

  context.history = selectedEras.map((era, index) => ({
    id: "era_" + (index + 1),
    ...era
  }))

  context.world.history = {
    depth: depth <= 1 ? "shallow" : depth <= 2 ? "moderate" : depth <= 3 ? "deep" : "epic",
    eras: context.history,
    notableFigures: selectedFigures,
    legendaryEvents: legendaryEvents
  }

  return context
}
