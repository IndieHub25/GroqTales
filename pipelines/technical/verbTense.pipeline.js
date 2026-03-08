/**
 * Verb Tense Pipeline
 *
 * Defines the primary tense used in narration.
 * Supported tenses:
 *   "past"    — traditional storytelling tense ("She walked into the room")
 *   "present" — immediate, cinematic feel ("She walks into the room")
 *   "future"  — prophetic or speculative tone ("She will walk into the room")
 * Each tense defines usage rules, common pitfalls, and pairing guidance.
 */

export function verbTensePipeline(params, context) {
  const tense = params.verbTense || "past"

  if (!context.technical) {
    context.technical = {}
  }

  const tenseDefinitions = {
    "past": {
      tense: "past",
      description: "Traditional storytelling tense — events have already happened",
      example: "She walked into the room and noticed the broken window.",
      usageRules: [
        "default narration uses simple past",
        "flashbacks use past perfect ('had walked')",
        "dialogue remains in natural tense"
      ],
      pitfalls: [
        "avoid unnecessary past perfect in continuous narration",
        "maintain consistent tense within paragraphs",
        "don't slip into present tense during action scenes"
      ],
      pairingNotes: "Past tense pairs naturally with third-person and first-person. Most flexible and familiar to readers."
    },
    "present": {
      tense: "present",
      description: "Immediate, cinematic tense — events unfold in real-time",
      example: "She walks into the room and notices the broken window.",
      usageRules: [
        "default narration uses simple present",
        "past events referenced with simple past",
        "internal thought can stay in present tense"
      ],
      pitfalls: [
        "easy to accidentally slip into past tense during reflection",
        "can feel exhausting over very long narratives",
        "requires extra care with temporal markers"
      ],
      pairingNotes: "Present tense creates immediacy. Pairs well with first-person and second-person. Excellent for thrillers and literary fiction."
    },
    "future": {
      tense: "future",
      description: "Prophetic or speculative tense — events are yet to happen",
      example: "She will walk into the room and notice the broken window.",
      usageRules: [
        "default narration uses simple future ('will')",
        "conditional mood for uncertain outcomes ('would')",
        "present tense for established facts within the world"
      ],
      pitfalls: [
        "very difficult to sustain for a full narrative",
        "can create emotional distance if overused",
        "best used for specific sections rather than entire stories"
      ],
      pairingNotes: "Future tense is rare and experimental. Best used for prophecy sequences, speculative fiction, or short stylistic passages."
    }
  }

  const selected = tenseDefinitions[tense] || tenseDefinitions["past"]

  context.technical.verbTense = selected

  return context
}
