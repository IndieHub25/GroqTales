/**
 * Ending Type Pipeline
 *
 * Defines the final ending style of the story.
 * Supported ending types:
 *   "closed"        — all threads resolved, definitive conclusion
 *   "open"          — major question left unanswered
 *   "twist"         — final reveal that recontextualizes everything
 *   "epilogue"      — resolution followed by a time-skip epilogue
 *   "cliffhanger"   — ends at a peak moment, inviting continuation
 *   "mirror"        — ending echoes the opening scene with new meaning
 * Sets the ending style, emotional tone, and structural guidance.
 */

export function endingTypePipeline(params, context) {
  const endingType = params.endingType || "closed"

  if (!context.plot) {
    context.plot = {}
  }

  const endings = {
    "closed": {
      type: "closed",
      tone: "conclusive",
      description: "All story threads are resolved with a definitive conclusion",
      guidance: "Tie up every subplot, answer central questions, and provide emotional closure"
    },
    "open": {
      type: "open",
      tone: "contemplative",
      description: "The story ends with at least one significant question unanswered",
      guidance: "Resolve the immediate conflict but leave the larger thematic question open"
    },
    "twist": {
      type: "twist",
      tone: "shocking",
      description: "A final reveal recontextualizes the entire story",
      guidance: "Plant seeds throughout, then deliver a revelation that invites re-reading"
    },
    "epilogue": {
      type: "epilogue",
      tone: "reflective",
      description: "The main story resolves, followed by a time-skip showing aftermath",
      guidance: "Close the climax cleanly, then jump forward to show lasting consequences"
    },
    "cliffhanger": {
      type: "cliffhanger",
      tone: "suspenseful",
      description: "Story ends at a moment of peak tension or uncertainty",
      guidance: "Build to a crescendo and cut right before resolution to fuel anticipation"
    },
    "mirror": {
      type: "mirror",
      tone: "poetic",
      description: "The ending echoes the opening scene but with transformed meaning",
      guidance: "Return to the opening image, location, or line and show how everything has changed"
    }
  }

  const ending = endings[endingType] || endings["closed"]

  context.plot.ending = ending

  return context
}
