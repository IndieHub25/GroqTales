/**
 * Hook Strength Pipeline
 *
 * Controls the intensity of the story's opening hook.
 * Hook strength range 1–5:
 *   1 → gentle    (atmospheric, slow-burn opening)
 *   2 → intriguing (a question or mystery posed immediately)
 *   3 → compelling (strong character moment or conflict tease)
 *   4 → gripping   (immediate tension or stakes established)
 *   5 → explosive  (opens with action, danger, or a shocking reveal)
 * Sets hook type, recommended technique, and opening guidance.
 */

export function hookStrengthPipeline(params, context) {
  const strength = params.hookStrength || 3

  if (!context.plot) {
    context.plot = {}
  }

  const hookLevels = {
    1: {
      label: "gentle",
      technique: "atmospheric opening",
      guidance: "Begin with a quiet, evocative scene that draws the reader in through mood and setting",
      opensWith: "description"
    },
    2: {
      label: "intriguing",
      technique: "mystery question",
      guidance: "Open with an unexplained event or statement that provokes curiosity",
      opensWith: "question"
    },
    3: {
      label: "compelling",
      technique: "character moment",
      guidance: "Start with the protagonist in a defining moment that reveals who they are",
      opensWith: "character-action"
    },
    4: {
      label: "gripping",
      technique: "immediate stakes",
      guidance: "Open with a problem or threat that demands immediate attention",
      opensWith: "conflict"
    },
    5: {
      label: "explosive",
      technique: "shock opening",
      guidance: "Begin with action, danger, or a revelation that forces the reader to keep going",
      opensWith: "action"
    }
  }

  const hook = hookLevels[Math.min(Math.max(strength, 1), 5)] || hookLevels[3]

  context.plot.hook = hook

  return context
}
