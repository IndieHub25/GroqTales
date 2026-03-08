/**
 * Dialogue Level Pipeline
 *
 * Controls the balance between dialogue and narration in the story.
 * Level range 1–10:
 *   1–3  → narration-heavy (dialogue is sparse, world and thought dominate)
 *   4–6  → balanced        (healthy mix of dialogue and prose)
 *   7–10 → dialogue-heavy  (conversations drive the story forward)
 * Sets ratio, scene guidance, and formatting recommendations.
 */

export function dialogueLevelPipeline(params, context) {
  const level = params.dialogueLevel || 5

  if (!context.dialogue) {
    context.dialogue = {}
  }

  let config

  if (level <= 3) {
    config = {
      label: "narration-heavy",
      dialogueRatio: 0.2,
      narrationRatio: 0.8,
      guidance: "Use dialogue sparingly and meaningfully. Let narration carry exposition, setting, and emotional beats.",
      sceneFormat: "Long descriptive passages with occasional dialogue exchanges",
      recommended: ["internal monologue", "environmental storytelling", "action sequences"]
    }
  } else if (level <= 6) {
    config = {
      label: "balanced",
      dialogueRatio: 0.5,
      narrationRatio: 0.5,
      guidance: "Alternate between dialogue exchanges and narrative passages. Use conversation to reveal character and advance plot.",
      sceneFormat: "Scenes alternate between conversation and description",
      recommended: ["character-driven scenes", "dialogue with action beats", "balanced exposition"]
    }
  } else {
    config = {
      label: "dialogue-heavy",
      dialogueRatio: 0.75,
      narrationRatio: 0.25,
      guidance: "Let characters talk. Use dialogue to reveal plot, conflict, and personality. Keep narration brief and functional.",
      sceneFormat: "Rapid-fire exchanges with minimal narrative interruption",
      recommended: ["witty banter", "interrogation scenes", "debate and argument", "subtext-laden conversations"]
    }
  }

  context.dialogue.level = config

  return context
}
