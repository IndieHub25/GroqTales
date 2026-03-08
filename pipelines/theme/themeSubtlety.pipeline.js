/**
 * Theme Subtlety Pipeline
 *
 * Controls how subtly themes are presented to the reader.
 * Supported levels:
 *   "obvious"  — themes are stated directly through dialogue or narration
 *   "balanced" — themes are present but require some reader interpretation
 *   "symbolic" — themes expressed primarily through symbols and metaphor
 *   "hidden"   — themes are deeply embedded, revealed only through close reading
 * Each level defines presentation techniques, narrator involvement, and discovery expectations.
 */

export function themeSubtletyPipeline(params, context) {
  const subtlety = params.themeSubtlety || "balanced"

  if (!context.theme) {
    context.theme = {}
  }

  const subtletyDefinitions = {
    "obvious": {
      level: "obvious",
      description: "Themes are stated directly — characters discuss them openly",
      presentationTechniques: [
        "characters articulate the theme in dialogue",
        "narrator explicitly names the lesson or moral",
        "chapter titles or epigraphs state the theme",
        "climactic speeches embody the thematic conclusion"
      ],
      narratorInvolvement: "high — narrator may editorialize",
      discoveryExpectation: "immediate — no interpretation required",
      guidance: "Be upfront about what the story means. This works well for younger audiences, fables, and allegories where clarity is a virtue."
    },
    "balanced": {
      level: "balanced",
      description: "Themes are present and recognizable but require some reader engagement",
      presentationTechniques: [
        "character actions reflect thematic ideas without stating them",
        "recurring motifs point toward the theme",
        "key scenes embody the thematic question",
        "dialogue hints at the theme without spelling it out"
      ],
      narratorInvolvement: "moderate — narrator shows but doesn't tell",
      discoveryExpectation: "moderate — attentive readers will identify the theme",
      guidance: "Show the theme through choices and consequences. Let the reader connect the dots without making them work too hard."
    },
    "symbolic": {
      level: "symbolic",
      description: "Themes are expressed primarily through symbols, imagery, and metaphor",
      presentationTechniques: [
        "objects and settings carry thematic weight",
        "character names or roles echo mythic patterns",
        "visual and sensory motifs encode meaning",
        "parallel structures create thematic rhymes"
      ],
      narratorInvolvement: "low — meaning lives in the imagery, not the narration",
      discoveryExpectation: "requires interpretation — theme rewards close reading",
      guidance: "Build a symbolic vocabulary throughout the story. Repeat images with shifting meaning. Trust the reader to decode the patterns."
    },
    "hidden": {
      level: "hidden",
      description: "Themes are deeply embedded, revealed only through careful analysis",
      presentationTechniques: [
        "structural choices encode thematic meaning",
        "what characters don't say is as important as what they do",
        "theme emerges from the negative space between events",
        "multiple re-reads reveal new thematic layers"
      ],
      narratorInvolvement: "minimal — the narrator may actively misdirect",
      discoveryExpectation: "high effort — most readers will sense but not articulate the theme",
      guidance: "The theme should haunt the reader rather than announce itself. Embed meaning in structure, omission, and juxtaposition. This demands a sophisticated audience."
    }
  }

  const selected = subtletyDefinitions[subtlety] || subtletyDefinitions["balanced"]

  context.theme.subtlety = selected

  return context
}
