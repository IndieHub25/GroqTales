/**
 * Pro Panel Defaults & Category Metadata
 * Centralized configuration for all Pro Panel parameters
 */

import type { ProParameters, ProPreset, CategoryKey } from '../schemas/proPanelSchemas';

// ============================================================
// DEFAULT PARAMETERS
// ============================================================
export const DEFAULT_PARAMETERS: ProParameters = {
  storyStructure: {
    narrativeStyle: 'linear',
    pacing: 'moderate',
    actStructure: 'three-act',
    plotComplexity: 50,
    conflictIntensity: 60,
    resolutionStyle: 'conclusive',
    flashbackFrequency: 20,
    foreshadowingLevel: 40,
  },
  characters: {
    protagonistDepth: 70,
    antagonistComplexity: 50,
    supportingCastSize: 'moderate',
    characterVoiceDistinctness: 60,
    relationshipComplexity: 50,
    characterGrowthArc: 'positive-change',
    backstoryIntegration: 40,
    dialogueStyle: 'naturalistic',
    internalMonologueFrequency: 40,
  },
  world: {
    worldBuildingDepth: 50,
    settingType: 'real-world-contemporary',
    geographicScope: 'city',
    cultureDetailLevel: 40,
    technologyLevel: 'modern',
    magicSystemComplexity: 0,
    environmentalDetail: 50,
    historicalDepth: 30,
    sensoryRichness: 60,
  },
  toneStyle: {
    primaryTone: 'serious',
    proseStyle: 'literary',
    vocabularyLevel: 'moderate',
    sentenceVariety: 60,
    metaphorDensity: 40,
    humorLevel: 30,
    violenceLevel: 'moderate',
    romanceLevel: 'subtle',
    descriptiveBalance: 50,
    emotionalIntensity: 60,
  },
  theme: {
    primaryTheme: 'identity',
    secondaryThemes: ['survival', 'redemption'],
    moralComplexity: 50,
    socialCommentary: 30,
    philosophicalDepth: 40,
    symbolismDensity: 30,
    allegoricalLevel: 20,
  },
  modelSettings: {
    modelSelection: 'llama3-70b-8192',
    temperature: 0.8,
    maxTokens: 4096,
    topP: 0.9,
    topK: 50,
    frequencyPenalty: 0,
    presencePenalty: 0,
    repetitionPenalty: 1.0,
    stopSequences: [],
  },
  visual: {
    coverImageStyle: 'digital-art',
    colorPalette: 'vibrant',
    illustrationFrequency: 'chapter-headers',
    artDirection: '',
    aspectRatio: '3:4',
    visualMoodBoard: [],
  },
  length: {
    targetWordCount: 5000,
    chapterCount: 5,
    averageChapterLength: 1000,
    sceneLength: 'medium',
    prologueIncluded: false,
    epilogueIncluded: false,
    formatType: 'short-story',
  },
  advanced: {
    pointOfView: 'third-person-limited',
    tenseConsistency: 'past',
    unreliableNarrator: false,
    metafictionalElements: 0,
    experimentalTechniques: [],
    targetAudience: 'adult',
    contentWarnings: [],
    genreMashup: ['literary'],
    customInstructions: '',
    seedPhrase: '',
  },
};

// ============================================================
// CATEGORY CONFIGURATION
// ============================================================
export interface CategoryConfig {
  title: string;
  description: string;
  icon: string;
  order: number;
}

export const CATEGORY_CONFIG: Record<CategoryKey, CategoryConfig> = {
  storyStructure: {
    title: 'Story Structure',
    description: 'Control narrative flow, pacing, and dramatic structure',
    icon: 'book-open',
    order: 1,
  },
  characters: {
    title: 'Characters',
    description: 'Define protagonist depth, supporting cast, and dialogue style',
    icon: 'users',
    order: 2,
  },
  world: {
    title: 'World Building',
    description: 'Shape the setting, geography, and environmental details',
    icon: 'globe',
    order: 3,
  },
  toneStyle: {
    title: 'Tone & Style',
    description: 'Set the emotional tone, prose style, and vocabulary',
    icon: 'theater',
    order: 4,
  },
  theme: {
    title: 'Themes',
    description: 'Choose primary and secondary themes for your story',
    icon: 'lightbulb',
    order: 5,
  },
  modelSettings: {
    title: 'AI Model Settings',
    description: 'Fine-tune Groq AI parameters for generation',
    icon: 'bot',
    order: 6,
  },
  visual: {
    title: 'Visual Style',
    description: 'Configure cover art and illustration preferences',
    icon: 'palette',
    order: 7,
  },
  length: {
    title: 'Length & Format',
    description: 'Set word count, chapter structure, and story format',
    icon: 'ruler',
    order: 8,
  },
  advanced: {
    title: 'Advanced Options',
    description: 'POV, experimental techniques, and custom instructions',
    icon: 'settings',
    order: 9,
  },
};

// ============================================================
// BUILT-IN PRESETS
// ============================================================
export const BUILT_IN_PRESETS: Record<string, Omit<ProPreset, 'timestamp'>> = {
  'noir-dossier': {
    name: 'Noir Dossier',
    description: 'Gritty detective fiction with shadowy atmospherics and moral ambiguity',
    version: 1,
    parameters: {
      ...DEFAULT_PARAMETERS,
      storyStructure: {
        ...DEFAULT_PARAMETERS.storyStructure,
        narrativeStyle: 'linear',
        pacing: 'slow-burn',
        actStructure: 'three-act',
        plotComplexity: 75,
        conflictIntensity: 80,
        resolutionStyle: 'ambiguous',
        flashbackFrequency: 50,
        foreshadowingLevel: 70,
      },
      characters: {
        ...DEFAULT_PARAMETERS.characters,
        protagonistDepth: 85,
        antagonistComplexity: 80,
        supportingCastSize: 'moderate',
        characterVoiceDistinctness: 80,
        relationshipComplexity: 70,
        characterGrowthArc: 'disillusionment',
        backstoryIntegration: 60,
        dialogueStyle: 'stylized',
        internalMonologueFrequency: 70,
      },
      world: {
        ...DEFAULT_PARAMETERS.world,
        worldBuildingDepth: 70,
        settingType: 'real-world-contemporary',
        geographicScope: 'city',
        cultureDetailLevel: 60,
        technologyLevel: 'modern',
        environmentalDetail: 80,
        sensoryRichness: 85,
      },
      toneStyle: {
        ...DEFAULT_PARAMETERS.toneStyle,
        primaryTone: 'dark',
        proseStyle: 'literary',
        vocabularyLevel: 'advanced',
        sentenceVariety: 70,
        metaphorDensity: 75,
        humorLevel: 20,
        violenceLevel: 'moderate',
        romanceLevel: 'subtle',
        descriptiveBalance: 60,
        emotionalIntensity: 75,
      },
      theme: {
        ...DEFAULT_PARAMETERS.theme,
        primaryTheme: 'corruption',
        secondaryThemes: ['justice', 'betrayal', 'isolation'],
        moralComplexity: 85,
        socialCommentary: 60,
        philosophicalDepth: 50,
        symbolismDensity: 60,
        allegoricalLevel: 40,
      },
      visual: {
        ...DEFAULT_PARAMETERS.visual,
        coverImageStyle: 'noir',
        colorPalette: 'monochromatic',
        illustrationFrequency: 'chapter-headers',
      },
      advanced: {
        ...DEFAULT_PARAMETERS.advanced,
        pointOfView: 'first-person',
        genreMashup: ['noir', 'mystery'],
      },
    },
  },
  'fast-thriller': {
    name: 'Fast Thriller',
    description: 'High-octane action with relentless pacing and intense stakes',
    version: 1,
    parameters: {
      ...DEFAULT_PARAMETERS,
      storyStructure: {
        ...DEFAULT_PARAMETERS.storyStructure,
        narrativeStyle: 'linear',
        pacing: 'breakneck',
        actStructure: 'fichtean-curve',
        plotComplexity: 65,
        conflictIntensity: 95,
        resolutionStyle: 'conclusive',
        flashbackFrequency: 15,
        foreshadowingLevel: 50,
      },
      characters: {
        ...DEFAULT_PARAMETERS.characters,
        protagonistDepth: 60,
        antagonistComplexity: 55,
        supportingCastSize: 'small',
        characterVoiceDistinctness: 55,
        relationshipComplexity: 40,
        characterGrowthArc: 'positive-change',
        backstoryIntegration: 25,
        dialogueStyle: 'minimal',
        internalMonologueFrequency: 20,
      },
      toneStyle: {
        ...DEFAULT_PARAMETERS.toneStyle,
        primaryTone: 'suspenseful',
        proseStyle: 'cinematic',
        vocabularyLevel: 'simple',
        sentenceVariety: 80,
        metaphorDensity: 20,
        humorLevel: 15,
        violenceLevel: 'graphic',
        descriptiveBalance: 30,
        emotionalIntensity: 85,
      },
      theme: {
        ...DEFAULT_PARAMETERS.theme,
        primaryTheme: 'survival',
        secondaryThemes: ['justice', 'sacrifice'],
        moralComplexity: 35,
      },
      modelSettings: {
        ...DEFAULT_PARAMETERS.modelSettings,
        temperature: 0.9,
        maxTokens: 8192,
      },
      advanced: {
        ...DEFAULT_PARAMETERS.advanced,
        pointOfView: 'third-person-limited',
        genreMashup: ['thriller', 'action'],
      },
    },
  },
  'epic-fantasy': {
    name: 'Epic Fantasy',
    description: 'Grand adventures in richly detailed magical worlds',
    version: 1,
    parameters: {
      ...DEFAULT_PARAMETERS,
      storyStructure: {
        ...DEFAULT_PARAMETERS.storyStructure,
        narrativeStyle: 'episodic',
        pacing: 'moderate',
        actStructure: 'heros-journey',
        plotComplexity: 85,
        conflictIntensity: 75,
        resolutionStyle: 'conclusive',
        flashbackFrequency: 30,
        foreshadowingLevel: 80,
      },
      characters: {
        ...DEFAULT_PARAMETERS.characters,
        protagonistDepth: 90,
        antagonistComplexity: 85,
        supportingCastSize: 'ensemble',
        characterVoiceDistinctness: 75,
        relationshipComplexity: 80,
        characterGrowthArc: 'positive-change',
        backstoryIntegration: 70,
        dialogueStyle: 'stylized',
        internalMonologueFrequency: 50,
      },
      world: {
        ...DEFAULT_PARAMETERS.world,
        worldBuildingDepth: 95,
        settingType: 'high-fantasy',
        geographicScope: 'world',
        cultureDetailLevel: 85,
        technologyLevel: 'medieval',
        magicSystemComplexity: 80,
        environmentalDetail: 90,
        historicalDepth: 85,
        sensoryRichness: 80,
      },
      toneStyle: {
        ...DEFAULT_PARAMETERS.toneStyle,
        primaryTone: 'hopeful',
        proseStyle: 'literary',
        vocabularyLevel: 'advanced',
        sentenceVariety: 70,
        metaphorDensity: 60,
        violenceLevel: 'moderate',
        emotionalIntensity: 70,
      },
      theme: {
        ...DEFAULT_PARAMETERS.theme,
        primaryTheme: 'good-vs-evil',
        secondaryThemes: ['sacrifice', 'identity', 'power'],
        moralComplexity: 60,
        philosophicalDepth: 55,
        symbolismDensity: 65,
      },
      visual: {
        ...DEFAULT_PARAMETERS.visual,
        coverImageStyle: 'illustration',
        colorPalette: 'vibrant',
      },
      length: {
        ...DEFAULT_PARAMETERS.length,
        targetWordCount: 80000,
        chapterCount: 30,
        averageChapterLength: 2500,
        formatType: 'novel',
        prologueIncluded: true,
        epilogueIncluded: true,
      },
      advanced: {
        ...DEFAULT_PARAMETERS.advanced,
        pointOfView: 'multiple-pov',
        genreMashup: ['fantasy', 'drama'],
      },
    },
  },
  'cozy-mystery': {
    name: 'Cozy Mystery',
    description: 'Charming whodunits with quirky characters and low-stakes violence',
    version: 1,
    parameters: {
      ...DEFAULT_PARAMETERS,
      storyStructure: {
        ...DEFAULT_PARAMETERS.storyStructure,
        narrativeStyle: 'linear',
        pacing: 'moderate',
        actStructure: 'three-act',
        plotComplexity: 70,
        conflictIntensity: 40,
        resolutionStyle: 'conclusive',
        flashbackFrequency: 25,
        foreshadowingLevel: 60,
      },
      characters: {
        ...DEFAULT_PARAMETERS.characters,
        protagonistDepth: 75,
        antagonistComplexity: 50,
        supportingCastSize: 'large',
        characterVoiceDistinctness: 80,
        relationshipComplexity: 60,
        characterGrowthArc: 'flat-arc',
        dialogueStyle: 'witty',
        internalMonologueFrequency: 50,
      },
      toneStyle: {
        ...DEFAULT_PARAMETERS.toneStyle,
        primaryTone: 'whimsical',
        proseStyle: 'conversational',
        vocabularyLevel: 'moderate',
        humorLevel: 65,
        violenceLevel: 'mild',
        emotionalIntensity: 45,
      },
      theme: {
        ...DEFAULT_PARAMETERS.theme,
        primaryTheme: 'justice',
        secondaryThemes: ['friendship', 'identity'],
        moralComplexity: 30,
      },
      advanced: {
        ...DEFAULT_PARAMETERS.advanced,
        pointOfView: 'first-person',
        targetAudience: 'adult',
        genreMashup: ['mystery', 'comedy'],
      },
    },
  },
  'literary-fiction': {
    name: 'Literary Fiction',
    description: 'Character-driven narratives with deep introspection and thematic weight',
    version: 1,
    parameters: {
      ...DEFAULT_PARAMETERS,
      storyStructure: {
        ...DEFAULT_PARAMETERS.storyStructure,
        narrativeStyle: 'nonlinear',
        pacing: 'slow-burn',
        actStructure: 'kishōtenketsu',
        plotComplexity: 60,
        conflictIntensity: 50,
        resolutionStyle: 'ambiguous',
        flashbackFrequency: 60,
        foreshadowingLevel: 55,
      },
      characters: {
        ...DEFAULT_PARAMETERS.characters,
        protagonistDepth: 95,
        antagonistComplexity: 70,
        supportingCastSize: 'small',
        characterVoiceDistinctness: 90,
        relationshipComplexity: 85,
        characterGrowthArc: 'positive-change',
        backstoryIntegration: 80,
        dialogueStyle: 'naturalistic',
        internalMonologueFrequency: 85,
      },
      toneStyle: {
        ...DEFAULT_PARAMETERS.toneStyle,
        primaryTone: 'melancholic',
        proseStyle: 'lyrical',
        vocabularyLevel: 'advanced',
        sentenceVariety: 90,
        metaphorDensity: 85,
        humorLevel: 20,
        violenceLevel: 'mild',
        descriptiveBalance: 70,
        emotionalIntensity: 80,
      },
      theme: {
        ...DEFAULT_PARAMETERS.theme,
        primaryTheme: 'identity',
        secondaryThemes: ['loss-and-grief', 'family', 'isolation'],
        moralComplexity: 90,
        socialCommentary: 70,
        philosophicalDepth: 85,
        symbolismDensity: 80,
        allegoricalLevel: 60,
      },
      advanced: {
        ...DEFAULT_PARAMETERS.advanced,
        pointOfView: 'third-person-omniscient',
        experimentalTechniques: ['stream-of-consciousness', 'multiple-timelines'],
        genreMashup: ['literary', 'drama'],
      },
    },
  },
  'sci-fi-adventure': {
    name: 'Sci-Fi Adventure',
    description: 'Futuristic exploration with technology, space, and wonder',
    version: 1,
    parameters: {
      ...DEFAULT_PARAMETERS,
      storyStructure: {
        ...DEFAULT_PARAMETERS.storyStructure,
        narrativeStyle: 'episodic',
        pacing: 'fast-paced',
        actStructure: 'three-act',
        plotComplexity: 75,
        conflictIntensity: 70,
        resolutionStyle: 'conclusive',
        foreshadowingLevel: 55,
      },
      characters: {
        ...DEFAULT_PARAMETERS.characters,
        protagonistDepth: 70,
        antagonistComplexity: 65,
        supportingCastSize: 'moderate',
        characterVoiceDistinctness: 65,
        relationshipComplexity: 55,
        characterGrowthArc: 'positive-change',
        dialogueStyle: 'naturalistic',
      },
      world: {
        ...DEFAULT_PARAMETERS.world,
        worldBuildingDepth: 85,
        settingType: 'science-fiction',
        geographicScope: 'multiverse',
        cultureDetailLevel: 70,
        technologyLevel: 'far-future',
        magicSystemComplexity: 0,
        environmentalDetail: 80,
        historicalDepth: 50,
        sensoryRichness: 75,
      },
      toneStyle: {
        ...DEFAULT_PARAMETERS.toneStyle,
        primaryTone: 'hopeful',
        proseStyle: 'cinematic',
        vocabularyLevel: 'specialized',
        emotionalIntensity: 65,
      },
      theme: {
        ...DEFAULT_PARAMETERS.theme,
        primaryTheme: 'identity',
        secondaryThemes: ['nature-vs-technology', 'freedom', 'survival'],
        philosophicalDepth: 60,
      },
      visual: {
        ...DEFAULT_PARAMETERS.visual,
        coverImageStyle: 'digital-art',
        colorPalette: 'neon',
      },
      advanced: {
        ...DEFAULT_PARAMETERS.advanced,
        pointOfView: 'third-person-limited',
        genreMashup: ['sci-fi', 'action'],
      },
    },
  },
};

// ============================================================
// GENRE PRESET METADATA (for cards with images)
// ============================================================
export interface GenrePresetMeta {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  badge: string;
  caseId: string;
  archetype: string;
}

export const GENRE_PRESET_META: GenrePresetMeta[] = [
  {
    id: 'fantasy',
    title: 'Fantasy',
    description: 'Magical worlds, epic quests, and legendary heroes',
    imageUrl: '/images/presets/genre-fantasy.jpg',
    badge: 'FANTASY',
    caseId: 'FNTSY-01',
    archetype: 'THE WIZARD',
  },
  {
    id: 'sci-fi',
    title: 'Sci-Fi',
    description: 'Futuristic technology, space exploration, and alien encounters',
    imageUrl: '/images/presets/genre-sci-fi.jpg',
    badge: 'SCI-FI',
    caseId: 'SCFI-02',
    archetype: 'THE EXPLORER',
  },
  {
    id: 'horror',
    title: 'Horror',
    description: 'Dark terrors, supernatural dread, and spine-chilling suspense',
    imageUrl: '/images/presets/genre-horror.jpg',
    badge: 'HORROR',
    caseId: 'HORR-03',
    archetype: 'THE SURVIVOR',
  },
  {
    id: 'mystery',
    title: 'Mystery',
    description: 'Puzzling cases, hidden clues, and shocking revelations',
    imageUrl: '/images/presets/genre-mystery.jpg',
    badge: 'MYSTERY',
    caseId: 'MYST-04',
    archetype: 'THE DETECTIVE',
  },
  {
    id: 'romance',
    title: 'Romance',
    description: 'Passionate love stories with emotional depth and chemistry',
    imageUrl: '/images/presets/genre-romance.jpg',
    badge: 'ROMANCE',
    caseId: 'RMNC-05',
    archetype: 'THE LOVER',
  },
  {
    id: 'adventure',
    title: 'Adventure',
    description: 'Daring expeditions, treasure hunts, and thrilling discoveries',
    imageUrl: '/images/presets/genre-adventure.jpg',
    badge: 'ADVENTURE',
    caseId: 'ADVN-06',
    archetype: 'THE HERO',
  },
  {
    id: 'comedy',
    title: 'Comedy',
    description: 'Witty humor, absurd situations, and laugh-out-loud moments',
    imageUrl: '/images/presets/genre-comedy.jpg',
    badge: 'COMEDY',
    caseId: 'CMDY-07',
    archetype: 'THE TRICKSTER',
  },
  {
    id: 'cyberpunk',
    title: 'Cyberpunk',
    description: 'Neon-lit dystopias, AI rebels, and high-tech underworlds',
    imageUrl: '/images/presets/genre-cyberpunk.jpg',
    badge: 'CYBERPUNK',
    caseId: 'CYBR-08',
    archetype: 'THE HACKER',
  },
  {
    id: 'thriller',
    title: 'Thriller',
    description: 'High-stakes tension, dangerous conspiracies, and edge-of-seat action',
    imageUrl: '/images/presets/genre-thriller.jpg',
    badge: 'THRILLER',
    caseId: 'THRL-09',
    archetype: 'THE AGENT',
  },
  {
    id: 'drama',
    title: 'Drama',
    description: 'Deep emotional narratives with complex characters and real conflicts',
    imageUrl: '/images/presets/genre-drama.jpg',
    badge: 'DRAMA',
    caseId: 'DRMA-10',
    archetype: 'THE NARRATOR',
  },
];

// ============================================================
// HELPER: Convert built-in presets to full PresetSchema format
// ============================================================
export function initializeBuiltInPresets(): Record<string, Omit<ProPreset, 'timestamp'> & { timestamp: number }> {
  const timestamp = Date.now();
  const result: Record<string, ProPreset> = {};

  for (const [key, preset] of Object.entries(BUILT_IN_PRESETS)) {
    result[key] = {
      ...preset,
      timestamp,
    };
  }

  return result;
}
