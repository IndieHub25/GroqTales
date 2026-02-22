/**
 * Pro Panel Zod Schemas
 * Type-safe validation for 70+ parameters across 9 categories
 */

import { z } from 'zod';

// ============================================================
// STORY STRUCTURE SCHEMA
// ============================================================
export const StoryStructureSchema = z.object({
  // Narrative structure
  narrativeStyle: z.enum([
    'linear',
    'nonlinear',
    'episodic',
    'circular',
    'parallel',
    'frame-story',
    'stream-of-consciousness',
  ]).describe('The overall narrative structure'),
  
  pacing: z.enum([
    'slow-burn',
    'moderate',
    'fast-paced',
    'breakneck',
    'variable',
  ]).describe('Story pacing speed'),
  
  actStructure: z.enum([
    'three-act',
    'five-act',
    'heros-journey',
    'kishōtenketsu',
    'seven-point',
    'fichtean-curve',
  ]).describe('Dramatic structure framework'),
  
  plotComplexity: z.number().min(0).max(100).describe('Complexity of plot threads (0-100)'),
  
  conflictIntensity: z.number().min(0).max(100).describe('Level of conflict intensity (0-100)'),
  
  resolutionStyle: z.enum([
    'conclusive',
    'open-ended',
    'ambiguous',
    'twist-ending',
    'cliffhanger',
    'bittersweet',
  ]).describe('How the story concludes'),
  
  flashbackFrequency: z.number().min(0).max(100).describe('Use of flashbacks (0-100)'),
  
  foreshadowingLevel: z.number().min(0).max(100).describe('Amount of foreshadowing (0-100)'),
});

// ============================================================
// CHARACTER SCHEMA
// ============================================================
export const CharacterSchema = z.object({
  protagonistDepth: z.number().min(0).max(100).describe('Depth of protagonist development (0-100)'),
  
  antagonistComplexity: z.number().min(0).max(100).describe('Moral complexity of antagonist (0-100)'),
  
  supportingCastSize: z.enum([
    'minimal',
    'small',
    'moderate',
    'large',
    'ensemble',
  ]).describe('Number of supporting characters'),
  
  characterVoiceDistinctness: z.number().min(0).max(100).describe('How distinct character voices are (0-100)'),
  
  relationshipComplexity: z.number().min(0).max(100).describe('Complexity of character relationships (0-100)'),
  
  characterGrowthArc: z.enum([
    'positive-change',
    'negative-change',
    'flat-arc',
    'disillusionment',
    'fall-and-rise',
    'steadfast',
  ]).describe('Type of character development arc'),
  
  backstoryIntegration: z.number().min(0).max(100).describe('How much backstory is woven in (0-100)'),
  
  dialogueStyle: z.enum([
    'naturalistic',
    'stylized',
    'minimal',
    'verbose',
    'witty',
    'poetic',
  ]).describe('Style of character dialogue'),
  
  internalMonologueFrequency: z.number().min(0).max(100).describe('Amount of internal thoughts shown (0-100)'),
});

// ============================================================
// WORLD SCHEMA
// ============================================================
export const WorldSchema = z.object({
  worldBuildingDepth: z.number().min(0).max(100).describe('Detail level of world building (0-100)'),
  
  settingType: z.enum([
    'real-world-contemporary',
    'real-world-historical',
    'alternate-history',
    'low-fantasy',
    'high-fantasy',
    'science-fiction',
    'post-apocalyptic',
    'dystopian',
    'urban-fantasy',
    'steampunk',
    'cyberpunk',
  ]).describe('Primary setting genre'),
  
  geographicScope: z.enum([
    'single-location',
    'city',
    'region',
    'country',
    'continent',
    'world',
    'multiverse',
  ]).describe('Geographic scope of the story'),
  
  cultureDetailLevel: z.number().min(0).max(100).describe('Detail of cultural elements (0-100)'),
  
  technologyLevel: z.enum([
    'primitive',
    'medieval',
    'renaissance',
    'industrial',
    'modern',
    'near-future',
    'far-future',
    'mixed',
  ]).describe('Technology level of the world'),
  
  magicSystemComplexity: z.number().min(0).max(100).describe('Complexity of magic/supernatural systems (0-100)'),
  
  environmentalDetail: z.number().min(0).max(100).describe('Detail of environmental descriptions (0-100)'),
  
  historicalDepth: z.number().min(0).max(100).describe('World history integration (0-100)'),
  
  sensoryRichness: z.number().min(0).max(100).describe('Sensory detail in descriptions (0-100)'),
});

// ============================================================
// TONE & STYLE SCHEMA
// ============================================================
export const ToneStyleSchema = z.object({
  primaryTone: z.enum([
    'serious',
    'humorous',
    'satirical',
    'dark',
    'hopeful',
    'melancholic',
    'suspenseful',
    'romantic',
    'whimsical',
    'gritty',
  ]).describe('Primary emotional tone'),
  
  proseStyle: z.enum([
    'minimalist',
    'literary',
    'pulpy',
    'journalistic',
    'lyrical',
    'cinematic',
    'conversational',
  ]).describe('Writing style'),
  
  vocabularyLevel: z.enum([
    'simple',
    'moderate',
    'advanced',
    'specialized',
    'archaic',
  ]).describe('Vocabulary complexity'),
  
  sentenceVariety: z.number().min(0).max(100).describe('Variety in sentence structure (0-100)'),
  
  metaphorDensity: z.number().min(0).max(100).describe('Use of metaphors and similes (0-100)'),
  
  humorLevel: z.number().min(0).max(100).describe('Amount of humor (0-100)'),
  
  violenceLevel: z.enum([
    'none',
    'mild',
    'moderate',
    'graphic',
    'extreme',
  ]).describe('Level of violence depicted'),
  
  romanceLevel: z.enum([
    'none',
    'subtle',
    'moderate',
    'prominent',
    'central',
  ]).describe('Romance prominence'),
  
  descriptiveBalance: z.number().min(0).max(100).describe('Balance between action and description (0-100)'),
  
  emotionalIntensity: z.number().min(0).max(100).describe('Emotional intensity of scenes (0-100)'),
});

// ============================================================
// THEME SCHEMA
// ============================================================
export const ThemeSchema = z.object({
  primaryTheme: z.enum([
    'love',
    'redemption',
    'revenge',
    'identity',
    'power',
    'survival',
    'justice',
    'freedom',
    'sacrifice',
    'coming-of-age',
    'loss-and-grief',
    'good-vs-evil',
    'nature-vs-technology',
    'isolation',
    'corruption',
  ]).describe('Central theme of the story'),
  
  secondaryThemes: z.array(z.enum([
    'love',
    'redemption',
    'revenge',
    'identity',
    'power',
    'survival',
    'justice',
    'freedom',
    'sacrifice',
    'coming-of-age',
    'loss-and-grief',
    'good-vs-evil',
    'nature-vs-technology',
    'isolation',
    'corruption',
    'family',
    'friendship',
    'betrayal',
    'hope',
    'faith',
  ])).max(5).describe('Supporting themes (max 5)'),
  
  moralComplexity: z.number().min(0).max(100).describe('Moral ambiguity level (0-100)'),
  
  socialCommentary: z.number().min(0).max(100).describe('Level of social commentary (0-100)'),
  
  philosophicalDepth: z.number().min(0).max(100).describe('Philosophical exploration (0-100)'),
  
  symbolismDensity: z.number().min(0).max(100).describe('Use of symbolism (0-100)'),
  
  allegoricalLevel: z.number().min(0).max(100).describe('Allegorical content (0-100)'),
});

// ============================================================
// MODEL SETTINGS SCHEMA (Maps to real Groq API parameters)
// ============================================================
export const ModelSettingsSchema = z.object({
  modelSelection: z.enum([
    'llama3-70b-8192',
    'llama3-8b-8192',
    'mixtral-8x7b-32768',
    'gemma-7b-it',
    'gemma2-9b-it',
    'llama-3.1-70b-versatile',
    'llama-3.1-8b-instant',
    'llama-3.2-90b-vision-preview',
    'llama-3.3-70b-versatile',
  ]).describe('Groq AI model to use'),
  
  temperature: z.number().min(0).max(2).describe('Randomness of output (0-2)'),
  
  maxTokens: z.number().min(256).max(32768).describe('Maximum tokens to generate (256-32768)'),
  
  topP: z.number().min(0).max(1).describe('Nucleus sampling threshold (0-1)'),
  
  topK: z.number().min(1).max(100).int().describe('Top-K sampling (1-100)'),
  
  frequencyPenalty: z.number().min(-2).max(2).describe('Frequency penalty (-2 to 2)'),
  
  presencePenalty: z.number().min(-2).max(2).describe('Presence penalty (-2 to 2)'),
  
  repetitionPenalty: z.number().min(0).max(2).describe('Repetition penalty (0-2)'),
  
  stopSequences: z.array(z.string().max(50)).max(4).describe('Stop sequences (max 4)'),
});

// ============================================================
// VISUAL SCHEMA
// ============================================================
export const VisualSchema = z.object({
  coverImageStyle: z.enum([
    'photorealistic',
    'digital-art',
    'illustration',
    'comic-book',
    'watercolor',
    'oil-painting',
    'minimalist',
    'noir',
    'vintage',
    'abstract',
  ]).describe('Style for generated cover images'),
  
  colorPalette: z.enum([
    'vibrant',
    'muted',
    'monochromatic',
    'warm',
    'cool',
    'earth-tones',
    'neon',
    'pastel',
    'dark',
    'high-contrast',
  ]).describe('Color palette for visuals'),
  
  illustrationFrequency: z.enum([
    'none',
    'chapter-headers',
    'key-scenes',
    'frequent',
    'graphic-novel',
  ]).describe('How often illustrations appear'),
  
  artDirection: z.string().max(500).describe('Custom art direction notes'),
  
  aspectRatio: z.enum([
    '1:1',
    '4:3',
    '16:9',
    '3:4',
    '9:16',
    '2:3',
  ]).describe('Preferred aspect ratio'),
  
  visualMoodBoard: z.array(z.string().max(100)).max(10).describe('Reference mood keywords'),
});

// ============================================================
// LENGTH SCHEMA
// ============================================================
export const LengthSchema = z.object({
  targetWordCount: z.number().min(100).max(200000).describe('Target word count'),
  
  chapterCount: z.number().min(1).max(100).int().describe('Number of chapters'),
  
  averageChapterLength: z.number().min(100).max(10000).describe('Average words per chapter'),
  
  sceneLength: z.enum([
    'short',
    'medium',
    'long',
    'variable',
  ]).describe('Typical scene length'),
  
  prologueIncluded: z.boolean().describe('Include a prologue'),
  
  epilogueIncluded: z.boolean().describe('Include an epilogue'),
  
  formatType: z.enum([
    'flash-fiction',
    'short-story',
    'novelette',
    'novella',
    'novel',
    'epic',
  ]).describe('Story format type'),
});

// ============================================================
// ADVANCED SCHEMA
// ============================================================
export const AdvancedSchema = z.object({
  pointOfView: z.enum([
    'first-person',
    'second-person',
    'third-person-limited',
    'third-person-omniscient',
    'multiple-pov',
  ]).describe('Narrative point of view'),
  
  tenseConsistency: z.enum([
    'past',
    'present',
    'future',
    'mixed',
  ]).describe('Verb tense for narration'),
  
  unreliableNarrator: z.boolean().describe('Use unreliable narrator technique'),
  
  metafictionalElements: z.number().min(0).max(100).describe('Self-referential elements (0-100)'),
  
  experimentalTechniques: z.array(z.enum([
    'stream-of-consciousness',
    'epistolary',
    'multiple-timelines',
    'second-person',
    'footnotes',
    'mixed-media',
    'choose-your-path',
    'unreliable-narrator',
    'non-linear',
  ])).max(5).describe('Experimental writing techniques'),
  
  targetAudience: z.enum([
    'children',
    'middle-grade',
    'young-adult',
    'new-adult',
    'adult',
    'mature',
  ]).describe('Target reader audience'),
  
  contentWarnings: z.array(z.string().max(50)).max(10).describe('Content warnings to include'),
  
  genreMashup: z.array(z.enum([
    'fantasy',
    'sci-fi',
    'romance',
    'thriller',
    'mystery',
    'horror',
    'literary',
    'historical',
    'comedy',
    'drama',
    'action',
    'noir',
  ])).max(3).describe('Genre combinations (max 3)'),
  
  customInstructions: z.string().max(2000).describe('Additional custom instructions'),
  
  seedPhrase: z.string().max(500).describe('Optional seed phrase for consistency'),
});

// ============================================================
// COMBINED PARAMETERS SCHEMA
// ============================================================
export const ParametersSchema = z.object({
  storyStructure: StoryStructureSchema,
  characters: CharacterSchema,
  world: WorldSchema,
  toneStyle: ToneStyleSchema,
  theme: ThemeSchema,
  modelSettings: ModelSettingsSchema,
  visual: VisualSchema,
  length: LengthSchema,
  advanced: AdvancedSchema,
});

// ============================================================
// PRESET SCHEMAS
// ============================================================
export const PresetSchema = z.object({
  name: z.string().min(1).max(100).describe('Preset name'),
  description: z.string().max(500).optional().describe('Preset description'),
  timestamp: z.number().describe('Unix timestamp of creation/update'),
  version: z.number().int().min(1).describe('Schema version'),
  parameters: ParametersSchema,
});

export const PresetsCollectionSchema = z.record(z.string(), PresetSchema);

// ============================================================
// TYPE EXPORTS
// ============================================================
export type StoryStructure = z.infer<typeof StoryStructureSchema>;
export type Character = z.infer<typeof CharacterSchema>;
export type World = z.infer<typeof WorldSchema>;
export type ToneStyle = z.infer<typeof ToneStyleSchema>;
export type Theme = z.infer<typeof ThemeSchema>;
export type ModelSettings = z.infer<typeof ModelSettingsSchema>;
export type Visual = z.infer<typeof VisualSchema>;
export type Length = z.infer<typeof LengthSchema>;
export type Advanced = z.infer<typeof AdvancedSchema>;
export type ProParameters = z.infer<typeof ParametersSchema>;
export type ProPreset = z.infer<typeof PresetSchema>;
export type PresetsCollection = z.infer<typeof PresetsCollectionSchema>;

// ============================================================
// CATEGORY KEYS TYPE
// ============================================================
export type CategoryKey = keyof ProParameters;
export const CATEGORY_KEYS: CategoryKey[] = [
  'storyStructure',
  'characters',
  'world',
  'toneStyle',
  'theme',
  'modelSettings',
  'visual',
  'length',
  'advanced',
] as const;
