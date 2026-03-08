/**
 * Chapter Role Pipeline
 *
 * Defines the narrative purpose of each chapter in the story.
 * Generates a chapter plan where each chapter is tagged with a role
 * based on the story structure phases (from context.structure).
 * If no structure is set, defaults to a generic 10-chapter plan.
 */

export function chapterRolePipeline(params, context) {
  const chapterCount = params.chapterRole || 10

  if (!context.plot) {
    context.plot = {}
  }

  // Default chapter roles that cycle if no structure is available
  const defaultRoles = [
    "introduction",
    "world-building",
    "inciting-incident",
    "rising-action",
    "character-development",
    "midpoint-twist",
    "escalation",
    "dark-moment",
    "climax",
    "resolution"
  ]

  const chapters = []
  const phases = (context.structure && context.structure.phases) ? context.structure.phases : []

  for (let i = 0; i < chapterCount; i++) {
    let role
    let phase = null

    if (phases.length > 0) {
      // Distribute chapters across structure phases based on weight
      let accumulated = 0
      const chapterPosition = (i + 0.5) / chapterCount

      for (let p = 0; p < phases.length; p++) {
        accumulated += phases[p].weight
        if (chapterPosition <= accumulated) {
          phase = phases[p].name
          role = phases[p].purpose
          break
        }
      }

      // Fallback if no phase matched
      if (!phase) {
        phase = phases[phases.length - 1].name
        role = phases[phases.length - 1].purpose
      }
    } else {
      role = defaultRoles[i % defaultRoles.length]
    }

    chapters.push({
      chapter: i + 1,
      role: role,
      phase: phase,
      status: "planned"
    })
  }

  context.plot.chapters = chapters

  return context
}
