/**
 * Cultural Sensitivity Pipeline
 *
 * Applies cultural sensitivity checks and safeguards to the story context.
 * Sensitivity levels:
 *   1 → standard   (basic awareness, avoid overt stereotypes)
 *   2 → careful    (review cultural portrayals, ensure respectful depiction)
 *   3 → thorough   (active inclusion guidelines, nuanced portrayals, avoid tropes)
 *   4 → rigorous   (comprehensive sensitivity framework, consultative approach)
 * Generates safeguard rules and flags potential areas of concern.
 */

export function culturalSensitivityPipeline(params, context) {
  const level = params.culturalSensitivity || 2

  if (!context.audience) {
    context.audience = {}
  }

  const sensitivityLevels = {
    1: {
      level: "standard",
      description: "Basic cultural awareness — avoid overt stereotypes and offensive content",
      safeguards: [
        "avoid racial or ethnic stereotypes",
        "do not mock religious practices",
        "avoid cultural appropriation in character naming",
        "ensure no group is portrayed as monolithically good or evil"
      ],
      flaggedAreas: [],
      guidance: "Apply common-sense sensitivity. If a portrayal could be read as mocking or reductive, revise it."
    },
    2: {
      level: "careful",
      description: "Review cultural portrayals for respect and authenticity",
      safeguards: [
        "research cultural practices before depicting them",
        "avoid 'exotic' framing of non-Western cultures",
        "ensure diverse characters have agency and complexity",
        "avoid magical or mystical stereotyping of specific cultures",
        "use respectful language when describing cultural differences"
      ],
      flaggedAreas: ["religious ceremonies", "indigenous practices", "cultural dress", "accent representation"],
      guidance: "Every cultural depiction should feel informed, not assumed. Characters from different backgrounds should be written with the same depth as the protagonist."
    },
    3: {
      level: "thorough",
      description: "Active inclusion guidelines with nuanced portrayals and trope avoidance",
      safeguards: [
        "avoid the 'white savior' narrative pattern",
        "do not use trauma as the sole defining trait of marginalized characters",
        "ensure representation extends beyond surface-level diversity",
        "avoid 'magical minority' tropes",
        "portray cultural conflict with empathy for all sides",
        "research naming conventions for characters from specific cultures",
        "avoid treating any culture as a monolith"
      ],
      flaggedAreas: [
        "historical oppression narratives",
        "cross-cultural romance dynamics",
        "language and dialect portrayal",
        "disability representation",
        "religious worldview depictions"
      ],
      guidance: "Diversity should be structural, not decorative. Characters from underrepresented groups deserve full arcs, flaws, and victories — not just presence."
    },
    4: {
      level: "rigorous",
      description: "Comprehensive sensitivity framework with consultative approach",
      safeguards: [
        "all safeguards from lower levels apply",
        "recommend sensitivity readers for specific cultural portrayals",
        "flag any scene involving systemic oppression for careful review",
        "ensure power dynamics between cultures are examined, not reproduced",
        "provide author notes explaining research and intent behind portrayals",
        "avoid centering the dominant culture's perspective on marginalized experiences",
        "examine intersectionality in character identities"
      ],
      flaggedAreas: [
        "all areas from lower levels",
        "colonialism narratives",
        "gender identity portrayals",
        "neurodivergent representation",
        "socioeconomic class dynamics",
        "immigration and displacement themes"
      ],
      guidance: "Treat cultural portrayal as a craft discipline equal to prose or plot. When in doubt, seek informed perspectives. Acknowledge limitations and approach with humility."
    }
  }

  const selected = sensitivityLevels[Math.min(Math.max(level, 1), 4)] || sensitivityLevels[2]

  // Cross-reference existing cultures in context for flagging
  const existingCultures = context.cultures || []
  const potentialFlags = []

  if (existingCultures.length > 0 && level >= 2) {
    existingCultures.forEach((culture) => {
      potentialFlags.push({
        cultureId: culture.id,
        cultureName: culture.name,
        reviewNote: "Ensure this culture is portrayed with depth, agency, and respect"
      })
    })
  }

  context.audience.culturalSensitivity = {
    ...selected,
    potentialFlags: potentialFlags
  }

  return context
}
