/**
 * Chapter Structure Pipeline
 *
 * Defines the chapter formatting and organizational style.
 * Supported structures:
 *   "traditional"  — numbered chapters with clear beginnings and endings
 *   "episodic"     — self-contained episodes loosely connected by theme or character
 *   "interwoven"   — multiple threads that alternate and converge
 * Each structure defines formatting rules, transition types, and reader expectations.
 */

export function chapterStructurePipeline(params, context) {
  const structure = params.chapterStructure || "traditional"

  if (!context.technical) {
    context.technical = {}
  }

  const structureDefinitions = {
    "traditional": {
      structure: "traditional",
      description: "Numbered chapters with clear beginnings, middles, and endings",
      formatting: {
        naming: "Chapter 1, Chapter 2, etc. — optional titles",
        length: "roughly equal chapter lengths",
        breaks: "clean scene breaks within chapters using visual dividers"
      },
      transitions: "end each chapter with a sense of closure or forward momentum",
      readerExpectation: "familiar, comfortable, easy to navigate and bookmark",
      guidance: "Each chapter should feel like a complete unit of narrative. Open with a hook, build tension, and close with resolution or a question."
    },
    "episodic": {
      structure: "episodic",
      description: "Self-contained episodes connected by recurring characters or themes",
      formatting: {
        naming: "episode titles that reflect the contained story",
        length: "can vary significantly between episodes",
        breaks: "hard breaks between episodes — each is its own mini-story"
      },
      transitions: "each episode stands alone but may reference previous events",
      readerExpectation: "can be read out of order or in sequence; low commitment per episode",
      guidance: "Each episode needs its own arc: setup, conflict, resolution. Recurring elements create cohesion across the collection."
    },
    "interwoven": {
      structure: "interwoven",
      description: "Multiple narrative threads that alternate chapter by chapter and eventually converge",
      formatting: {
        naming: "thread identifiers — character names, locations, or time periods as chapter headers",
        length: "can vary but should balance screen time across threads",
        breaks: "clear thread markers so readers can track which storyline they're in"
      },
      transitions: "end each thread segment with a hook that connects thematically to the next thread",
      readerExpectation: "requires engaged, attentive reading; payoff comes from convergence",
      guidance: "Alternate threads at strategic moments — cut away at peaks to create suspense. Ensure threads converge meaningfully by the final act."
    }
  }

  const selected = structureDefinitions[structure] || structureDefinitions["traditional"]

  context.technical.chapterStructure = selected

  return context
}
