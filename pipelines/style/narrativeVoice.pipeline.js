/**
 * Narrative Voice Pipeline
 *
 * Defines the storytelling perspective used throughout the narrative.
 * Supported voices:
 *   "first-person"   — protagonist narrates directly ("I walked into the room")
 *   "third-person"   — external narrator using character names ("She walked in")
 *   "third-limited"  — third-person locked to one character's perception at a time
 *   "omniscient"     — all-knowing narrator with access to every character's thoughts
 * Each voice includes POV rules, access scope, and prose guidance.
 */

export function narrativeVoicePipeline(params, context) {
  const voice = params.narrativeVoice || "third-limited"

  if (!context.style) {
    context.style = {}
  }

  const voiceDefinitions = {
    "first-person": {
      voice: "first-person",
      pronoun: "I",
      description: "The protagonist narrates their own experience directly",
      accessScope: "narrator's thoughts and perceptions only",
      limitations: ["cannot know what others think", "limited to scenes the narrator is present in", "reliability may be questionable"],
      guidance: "Write with personal immediacy. Use sensory details filtered through the narrator's personality. Embrace subjective bias."
    },
    "third-person": {
      voice: "third-person",
      pronoun: "he/she/they",
      description: "An external narrator describes events using character names",
      accessScope: "external observations, actions, and dialogue",
      limitations: ["no direct access to inner thoughts", "emotional states inferred through behavior", "narrator remains detached"],
      guidance: "Maintain narrative distance. Show emotions through action and body language rather than internal monologue."
    },
    "third-limited": {
      voice: "third-limited",
      pronoun: "he/she/they",
      description: "Third-person narration locked to one character's perception per scene",
      accessScope: "one character's thoughts and perceptions per scene",
      limitations: ["must stay within the focal character's awareness", "scene breaks required to shift POV", "other characters' thoughts are hidden"],
      guidance: "Filter all descriptions through the focal character's worldview. Use scene breaks to shift perspective. Preserve mystery about other characters' inner states."
    },
    "omniscient": {
      voice: "omniscient",
      pronoun: "he/she/they",
      description: "An all-knowing narrator with access to every character's mind",
      accessScope: "all characters' thoughts, feelings, and hidden truths",
      limitations: ["risk of information overload", "must manage whose thoughts are shown and when", "can undermine suspense if overused"],
      guidance: "Use omniscience strategically. Reveal inner thoughts to create dramatic irony. Pull back to panoramic views for world-scale moments."
    }
  }

  const selected = voiceDefinitions[voice] || voiceDefinitions["third-limited"]

  context.style.narrativeVoice = selected

  return context
}
