/**
 * Flashback Usage Pipeline
 *
 * Inserts flashback markers into the story timeline.
 * Usage levels:
 *   0 → none     (strictly chronological)
 *   1 → minimal  (one or two brief flashbacks for backstory)
 *   2 → moderate (flashbacks woven into key chapters)
 *   3 → heavy    (flashbacks as a narrative device throughout)
 * Each flashback entry includes a trigger, timing, and purpose.
 */

export function flashbackUsagePipeline(params, context) {
  const usage = params.flashbackUsage ?? 1

  if (!context.timeline) {
    context.timeline = []
  }

  if (usage <= 0) {
    context.plot = context.plot || {}
    context.plot.flashbacks = { usage: "none", entries: [] }
    return context
  }

  const triggers = [
    "a familiar scent triggers a childhood memory",
    "finding an old letter reopens a past wound",
    "a recurring nightmare reveals suppressed trauma",
    "visiting a once-familiar place sparks involuntary recall",
    "a character's words echo something said long ago",
    "a near-death experience brings clarity about the past"
  ]

  const purposes = [
    "reveal hidden backstory",
    "explain a character's motivation",
    "foreshadow a future event",
    "deepen emotional resonance",
    "provide missing context for a conflict",
    "show how a relationship started"
  ]

  // Number of flashbacks scales with usage level
  const flashbackCount = usage <= 1 ? 1 : usage <= 2 ? 3 : 5

  const entries = []

  for (let i = 0; i < flashbackCount; i++) {
    const entry = {
      id: "flashback_" + (i + 1),
      trigger: triggers[i % triggers.length],
      purpose: purposes[i % purposes.length],
      timing: i < flashbackCount / 2 ? "first-half" : "second-half",
      duration: usage >= 3 ? "extended" : "brief"
    }

    entries.push(entry)

    // Also add to the shared timeline
    context.timeline.push({
      id: entry.id,
      type: "flashback",
      position: entry.timing,
      description: entry.trigger
    })
  }

  context.plot = context.plot || {}
  context.plot.flashbacks = {
    usage: usage <= 1 ? "minimal" : usage <= 2 ? "moderate" : "heavy",
    entries: entries
  }

  return context
}
