/**
 * Economic System Pipeline
 *
 * Defines the economic structures of the story world.
 * Supported system types:
 *   "barter"     — trade-based, no standard currency
 *   "feudal"     — land-based wealth, tithe systems
 *   "mercantile" — trade guilds, currency, early capitalism
 *   "industrial" — factory-based production, wage labor
 *   "corporate"  — mega-corporations, financial markets
 *   "post-scarcity" — abundance, no material want
 * Each type defines currency, trade structure, wealth distribution, and key resources.
 */

export function economicSystemPipeline(params, context) {
  const economicType = params.economicSystem || "mercantile"

  if (!context.world) {
    context.world = {}
  }
  if (!context.systems) {
    context.systems = {}
  }

  const economicDefinitions = {
    "barter": {
      type: "barter",
      description: "Direct exchange of goods and services with no standard currency",
      currency: "none — goods are traded directly",
      tradeStructure: "local, face-to-face exchanges",
      wealthDistribution: "relatively egalitarian, based on productivity",
      keyResources: ["food", "raw materials", "crafted tools", "livestock"],
      tension: "Disputes over fair trade value and resource hoarding"
    },
    "feudal": {
      type: "feudal",
      description: "Land-based wealth with lords, vassals, and tithe systems",
      currency: "coinage minted by ruling houses",
      tradeStructure: "controlled by landowners, traded through seasonal fairs",
      wealthDistribution: "highly concentrated among nobility",
      keyResources: ["arable land", "timber", "iron", "grain"],
      tension: "Peasant uprisings, taxation disputes, succession wars"
    },
    "mercantile": {
      type: "mercantile",
      description: "Trade guilds and merchant classes drive the economy",
      currency: "standardized coins or trade notes",
      tradeStructure: "guild-regulated, long-distance trade routes",
      wealthDistribution: "growing middle class, merchant elite",
      keyResources: ["spices", "textiles", "metals", "gemstones"],
      tension: "Guild monopolies, trade wars, piracy"
    },
    "industrial": {
      type: "industrial",
      description: "Factory-based mass production with wage labor systems",
      currency: "national currency backed by central banks",
      tradeStructure: "global supply chains, import/export",
      wealthDistribution: "sharp divide between owners and laborers",
      keyResources: ["coal", "steel", "oil", "manufactured goods"],
      tension: "Labor strikes, pollution, wealth inequality"
    },
    "corporate": {
      type: "corporate",
      description: "Mega-corporations hold economic and political power",
      currency: "digital currency or corporate credits",
      tradeStructure: "corporate-controlled markets, franchises, data economy",
      wealthDistribution: "extreme concentration at the top",
      keyResources: ["data", "intellectual property", "energy", "biotech"],
      tension: "Corporate espionage, consumer exploitation, deregulation"
    },
    "post-scarcity": {
      type: "post-scarcity",
      description: "Material needs are fully met through advanced technology or magic",
      currency: "reputation, influence, or none",
      tradeStructure: "open exchange, gifting economies",
      wealthDistribution: "effectively equal — status replaces wealth",
      keyResources: ["knowledge", "creative works", "unique experiences", "rare anomalies"],
      tension: "Existential boredom, conflicts over meaning and legacy"
    }
  }

  const economy = economicDefinitions[economicType] || economicDefinitions["mercantile"]

  context.systems.economy = economy

  return context
}
