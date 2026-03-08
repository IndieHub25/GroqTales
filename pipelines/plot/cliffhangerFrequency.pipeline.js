/**
 * Cliffhanger Frequency Pipeline
 *
 * Determines how often chapters end with suspense or unresolved tension.
 * Frequency levels:
 *   1 → rare       (most chapters resolve cleanly)
 *   2 → occasional (every few chapters end on a cliffhanger)
 *   3 → frequent   (most chapters end with suspense)
 *   4 → relentless (every chapter ends on a cliffhanger)
 * Also generates a pattern map indicating which chapters get cliffhangers.
 */

export function cliffhangerFrequencyPipeline(params, context) {
  const frequency = params.cliffhangerFrequency || 2

  if (!context.plot) {
    context.plot = {}
  }

  const frequencyMap = {
    1: { label: "rare",       ratio: 0.15, guidance: "Reserve cliffhangers for act breaks and major turning points" },
    2: { label: "occasional", ratio: 0.35, guidance: "End every 3rd chapter with unresolved tension" },
    3: { label: "frequent",   ratio: 0.65, guidance: "Most chapters should leave a question unanswered" },
    4: { label: "relentless", ratio: 0.90, guidance: "Nearly every chapter ends mid-action or with a revelation" }
  }

  const level = frequencyMap[Math.min(Math.max(frequency, 1), 4)] || frequencyMap[2]

  // Generate a 12-chapter pattern indicating which chapters get cliffhangers
  const chapterCount = 12
  const pattern = []

  for (let i = 0; i < chapterCount; i++) {
    const threshold = (i + 1) / chapterCount
    pattern.push({
      chapter: i + 1,
      endsWithCliffhanger: threshold <= level.ratio
    })
  }

  context.plot.cliffhangers = {
    frequency: level.label,
    ratio: level.ratio,
    guidance: level.guidance,
    pattern: pattern
  }

  return context
}
