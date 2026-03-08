/**
 * Gender Representation Pipeline
 *
 * Ensures balanced gender representation in the story's character cast.
 * Analyzes existing characters and applies adjustments or flags
 * based on the genderRepresentation parameter.
 * Supported levels:
 *   "default"    — no explicit enforcement, natural distribution
 *   "balanced"   — aim for roughly equal representation
 *   "diverse"    — include non-binary, genderqueer, or gender-fluid characters
 *   "specific"   — user-specified gender distribution
 */

export function genderRepresentationPipeline(params, context) {
  const representation = params.genderRepresentation || "balanced"

  if (!context.audience) {
    context.audience = {}
  }

  const characters = context.characters || []

  // Gender pools for assignment
  const genderOptions = {
    "default":  ["male", "female"],
    "balanced": ["male", "female"],
    "diverse":  ["male", "female", "non-binary", "genderqueer", "gender-fluid"],
    "specific": ["male", "female", "non-binary"]
  }

  const availableGenders = genderOptions[representation] || genderOptions["balanced"]

  // Assign genders to characters that don't already have one
  let maleCount = 0
  let femaleCount = 0
  let otherCount = 0

  const updatedCharacters = characters.map((character, index) => {
    if (character.gender) {
      // Count existing assignments
      if (character.gender === "male") maleCount++
      else if (character.gender === "female") femaleCount++
      else otherCount++
      return character
    }

    let assignedGender

    if (representation === "balanced") {
      // Alternate to maintain balance
      assignedGender = maleCount <= femaleCount ? "male" : "female"
    } else if (representation === "diverse") {
      // Cycle through diverse options
      assignedGender = availableGenders[index % availableGenders.length]
    } else {
      // Default or specific: round-robin
      assignedGender = availableGenders[index % availableGenders.length]
    }

    if (assignedGender === "male") maleCount++
    else if (assignedGender === "female") femaleCount++
    else otherCount++

    return {
      ...character,
      gender: assignedGender
    }
  })

  context.characters = updatedCharacters

  const total = maleCount + femaleCount + otherCount

  context.audience.genderRepresentation = {
    level: representation,
    distribution: {
      male: maleCount,
      female: femaleCount,
      other: otherCount,
      total: total
    },
    balanceRatio: total > 0 ? Math.round((Math.min(maleCount, femaleCount) / Math.max(maleCount, femaleCount, 1)) * 100) / 100 : 1,
    guidance: representation === "diverse"
      ? "Include characters across the gender spectrum. Ensure non-binary and genderqueer characters have full arcs and are not tokenized."
      : representation === "balanced"
        ? "Maintain roughly equal male and female representation. Avoid gendered stereotypes in role assignment."
        : "Gender distribution follows the natural demands of the story."
  }

  return context
}
