/**
 * Cross References Pipeline
 *
 * Allows connections to other stories or internal lore within a shared universe.
 * Supported modes:
 *   "none"       — standalone story, no external connections
 *   "internal"   — references to world lore established within this story
 *   "series"     — connections to other stories in the same series
 *   "universe"   — part of a shared universe with broader cross-story links
 * Generates reference entries that link to characters, events, or lore
 * from other narratives or from the current story's deeper worldbuilding.
 */

export function crossReferencesPipeline(params, context) {
  const mode = params.crossReferences || "none"

  if (!context.effects) {
    context.effects = {}
  }

  const modeDefinitions = {
    "none": {
      mode: "none",
      description: "Standalone story — no connections to other narratives",
      referenceTypes: [],
      referenceCount: 0,
      guidance: "This story exists in isolation. No references to external stories are needed or expected."
    },
    "internal": {
      mode: "internal",
      description: "References to world lore established within this story's own universe",
      referenceTypes: [
        { type: "historical-event",    description: "Characters reference a past event described in the world history", source: "context.history" },
        { type: "legendary-figure",     description: "A historical figure from the lore is mentioned or quoted",        source: "context.world.history.notableFigures" },
        { type: "cultural-tradition",   description: "A cultural practice from the worldbuilding is observed or discussed", source: "context.cultures" },
        { type: "in-world-text",        description: "Characters read or quote from a book, scripture, or document that exists in-world", source: "generated" }
      ],
      referenceCount: 4,
      guidance: "Make the world feel lived-in by referencing its own established lore. Characters should talk about history and culture as if they grew up with it."
    },
    "series": {
      mode: "series",
      description: "Connections to other stories in the same series or sequence",
      referenceTypes: [
        { type: "returning-character",  description: "A character from a previous story appears or is mentioned",     source: "series-data" },
        { type: "consequence-callback", description: "Events from a prior story have visible consequences here",       source: "series-data" },
        { type: "evolving-world",       description: "The world has changed since the previous story in observable ways", source: "series-data" },
        { type: "foreshadow-next",      description: "Subtle hints at events that will occur in the next installment",  source: "planned" },
        { type: "shared-artifact",      description: "An object or symbol carries over between stories",                source: "series-data" }
      ],
      referenceCount: 5,
      guidance: "Reward returning readers without alienating new ones. References should add depth for fans but not be required for comprehension. Each story must stand on its own."
    },
    "universe": {
      mode: "universe",
      description: "Part of a shared universe with broader cross-story links",
      referenceTypes: [
        { type: "parallel-event",       description: "Events in this story are happening simultaneously with another story in the universe", source: "universe-data" },
        { type: "shared-faction",       description: "An organization or faction from another story appears or is referenced",              source: "universe-data" },
        { type: "cameo-appearance",     description: "A character from a different story makes a brief appearance",                          source: "universe-data" },
        { type: "universal-lore",       description: "Deep lore that spans multiple stories is referenced or expanded",                     source: "universe-data" },
        { type: "divergent-perspective", description: "The same event is seen from a different angle than in another story",                 source: "universe-data" },
        { type: "mythology-thread",     description: "A mythological element weaves through multiple stories in the universe",               source: "universe-data" }
      ],
      referenceCount: 6,
      guidance: "Build connection points that enrich the broader universe. Each reference should make both stories stronger. Coordination with the universe bible is essential."
    }
  }

  const selected = modeDefinitions[mode] || modeDefinitions["none"]

  // Cross-reference with existing context data for internal mode
  const concreteReferences = []

  if (mode === "internal") {
    // Link to existing history entries
    if (context.history && context.history.length > 0) {
      concreteReferences.push({
        type: "historical-event",
        target: context.history[0].name,
        usage: "Characters mention '" + context.history[0].name + "' in dialogue or narration"
      })
    }

    // Link to existing cultures
    if (context.cultures && context.cultures.length > 0) {
      concreteReferences.push({
        type: "cultural-tradition",
        target: context.cultures[0].name,
        usage: "A " + context.cultures[0].name + " tradition is observed or discussed in a scene"
      })
    }
  }

  context.effects.crossReferences = {
    ...selected,
    concreteReferences: concreteReferences
  }

  return context
}
