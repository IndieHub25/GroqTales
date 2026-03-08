/**
 * Character Voice Distinctness Pipeline
 *
 * Assigns unique dialogue and speech styles to each character.
 * Higher characterVoiceDistinctness values unlock a wider pool of
 * speech styles, making each character sound more unique.
 * Each style includes a short label and a full pattern description.
 */

export function characterVoiceDistinctnessPipeline(params, context) {
  const distinctness = params.characterVoiceDistinctness || 2

  const speechStyles = [
    { label: "formal",     pattern: "speaks in complete, structured sentences with elevated vocabulary" },
    { label: "casual",     pattern: "uses everyday language, contractions, and informal phrasing" },
    { label: "terse",      pattern: "speaks in short, clipped sentences; avoids unnecessary words" },
    { label: "poetic",     pattern: "uses metaphors, rhythm, and lyrical phrasing" },
    { label: "sarcastic",  pattern: "laces speech with dry humor, irony, and understatement" },
    { label: "verbose",    pattern: "tends to over-explain and use long-winded descriptions" },
    { label: "cryptic",    pattern: "speaks in riddles, hints, and indirect references" },
    { label: "folksy",     pattern: "uses colloquialisms, proverbs, and homespun wisdom" },
    { label: "commanding", pattern: "speaks with authority; uses directives and declarations" },
    { label: "nervous",    pattern: "stutters, second-guesses, and trails off mid-sentence" }
  ]

  // Scale available pool based on distinctness (1–5 maps to 2–10 styles)
  const poolSize = Math.min(Math.max(distinctness * 2, 2), speechStyles.length)
  const availableStyles = speechStyles.slice(0, poolSize)

  context.characters = context.characters.map((character, index) => {
    const style = availableStyles[index % availableStyles.length]

    return {
      ...character,
      speechStyle: style.label,
      speechPattern: style.pattern
    }
  })

  return context
}
