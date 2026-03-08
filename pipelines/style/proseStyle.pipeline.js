/**
 * Prose Style Pipeline
 *
 * Defines the overall writing style for the story.
 * Supported styles:
 *   "literary"    — rich, layered prose with thematic depth
 *   "simple"      — clear, accessible, straightforward language
 *   "cinematic"   — visual, scene-driven, screenplay-like flow
 *   "poetic"      — rhythm-focused, metaphor-heavy, lyrical
 *   "minimalist"  — stripped-down, essential-only prose
 * Each style includes sentence structure guidance, vocabulary level, and examples.
 */

export function proseStylePipeline(params, context) {
  const style = params.proseStyle || "cinematic"

  if (!context.style) {
    context.style = {}
  }

  const styleDefinitions = {
    "literary": {
      style: "literary",
      description: "Rich, layered prose that rewards close reading",
      sentenceStructure: "varied — long compound sentences interspersed with short declaratives",
      vocabularyLevel: "elevated",
      figurativeLanguage: "heavy use of metaphor, symbolism, and allusion",
      paragraphDensity: "dense",
      guidance: "Prioritize thematic resonance. Let sentences carry subtext. Use imagery that connects to the story's deeper meaning."
    },
    "simple": {
      style: "simple",
      description: "Clear, accessible language that prioritizes comprehension",
      sentenceStructure: "short to medium, direct subject-verb-object",
      vocabularyLevel: "everyday",
      figurativeLanguage: "occasional similes, no complex metaphors",
      paragraphDensity: "light",
      guidance: "Say what you mean plainly. Avoid jargon and ornament. Let story and character do the heavy lifting."
    },
    "cinematic": {
      style: "cinematic",
      description: "Visual, scene-driven prose that reads like a film",
      sentenceStructure: "action-oriented, present-tense feel even in past tense",
      vocabularyLevel: "moderate",
      figurativeLanguage: "visual metaphors, camera-like framing",
      paragraphDensity: "medium with frequent scene cuts",
      guidance: "Describe what a camera would see. Use quick cuts between angles. Favor external action and dialogue over internal monologue."
    },
    "poetic": {
      style: "poetic",
      description: "Rhythm-focused, lyrical prose with emphasis on sound and cadence",
      sentenceStructure: "flowing, musical, often fragmented for effect",
      vocabularyLevel: "curated and evocative",
      figurativeLanguage: "pervasive — metaphor, personification, synesthesia",
      paragraphDensity: "varies — can be sparse or lush",
      guidance: "Read sentences aloud for rhythm. Choose words for their sound as much as meaning. Let language itself become part of the experience."
    },
    "minimalist": {
      style: "minimalist",
      description: "Stripped-down, essential-only prose where every word earns its place",
      sentenceStructure: "very short, declarative, Hemingway-influenced",
      vocabularyLevel: "basic",
      figurativeLanguage: "rare — meaning comes from what is left unsaid",
      paragraphDensity: "sparse with generous white space",
      guidance: "Cut ruthlessly. If a word can be removed without losing meaning, remove it. Trust the reader to fill gaps."
    }
  }

  const selected = styleDefinitions[style] || styleDefinitions["cinematic"]

  context.style.prose = selected

  return context
}
