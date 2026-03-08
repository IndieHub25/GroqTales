/**
 * Genre Blending Pipeline
 *
 * Controls the mixing of multiple genres within a single story.
 * Blend level range 0–10:
 *   0     → pure       (single genre, no blending)
 *   1–3   → minimal    (one dominant genre with light touches from another)
 *   4–6   → moderate   (two genres woven together in equal measure)
 *   7–8   → heavy      (three or more genres layered and interlocking)
 *   9–10  → fusion     (genre boundaries dissolved, creating something entirely new)
 * Generates genre combination entries with integration rules and tone management.
 */

export function genreBlendingPipeline(params, context) {
  const blend = params.genreBlending ?? 0

  if (!context.effects) {
    context.effects = {}
  }

  // Genre library with tonal signatures
  const genreLibrary = [
    { genre: "fantasy",      tonalSignature: "wonder, myth, arcane danger",       keywords: ["magic", "quests", "ancient prophecy"] },
    { genre: "sci-fi",       tonalSignature: "curiosity, technological awe, existential scale", keywords: ["technology", "space", "artificial intelligence"] },
    { genre: "thriller",     tonalSignature: "suspense, urgency, paranoia",       keywords: ["chase", "conspiracy", "ticking clock"] },
    { genre: "romance",      tonalSignature: "longing, intimacy, emotional risk", keywords: ["connection", "vulnerability", "desire"] },
    { genre: "horror",       tonalSignature: "dread, revulsion, the uncanny",     keywords: ["fear", "the unknown", "body", "isolation"] },
    { genre: "mystery",      tonalSignature: "curiosity, suspicion, revelation",  keywords: ["clues", "deception", "investigation"] },
    { genre: "comedy",       tonalSignature: "absurdity, timing, subverted expectations", keywords: ["humor", "misunderstanding", "escalation"] },
    { genre: "literary",     tonalSignature: "introspection, thematic weight, ambiguity", keywords: ["meaning", "identity", "time"] },
    { genre: "adventure",    tonalSignature: "excitement, exploration, triumph",  keywords: ["journey", "discovery", "survival"] },
    { genre: "historical",   tonalSignature: "period authenticity, social context, legacy", keywords: ["era", "tradition", "revolution"] }
  ]

  if (blend <= 0) {
    context.effects.genreBlending = {
      level: "pure",
      description: "Single genre — no blending applied",
      genres: [],
      integrationRules: [],
      guidance: "Commit fully to one genre's conventions and audience expectations."
    }
    return context
  }

  let config
  let genreCount

  if (blend <= 3) {
    genreCount = 2
    config = {
      level: "minimal",
      description: "One dominant genre with light touches from a secondary genre",
      toneManagement: "the primary genre sets the tone; the secondary adds flavor",
      integrationRules: [
        "secondary genre elements appear in no more than 20% of scenes",
        "the secondary genre should never override the primary's tone",
        "transitions between genre elements should feel natural"
      ]
    }
  } else if (blend <= 6) {
    genreCount = 2
    config = {
      level: "moderate",
      description: "Two genres woven together in roughly equal measure",
      toneManagement: "both genres contribute to tone; scenes may lean one way or the other",
      integrationRules: [
        "both genres have dedicated scenes and shared scenes",
        "genre A and genre B should enhance each other, not compete",
        "key plot points should involve elements from both genres",
        "the ending must satisfy expectations from both genres"
      ]
    }
  } else if (blend <= 8) {
    genreCount = 3
    config = {
      level: "heavy",
      description: "Three or more genres layered and interlocking",
      toneManagement: "tone shifts are a feature — manage transitions carefully",
      integrationRules: [
        "each genre contributes unique story elements (plot, character, world)",
        "tonal whiplash must be intentional and controlled",
        "at least one genre should inform the thematic core",
        "genre expectations may be subverted through combination",
        "the reader should feel surprised but not confused"
      ]
    }
  } else {
    genreCount = 4
    config = {
      level: "fusion",
      description: "Genre boundaries dissolved — something entirely new emerges",
      toneManagement: "there is no primary genre — the story defines its own category",
      integrationRules: [
        "genre elements are inseparable from each other",
        "no single genre's conventions are followed completely",
        "the story should feel like it belongs to a genre that doesn't exist yet",
        "readers may disagree about how to categorize it — that's by design",
        "embrace the chaos — coherence comes from character and theme, not genre convention"
      ]
    }
  }

  // Select genres from library
  const selectedGenres = genreLibrary.slice(0, genreCount).map((g, index) => ({
    id: "genre_" + (index + 1),
    ...g,
    role: index === 0 ? "primary" : index === 1 ? "secondary" : "accent"
  }))

  context.effects.genreBlending = {
    ...config,
    genres: selectedGenres,
    guidance: blend <= 3
      ? "Keep the secondary genre subtle. It should feel like seasoning, not a second meal."
      : blend <= 6
        ? "Give both genres equal respect. The best genre blends create experiences neither genre can achieve alone."
        : "You're creating something new. Let the combination surprise you. The rules of individual genres are starting points, not limits."
  }

  return context
}
