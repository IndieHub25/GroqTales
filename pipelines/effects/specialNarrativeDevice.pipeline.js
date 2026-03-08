/**
 * Special Narrative Device Pipeline
 *
 * Applies special storytelling formats and devices to the narrative.
 * Supported devices:
 *   "unreliable-narrator"     — the narrator's account is intentionally distorted
 *   "epistolary"              — story told through letters, emails, diary entries, documents
 *   "multiple-perspectives"   — alternating POVs from different characters
 *   "found-footage"           — presented as discovered recordings, reports, or transcripts
 *   "frame-story"             — a story within a story, with an outer narrative wrapper
 *   "reverse-chronology"      — events unfold backwards from ending to beginning
 *   "none"                    — no special device, standard narration
 * Each device defines structural rules, reader expectations, and implementation guidance.
 */

export function specialNarrativeDevicePipeline(params, context) {
  const device = params.specialNarrativeDevice || "none"

  if (!context.effects) {
    context.effects = {}
  }

  const deviceDefinitions = {
    "none": {
      device: "none",
      description: "Standard narration — no special structural device applied",
      structuralRules: [],
      readerExpectation: "conventional reading experience",
      guidance: "Tell the story in the most natural way for its content."
    },
    "unreliable-narrator": {
      device: "unreliable-narrator",
      description: "The narrator's account is intentionally distorted, biased, or deceptive",
      structuralRules: [
        "plant subtle contradictions the attentive reader can catch",
        "narrator's version of events should feel plausible on first read",
        "reveal unreliability gradually — hints before the reveal",
        "other characters may contradict the narrator indirectly"
      ],
      readerExpectation: "growing suspicion, eventual re-evaluation of everything read",
      formatElements: ["internal justifications", "selective omissions", "reframed memories", "confident assertions about uncertain events"],
      guidance: "The key is making the narrator convincing enough to believe but flawed enough to question. The reader should want to re-read the story after the truth emerges."
    },
    "epistolary": {
      device: "epistolary",
      description: "Story told through letters, emails, diary entries, reports, or documents",
      structuralRules: [
        "each entry must have a plausible author and intended audience",
        "gaps between entries create suspense and implication",
        "voice must shift between different document authors",
        "information is limited to what the writer would know and share"
      ],
      readerExpectation: "piecing together the full story from fragments",
      formatElements: ["dated entries", "salutations and sign-offs", "intercepted messages", "redacted sections", "footnotes or editor's notes"],
      guidance: "The reader becomes a detective assembling the truth from partial accounts. What is not written is as important as what is."
    },
    "multiple-perspectives": {
      device: "multiple-perspectives",
      description: "Alternating POV chapters from different characters' viewpoints",
      structuralRules: [
        "each POV character needs a distinct voice and worldview",
        "the same event seen from different perspectives creates dramatic irony",
        "balance screen time — no character should dominate unless intentional",
        "POV switches should occur at natural chapter or section breaks"
      ],
      readerExpectation: "richer understanding through multiple lenses",
      formatElements: ["character name chapter headers", "distinct internal vocabularies", "conflicting accounts of shared events"],
      guidance: "Each perspective should reveal something the others cannot. The reader's understanding should be greater than any single character's."
    },
    "found-footage": {
      device: "found-footage",
      description: "Presented as discovered recordings, transcripts, reports, or archives",
      structuralRules: [
        "establish who found the material and why it's being shared",
        "material should feel raw, unedited, and authentic",
        "gaps, corruptions, and missing sections add realism",
        "an editorial voice may annotate or contextualize the findings"
      ],
      readerExpectation: "immersive realism, sense of uncovering something hidden",
      formatElements: ["timestamps", "recording transcripts", "evidence labels", "redacted names", "archival notes", "metadata fragments"],
      guidance: "The artificiality of the 'found' framing should enhance believability. Include imperfections — static, missing pages, water damage — to sell the conceit."
    },
    "frame-story": {
      device: "frame-story",
      description: "A story within a story — an outer narrative wraps the inner tale",
      structuralRules: [
        "the outer story must have its own stakes and purpose",
        "the inner story should reflect or contrast the outer story thematically",
        "transitions between layers must be clearly signaled",
        "the outer story should be affected by the telling of the inner story"
      ],
      readerExpectation: "thematic resonance between nested layers",
      formatElements: ["storyteller character", "audience reactions", "interruptions", "the telling affects the teller"],
      guidance: "The frame is not decoration — it's a second story. The reason someone is telling this story should matter as much as the story itself."
    },
    "reverse-chronology": {
      device: "reverse-chronology",
      description: "Events unfold backwards — from the ending to the beginning",
      structuralRules: [
        "each scene must be self-contained enough to understand out of order",
        "the emotional journey reverses — from consequences to causes",
        "the final chapter (chronologically first) should recontextualize everything",
        "foreshadowing becomes 'backshadowing' — hints about what you've already read"
      ],
      readerExpectation: "understanding deepens as context is peeled back layer by layer",
      formatElements: ["chapter timestamps counting backwards", "dramatic irony from knowing outcomes", "revelatory origin scenes"],
      guidance: "The reader knows what happened — the power is in discovering why. Each step backwards should add meaning to what came after."
    }
  }

  const selected = deviceDefinitions[device] || deviceDefinitions["none"]

  context.effects.narrativeDevice = selected

  return context
}
