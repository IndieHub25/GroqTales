/**
 * Easter Eggs Pipeline
 *
 * Adds hidden references, subtle details, and discoverable secrets
 * within the story for attentive readers.
 * Level range 0–5:
 *   0 → none      (no hidden content)
 *   1 → minimal   (one or two subtle nods)
 *   2 → light     (a handful of hidden details scattered throughout)
 *   3 → moderate  (recurring hidden patterns and references)
 *   4 → rich      (layered secrets that reward re-reading)
 *   5 → elaborate (an entire hidden layer beneath the surface narrative)
 * Generates specific easter egg entries with placement and discovery difficulty.
 */

export function easterEggsPipeline(params, context) {
  const level = params.easterEggs ?? 2

  if (!context.effects) {
    context.effects = {}
  }

  if (level <= 0) {
    context.effects.easterEggs = {
      level: "none",
      count: 0,
      entries: [],
      guidance: "No hidden content. The story operates entirely on the surface level."
    }
    return context
  }

  // Easter egg templates — drawn from based on level
  const eggPool = [
    {
      type: "name-reference",
      description: "A character or place name is an anagram or reference to something outside the story",
      placement: "character introductions or location naming",
      difficulty: "easy"
    },
    {
      type: "dialogue-callback",
      description: "A line of dialogue early in the story is echoed later with changed meaning",
      placement: "opening and closing chapters",
      difficulty: "moderate"
    },
    {
      type: "background-detail",
      description: "A seemingly insignificant environmental detail foreshadows a major event",
      placement: "scene descriptions in the first third",
      difficulty: "hard"
    },
    {
      type: "number-pattern",
      description: "A specific number appears repeatedly across unrelated contexts",
      placement: "scattered throughout the narrative",
      difficulty: "moderate"
    },
    {
      type: "hidden-message",
      description: "First letters of chapter titles or sentences spell out a secret message",
      placement: "structural — chapter or section headers",
      difficulty: "hard"
    },
    {
      type: "parallel-scene",
      description: "Two scenes mirror each other in structure but with inverted meaning",
      placement: "symmetrical positions in the narrative (e.g., chapters 2 and penultimate)",
      difficulty: "moderate"
    },
    {
      type: "unreliable-detail",
      description: "A detail the narrator presents as fact is subtly contradicted elsewhere",
      placement: "narrator descriptions vs. character dialogue",
      difficulty: "hard"
    },
    {
      type: "meta-reference",
      description: "The story subtly acknowledges its own nature as a story",
      placement: "narrator asides or character observations",
      difficulty: "easy"
    },
    {
      type: "cultural-nod",
      description: "A scene, phrase, or situation echoes a classic work of literature or film",
      placement: "pivotal scenes",
      difficulty: "moderate"
    },
    {
      type: "prophetic-throwaway",
      description: "A casual, throwaway line turns out to be literally true by the story's end",
      placement: "early casual dialogue",
      difficulty: "hard"
    }
  ]

  // Scale egg count with level
  const eggCount = Math.min(
    level <= 1 ? 2 : level <= 2 ? 4 : level <= 3 ? 6 : level <= 4 ? 8 : 10,
    eggPool.length
  )

  const selectedEggs = eggPool.slice(0, eggCount).map((egg, index) => ({
    id: "egg_" + (index + 1),
    ...egg
  }))

  context.effects.easterEggs = {
    level: level <= 1 ? "minimal" : level <= 2 ? "light" : level <= 3 ? "moderate" : level <= 4 ? "rich" : "elaborate",
    count: selectedEggs.length,
    entries: selectedEggs,
    guidance: level <= 2
      ? "Sprinkle a few hidden details that attentive readers will notice on a second read. Keep them subtle — they should feel like discoveries, not puzzles."
      : level <= 3
        ? "Build a pattern of hidden references. Readers who pay close attention should feel rewarded. Easter eggs should enhance, not distract from, the main story."
        : "Create a hidden layer beneath the surface narrative. The story works without discovering the eggs, but finding them transforms the reading experience. Consider a re-reading reveal."
  }

  return context
}
