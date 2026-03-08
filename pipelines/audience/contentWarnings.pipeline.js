/**
 * Content Warnings Pipeline
 *
 * Adds warnings for sensitive content present in the story.
 * Accepts an array of warning tags or a numeric intensity level.
 * Supported warning categories:
 *   violence, language, gore, disturbing-themes,
 *   death, abuse, self-harm, substance-use, sexual-content
 * Warnings are stored in context.warnings and summarized in context.audience.
 * When no explicit tags are provided, the pipeline infers from the age rating.
 */

export function contentWarningsPipeline(params, context) {
  const warningInput = params.contentWarnings

  if (!context.audience) {
    context.audience = {}
  }
  if (!context.warnings) {
    context.warnings = []
  }

  // Full warning catalog with descriptions
  const warningCatalog = {
    "violence":           { tag: "violence",           severity: "moderate", description: "Physical conflict, fighting, or war depicted in the story" },
    "language":           { tag: "language",            severity: "mild",     description: "Strong or coarse language used by characters" },
    "gore":               { tag: "gore",               severity: "severe",   description: "Graphic depictions of blood, injury, or bodily harm" },
    "disturbing-themes":  { tag: "disturbing-themes",  severity: "severe",   description: "Themes that may cause psychological discomfort" },
    "death":              { tag: "death",               severity: "moderate", description: "Character death depicted on-page" },
    "abuse":              { tag: "abuse",               severity: "severe",   description: "Physical, emotional, or psychological abuse portrayed" },
    "self-harm":          { tag: "self-harm",           severity: "severe",   description: "Depictions of self-harm or suicidal ideation" },
    "substance-use":      { tag: "substance-use",      severity: "moderate", description: "Use of drugs or alcohol depicted" },
    "sexual-content":     { tag: "sexual-content",     severity: "moderate", description: "Sexual situations or content present" }
  }

  let selectedWarnings = []

  if (Array.isArray(warningInput) && warningInput.length > 0) {
    // Use explicitly provided warning tags
    selectedWarnings = warningInput
      .filter((tag) => warningCatalog[tag])
      .map((tag) => ({ id: "warning_" + tag, ...warningCatalog[tag] }))
  } else if (typeof warningInput === "number" && warningInput > 0) {
    // Numeric intensity: auto-select warnings based on level
    const allTags = Object.keys(warningCatalog)
    const count = Math.min(warningInput, allTags.length)
    selectedWarnings = allTags.slice(0, count).map((tag) => ({
      id: "warning_" + tag,
      ...warningCatalog[tag]
    }))
  } else {
    // Infer from age rating if available
    const rating = context.audience.ageRating ? context.audience.ageRating.rating : "teen"

    const inferredWarnings = {
      "child":       [],
      "teen":        ["violence"],
      "young-adult": ["violence", "language", "death"],
      "adult":       ["violence", "language", "death", "disturbing-themes"]
    }

    const tags = inferredWarnings[rating] || inferredWarnings["teen"]
    selectedWarnings = tags.map((tag) => ({
      id: "warning_" + tag,
      ...warningCatalog[tag]
    }))
  }

  context.warnings = selectedWarnings

  context.audience.contentWarnings = {
    count: selectedWarnings.length,
    warnings: selectedWarnings,
    hasSevere: selectedWarnings.some((w) => w.severity === "severe"),
    guidance: selectedWarnings.length === 0
      ? "No content warnings needed — story is safe for all audiences"
      : "Display content warnings at the beginning of the story. Flag chapters containing severe content with inline warnings."
  }

  return context
}
