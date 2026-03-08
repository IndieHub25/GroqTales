/**
 * Character Flaws Pipeline
 *
 * Assigns internal personality flaws to every character.
 * The characterFlaws parameter controls how many flaws each character
 * receives (1–4). Each flaw includes a name, severity, and description.
 * Flaws are drawn from a pool ordered from mild to severe.
 */

export function characterFlawsPipeline(params, context) {
  const flawIntensity = params.characterFlaws || 1

  const flawPool = [
    { name: "self-doubt",     severity: "mild",     description: "questions own abilities under pressure" },
    { name: "pride",          severity: "moderate",  description: "refuses help and overestimates own strength" },
    { name: "fear",           severity: "moderate",  description: "avoids confrontation even when necessary" },
    { name: "greed",          severity: "severe",    description: "prioritizes personal gain over the group" },
    { name: "envy",           severity: "moderate",  description: "resents others' success or recognition" },
    { name: "wrath",          severity: "severe",    description: "reacts with disproportionate anger" },
    { name: "obsession",      severity: "severe",    description: "fixates on a single goal to the exclusion of all else" },
    { name: "naivety",        severity: "mild",      description: "trusts too easily and overlooks deception" },
    { name: "stubbornness",   severity: "moderate",  description: "refuses to change course despite evidence" },
    { name: "impulsiveness",  severity: "moderate",  description: "acts without considering consequences" }
  ]

  // Number of flaws per character (capped at 4)
  const flawCount = Math.min(Math.max(flawIntensity, 1), 4)

  context.characters = context.characters.map((character, index) => {
    const assignedFlaws = []

    for (let i = 0; i < flawCount; i++) {
      const flawIndex = (index + i) % flawPool.length
      assignedFlaws.push({ ...flawPool[flawIndex] })
    }

    return {
      ...character,
      flaws: assignedFlaws
    }
  })

  return context
}
