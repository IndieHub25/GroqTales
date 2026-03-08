/**
 * Model Temperature Pipeline
 *
 * Controls the randomness/creativity of AI text generation.
 * Temperature range 0.0–2.0:
 *   0.0–0.3  → precise     (highly deterministic, focused, repetitive)
 *   0.4–0.7  → balanced    (coherent with moderate variation)
 *   0.8–1.2  → creative    (diverse output, surprising word choices)
 *   1.3–2.0  → wild        (highly random, potentially incoherent)
 * Sets the temperature value and provides generation parameter guidance.
 */

export function modelTemperaturePipeline(params, context) {
  const temperature = params.modelTemperature ?? 0.8

  if (!context.advanced) {
    context.advanced = {}
  }
  if (!context.generation) {
    context.generation = {}
  }

  // Clamp temperature to valid range
  const clampedTemp = Math.min(Math.max(temperature, 0.0), 2.0)

  let config

  if (clampedTemp <= 0.3) {
    config = {
      label: "precise",
      description: "Highly deterministic — focused, predictable, and consistent output",
      tradeoff: "consistency over creativity",
      bestFor: ["technical writing", "factual narration", "consistent character voice", "plot-critical scenes"],
      risks: ["repetitive phrasing", "flat prose", "lack of surprise"]
    }
  } else if (clampedTemp <= 0.7) {
    config = {
      label: "balanced",
      description: "Coherent output with moderate variation and natural flow",
      tradeoff: "quality and reliability with some creative flair",
      bestFor: ["general storytelling", "dialogue", "balanced prose", "most scenes"],
      risks: ["occasional odd phrasing", "minor inconsistencies"]
    }
  } else if (clampedTemp <= 1.2) {
    config = {
      label: "creative",
      description: "Diverse, surprising output with unexpected word choices",
      tradeoff: "creativity over predictability",
      bestFor: ["poetic passages", "experimental prose", "surreal scenes", "brainstorming"],
      risks: ["occasional incoherence", "tangential output", "needs editing"]
    }
  } else {
    config = {
      label: "wild",
      description: "Highly random — potentially incoherent but maximally creative",
      tradeoff: "maximum novelty at the cost of reliability",
      bestFor: ["experimental writing", "dream sequences", "abstract passages", "creative exploration"],
      risks: ["frequent incoherence", "broken grammar", "loss of narrative thread"]
    }
  }

  context.generation.temperature = clampedTemp

  context.advanced.temperature = {
    value: clampedTemp,
    ...config,
    guidance: "Set temperature to " + clampedTemp + " for generation. Adjust per-scene if the pipeline supports it — use lower values for plot-critical moments and higher for creative passages."
  }

  return context
}
