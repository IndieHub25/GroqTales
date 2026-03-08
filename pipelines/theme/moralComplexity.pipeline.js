/**
 * Moral Complexity Pipeline
 *
 * Defines the level of moral ambiguity in the story.
 * Supported levels:
 *   "clear-good-vs-evil" — unambiguous right and wrong, classic moral framework
 *   "mixed-morality"     — characters have understandable reasons on all sides
 *   "ethically-complex"  — no clear answers, moral dilemmas without easy resolution
 * Each level defines character moral alignment rules, conflict framing, and reader challenge.
 */

export function moralComplexityPipeline(params, context) {
  const complexity = params.moralComplexity || "mixed-morality"

  if (!context.theme) {
    context.theme = {}
  }

  const complexityDefinitions = {
    "clear-good-vs-evil": {
      level: "clear-good-vs-evil",
      description: "Unambiguous moral framework — heroes are good, villains are evil",
      characterAlignment: {
        protagonist: "virtuous — flaws exist but don't compromise moral standing",
        antagonist: "clearly wrong — their actions are indefensible",
        sideCharacters: "aligned with good or evil, minimal grey area"
      },
      conflictFraming: "right vs wrong — the moral answer is clear even if difficult",
      moralLessons: ["courage triumphs over cowardice", "kindness defeats cruelty", "truth overcomes deception"],
      readerChallenge: "low — reader knows who to root for from the start",
      guidance: "Make the moral stakes clear. The hero's goodness should be tested but ultimately affirmed. Evil should be recognizable and resistible."
    },
    "mixed-morality": {
      level: "mixed-morality",
      description: "Characters have understandable reasons — right and wrong are muddied",
      characterAlignment: {
        protagonist: "well-intentioned but capable of questionable choices",
        antagonist: "has legitimate grievances or understandable motivations",
        sideCharacters: "each operates from their own moral compass"
      },
      conflictFraming: "competing goods or necessary evils — multiple sides have valid claims",
      moralLessons: ["intention doesn't guarantee outcome", "empathy reveals the enemy's humanity", "compromise is sometimes the bravest choice"],
      readerChallenge: "moderate — reader must weigh competing sympathies",
      guidance: "Give the antagonist a speech the reader might secretly agree with. Let the protagonist make at least one choice that is hard to justify. Moral truth should be earned through experience, not given."
    },
    "ethically-complex": {
      level: "ethically-complex",
      description: "No clear answers — moral dilemmas resist easy resolution",
      characterAlignment: {
        protagonist: "may do terrible things for defensible reasons",
        antagonist: "may be right about the problem, wrong about the solution — or vice versa",
        sideCharacters: "every character embodies a different ethical position"
      },
      conflictFraming: "values in collision — each side sacrifices something essential to gain something essential",
      moralLessons: ["morality is contextual", "good intentions can cause harm", "systems shape individuals more than individuals shape systems", "there may be no right answer"],
      readerChallenge: "high — reader is forced to confront their own assumptions",
      guidance: "Refuse to resolve the moral question cleanly. Let the reader sit with discomfort. The most ethically complex stories present a dilemma where every choice costs something irreplaceable."
    }
  }

  const selected = complexityDefinitions[complexity] || complexityDefinitions["mixed-morality"]

  context.theme.moralComplexity = selected

  return context
}
