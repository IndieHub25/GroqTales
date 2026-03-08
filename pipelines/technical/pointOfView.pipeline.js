/**
 * Point of View Pipeline
 *
 * Sets the narrative point of view for the story.
 * Supported POVs:
 *   "first-person"  — narrator is a character in the story ("I saw...")
 *   "second-person" — reader is addressed directly ("You walk into...")
 *   "third-person"  — external narrator, freely accessing all characters
 *   "third-limited" — external narrator locked to one character's perception
 * Each POV defines pronouns, access rules, and formatting conventions.
 *
 * Note: This complements the narrativeVoice pipeline in the style category.
 * narrativeVoice focuses on voice quality; this focuses on technical POV rules.
 */

export function pointOfViewPipeline(params, context) {
  const pov = params.pointOfView || "third-limited"

  if (!context.technical) {
    context.technical = {}
  }

  const povDefinitions = {
    "first-person": {
      pov: "first-person",
      pronouns: { subject: "I", object: "me", possessive: "my" },
      description: "The narrator is a character within the story",
      accessRules: [
        "can only describe what the narrator directly observes",
        "inner thoughts of other characters must be inferred",
        "narrator's bias colors all descriptions"
      ],
      formatting: "Use 'I' consistently. Internal thought can be untagged.",
      guidance: "Everything is filtered through the narrator's personality, vocabulary, and emotional state."
    },
    "second-person": {
      pov: "second-person",
      pronouns: { subject: "you", object: "you", possessive: "your" },
      description: "The reader is addressed directly as the protagonist",
      accessRules: [
        "describe what 'you' see, feel, and do",
        "can suggest emotions but maintain reader agency",
        "avoid dictating the reader's internal response too rigidly"
      ],
      formatting: "Use 'you' throughout. Present tense pairs well with second-person.",
      guidance: "Create immediacy and immersion. The reader becomes the character. Use sparingly for maximum effect."
    },
    "third-person": {
      pov: "third-person",
      pronouns: { subject: "he/she/they", object: "him/her/them", possessive: "his/her/their" },
      description: "An external narrator with free access to all characters",
      accessRules: [
        "can reveal any character's thoughts at any time",
        "can describe scenes where no main character is present",
        "narrator can editorialize and offer commentary"
      ],
      formatting: "Use character names and third-person pronouns. Tag POV shifts clearly.",
      guidance: "Use the freedom strategically. Revealing too many inner thoughts at once can dilute tension."
    },
    "third-limited": {
      pov: "third-limited",
      pronouns: { subject: "he/she/they", object: "him/her/them", possessive: "his/her/their" },
      description: "External narrator locked to one character's perception per scene",
      accessRules: [
        "only the focal character's thoughts are accessible",
        "other characters' emotions must be inferred from behavior",
        "scene breaks are required to switch focal characters"
      ],
      formatting: "Use third-person pronouns but filter all observations through the focal character.",
      guidance: "Stay disciplined within the focal character's awareness. This creates natural suspense about other characters' motives."
    }
  }

  const selected = povDefinitions[pov] || povDefinitions["third-limited"]

  context.technical.pointOfView = selected

  return context
}
