/**
 * Reading Level Pipeline
 *
 * Defines vocabulary complexity and sentence structure targets.
 * Supported levels:
 *   "child"    — ages 6–10, simple words, short sentences, concrete ideas
 *   "teen"     — ages 11–17, moderate vocabulary, some abstract concepts
 *   "adult"    — ages 18+, full vocabulary range, complex themes
 *   "academic" — scholarly tone, dense prose, specialized terminology
 * Each level sets vocabulary range, sentence complexity, and content rules.
 */

export function readingLevelPipeline(params, context) {
  const level = params.readingLevel || "adult"

  if (!context.technical) {
    context.technical = {}
  }

  const levelDefinitions = {
    "child": {
      level: "child",
      ageRange: "6–10",
      description: "Simple, accessible language for young readers",
      vocabularyRange: "basic — common everyday words",
      maxSentenceLength: 12,
      avgSentenceLength: 8,
      complexity: "concrete ideas, no abstract philosophy",
      contentRules: ["no graphic violence", "no complex moral ambiguity", "clear right and wrong", "positive messaging"],
      guidance: "Use short sentences with familiar words. Explain new concepts immediately. Keep paragraphs brief."
    },
    "teen": {
      level: "teen",
      ageRange: "11–17",
      description: "Moderate complexity suitable for young adult readers",
      vocabularyRange: "intermediate — some advanced words with context clues",
      maxSentenceLength: 25,
      avgSentenceLength: 15,
      complexity: "some abstract concepts, emerging moral complexity",
      contentRules: ["mild violence permitted", "emotional complexity encouraged", "some ambiguity allowed", "age-appropriate themes"],
      guidance: "Balance accessibility with depth. Introduce complex ideas through character experience rather than exposition."
    },
    "adult": {
      level: "adult",
      ageRange: "18+",
      description: "Full vocabulary range with complex themes and nuance",
      vocabularyRange: "advanced — no restrictions on word choice",
      maxSentenceLength: 40,
      avgSentenceLength: 20,
      complexity: "full thematic depth, moral ambiguity, philosophical questions",
      contentRules: ["no content restrictions", "mature themes permitted", "nuance and subtlety expected"],
      guidance: "Write without vocabulary constraints. Trust the reader to handle complexity, subtext, and ambiguity."
    },
    "academic": {
      level: "academic",
      ageRange: "18+ (educated)",
      description: "Dense, scholarly prose with specialized terminology",
      vocabularyRange: "specialized — domain-specific jargon and elevated diction",
      maxSentenceLength: 60,
      avgSentenceLength: 28,
      complexity: "layered arguments, intertextual references, theoretical frameworks",
      contentRules: ["precision over accessibility", "footnote-level detail permitted", "allusion-heavy prose"],
      guidance: "Write for an educated audience. Use precise terminology. Layer meaning through reference and structure."
    }
  }

  const selected = levelDefinitions[level] || levelDefinitions["adult"]

  context.technical.readingLevel = selected

  return context
}
