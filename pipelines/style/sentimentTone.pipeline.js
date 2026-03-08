/**
 * Sentiment Tone Pipeline
 *
 * Defines the dominant emotional tone of the story.
 * Supported tones:
 *   "hopeful"      — optimistic undercurrent, light at the end of the tunnel
 *   "balanced"     — neutral emotional baseline, highs and lows in equal measure
 *   "tragic"       — sorrow-driven, exploring loss and irreversible consequences
 *   "melancholic"  — bittersweet, reflective, tinged with longing
 *   "uplifting"    — joyful, inspiring, celebrating human resilience
 * Each tone defines emotional arc guidance, scene mood defaults, and music cues.
 */

export function sentimentTonePipeline(params, context) {
  const tone = params.sentimentTone || "balanced"

  if (!context.tone) {
    context.tone = {}
  }

  const toneDefinitions = {
    "hopeful": {
      tone: "hopeful",
      description: "An optimistic undercurrent runs through even the darkest moments",
      emotionalArc: "Start with challenges, build toward earned optimism",
      sceneMoodDefault: "warm with underlying determination",
      musicCue: "swelling strings, major key, rising melodies",
      guidance: "Even when things are hard, the narrative should whisper that things can get better. Hope is the engine of the story."
    },
    "balanced": {
      tone: "balanced",
      description: "Emotional highs and lows exist in equal measure",
      emotionalArc: "Alternate between tension and relief, joy and sorrow",
      sceneMoodDefault: "neutral — mood follows the scene's content",
      musicCue: "varied — shifts with the narrative beat",
      guidance: "Let each scene set its own emotional temperature. Don't pull toward consistently happy or sad. Trust the story's natural rhythm."
    },
    "tragic": {
      tone: "tragic",
      description: "Sorrow and loss define the emotional landscape",
      emotionalArc: "Build toward inevitable, meaningful loss",
      sceneMoodDefault: "somber, heavy, weight-bearing",
      musicCue: "minor key, slow tempo, solo instruments",
      guidance: "The beauty of tragedy is in what could have been. Show the reader what's worth mourning. Make them care before you take it away."
    },
    "melancholic": {
      tone: "melancholic",
      description: "A bittersweet, reflective tone tinged with longing and nostalgia",
      emotionalArc: "Gentle descent with moments of quiet beauty",
      sceneMoodDefault: "wistful, autumnal, softly aching",
      musicCue: "piano, acoustic, gentle rain sounds, fading echoes",
      guidance: "Write with a sense of time passing. Characters look back as much as forward. Beauty and sadness coexist in every moment."
    },
    "uplifting": {
      tone: "uplifting",
      description: "Joyful, inspiring, celebrating resilience and triumph",
      emotionalArc: "Overcome obstacles to reach genuine joy and growth",
      sceneMoodDefault: "bright, energetic, forward-leaning",
      musicCue: "major key, building percussion, choir swells",
      guidance: "Earn the uplift. Show real struggle so the joy feels deserved. The story should leave the reader feeling better than when they started."
    }
  }

  const selected = toneDefinitions[tone] || toneDefinitions["balanced"]

  context.tone.sentiment = selected

  return context
}
