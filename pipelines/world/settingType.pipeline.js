/**
 * Setting Type Pipeline
 *
 * Defines the primary setting type for the story world.
 * Supported types:
 *   "urban"             — cities, infrastructure, dense populations
 *   "rural"             — countryside, villages, open landscapes
 *   "fantasy"           — magical realms, mythical geography
 *   "historical"        — period-accurate real-world settings
 *   "space"             — interstellar, stations, alien worlds
 *   "post-apocalyptic"  — ruined civilizations, survival landscapes
 * Each type provides terrain features, typical structures, and mood cues.
 */

export function settingTypePipeline(params, context) {
  const settingType = params.settingType || "fantasy"

  if (!context.world) {
    context.world = {}
  }

  const settingDefinitions = {
    "urban": {
      type: "urban",
      description: "Dense cities with layered infrastructure and diverse populations",
      terrain: ["streets", "skyscrapers", "alleys", "parks", "underground"],
      structures: ["apartment blocks", "markets", "government buildings", "transit hubs"],
      moodCues: ["noise", "neon lights", "crowds", "exhaust fumes"],
      scale: "metropolitan"
    },
    "rural": {
      type: "rural",
      description: "Open countryside with small communities and natural landscapes",
      terrain: ["rolling hills", "farmland", "forests", "rivers", "meadows"],
      structures: ["cottages", "barns", "village squares", "chapels"],
      moodCues: ["birdsong", "wind", "distant thunder", "wood smoke"],
      scale: "regional"
    },
    "fantasy": {
      type: "fantasy",
      description: "Magical realms with mythical geography and supernatural elements",
      terrain: ["enchanted forests", "floating islands", "crystal caves", "volcanic ranges"],
      structures: ["castles", "wizard towers", "ancient temples", "underground cities"],
      moodCues: ["arcane glow", "ethereal mist", "distant roars", "shimmering portals"],
      scale: "continental"
    },
    "historical": {
      type: "historical",
      description: "Period-accurate settings drawn from real-world history",
      terrain: ["cobblestone streets", "harbors", "battlefields", "trade routes"],
      structures: ["manors", "cathedrals", "fortresses", "marketplaces"],
      moodCues: ["torch light", "horse hooves", "church bells", "parchment smell"],
      scale: "regional"
    },
    "space": {
      type: "space",
      description: "Interstellar environments including ships, stations, and alien worlds",
      terrain: ["asteroid fields", "nebulae", "barren moons", "alien jungles"],
      structures: ["space stations", "colony domes", "starships", "orbital platforms"],
      moodCues: ["engine hum", "void silence", "airlock hiss", "holographic displays"],
      scale: "galactic"
    },
    "post-apocalyptic": {
      type: "post-apocalyptic",
      description: "Ruined civilizations where survivors navigate a broken world",
      terrain: ["crumbling highways", "overgrown ruins", "toxic wastelands", "flooded cities"],
      structures: ["makeshift shelters", "bunkers", "scavenger camps", "abandoned malls"],
      moodCues: ["eerie silence", "rust", "distant howls", "fallout dust"],
      scale: "regional"
    }
  }

  const setting = settingDefinitions[settingType] || settingDefinitions["fantasy"]

  context.world.setting = setting

  return context
}
