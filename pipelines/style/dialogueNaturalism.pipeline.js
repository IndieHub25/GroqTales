/**
 * Dialogue Naturalism Pipeline
 *
 * Controls how realistic and natural the dialogue sounds.
 * Naturalism range 1–5:
 *   1 → stylized     (theatrical, heightened language, clearly authored)
 *   2 → polished     (readable, clean, slightly idealized)
 *   3 → natural      (conversational with realistic flow and pauses)
 *   4 → gritty       (raw, includes stutters, interruptions, slang)
 *   5 → hyperreal    (exact replication of messy human speech patterns)
 * Each level defines allowed speech features and formatting guidance.
 */

export function dialogueNaturalismPipeline(params, context) {
  const naturalism = params.dialogueNaturalism || 3

  if (!context.dialogue) {
    context.dialogue = {}
  }

  const naturalismLevels = {
    1: {
      label: "stylized",
      description: "Theatrical, heightened language — characters speak in crafted, deliberate prose",
      allowedFeatures: ["monologues", "rhetorical questions", "parallel structure", "grand declarations"],
      avoidFeatures: ["stutters", "filler words", "contractions", "interruptions"],
      guidance: "Dialogue should sound scripted and intentional. Every line carries weight and rhythm."
    },
    2: {
      label: "polished",
      description: "Clean, readable dialogue that feels natural but slightly idealized",
      allowedFeatures: ["contractions", "brief pauses", "natural pacing"],
      avoidFeatures: ["excessive filler words", "rambling", "incomplete sentences"],
      guidance: "Write dialogue that sounds like real speech but trimmed of its messiest qualities."
    },
    3: {
      label: "natural",
      description: "Conversational dialogue with realistic flow, pauses, and variety",
      allowedFeatures: ["contractions", "interruptions", "trailing off", "filler words (occasional)", "overlapping ideas"],
      avoidFeatures: ["perfectly formed arguments", "unrealistic eloquence under pressure"],
      guidance: "Let characters stumble, pause, and rephrase. Match speech patterns to personality and emotional state."
    },
    4: {
      label: "gritty",
      description: "Raw dialogue with stutters, slang, interruptions, and imperfect grammar",
      allowedFeatures: ["slang", "profanity", "sentence fragments", "interruptions", "dialect markers", "filler words"],
      avoidFeatures: ["polished monologues", "overly articulate emotional moments"],
      guidance: "Lean into the rough edges of speech. Characters should sound like they live in their world, not like they're performing for an audience."
    },
    5: {
      label: "hyperreal",
      description: "Exact replication of messy human speech with all its imperfections",
      allowedFeatures: ["false starts", "rambling", "non sequiturs", "talking over each other", "mumbling", "awkward silence"],
      avoidFeatures: ["clarity for its own sake", "convenient exposition through dialogue"],
      guidance: "Sacrifice readability for authenticity when needed. Real speech is messy — embrace it."
    }
  }

  const selected = naturalismLevels[Math.min(Math.max(naturalism, 1), 5)] || naturalismLevels[3]

  context.dialogue.naturalism = selected

  return context
}
