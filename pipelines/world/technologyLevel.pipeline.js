/**
 * Technology Level Pipeline
 *
 * Sets the technology level of the story world.
 * Supported levels:
 *   "ancient"    — stone/bronze age tools, oral traditions
 *   "medieval"   — iron-working, feudal systems, early engineering
 *   "modern"     — industrial to present-day technology
 *   "futuristic" — beyond current capabilities, sci-fi tech
 * Each level defines available tools, communication, transport, and weapons.
 */

export function technologyLevelPipeline(params, context) {
  const techLevel = params.technologyLevel || "medieval"

  if (!context.world) {
    context.world = {}
  }
  if (!context.systems) {
    context.systems = {}
  }

  const techDefinitions = {
    "ancient": {
      level: "ancient",
      era: "prehistoric to bronze age",
      description: "Primitive tools, oral traditions, and subsistence living",
      tools: ["stone axes", "clay pots", "bone needles", "flint knives"],
      communication: ["oral tradition", "cave paintings", "smoke signals", "runners"],
      transport: ["walking", "canoes", "pack animals"],
      weapons: ["spears", "slings", "clubs", "bows"],
      energy: "fire and manual labor"
    },
    "medieval": {
      level: "medieval",
      era: "iron age to late middle ages",
      description: "Feudal societies with skilled craftsmanship and early engineering",
      tools: ["blacksmith forges", "looms", "water mills", "plows"],
      communication: ["written scrolls", "messengers", "heralds", "signal fires"],
      transport: ["horses", "carts", "sailing ships", "river barges"],
      weapons: ["swords", "crossbows", "catapults", "plate armor"],
      energy: "wind, water, and animal power"
    },
    "modern": {
      level: "modern",
      era: "industrial to information age",
      description: "Industrialized world with advanced infrastructure and global connectivity",
      tools: ["computers", "power tools", "medical equipment", "telecommunications"],
      communication: ["phones", "internet", "broadcast media", "satellites"],
      transport: ["cars", "trains", "aircraft", "ships"],
      weapons: ["firearms", "missiles", "surveillance tech", "drones"],
      energy: "electricity, fossil fuels, early renewables"
    },
    "futuristic": {
      level: "futuristic",
      era: "beyond present day",
      description: "Advanced technology beyond current human capabilities",
      tools: ["nanobots", "quantum computers", "matter fabricators", "neural interfaces"],
      communication: ["neural links", "quantum entanglement comms", "AI translators", "holographic displays"],
      transport: ["FTL drives", "teleportation pads", "anti-gravity vehicles", "orbital elevators"],
      weapons: ["energy weapons", "EMP devices", "autonomous drones", "planetary shields"],
      energy: "fusion, antimatter, zero-point energy"
    }
  }

  const tech = techDefinitions[techLevel] || techDefinitions["medieval"]

  context.systems.technology = tech

  return context
}
