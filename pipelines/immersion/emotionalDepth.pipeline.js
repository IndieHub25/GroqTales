/**
 * Emotional Depth Pipeline
 *
 * Defines emotional intensity and how deeply internal character feelings
 * are explored in the narrative.
 * Depth range 1–10:
 *   1–3  → restrained   (emotions shown through action, rarely named directly)
 *   4–6  → expressive   (emotions are named and explored at key moments)
 *   7–8  → intense      (deep internal monologue, visceral emotional reactions)
 *   9–10 → raw          (unfiltered emotional exposure, psychologically intimate)
 * Also generates emotion markers stored in context.emotions for downstream use.
 */

export function emotionalDepthPipeline(params, context) {
  const depth = params.emotionalDepth || 5

  if (!context.immersion) {
    context.immersion = {}
  }
  if (!context.emotions) {
    context.emotions = []
  }

  // Emotion palette — available emotions scale with depth
  const emotionPalette = [
    { emotion: "fear",        physical: "cold sweat, shallow breathing, rigid muscles" },
    { emotion: "joy",         physical: "lightness in chest, involuntary smile, warm flush" },
    { emotion: "grief",       physical: "hollow chest, tight throat, stinging eyes" },
    { emotion: "anger",       physical: "clenched jaw, heat in face, trembling hands" },
    { emotion: "shame",       physical: "downcast eyes, shrinking posture, nausea" },
    { emotion: "longing",     physical: "ache behind the ribs, distant gaze, restless hands" },
    { emotion: "tenderness",  physical: "soft voice, gentle touch, slowed breathing" },
    { emotion: "dread",       physical: "pit in stomach, hyper-alertness, dry mouth" },
    { emotion: "betrayal",    physical: "stunned stillness, ringing ears, dissociation" },
    { emotion: "euphoria",    physical: "racing heart, reckless energy, loss of time" }
  ]

  let config
  let selectedEmotions

  if (depth <= 3) {
    selectedEmotions = emotionPalette.slice(0, 4)
    config = {
      level: "restrained",
      description: "Emotions are shown through action and behavior, rarely named directly",
      expressionMode: "external — body language, silence, avoidance",
      internalMonologue: "rare to none",
      physicalManifstation: "subtle — readers must infer emotional states",
      guidance: "Show, don't tell. A character grips a table instead of 'feeling angry.' Let dialogue carry emotion through what is not said."
    }
  } else if (depth <= 6) {
    selectedEmotions = emotionPalette.slice(0, 7)
    config = {
      level: "expressive",
      description: "Emotions are named and explored at key narrative moments",
      expressionMode: "mixed — internal feelings paired with external reactions",
      internalMonologue: "present during pivotal scenes",
      physicalManifstation: "clear — readers feel what characters feel",
      guidance: "Name emotions at turning points. Use physical responses to ground abstract feelings. Balance internal and external expression."
    }
  } else if (depth <= 8) {
    selectedEmotions = emotionPalette.slice(0, 9)
    config = {
      level: "intense",
      description: "Deep internal monologue with visceral, embodied emotional reactions",
      expressionMode: "primarily internal — the reader lives inside the character's psyche",
      internalMonologue: "frequent — extended passages of inner experience",
      physicalManifstation: "vivid — emotions are felt in the body with specificity",
      guidance: "Emotions should be physical events. Don't just name them — describe how they feel in the chest, throat, and stomach. Let emotional passages slow the pacing intentionally."
    }
  } else {
    selectedEmotions = emotionPalette
    config = {
      level: "raw",
      description: "Unfiltered emotional exposure — psychologically intimate and vulnerable",
      expressionMode: "total — no emotional boundary between character and reader",
      internalMonologue: "pervasive — the emotional landscape IS the narrative",
      physicalManifstation: "overwhelming — emotions distort perception itself",
      guidance: "Strip away all emotional armor. Let characters break down, contradict themselves, and feel things they can't articulate. The reader should feel uncomfortably close to the character's inner world."
    }
  }

  context.emotions = selectedEmotions.map((e, index) => ({
    id: "emotion_" + (index + 1),
    ...e
  }))

  context.immersion.emotionalDepth = {
    ...config,
    availableEmotions: context.emotions
  }

  return context
}
