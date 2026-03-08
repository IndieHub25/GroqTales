/**
 * Randomization Seed Pipeline
 *
 * Sets a seed value for reproducible story generation.
 * When a seed is provided, the same parameters should produce
 * the same structured output across runs.
 * When no seed is set, generation uses non-deterministic selection.
 * Also provides a simple seeded pseudo-random number generator
 * for downstream pipelines to use.
 */

export function randomizationSeedPipeline(params, context) {
  const seed = params.randomizationSeed ?? null

  if (!context.advanced) {
    context.advanced = {}
  }
  if (!context.generation) {
    context.generation = {}
  }

  if (seed !== null && seed !== undefined) {
    // Simple seeded PRNG (mulberry32 algorithm)
    // Returns a function that produces deterministic floats 0–1
    let state = typeof seed === "number" ? seed : hashString(String(seed))

    const seededRandom = function () {
      state |= 0
      state = (state + 0x6D2B79F5) | 0
      let t = Math.imul(state ^ (state >>> 15), 1 | state)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }

    context.generation.seed = seed
    context.generation.deterministic = true
    context.generation.random = seededRandom

    context.advanced.randomization = {
      seed: seed,
      mode: "deterministic",
      description: "Story generation is seeded — identical parameters produce identical output",
      guidance: "Use context.generation.random() instead of Math.random() in all pipelines to maintain reproducibility."
    }
  } else {
    // Non-deterministic mode — use Math.random
    context.generation.seed = null
    context.generation.deterministic = false
    context.generation.random = Math.random

    context.advanced.randomization = {
      seed: null,
      mode: "non-deterministic",
      description: "Story generation is randomized — each run may produce different results",
      guidance: "No seed is set. Output will vary between runs. Use this for exploration and surprise."
    }
  }

  return context
}

/**
 * Simple string hash for converting string seeds to numbers.
 * Uses djb2 algorithm.
 */
function hashString(str) {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i)
    hash |= 0  // Convert to 32-bit integer
  }
  return Math.abs(hash)
}
