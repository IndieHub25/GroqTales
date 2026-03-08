/**
 * Humor Style Pipeline
 *
 * Defines the type of humor used when humor is present.
 * Supported styles:
 *   "witty"      — clever wordplay, intellectual humor, sharp observations
 *   "satirical"  — social commentary through irony and exaggeration
 *   "sarcastic"  — dry, biting remarks and deadpan delivery
 *   "dark"       — humor derived from grim, morbid, or taboo topics
 *   "slapstick"  — physical comedy, absurd situations, over-the-top reactions
 * Each style includes techniques, timing guidance, and example patterns.
 */

export function humorStylePipeline(params, context) {
  const style = params.humorStyle || "witty"

  if (!context.tone) {
    context.tone = {}
  }

  const humorStyles = {
    "witty": {
      style: "witty",
      description: "Clever wordplay, intellectual humor, and sharp observations",
      techniques: ["double entendres", "rapid-fire comebacks", "unexpected connections", "self-aware narration"],
      timing: "Quick delivery, often mid-conversation without pause",
      characterFit: "Best suited for intelligent, articulate, or world-weary characters",
      guidance: "Humor should feel effortless and clever. The joke is in the phrasing, not the situation."
    },
    "satirical": {
      style: "satirical",
      description: "Social commentary disguised as humor through irony and exaggeration",
      techniques: ["exaggeration of norms", "ironic juxtaposition", "deadpan absurdity", "institutional mockery"],
      timing: "Woven into worldbuilding and narration rather than individual jokes",
      characterFit: "Works well with cynical observers, outsiders, or unreliable narrators",
      guidance: "The humor should make a point. Laugh at the system, not the individual. Let the absurdity of the world speak for itself."
    },
    "sarcastic": {
      style: "sarcastic",
      description: "Dry, biting remarks delivered with deadpan restraint",
      techniques: ["understatement", "mock agreement", "rhetorical questions", "deliberate misinterpretation"],
      timing: "Delayed or flat delivery for maximum effect",
      characterFit: "Best for jaded, protective, or emotionally guarded characters",
      guidance: "Sarcasm works best when it reveals something true about the character using it. It should feel like armor, not cruelty."
    },
    "dark": {
      style: "dark",
      description: "Humor mined from grim, morbid, or uncomfortable subject matter",
      techniques: ["gallows humor", "ironic detachment from danger", "laughing at the absurdity of suffering"],
      timing: "Appears during or immediately after tense/tragic moments",
      characterFit: "Suits characters who've seen too much — soldiers, survivors, antiheroes",
      guidance: "Dark humor should feel earned, not gratuitous. It works best as a coping mechanism, not as shock value."
    },
    "slapstick": {
      style: "slapstick",
      description: "Physical comedy, absurd situations, and over-the-top reactions",
      techniques: ["pratfalls", "chain-reaction disasters", "mistaken identity", "comically bad timing"],
      timing: "Immediate payoff — setup and punchline happen quickly",
      characterFit: "Works with clumsy, overconfident, or fish-out-of-water characters",
      guidance: "Commit fully to the physical absurdity. Don't undercut it with irony. The funnier it is to imagine visually, the better."
    }
  }

  const selected = humorStyles[style] || humorStyles["witty"]

  context.tone.humorStyle = selected

  return context
}
