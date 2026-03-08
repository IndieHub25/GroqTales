/**
 * Action Description Pipeline
 *
 * Controls how detailed action scenes are — from sparse to cinematic.
 * Detail range 1–10:
 *   1–3  → summary     (action is glossed over, results matter more than process)
 *   4–6  → balanced    (key beats described, pacing kept tight)
 *   7–8  → detailed    (blow-by-blow choreography, spatial awareness)
 *   9–10 → cinematic   (slow-motion precision, every muscle and breath captured)
 * Sets sentence pacing, choreography depth, and camera-style guidance.
 */

export function actionDescriptionPipeline(params, context) {
  const detail = params.actionDescription || 5

  if (!context.immersion) {
    context.immersion = {}
  }

  let config

  if (detail <= 3) {
    config = {
      level: "summary",
      description: "Action is compressed — outcomes matter more than the process",
      sentencePacing: "long sentences that cover multiple beats at once",
      choreographyDepth: "none — 'they fought' or 'the battle raged' is sufficient",
      spatialAwareness: "minimal — general location only",
      techniques: ["time compression", "aftermath focus", "reaction over action"],
      guidance: "Skip the mechanics of combat or chase. Cut to the result and show its emotional impact. A single sentence can cover an entire fight."
    }
  } else if (detail <= 6) {
    config = {
      level: "balanced",
      description: "Key action beats are described while maintaining tight pacing",
      sentencePacing: "short-to-medium sentences, faster rhythm during peaks",
      choreographyDepth: "selective — describe turning points and decisive moments",
      spatialAwareness: "moderate — reader knows relative positions",
      techniques: ["highlight the pivotal moment", "intercut action with reaction", "use environment as participant"],
      guidance: "Describe the three most important beats of any action sequence. Skip routine moves. Let the reader's imagination fill gaps between key moments."
    }
  } else if (detail <= 8) {
    config = {
      level: "detailed",
      description: "Blow-by-blow choreography with clear spatial awareness",
      sentencePacing: "staccato short sentences during intensity, longer for build-up",
      choreographyDepth: "high — individual moves, tactics, and counter-moves",
      spatialAwareness: "detailed — reader can visualize the space like a map",
      techniques: ["tactical narration", "body mechanics", "environmental interaction", "momentum shifts"],
      guidance: "Choreograph action scenes like a fight director. Track positions, weapons, and terrain. Each move should have a logical consequence. Vary sentence length to control pace."
    }
  } else {
    config = {
      level: "cinematic",
      description: "Slow-motion precision — every muscle, breath, and heartbeat captured",
      sentencePacing: "ultra-short fragments during peaks, expanding during pauses",
      choreographyDepth: "extreme — micro-movements, reflexes, and split-second decisions",
      spatialAwareness: "total — 360-degree environmental awareness",
      techniques: ["slow-motion breakdowns", "sensory overload", "time dilation", "internal monologue during action", "bullet-time moments"],
      guidance: "Stretch key seconds into paragraphs. Show the sweat, the shift of weight, the held breath. Action becomes poetry. Use this sparingly or it exhausts the reader."
    }
  }

  context.immersion.action = config

  return context
}
