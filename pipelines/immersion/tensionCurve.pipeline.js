/**
 * Tension Curve Pipeline
 *
 * Defines how tension evolves across the story's narrative arc.
 * Supported curve patterns:
 *   "rising"  — steady build from low tension to high climax
 *   "wave"    — alternating peaks and valleys, breathing room between crises
 *   "spike"   — mostly low tension with sudden sharp spikes at key moments
 *   "steady"  — consistent moderate tension throughout, no dramatic swings
 * Each pattern generates a tension map with per-chapter intensity values
 * stored in context.tension for downstream reference.
 */

export function tensionCurvePipeline(params, context) {
  const curveType = params.tensionCurve || "wave"

  if (!context.immersion) {
    context.immersion = {}
  }
  if (!context.tension) {
    context.tension = []
  }

  // Default chapter count — use existing chapter data if available
  const chapterCount = (context.plot && context.plot.chapters)
    ? context.plot.chapters.length
    : 10

  const curveDefinitions = {
    "rising": {
      pattern: "rising",
      description: "Steady, relentless build from low tension to high climax",
      emotionalEffect: "mounting dread, accelerating pace, increasing stakes",
      guidance: "Each chapter should be slightly more tense than the last. There is no relief — only escalation. The climax should feel inevitable."
    },
    "wave": {
      pattern: "wave",
      description: "Alternating peaks and valleys — crises followed by breathing room",
      emotionalEffect: "rhythmic engagement, emotional reset between peaks",
      guidance: "After each peak, give the reader a valley to recover. Use quiet scenes to deepen character between action. Peaks should grow progressively higher."
    },
    "spike": {
      pattern: "spike",
      description: "Mostly low tension with sudden, sharp spikes at key moments",
      emotionalEffect: "surprise, shock, jarring disruption of comfort",
      guidance: "Lull the reader into comfort, then shatter it. Spikes should feel sudden and disorienting. The contrast between calm and crisis creates maximum impact."
    },
    "steady": {
      pattern: "steady",
      description: "Consistent moderate tension throughout — no dramatic swings",
      emotionalEffect: "persistent unease, slow-burn suspense, psychological pressure",
      guidance: "Maintain a constant hum of tension. Never let the reader fully relax, but never overwhelm them either. This works best for psychological and mystery stories."
    }
  }

  const curve = curveDefinitions[curveType] || curveDefinitions["wave"]

  // Generate per-chapter tension values (0.0–1.0)
  const tensionMap = []

  for (let i = 0; i < chapterCount; i++) {
    const progress = i / (chapterCount - 1 || 1)
    let intensity

    switch (curveType) {
      case "rising":
        // Linear rise from 0.2 to 1.0
        intensity = 0.2 + (progress * 0.8)
        break
      case "wave":
        // Sine wave with rising baseline
        intensity = 0.3 + (progress * 0.4) + (Math.sin(progress * Math.PI * 3) * 0.2)
        intensity = Math.max(0.1, Math.min(1.0, intensity))
        break
      case "spike":
        // Low baseline with spikes at 30%, 60%, and 90% marks
        intensity = 0.2
        if (Math.abs(progress - 0.3) < 0.08) intensity = 0.75
        if (Math.abs(progress - 0.6) < 0.08) intensity = 0.85
        if (Math.abs(progress - 0.9) < 0.08) intensity = 1.0
        break
      case "steady":
      default:
        // Consistent moderate level with slight climax bump
        intensity = 0.5 + (progress > 0.85 ? 0.2 : 0)
        break
    }

    tensionMap.push({
      chapter: i + 1,
      intensity: Math.round(intensity * 100) / 100,
      label: intensity <= 0.3 ? "low" : intensity <= 0.6 ? "moderate" : intensity <= 0.8 ? "high" : "peak"
    })
  }

  context.tension = tensionMap

  context.immersion.tensionCurve = {
    ...curve,
    chapterCount: chapterCount,
    tensionMap: tensionMap
  }

  return context
}
