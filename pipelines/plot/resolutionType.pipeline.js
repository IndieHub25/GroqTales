/**
 * Resolution Type Pipeline
 *
 * Defines how the story's central conflict resolves.
 * Supported resolution types:
 *   "resolved"     — conflict fully resolved, loose ends tied up
 *   "bittersweet"  — victory comes at significant cost
 *   "ambiguous"    — resolution is left open to interpretation
 *   "tragic"       — protagonist fails or suffers irreversible loss
 *   "triumphant"   — clear, decisive victory for the protagonist
 *   "open-ended"   — story ends without definitive closure
 */

export function resolutionTypePipeline(params, context) {
  const resolutionType = params.resolutionType || "resolved"

  if (!context.plot) {
    context.plot = {}
  }

  const resolutions = {
    "resolved": {
      type: "resolved",
      tone: "satisfying",
      description: "All major conflicts are addressed and loose ends are tied up",
      guidance: "Provide clear answers to central questions and close subplot arcs"
    },
    "bittersweet": {
      type: "bittersweet",
      tone: "melancholic",
      description: "The goal is achieved but at a meaningful personal cost",
      guidance: "Balance the win with a significant sacrifice or irreversible change"
    },
    "ambiguous": {
      type: "ambiguous",
      tone: "contemplative",
      description: "Resolution is intentionally left open to interpretation",
      guidance: "End with an image or moment that can be read multiple ways"
    },
    "tragic": {
      type: "tragic",
      tone: "somber",
      description: "The protagonist fails, or success comes too late",
      guidance: "Build toward hope, then subvert expectations in the final act"
    },
    "triumphant": {
      type: "triumphant",
      tone: "uplifting",
      description: "Clear, decisive victory with the protagonist overcoming all odds",
      guidance: "Deliver catharsis through earned success and character growth"
    },
    "open-ended": {
      type: "open-ended",
      tone: "unresolved",
      description: "Story ends without definitive closure, inviting sequel or reflection",
      guidance: "Leave one major question unanswered while resolving the immediate crisis"
    }
  }

  const resolution = resolutions[resolutionType] || resolutions["resolved"]

  context.plot.resolution = resolution

  return context
}
