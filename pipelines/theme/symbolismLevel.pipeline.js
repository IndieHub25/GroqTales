/**
 * Symbolism Level Pipeline
 *
 * Generates symbolic elements to be used throughout the story.
 * Level range 1–5:
 *   1 → none      (no deliberate symbolism)
 *   2 → light     (one or two recurring symbols)
 *   3 → moderate  (several symbols woven into key scenes)
 *   4 → rich      (layered symbolic network throughout the narrative)
 *   5 → pervasive (nearly everything carries symbolic weight)
 * Symbols are stored in context.symbols for reference by downstream pipelines.
 */

export function symbolismLevelPipeline(params, context) {
  const level = params.symbolismLevel || 3

  if (!context.theme) {
    context.theme = {}
  }
  if (!context.symbols) {
    context.symbols = []
  }

  if (level <= 1) {
    context.theme.symbolism = {
      level: "none",
      description: "No deliberate symbolism — story operates at face value",
      guidance: "Avoid symbolic readings. Events and objects are literal."
    }
    return context
  }

  // Symbol pool with categories and meanings
  const symbolPool = [
    { name: "The Mirror",       category: "object",  meaning: "self-reflection, duality, truth hidden behind appearance" },
    { name: "The Storm",        category: "weather",  meaning: "inner turmoil, approaching conflict, unavoidable change" },
    { name: "The Door",         category: "object",  meaning: "opportunity, transition, the unknown beyond comfort" },
    { name: "The River",        category: "nature",  meaning: "time, passage, irreversible choices flowing forward" },
    { name: "Fire",             category: "element", meaning: "destruction and renewal, passion, purification" },
    { name: "The Mask",         category: "object",  meaning: "deception, social performance, hidden identity" },
    { name: "The Garden",       category: "place",   meaning: "innocence, cultivation, paradise lost or found" },
    { name: "Broken Glass",     category: "object",  meaning: "shattered illusions, fragile trust, irreparable damage" },
    { name: "The Crossroads",   category: "place",   meaning: "decision, diverging paths, moral choice" },
    { name: "Birdsong",         category: "sound",   meaning: "freedom, hope, the natural world's indifference" },
    { name: "Shadows",          category: "visual",  meaning: "the unconscious, hidden motives, that which follows" },
    { name: "The Clock",        category: "object",  meaning: "mortality, urgency, the unstoppable march of time" }
  ]

  // Scale symbol count with level
  const symbolCount = Math.min(
    level <= 2 ? 2 : level <= 3 ? 4 : level <= 4 ? 7 : 10,
    symbolPool.length
  )

  const selectedSymbols = symbolPool.slice(0, symbolCount).map((symbol, index) => ({
    id: "symbol_" + (index + 1),
    ...symbol,
    recurrence: level <= 2 ? "occasional" : level <= 3 ? "regular" : "frequent",
    placement: index < symbolCount / 2 ? "introduced early" : "emerges mid-story"
  }))

  context.symbols = selectedSymbols

  context.theme.symbolism = {
    level: level <= 2 ? "light" : level <= 3 ? "moderate" : level <= 4 ? "rich" : "pervasive",
    symbolCount: selectedSymbols.length,
    symbols: selectedSymbols,
    guidance: level <= 2
      ? "Introduce symbols sparingly. Let them appear naturally without forcing attention."
      : level <= 3
        ? "Weave symbols into key scenes. Repeat them with evolving meaning across the narrative."
        : "Build a dense symbolic network. Objects, settings, and weather should carry layered meaning. Multiple symbols may interlock."
  }

  return context
}
