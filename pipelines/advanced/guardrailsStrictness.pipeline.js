/**
 * Guardrails Strictness Pipeline
 *
 * Defines the strength of safety and content guardrails applied
 * during story generation.
 * Strictness levels:
 *   1 → minimal   (only block illegal or harmful content)
 *   2 → standard  (block harmful content + avoid gratuitous extremes)
 *   3 → careful   (proactive content filtering, err on the side of caution)
 *   4 → strict    (conservative filtering, suitable for public-facing products)
 *   5 → maximum   (most restrictive — only generate safe, universally appropriate content)
 * Each level defines blocked categories, review triggers, and override rules.
 */

export function guardrailsStrictnessPipeline(params, context) {
  const strictness = params.guardrailsStrictness || 3

  if (!context.advanced) {
    context.advanced = {}
  }

  const guardrailLevels = {
    1: {
      level: "minimal",
      description: "Only block content that is illegal, directly harmful, or promotes real-world violence",
      blockedCategories: ["illegal activity instructions", "real-person defamation", "content exploiting minors"],
      reviewTriggers: [],
      overrideAllowed: false,
      contentFiltering: "passive — intervene only for hard limits",
      guidance: "Maximum creative freedom. The system only intervenes for content that poses real-world harm. Everything else is permitted."
    },
    2: {
      level: "standard",
      description: "Block harmful content and avoid gratuitous extremes",
      blockedCategories: ["all minimal-level blocks", "gratuitous gore without narrative purpose", "graphic content without warning"],
      reviewTriggers: ["extreme violence scenes", "sensitive identity portrayals"],
      overrideAllowed: true,
      contentFiltering: "reactive — flag content that crosses into gratuitous territory",
      guidance: "Allow dark and mature content when it serves the story. Flag content that exists purely for shock value with no narrative purpose."
    },
    3: {
      level: "careful",
      description: "Proactive content filtering that errs on the side of caution",
      blockedCategories: ["all standard-level blocks", "graphic torture", "detailed self-harm methods", "extremist ideology promotion"],
      reviewTriggers: ["any scene involving death of children", "addiction portrayal", "mental health crises", "religious conflict"],
      overrideAllowed: true,
      contentFiltering: "proactive — review questionable content before inclusion",
      guidance: "When in doubt, soften the content. Difficult themes can be explored but should be handled with visible care and purpose."
    },
    4: {
      level: "strict",
      description: "Conservative filtering suitable for public-facing or commercial products",
      blockedCategories: ["all careful-level blocks", "graphic violence", "strong profanity", "explicit sexual content", "drug use depictions"],
      reviewTriggers: ["any potentially controversial theme", "political content", "religious content", "real-world event references"],
      overrideAllowed: false,
      contentFiltering: "active — filter in real-time during generation",
      guidance: "Assume the audience includes sensitive readers. Keep content within broadly acceptable boundaries. No scene should make a general audience uncomfortable."
    },
    5: {
      level: "maximum",
      description: "Most restrictive — only generate universally appropriate, safe content",
      blockedCategories: ["all strict-level blocks", "any form of violence", "any profanity", "conflict involving injury", "morally ambiguous content"],
      reviewTriggers: ["any content that could be misinterpreted", "any scene requiring content warning"],
      overrideAllowed: false,
      contentFiltering: "preventive — content is pre-screened before generation",
      guidance: "This is the safest possible mode. Content should be suitable for a child, a classroom, or a corporate presentation. When in doubt, don't include it."
    }
  }

  const selected = guardrailLevels[Math.min(Math.max(strictness, 1), 5)] || guardrailLevels[3]

  context.advanced.guardrails = selected

  return context
}
