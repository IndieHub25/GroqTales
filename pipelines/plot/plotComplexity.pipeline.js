/**
 * Plot Complexity Pipeline
 *
 * Determines the number of story threads and subplot layers.
 * Complexity levels:
 *   1 → single thread (one main storyline, no subplots)
 *   2 → dual thread   (main plot + one subplot)
 *   3 → layered       (main plot + two subplots with interwoven threads)
 *   4 → intricate     (main plot + three subplots, parallel timelines possible)
 *   5 → epic          (main plot + four+ subplots, multiple POVs and arcs)
 */

export function plotComplexityPipeline(params, context) {
  const complexity = params.plotComplexity || 3

  if (!context.plot) {
    context.plot = {}
  }

  const complexityMap = {
    1: { label: "single-thread",  mainThreads: 1, subplots: 0 },
    2: { label: "dual-thread",    mainThreads: 1, subplots: 1 },
    3: { label: "layered",        mainThreads: 2, subplots: 2 },
    4: { label: "intricate",      mainThreads: 2, subplots: 3 },
    5: { label: "epic",           mainThreads: 3, subplots: 4 }
  }

  const level = complexityMap[Math.min(Math.max(complexity, 1), 5)] || complexityMap[3]

  // Build story threads
  const threads = []

  for (let i = 0; i < level.mainThreads; i++) {
    threads.push({
      id: "main_thread_" + (i + 1),
      type: "main",
      status: "active",
      description: "Main story thread " + (i + 1)
    })
  }

  for (let i = 0; i < level.subplots; i++) {
    threads.push({
      id: "subplot_" + (i + 1),
      type: "subplot",
      status: "active",
      description: "Subplot " + (i + 1)
    })
  }

  context.plot.complexity = level.label
  context.plot.threads = threads
  context.plot.subplotCount = level.subplots

  return context
}
