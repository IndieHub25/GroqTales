/**
 * Plot Structure Type Pipeline
 *
 * Chooses the story's structural template and generates the
 * corresponding act/phase breakdown.
 * Supported structures:
 *   "three-act"       — Setup → Confrontation → Resolution
 *   "hero-journey"    — Call → Trials → Transformation → Return
 *   "nonlinear"       — Fragmented timeline, converging threads
 *   "circular"        — Ends where it began, cyclical motifs
 *   "in-medias-res"   — Opens mid-action, fills in backstory later
 */

export function plotStructureTypePipeline(params, context) {
  const structureType = params.plotStructureType || "three-act"

  if (!context.structure) {
    context.structure = {}
  }

  const templates = {
    "three-act": {
      type: "three-act",
      description: "Classic three-act structure with setup, confrontation, and resolution",
      phases: [
        { name: "Act 1 — Setup",         purpose: "Introduce world, characters, and inciting incident", weight: 0.25 },
        { name: "Act 2 — Confrontation",  purpose: "Escalate conflict, develop subplots, raise stakes",  weight: 0.50 },
        { name: "Act 3 — Resolution",     purpose: "Climax, resolution, and denouement",                 weight: 0.25 }
      ]
    },
    "hero-journey": {
      type: "hero-journey",
      description: "Mythic hero's journey through trials and transformation",
      phases: [
        { name: "The Ordinary World",    purpose: "Establish status quo and hero's normal life",         weight: 0.10 },
        { name: "Call to Adventure",     purpose: "Inciting event that disrupts the ordinary",           weight: 0.10 },
        { name: "Crossing the Threshold", purpose: "Hero commits to the journey",                       weight: 0.10 },
        { name: "Trials and Allies",     purpose: "Tests, enemies, and allies encountered",              weight: 0.25 },
        { name: "The Ordeal",            purpose: "Major crisis or lowest point",                        weight: 0.15 },
        { name: "Transformation",        purpose: "Hero gains insight or power",                         weight: 0.15 },
        { name: "The Return",            purpose: "Hero returns changed, resolution of conflict",        weight: 0.15 }
      ]
    },
    "nonlinear": {
      type: "nonlinear",
      description: "Fragmented timeline with converging narrative threads",
      phases: [
        { name: "Fragment A — Present",  purpose: "Current events driving the main conflict",            weight: 0.30 },
        { name: "Fragment B — Past",     purpose: "Backstory reveals that recontextualize the present",  weight: 0.25 },
        { name: "Fragment C — Future",   purpose: "Flash-forwards hinting at outcomes",                  weight: 0.15 },
        { name: "Convergence",           purpose: "All timelines merge at the climax",                   weight: 0.30 }
      ]
    },
    "circular": {
      type: "circular",
      description: "Story ends where it began with cyclical resonance",
      phases: [
        { name: "Opening Image",         purpose: "Establish a memorable opening scene",                 weight: 0.15 },
        { name: "Departure",             purpose: "Characters leave the starting point",                 weight: 0.20 },
        { name: "Journey",               purpose: "Central events of the story",                         weight: 0.35 },
        { name: "Return",                purpose: "Characters circle back to the beginning",             weight: 0.15 },
        { name: "Closing Mirror",        purpose: "Echo the opening with new meaning",                   weight: 0.15 }
      ]
    },
    "in-medias-res": {
      type: "in-medias-res",
      description: "Opens mid-action, fills backstory through reveals",
      phases: [
        { name: "Cold Open",             purpose: "Drop into the middle of a key event",                 weight: 0.15 },
        { name: "Rewind",                purpose: "Step back and reveal how we got here",                weight: 0.25 },
        { name: "Catch-Up",              purpose: "Narrative reaches back to the cold open moment",      weight: 0.25 },
        { name: "Forward Drive",         purpose: "Story pushes past the opening into new territory",    weight: 0.20 },
        { name: "Resolution",            purpose: "Full resolution with the backdrop now understood",    weight: 0.15 }
      ]
    }
  }

  const template = templates[structureType] || templates["three-act"]

  context.structure = {
    ...context.structure,
    ...template
  }

  return context
}
