/**
 * Cultural Diversity Pipeline
 *
 * Generates multiple cultures, traditions, and languages for the story world.
 * Diversity level 1–5:
 *   1 → monoculture   (single dominant culture)
 *   2 → dual          (two cultures, one dominant)
 *   3 → diverse       (three to four cultures with distinct traditions)
 *   4 → rich mosaic   (five or more cultures, significant interplay)
 *   5 → labyrinthine  (many overlapping cultures, subcultures, and hybrids)
 * Each culture includes traditions, values, language hints, and customs.
 */

export function culturalDiversityPipeline(params, context) {
  const diversity = params.culturalDiversity || 2

  if (!context.world) {
    context.world = {}
  }
  if (!context.cultures) {
    context.cultures = []
  }

  const culturePool = [
    {
      name: "The Heartlanders",
      values: ["community", "tradition", "honor"],
      traditions: ["harvest festivals", "elder storytelling", "oath-binding ceremonies"],
      language: "Common Tongue — direct, proverb-rich",
      customs: ["communal meals", "handshake contracts", "seasonal pilgrimages"]
    },
    {
      name: "The Seafarers",
      values: ["freedom", "exploration", "resilience"],
      traditions: ["naming storms", "tide songs", "navigation rites"],
      language: "Salt Speak — clipped, nautical metaphors",
      customs: ["ship christenings", "open-water burials", "starlight navigation"]
    },
    {
      name: "The Mountain Clans",
      values: ["strength", "self-reliance", "loyalty to kin"],
      traditions: ["summit trials", "fire dances", "stone carving"],
      language: "High Tongue — formal, echoing cadence",
      customs: ["trial by endurance", "clan tattoos", "echo prayers"]
    },
    {
      name: "The Sand Walkers",
      values: ["wisdom", "patience", "resourcefulness"],
      traditions: ["star reading", "sand mandalas", "water-sharing rituals"],
      language: "Dust Dialect — poetic, layered with double meanings",
      customs: ["dawn meditations", "oasis sanctuaries", "silent trade"]
    },
    {
      name: "The Iron Citizens",
      values: ["progress", "innovation", "merit"],
      traditions: ["invention fairs", "apprenticeship bonds", "the Great Tinkering"],
      language: "Gear Script — precise, technical jargon",
      customs: ["patent ceremonies", "clockwork festivals", "ranked debates"]
    },
    {
      name: "The Forest Kin",
      values: ["harmony", "balance", "reverence for nature"],
      traditions: ["tree planting rites", "moon circles", "spirit walks"],
      language: "Green Whisper — soft, nature-based metaphors",
      customs: ["living architecture", "animal companionship", "seasonal silence"]
    },
    {
      name: "The Twilight Scholars",
      values: ["knowledge", "secrecy", "preservation"],
      traditions: ["archive vigils", "ink ceremonies", "thesis defenses"],
      language: "Old Script — archaic, layered with footnotes",
      customs: ["memory palaces", "candlelit debates", "forbidden texts"]
    }
  ]

  // Scale culture count with diversity level
  const cultureCount = Math.min(
    diversity <= 1 ? 1 : diversity <= 2 ? 2 : diversity <= 3 ? 4 : diversity <= 4 ? 5 : 7,
    culturePool.length
  )

  const selectedCultures = culturePool.slice(0, cultureCount).map((culture, index) => ({
    id: "culture_" + (index + 1),
    ...culture,
    status: index === 0 ? "dominant" : index === 1 ? "influential" : "regional"
  }))

  // Generate cultural interactions for diversity >= 3
  const interactions = []

  if (diversity >= 3 && selectedCultures.length >= 3) {
    for (let i = 0; i < selectedCultures.length; i++) {
      for (let j = i + 1; j < selectedCultures.length; j++) {
        const relType = (i + j) % 3 === 0 ? "trade partners" : (i + j) % 3 === 1 ? "cultural tension" : "shared traditions"
        interactions.push({
          cultureA: selectedCultures[i].id,
          cultureB: selectedCultures[j].id,
          type: relType
        })
      }
    }
  }

  context.cultures = selectedCultures

  context.world.culturalDiversity = {
    level: diversity <= 1 ? "monoculture" : diversity <= 2 ? "dual" : diversity <= 3 ? "diverse" : diversity <= 4 ? "rich mosaic" : "labyrinthine",
    cultures: selectedCultures,
    interactions: interactions
  }

  return context
}
