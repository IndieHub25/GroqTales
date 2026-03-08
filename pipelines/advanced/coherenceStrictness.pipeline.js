/**
 * Coherence Strictness Pipeline
 *
 * Defines how strictly the story must remain logically consistent.
 * Strictness range 1–10:
 *   1–3  → loose     (dream-logic, surreal, contradictions are features)
 *   4–6  → moderate  (mostly consistent with allowance for artistic license)
 *   7–8  → strict    (tight internal logic, no contradictions tolerated)
 *   9–10 → rigorous  (every detail must be accounted for, cross-referenced, and consistent)
 * Sets rules for continuity, timeline tracking, and fact-checking.
 */

export function coherenceStrictnessPipeline(params, context) {
  const strictness = params.coherenceStrictness || 6

  if (!context.advanced) {
    context.advanced = {}
  }

  let config

  if (strictness <= 3) {
    config = {
      level: "loose",
      description: "Dream-logic and surreal narrative — contradictions are features, not bugs",
      continuityRules: [
        "characters can shift identity or traits without explanation",
        "timeline may be non-sequential or contradictory",
        "world rules can change based on emotional truth"
      ],
      factChecking: "none — internal consistency is not a priority",
      timelineTracking: "fluid — time is subjective",
      guidance: "Embrace inconsistency when it serves the mood. This is the domain of magical realism, surrealism, and fever-dream narratives."
    }
  } else if (strictness <= 6) {
    config = {
      level: "moderate",
      description: "Mostly consistent with allowance for artistic license",
      continuityRules: [
        "character names and relationships must remain stable",
        "major world rules should not contradict themselves",
        "minor timeline inconsistencies are acceptable if unobtrusive"
      ],
      factChecking: "light — catch obvious contradictions",
      timelineTracking: "general — events follow a clear order but gaps are allowed",
      guidance: "Keep the big things consistent and forgive the small things. Readers will accept minor gaps if the story delivers emotionally."
    }
  } else if (strictness <= 8) {
    config = {
      level: "strict",
      description: "Tight internal logic — no contradictions tolerated",
      continuityRules: [
        "all character details must remain consistent across scenes",
        "world rules established early must hold throughout",
        "timeline must be trackable and non-contradictory",
        "cause and effect must be logical"
      ],
      factChecking: "active — review each scene against established facts",
      timelineTracking: "precise — events can be placed on a timeline",
      guidance: "Treat the story like a contract with the reader. Every established fact is a promise. Breaking it breaks trust."
    }
  } else {
    config = {
      level: "rigorous",
      description: "Every detail is cross-referenced and verified for total consistency",
      continuityRules: [
        "all rules from strict level apply",
        "background details must remain consistent (weather, clothing, injuries)",
        "character knowledge tracks what they've actually witnessed",
        "distances, travel times, and geography must be internally consistent",
        "emotional continuity — characters remember and are affected by past events"
      ],
      factChecking: "comprehensive — maintain a story bible of established facts",
      timelineTracking: "exact — hour-by-hour tracking when relevant",
      guidance: "This is for readers who will catch every mistake. Build a reference document of established facts and check every scene against it. Obsessive consistency creates deep reader trust."
    }
  }

  context.advanced.coherence = config

  return context
}
