/**
 * Age Rating Pipeline
 *
 * Defines the target audience age group and sets content boundaries accordingly.
 * Supported ratings:
 *   "child"       — ages 6–10, safe and wholesome content
 *   "teen"        — ages 11–14, mild peril and emotional complexity
 *   "young-adult" — ages 15–17, real-world themes with some intensity
 *   "adult"       — ages 18+, no content restrictions
 * Each rating defines permitted content, language rules, and thematic boundaries.
 */

export function ageRatingPipeline(params, context) {
  const rating = params.ageRating || "teen"

  if (!context.audience) {
    context.audience = {}
  }

  const ratingDefinitions = {
    "child": {
      rating: "child",
      ageRange: "6–10",
      description: "Safe, wholesome content suitable for young children",
      permittedContent: {
        violence: "none — conflict resolved through cleverness or cooperation",
        language: "clean — no profanity, no insults beyond mild teasing",
        romance: "none",
        death: "avoided or handled gently (a pet, a grandparent — off-page)",
        substances: "none"
      },
      thematicBoundaries: ["friendship", "bravery", "curiosity", "kindness", "fairness"],
      guidance: "Keep the world safe and inviting. Consequences are temporary. Good always wins. Characters are kind at heart."
    },
    "teen": {
      rating: "teen",
      ageRange: "11–14",
      description: "Mild peril and emotional complexity suitable for younger teens",
      permittedContent: {
        violence: "mild — action scenes without graphic injury",
        language: "mild — occasional mild exclamations, no strong profanity",
        romance: "crushes and hand-holding; nothing beyond a first kiss",
        death: "can occur off-page or with emotional weight, not graphically",
        substances: "mentioned as context, never glorified"
      },
      thematicBoundaries: ["identity", "belonging", "standing up for what's right", "growing up", "first loss"],
      guidance: "Characters face real challenges but always find a way through. Emotional stakes can be high. Physical stakes stay moderate."
    },
    "young-adult": {
      rating: "young-adult",
      ageRange: "15–17",
      description: "Real-world themes with intensity suitable for older teens",
      permittedContent: {
        violence: "moderate — consequences shown, not gratuitous",
        language: "occasional strong language in realistic context",
        romance: "emotional intimacy, implied physical intimacy",
        death: "can occur on-page with emotional gravity",
        substances: "can be part of the story if handled responsibly"
      },
      thematicBoundaries: ["justice", "moral complexity", "love and loss", "systemic challenges", "self-discovery"],
      guidance: "Treat the reader as capable of handling difficult truths. Show consequences for actions. Romance and conflict can be intense but should serve the story."
    },
    "adult": {
      rating: "adult",
      ageRange: "18+",
      description: "No content restrictions — full creative freedom",
      permittedContent: {
        violence: "unrestricted — graphic if narratively justified",
        language: "unrestricted",
        romance: "unrestricted",
        death: "unrestricted",
        substances: "unrestricted"
      },
      thematicBoundaries: ["no boundaries — all themes are available"],
      guidance: "Write without guardrails. Content should serve the story's needs. Maturity means handling difficult subjects with craft and purpose, not gratuitousness."
    }
  }

  const selected = ratingDefinitions[rating] || ratingDefinitions["teen"]

  context.audience.ageRating = selected

  return context
}
