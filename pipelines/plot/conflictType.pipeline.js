/**
 * Conflict Type Pipeline
 *
 * Defines the main story conflict and optional secondary conflicts.
 * Supported conflict types:
 *   "person-vs-person"      — direct opposition between characters
 *   "person-vs-self"        — internal struggle
 *   "person-vs-society"     — individual against systemic forces
 *   "person-vs-nature"      — survival against natural forces
 *   "person-vs-technology"  — humanity against its own creations
 *   "person-vs-fate"        — struggle against destiny or prophecy
 */

export function conflictTypePipeline(params, context) {
  const conflictType = params.conflictType || "person-vs-person"

  if (!context.plot) {
    context.plot = {}
  }

  const conflictDefinitions = {
    "person-vs-person": {
      type: "person-vs-person",
      description: "Direct opposition between two or more characters",
      stakes: "personal",
      drivers: ["rivalry", "betrayal", "competing goals"],
      tension: "Escalates through confrontation and reversals"
    },
    "person-vs-self": {
      type: "person-vs-self",
      description: "Internal struggle within the protagonist",
      stakes: "psychological",
      drivers: ["guilt", "identity crisis", "moral dilemma"],
      tension: "Builds through introspection, flashbacks, and turning points"
    },
    "person-vs-society": {
      type: "person-vs-society",
      description: "Individual fighting against systemic or institutional forces",
      stakes: "societal",
      drivers: ["injustice", "oppression", "cultural norms"],
      tension: "Grows as the protagonist challenges the status quo"
    },
    "person-vs-nature": {
      type: "person-vs-nature",
      description: "Survival against natural disasters, wilderness, or environments",
      stakes: "existential",
      drivers: ["storm", "isolation", "resource scarcity"],
      tension: "Heightens as the environment becomes more hostile"
    },
    "person-vs-technology": {
      type: "person-vs-technology",
      description: "Humanity confronting its own technological creations",
      stakes: "existential",
      drivers: ["AI uprising", "surveillance", "dependency"],
      tension: "Increases as technology gains autonomy or control"
    },
    "person-vs-fate": {
      type: "person-vs-fate",
      description: "Struggle against destiny, prophecy, or cosmic forces",
      stakes: "metaphysical",
      drivers: ["prophecy", "inevitability", "cosmic order"],
      tension: "Deepens as attempts to escape fate backfire"
    }
  }

  const conflict = conflictDefinitions[conflictType] || conflictDefinitions["person-vs-person"]

  context.plot.conflict = conflict

  return context
}
