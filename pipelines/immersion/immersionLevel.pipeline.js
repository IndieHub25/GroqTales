/**
 * Immersion Level Pipeline
 *
 * Defines the overall reader immersion level — how deeply the narrative
 * pulls the reader into the story world.
 * Level range 1–10:
 *   1–3  → observational  (reader watches from a distance, aware of the text)
 *   4–6  → engaged        (reader is drawn in but remains an outside observer)
 *   7–8  → absorbed       (reader forgets they're reading, fully inside the world)
 *   9–10 → total          (reader experiences the story as if living it)
 * Synthesizes signals from other immersion pipelines and provides
 * overarching prose and structural guidance.
 */

export function immersionLevelPipeline(params, context) {
  const level = params.immersionLevel || 6

  if (!context.immersion) {
    context.immersion = {}
  }

  let config

  if (level <= 3) {
    config = {
      level: "observational",
      description: "Reader watches events unfold from a comfortable distance",
      readerPosition: "outside the story, aware of the text as a construct",
      proseStyle: "clear, reportorial, occasionally self-aware",
      structuralCues: [
        "chapter summaries are acceptable",
        "narrator can address the reader directly",
        "meta-commentary is permitted",
        "pacing favors efficiency over atmosphere"
      ],
      breakingTechniques: ["time jumps", "summaries", "narrator commentary", "lists"],
      guidance: "Prioritize clarity and forward motion. The story is something to be understood, not felt. This suits satire, fables, and philosophical fiction."
    }
  } else if (level <= 6) {
    config = {
      level: "engaged",
      description: "Reader is drawn into the story but remains an outside observer",
      readerPosition: "close to the characters, emotionally invested but aware of craft",
      proseStyle: "immersive in key scenes, efficient in transitions",
      structuralCues: [
        "scene-level immersion with transitional summaries",
        "emotional beats are fully rendered",
        "world details anchor important moments",
        "narrator stays invisible during dramatic scenes"
      ],
      breakingTechniques: ["smooth time transitions", "brief recaps after jumps"],
      guidance: "Render the important scenes fully — let the reader feel present. Use efficient narration between peaks to maintain momentum."
    }
  } else if (level <= 8) {
    config = {
      level: "absorbed",
      description: "Reader forgets they're reading — the text becomes transparent",
      readerPosition: "inside the story, experiencing events alongside characters",
      proseStyle: "continuous, flowing, sensory-rich, no narrative distance",
      structuralCues: [
        "no summaries — every scene is depicted in real-time",
        "transitions are seamless and sensory",
        "pacing reflects the character's subjective experience",
        "narrator is invisible at all times"
      ],
      breakingTechniques: [],
      guidance: "Eliminate everything that reminds the reader they're reading. No authorial intrusion, no clunky exposition. The prose should be a window, not a screen."
    }
  } else {
    config = {
      level: "total",
      description: "Reader experiences the story as if living it — complete psychological immersion",
      readerPosition: "merged with the protagonist's consciousness",
      proseStyle: "stream of consciousness, immediate, present-tense feel even in past tense",
      structuralCues: [
        "interior experience is inseparable from external events",
        "time warps to match emotional intensity",
        "the reader's heartbeat should sync with the character's",
        "sensory and emotional channels are always open"
      ],
      breakingTechniques: [],
      guidance: "The reader should not be able to distinguish between the character's experience and their own reading experience. This is the most demanding level — every word must serve immersion."
    }
  }

  context.immersion.overall = config

  return context
}
