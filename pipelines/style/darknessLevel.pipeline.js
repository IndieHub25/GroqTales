/**
 * Darkness Level Pipeline
 *
 * Controls how dark the overall tone of the story becomes.
 * Level range 1–10:
 *   1–2  → light     (safe, uplifting, no disturbing content)
 *   3–4  → mild      (occasional tension, mild consequences)
 *   5–6  → moderate  (real stakes, morally grey moments, some violence)
 *   7–8  → dark      (high stakes, loss, moral ambiguity, graphic tension)
 *   9–10 → grim      (relentless, bleak, unflinching portrayal of suffering)
 * Sets content boundaries, thematic weight, and allowed narrative elements.
 */

export function darknessLevelPipeline(params, context) {
  const level = params.darknessLevel || 5

  if (!context.tone) {
    context.tone = {}
  }

  let config

  if (level <= 2) {
    config = {
      label: "light",
      description: "Safe, uplifting tone with no disturbing content",
      allowedElements: ["mild conflict", "gentle tension", "happy resolutions"],
      restrictedElements: ["death", "graphic violence", "betrayal", "moral dilemmas"],
      consequenceWeight: "minimal — setbacks are temporary",
      guidance: "Keep the world inviting. Conflict exists but never feels truly threatening. Good always prevails."
    }
  } else if (level <= 4) {
    config = {
      label: "mild",
      description: "Occasional tension with real but limited consequences",
      allowedElements: ["moderate conflict", "minor injuries", "difficult choices", "temporary loss"],
      restrictedElements: ["graphic violence", "permanent death of allies", "extreme suffering"],
      consequenceWeight: "moderate — actions have consequences but recovery is possible",
      guidance: "Let characters face real obstacles but ensure hope is always visible. Stakes are present but manageable."
    }
  } else if (level <= 6) {
    config = {
      label: "moderate",
      description: "Real stakes with morally grey moments and impactful consequences",
      allowedElements: ["violence with consequences", "moral ambiguity", "loss", "difficult truths", "betrayal"],
      restrictedElements: ["gratuitous gore", "relentless despair without relief"],
      consequenceWeight: "significant — choices carry lasting weight",
      guidance: "Balance darkness with moments of light. Let the reader feel the weight of consequences without drowning in despair."
    }
  } else if (level <= 8) {
    config = {
      label: "dark",
      description: "High stakes with loss, moral ambiguity, and graphic tension",
      allowedElements: ["character death", "graphic conflict", "corruption", "systemic injustice", "psychological horror"],
      restrictedElements: ["gratuitous cruelty without narrative purpose"],
      consequenceWeight: "heavy — victory comes at great cost if it comes at all",
      guidance: "Don't shy away from difficult realities. Darkness should serve the story's themes. Moments of hope become more powerful by contrast."
    }
  } else {
    config = {
      label: "grim",
      description: "Relentless, bleak, unflinching portrayal of a harsh world",
      allowedElements: ["permanent loss", "moral collapse", "existential dread", "unfair outcomes", "graphic consequences"],
      restrictedElements: ["none — all narrative elements are permitted"],
      consequenceWeight: "crushing — survival itself is a victory",
      guidance: "This is a world that does not care about fairness. Show the cost of every choice. If hope exists, it must be fought for against overwhelming odds."
    }
  }

  context.tone.darkness = config

  return context
}
