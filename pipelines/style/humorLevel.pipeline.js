/**
 * Humor Level Pipeline
 *
 * Controls how much humor appears in the story.
 * Level range 1–10:
 *   1–2  → none       (entirely serious, no comedic elements)
 *   3–4  → light      (occasional moments of levity to relieve tension)
 *   5–6  → moderate   (humor is a regular presence, balancing drama)
 *   7–8  → high       (humor is a major driver of tone and character)
 *   9–10 → pervasive  (comedy-first — nearly every scene has humor)
 * Sets humor frequency, placement guidance, and character humor roles.
 */

export function humorLevelPipeline(params, context) {
  const level = params.humorLevel || 4

  if (!context.tone) {
    context.tone = {}
  }

  let config

  if (level <= 2) {
    config = {
      label: "none",
      frequency: 0,
      placement: "never",
      guidance: "Maintain a serious tone throughout. Avoid comedic beats even in downtime scenes.",
      characterHumorRole: "no character serves a comedic function"
    }
  } else if (level <= 4) {
    config = {
      label: "light",
      frequency: 0.15,
      placement: "between tense scenes as relief",
      guidance: "Use humor sparingly to ease tension after heavy scenes. Keep it character-driven, not situational.",
      characterHumorRole: "one side character may provide occasional levity"
    }
  } else if (level <= 6) {
    config = {
      label: "moderate",
      frequency: 0.35,
      placement: "regularly throughout, avoiding climactic moments",
      guidance: "Weave humor into dialogue and character interactions. Balance wit with dramatic weight.",
      characterHumorRole: "multiple characters can be funny; humor flows naturally from dynamics"
    }
  } else if (level <= 8) {
    config = {
      label: "high",
      frequency: 0.55,
      placement: "in most scenes, including some serious ones",
      guidance: "Humor is a core tone. Characters quip under pressure. Serious moments land harder by contrast.",
      characterHumorRole: "protagonist and key cast use humor as a defense mechanism or worldview"
    }
  } else {
    config = {
      label: "pervasive",
      frequency: 0.80,
      placement: "everywhere — even dramatic moments have a comedic layer",
      guidance: "This is a comedy-first story. Every scene should have at least one laugh. Serious moments are brief and punchy.",
      characterHumorRole: "the entire cast participates in the comedy; the world itself is often absurd"
    }
  }

  context.tone.humor = config

  return context
}
