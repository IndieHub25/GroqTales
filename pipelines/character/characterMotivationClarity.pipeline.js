/**
 * Character Motivation Clarity Pipeline
 *
 * Defines goals and motivations for each character.
 * Clarity levels:
 *   1 → ambiguous (vague, dream-like motivations)
 *   2 → mixed     (one clear goal + one ambiguous goal)
 *   3 → clear     (two explicit, well-defined goals)
 */

export function characterMotivationClarityPipeline(params, context) {
  const clarity = params.characterMotivationClarity || 2

  const clearGoals = [
    "protect their homeland",
    "avenge a fallen ally",
    "uncover the hidden truth",
    "earn redemption for past sins",
    "become the greatest in their craft",
    "reunite with lost family",
    "overthrow a corrupt regime",
    "find a legendary artifact"
  ]

  const ambiguousGoals = [
    "searching for something they cannot name",
    "driven by a dream they barely remember",
    "drawn to a place they have never been",
    "compelled by a promise they cannot recall making",
    "haunted by a choice whose consequences remain unclear",
    "pursuing a feeling more than a destination"
  ]

  context.characters = context.characters.map((character, index) => {
    let goals = []

    if (clarity >= 3) {
      // Very clear: two explicit goals
      goals = [
        clearGoals[index % clearGoals.length],
        clearGoals[(index + 3) % clearGoals.length]
      ]
    } else if (clarity === 2) {
      // Mixed: one clear + one ambiguous
      goals = [
        clearGoals[index % clearGoals.length],
        ambiguousGoals[index % ambiguousGoals.length]
      ]
    } else {
      // Ambiguous: all hidden motivations
      goals = [
        ambiguousGoals[index % ambiguousGoals.length]
      ]
    }

    return {
      ...character,
      goals: goals,
      motivationClarity: clarity >= 3 ? "clear" : clarity === 2 ? "mixed" : "ambiguous"
    }
  })

  return context
}
