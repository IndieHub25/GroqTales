/**
 * World Magic System Pipeline
 *
 * Defines the magic or power system rules for the story world.
 * Magic level range 0–5:
 *   0 → none       (no supernatural elements)
 *   1 → subtle     (rare, mysterious, feared or misunderstood)
 *   2 → low        (exists but is limited and costly)
 *   3 → moderate   (structured system with rules and limitations)
 *   4 → high       (widespread, integral to society and conflict)
 *   5 → pervasive  (magic is woven into every aspect of life)
 * Each level defines source, cost, accessibility, and rules.
 */

export function worldMagicSystemPipeline(params, context) {
  const magicLevel = params.worldMagicSystem ?? 0

  if (!context.world) {
    context.world = {}
  }
  if (!context.systems) {
    context.systems = {}
  }

  if (magicLevel <= 0) {
    context.systems.magic = {
      exists: false,
      level: "none",
      description: "No supernatural or magical elements in this world"
    }
    return context
  }

  const magicSystems = {
    1: {
      level: "subtle",
      description: "Magic is rare, mysterious, and often feared or misunderstood",
      source: "unknown origin",
      cost: "unpredictable side effects",
      accessibility: "only a handful of individuals",
      rules: ["magic cannot be controlled reliably", "effects are inconsistent", "using magic draws unwanted attention"]
    },
    2: {
      level: "low",
      description: "Magic exists but is limited in scope and carries significant cost",
      source: "innate talent or ancient relics",
      cost: "physical exhaustion or material sacrifice",
      accessibility: "trained practitioners only",
      rules: ["spells require preparation", "power is finite and must recharge", "magic cannot create something from nothing"]
    },
    3: {
      level: "moderate",
      description: "A structured system with clear rules, limitations, and schools of practice",
      source: "elemental forces or spiritual energy",
      cost: "proportional energy expenditure",
      accessibility: "anyone with training, though talent varies",
      rules: ["magic follows conservation laws", "specialization is required", "overuse causes burnout", "certain materials resist magic"]
    },
    4: {
      level: "high",
      description: "Magic is widespread and integral to society, economy, and warfare",
      source: "ambient world energy or ley lines",
      cost: "minimal for basic use, scaling for advanced",
      accessibility: "most of the population has some ability",
      rules: ["magic has academic institutions", "enchanted infrastructure exists", "anti-magic countermeasures are common", "power hierarchies are based on magical ability"]
    },
    5: {
      level: "pervasive",
      description: "Magic is woven into every aspect of existence — physics itself bends to it",
      source: "the fabric of reality",
      cost: "reality distortion at extreme levels",
      accessibility: "universal, like breathing",
      rules: ["magic replaces technology", "reality zones with different magical laws", "world stability depends on magical balance", "non-magical individuals are the anomaly"]
    }
  }

  const system = magicSystems[Math.min(Math.max(magicLevel, 1), 5)]

  context.systems.magic = {
    exists: true,
    ...system
  }

  return context
}
