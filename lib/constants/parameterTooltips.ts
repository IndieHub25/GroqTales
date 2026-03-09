/**
 * Enhanced Tooltips with detailed descriptions for Pro Panel parameters
 * Maps parameter names to rich tooltip content based on Zod schemas
 */

export const PARAMETER_TOOLTIPS = {
  // Story Structure
  narrativeStyle: {
    title: 'Narrative Structure',
    description: 'How the story is organized and told',
    examples:
      'Linear (chronological), Non-linear (jumps in time), Episodic (distinct chapters)',
    powerLevel: 'High impact on readability',
  },
  pacing: {
    title: 'Story Pacing',
    description: 'Speed at which plot events unfold',
    examples:
      'Slow-burn (gradual buildup), Fast-paced (rapid events), Variable (mixed speeds)',
    powerLevel: 'Moderate impact on engagement',
  },
  plotComplexity: {
    title: 'Plot Thread Complexity',
    description: 'Number and intricacy of storylines (0-100)',
    examples: '20 = Simple single plot, 80 = Multiple interweaving threads',
    powerLevel: 'High impact on story depth',
  },
  conflictIntensity: {
    title: 'Conflict Level',
    description: 'Intensity of dramatic tension (0-100)',
    examples: '30 = Mild disagreements, 90 = Life-or-death stakes',
    powerLevel: 'High impact on drama',
  },

  // Characters
  protagonistDepth: {
    title: 'Main Character Development',
    description: 'Psychological complexity of the hero (0-100)',
    examples: '40 = Basic motivations, 90 = Complex psychology with flaws',
    powerLevel: 'High impact on reader connection',
  },
  antagonistComplexity: {
    title: 'Villain Moral Complexity',
    description: 'How nuanced the antagonist is (0-100)',
    examples: '20 = Pure evil, 80 = Sympathetic villain with valid points',
    powerLevel: 'High impact on story sophistication',
  },
  supportingCastSize: {
    title: 'Supporting Characters',
    description: 'Number of secondary characters in the story',
    examples: 'Minimal (2-3), Ensemble (8+ major characters)',
    powerLevel: 'Moderate impact on story richness',
  },
  dialogueStyle: {
    title: 'Character Speech',
    description: 'How characters speak and communicate',
    examples:
      'Naturalistic (realistic), Witty (clever banter), Poetic (lyrical)',
    powerLevel: 'Moderate impact on character voice',
  },

  // World Building
  worldBuildingDepth: {
    title: 'Setting Detail Level',
    description: 'How thoroughly the world is described (0-100)',
    examples: '30 = Basic locations, 90 = Rich cultures and histories',
    powerLevel: 'High impact on immersion',
  },
  settingType: {
    title: 'World Genre',
    description: 'Primary setting and time period',
    examples: 'Contemporary (modern day), High Fantasy (magical realm)',
    powerLevel: 'Foundational story element',
  },
  technologyLevel: {
    title: 'Tech Era',
    description: 'Technological advancement in the world',
    examples:
      'Medieval (swords/horses), Near-future (advanced but recognizable)',
    powerLevel: 'High impact on possibilities',
  },
  magicSystemComplexity: {
    title: 'Supernatural Elements',
    description: 'Complexity of magic/powers system (0-100)',
    examples: '0 = No magic, 50 = Simple spells, 90 = Complex magical laws',
    powerLevel: 'High impact on plot possibilities',
  },

  // Tone & Style
  primaryTone: {
    title: 'Story Mood',
    description: 'Overall emotional feel of the narrative',
    examples:
      'Dark (serious/grim), Humorous (light/funny), Suspenseful (tense)',
    powerLevel: 'Foundational story element',
  },
  proseStyle: {
    title: 'Writing Style',
    description: 'How the text is written and structured',
    examples:
      'Literary (elegant prose), Pulpy (fast action), Cinematic (visual)',
    powerLevel: 'High impact on reading experience',
  },
  vocabularyLevel: {
    title: 'Word Complexity',
    description: 'Sophistication of language used',
    examples: 'Simple (easy to read), Advanced (rich vocabulary)',
    powerLevel: 'Moderate impact on accessibility',
  },
  humorLevel: {
    title: 'Comedy Amount',
    description: 'How much humor is included (0-100)',
    examples: '0 = Serious throughout, 80 = Frequent jokes and wit',
    powerLevel: 'High impact on tone',
  },
  violenceLevel: {
    title: 'Action Intensity',
    description: 'Level of violence and conflict depicted',
    examples: 'Mild (implied), Graphic (detailed combat scenes)',
    powerLevel: 'Important for content rating',
  },

  // Model Settings
  modelSelection: {
    title: 'AI Model Choice',
    description: 'Which Groq AI model to use for generation',
    examples: 'LLaMA 3.3 70B (best quality), LLaMA 3.1 8B (fastest)',
    powerLevel: 'CRITICAL: Affects quality, speed, and cost',
  },
  temperature: {
    title: 'AI Creativity Level',
    description: 'Randomness in AI output (0-2, default 0.8)',
    examples: '0.3 = Very predictable, 1.2 = Highly creative/unpredictable',
    powerLevel: 'CRITICAL: Major impact on output style',
  },
  maxTokens: {
    title: 'Output Length Limit',
    description: 'Maximum words the AI can generate (256-32768)',
    examples: '1024 = Short scenes, 8192 = Full chapters',
    powerLevel: 'CRITICAL: Determines story length',
  },
  topP: {
    title: 'Nucleus Sampling',
    description: 'Controls word choice diversity (0-1)',
    examples: '0.9 = Varied vocabulary, 0.5 = More focused word choice',
    powerLevel: 'Advanced: Fine-tunes creativity',
  },

  // Visual
  coverImageStyle: {
    title: 'Art Style',
    description: 'Visual style for generated images',
    examples: 'Photorealistic, Digital Art, Comic Book, Noir',
    powerLevel: 'High impact on visual appeal',
  },
  colorPalette: {
    title: 'Color Scheme',
    description: 'Overall color mood for visuals',
    examples: 'Vibrant (bright colors), Dark (shadows/noir), Monochrome',
    powerLevel: 'High impact on visual mood',
  },

  // Length
  targetWordCount: {
    title: 'Story Length',
    description: 'Target number of words for the complete story',
    examples: '1000 = Flash fiction, 80000 = Full novel',
    powerLevel: 'High impact on scope and depth',
  },
  chapterCount: {
    title: 'Chapter Structure',
    description: 'Number of chapters to divide story into',
    examples: '3 = Simple structure, 20 = Complex multi-part saga',
    powerLevel: 'Moderate impact on pacing',
  },

  // Advanced
  pointOfView: {
    title: 'Narrative Perspective',
    description: 'Who tells the story and how',
    examples:
      'First-person (I/me), Third-person limited (he/she, one viewpoint)',
    powerLevel: 'Foundational: Major impact on reader experience',
  },
  unreliableNarrator: {
    title: 'Unreliable Narrator',
    description: 'Whether the storyteller can be trusted',
    examples: 'True = Narrator may lie/misremember, adds mystery',
    powerLevel: 'Advanced technique: High impact on plot twists',
  },
  targetAudience: {
    title: 'Reader Age Group',
    description: 'Who the story is written for',
    examples: 'Young Adult (teens), Adult (mature themes)',
    powerLevel: 'Important: Affects content and complexity',
  },
} as const;

export type ParameterKey = keyof typeof PARAMETER_TOOLTIPS;

/**
 * Enhanced tooltip content formatter
 */
export function formatTooltipContent(parameterKey: string) {
  const tooltip = PARAMETER_TOOLTIPS[parameterKey as ParameterKey];

  if (!tooltip) {
    return `Configure ${parameterKey.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
  }

  return {
    title: tooltip.title,
    description: tooltip.description,
    examples: tooltip.examples,
    powerLevel: tooltip.powerLevel,
  };
}
