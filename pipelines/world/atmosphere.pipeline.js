/**
 * Atmosphere Pipeline
 *
 * Defines the overall mood and atmosphere of the story world.
 * Supported moods:
 *   "hopeful"    — warm, optimistic, light-filled world
 *   "neutral"    — grounded, balanced, realistic tone
 *   "dark"       — oppressive, gritty, shadowed world
 *   "mysterious" — enigmatic, layered with secrets and unknowns
 *   "epic"       — grand, awe-inspiring, larger-than-life
 * Each mood defines color palette cues, sound cues, weather tendencies,
 * and prose guidance for consistent tone-setting.
 */

export function atmospherePipeline(params, context) {
  const mood = params.atmosphere || "neutral"

  if (!context.world) {
    context.world = {}
  }

  const atmospheres = {
    "hopeful": {
      mood: "hopeful",
      description: "A warm, optimistic world where light overcomes darkness",
      colorPalette: ["golden", "sky blue", "soft green", "warm white"],
      soundCues: ["birdsong", "gentle breeze", "laughter in the distance", "flowing water"],
      weather: ["clear skies", "warm sunlight", "light rain followed by rainbows"],
      proseGuidance: "Favor warm imagery, open spaces, and upward motion. End scenes on notes of possibility."
    },
    "neutral": {
      mood: "neutral",
      description: "A grounded, realistic world with balanced highs and lows",
      colorPalette: ["grey", "earth tones", "muted blue", "stone"],
      soundCues: ["ambient chatter", "footsteps", "wind", "clinking tools"],
      weather: ["overcast", "mild", "seasonal variation"],
      proseGuidance: "Use measured, observational prose. Let events carry their own weight without amplification."
    },
    "dark": {
      mood: "dark",
      description: "An oppressive, gritty world where hope is scarce",
      colorPalette: ["charcoal", "blood red", "deep purple", "ash grey"],
      soundCues: ["distant screams", "creaking metal", "howling wind", "dripping water"],
      weather: ["persistent overcast", "cold rain", "fog", "ash fall"],
      proseGuidance: "Lean into shadows, decay, and confinement. Use short, tense sentences during conflict."
    },
    "mysterious": {
      mood: "mysterious",
      description: "An enigmatic world layered with secrets and the unknown",
      colorPalette: ["twilight blue", "silver", "deep violet", "emerald"],
      soundCues: ["whispers", "echoes", "distant bells", "rustling unseen"],
      weather: ["rolling fog", "moonlit nights", "sudden stillness", "impossible auroras"],
      proseGuidance: "Withhold full descriptions. Use suggestion over declaration. Let the reader sense more than they see."
    },
    "epic": {
      mood: "epic",
      description: "A grand, awe-inspiring world where everything feels larger than life",
      colorPalette: ["gold", "crimson", "midnight blue", "blazing white"],
      soundCues: ["thundering drums", "soaring horns", "roaring crowds", "clashing steel"],
      weather: ["dramatic storms", "sweeping winds", "volcanic skies", "celestial events"],
      proseGuidance: "Use sweeping language, grand scale, and elevated rhetoric. Frame moments as legendary."
    }
  }

  const atmosphere = atmospheres[mood] || atmospheres["neutral"]

  context.world.atmosphere = atmosphere

  return context
}
