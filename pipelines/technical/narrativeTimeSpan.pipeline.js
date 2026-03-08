/**
 * Narrative Time Span Pipeline
 *
 * Defines how much in-story time the narrative covers.
 * Supported spans:
 *   "hours"  — tight, real-time or near-real-time storytelling
 *   "days"   — short arc, events over a few days
 *   "weeks"  — medium arc with time jumps between key events
 *   "months" — extended story with seasonal progression
 *   "years"  — epic span covering long-term change and growth
 * Each span defines pacing implications, transition types, and aging effects.
 */

export function narrativeTimeSpanPipeline(params, context) {
  const span = params.narrativeTimeSpan || "weeks"

  if (!context.technical) {
    context.technical = {}
  }

  const spanDefinitions = {
    "hours": {
      span: "hours",
      description: "Tight, compressed storytelling — events unfold in real-time or near-real-time",
      inStoryDuration: "1–24 hours",
      pacingImpact: "extremely fast — every moment counts, no room for downtime",
      transitions: "continuous or minute-by-minute cuts",
      timeMarkers: ["clock references", "light changes", "meal times", "shift changes"],
      agingEffects: "none — characters don't change physically",
      guidance: "Create urgency through compression. The ticking clock is your primary tension device. Every scene should feel immediately consequential."
    },
    "days": {
      span: "days",
      description: "Short arc spanning a handful of days",
      inStoryDuration: "2–7 days",
      pacingImpact: "fast — daily rhythm structures the narrative",
      transitions: "morning/evening breaks, sleep as natural chapter dividers",
      timeMarkers: ["sunrise/sunset", "day labels", "meal routines", "daily habits"],
      agingEffects: "none — fatigue and stress may accumulate",
      guidance: "Use the natural rhythm of days and nights. Each day should escalate the central conflict. Sleep scenes offer reflection moments."
    },
    "weeks": {
      span: "weeks",
      description: "Medium arc with time jumps between key events",
      inStoryDuration: "2–8 weeks",
      pacingImpact: "moderate — room for both action and reflection",
      transitions: "time-skip summaries, 'three days later' markers",
      timeMarkers: ["weekly rhythms", "weather changes", "deadline countdowns", "routine shifts"],
      agingEffects: "subtle — emotional wear shows, minor physical changes",
      guidance: "Skip routine days and focus on pivotal moments. Use time jumps to show gradual change without dragging."
    },
    "months": {
      span: "months",
      description: "Extended story with seasonal progression and visible change",
      inStoryDuration: "2–12 months",
      pacingImpact: "measured — space for subplots and character evolution",
      transitions: "seasonal markers, monthly milestones, 'that autumn' passages",
      timeMarkers: ["seasonal shifts", "holidays or festivals", "harvest/planting cycles", "school terms"],
      agingEffects: "moderate — characters visibly change, relationships evolve",
      guidance: "Use seasons as emotional metaphors. Show gradual transformation through accumulated small moments."
    },
    "years": {
      span: "years",
      description: "Epic span covering long-term change, growth, and generational shifts",
      inStoryDuration: "2+ years, potentially decades",
      pacingImpact: "sweeping — significant events are highlights separated by time jumps",
      transitions: "year markers, epoch labels, 'ten years later' jumps",
      timeMarkers: ["aging descriptions", "era-defining events", "generational milestones", "technological changes"],
      agingEffects: "significant — characters age, relationships transform, worlds shift",
      guidance: "Focus on defining moments spaced across time. Show who characters become, not just what they do. Let the passage of time itself be a theme."
    }
  }

  const selected = spanDefinitions[span] || spanDefinitions["weeks"]

  context.technical.narrativeTimeSpan = selected

  return context
}
