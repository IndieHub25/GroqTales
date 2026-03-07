/**
 * AI Story Studio Configuration Schema
 * Defines all 70+ configurable parameters for story generation
 * Grouped into 9 logical categories for the tab-based UI
 */

import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════
// 1. CORE SETUP (14 parameters)
// ═══════════════════════════════════════════════════════════════

const CoreSetupSchema = z.object({
  mode: z.enum(['story-only', 'story-comic', 'comic-only']).describe('Story generation mode'),
  primaryGenre: z.string().describe('Primary genre (fantasy, sci-fi, mystery, etc.)'),
  secondaryGenres: z.array(z.string()).max(3).describe('Up to 3 secondary genres'),
  subgenre: z.string().optional().describe('Specific subgenre (Space Opera, Cyberpunk, etc.)'),
  targetLength: z.enum(['short-story', 'novella', 'episode', 'novel']).describe('Target story length'),
  targetWordCount: z.number().min(500).max(100000).optional().describe('Specific word count target'),
  narrativePOV: z.enum(['first-person', 'third-limited', 'third-omniscient', 'rotating']).describe('Narrative point of view'),
  tense: z.enum(['past', 'present']).describe('Narrative tense'),
  language: z.string().default('en').describe('Language and locale'),
  audienceRating: z.enum(['all-ages', 'teen-13', 'mature-18']).describe('Content rating'),
  voiceStyle: z.string().optional().describe('Specific voice or writing style preference'),
  customPremise: z.string().optional().describe('User-provided story premise or hook'),
  includeCharacterSheet: z.boolean().default(true).describe('Include character sheet in output'),
  includeOutline: z.boolean().default(true).describe('Include chapter/scene outline in output'),
});

// ═══════════════════════════════════════════════════════════════
// 2. WORLD & TONE (12 parameters)
// ═══════════════════════════════════════════════════════════════

const WorldToneSchema = z.object({
  worldComplexity: z.enum(['low', 'medium', 'high']).describe('How much lore and worldbuilding'),
  techLevel: z.enum(['pre-industrial', 'modern', 'near-future', 'far-future']).describe('Technology level of the setting'),
  magicHardness: z.enum(['soft', 'medium', 'hard']).optional().describe('How restrictive/defined magic is'),
  tone: z.array(z.enum([
    'hopeful', 'grim', 'wholesome', 'dark', 'satirical', 'whimsical', 'epic', 'slice-of-life'
  ])).max(3).describe('Primary tone(s) of the story'),
  pacing: z.enum(['slow-burn', 'balanced', 'fast-paced']).describe('Story pacing'),
  humorLevel: z.enum(['none', 'light', 'high']).describe('Amount of humor'),
  violenceIntensity: z.number().min(0).max(10).describe('Violence intensity slider (0-10)'),
  romanceIntensity: z.number().min(0).max(10).describe('Romance/relationship intensity (0-10)'),
  loreDensity: z.number().min(0).max(10).describe('How much exposition and lore (0-10)'),
  emotionalDepth: z.enum(['light', 'moderate', 'profound']).describe('Emotional resonance target'),
  ambitionLevel: z.enum(['personal', 'regional', 'global', 'cosmic']).describe('Scale of stakes'),
  isolationLevel: z.enum(['isolated', 'small-community', 'connected']).describe('Character isolation level'),
});

// ═══════════════════════════════════════════════════════════════
// 3. CHARACTER DESIGN (15 parameters)
// ═══════════════════════════════════════════════════════════════

const CharacterDesignSchema = z.object({
  mainCharacterCount: z.number().min(1).max(10).describe('Number of main protagonists'),
  supportingCharacterCount: z.number().min(0).max(20).describe('Number of important supporting cast'),
  protagonistArchetype: z.enum([
    'reluctant-hero', 'antihero', 'detective', 'chosen-one', 'trickster', 'mentor', 'everyperson', 'leader'
  ]).describe('Protagonist character archetype'),
  antagonistType: z.enum(['person', 'system', 'nature', 'monster', 'internal-conflict', 'absent']).describe('Type of antagonist'),
  moralAlignment: z.enum(['clear-good-evil', 'grey-ambiguous', 'corrupt-world']).describe('Moral spectrum of story'),
  characterArcType: z.enum(['growth', 'redemption', 'corruption', 'tragedy', 'static', 'hybrid']).describe('Character arc type'),
  diversityPreferences: z.array(z.string()).optional().describe('Diversity preferences for names, cultures, appearances'),
  traitBanList: z.string().optional().describe('Character traits or tropes to avoid'),
  relationshipDynamics: z.array(z.string()).optional().describe('Key relationships (mentor-student, rivals, siblings, etc.)'),
  characterVoiceDistinction: z.enum(['minimal', 'moderate', 'highly-distinct']).describe('How distinct character voices are'),
  conflictType: z.array(z.enum([
    'external-action', 'internal-struggle', 'relationship-tension', 'mystery', 'moral-dilemma'
  ])).describe('Types of conflict to include'),
  characterCompetence: z.enum(['struggling', 'capable', 'expert', 'superhuman']).describe('Character competence level'),
  namingScheme: z.enum(['western', 'fantasy', 'cultural-specific', 'unique', 'minimal']).describe('Character naming style'),
  ageRange: z.string().optional().describe('Age range of protagonists'),
  enableFlashbacks: z.boolean().default(false).describe('Include character backstory flashbacks'),
});

// ═══════════════════════════════════════════════════════════════
// 4. PLOT & THEME (14 parameters)
// ═══════════════════════════════════════════════════════════════

const PlotThemeSchema = z.object({
  structureTemplate: z.enum([
    'three-act', 'four-act', 'heros-journey', 'mystery', 'heist', 'romance', 'tragedy', 'cyclic', 'episodic'
  ]).describe('Story structure template'),
  themes: z.array(z.string()).max(5).describe('Core themes (love, betrayal, redemption, identity, power, etc.)'),
  endingStyle: z.enum(['happy', 'bittersweet', 'tragic', 'open-ended', 'cliffhanger', 'ambiguous']).describe('Type of ending'),
  twistIntensity: z.enum(['none', 'mild', 'shocking']).describe('How strong plot twists are'),
  mysteryClarity: z.enum(['fair-play', 'opaque', 'gradual-reveal']).describe('How clued-in reader is before reveal'),
  foreshadowingAmount: z.number().min(0).max(10).describe('Amount of foreshadowing (0-10)'),
  narrativeComplexity: z.enum(['linear', 'lightly-non-linear', 'parallel-timelines', 'frame-narrative', 'nested-stories']).describe('Narrative structure complexity'),
  subplotCount: z.number().min(0).max(5).describe('Number of subplots'),
  conflictEscalation: z.enum(['gradual', 'build-plateau', 'roller-coaster', 'sudden']).describe('How conflict escalates'),
  resolutionStyle: z.enum(['quick', 'earned', 'pyrrhic', 'unresolved']).describe('How conflicts resolve'),
  storyQuestion: z.string().optional().describe('Central story question to answer'),
  enableFlashForward: z.boolean().default(false).describe('Include glimpses of future'),
  antagonistMotivation: z.string().optional().describe('Clear motivation for antagonist'),
  resonanceTarget: z.string().optional().describe('What reader should feel/remember'),
});

// ═══════════════════════════════════════════════════════════════
// 5. STYLE & VOICE (13 parameters)
// ═══════════════════════════════════════════════════════════════

const StyleVoiceSchema = z.object({
  proseDensity: z.enum(['sparse', 'balanced', 'lush']).describe('Amount of prose and description'),
  dialogueToDescriptionRatio: z.number().min(0).max(100).describe('Percentage that is dialogue vs narrative'),
  interiorMonologueAmount: z.number().min(0).max(10).describe('Amount of internal thoughts (0-10)'),
  showVsTellBias: z.enum(['show-heavy', 'balanced', 'tell-heavy']).describe('Show vs tell balance'),
  styleFlavorPresets: z.array(z.enum([
    'cinematic', 'literary', 'pulp', 'noir', 'YA', 'manga-paced', 'poetic', 'minimalist', 'bombastic'
  ])).max(3).describe('Style flavor presets to blend'),
  avoidRepetition: z.boolean().default(true).describe('Explicitly avoid repeating phrases/concepts'),
  contentBanList: z.string().optional().describe('Banned words, phrases, or content'),
  includeThoughtMarkers: z.boolean().default(false).describe('Mark thoughts with italics/quotes'),
  sentenceVariation: z.enum(['minimal', 'moderate', 'high']).describe('Sentence structure variation'),
  paragraphLength: z.enum(['very-short', 'short', 'medium', 'long']).describe('Target paragraph length'),
  metaphorDensity: z.enum(['minimal', 'moderate', 'heavy']).describe('Use of metaphors and figurative language'),
  readingLevel: z.enum(['elementary', 'intermediate', 'high-school', 'college', 'literary']).describe('Target reading level'),
  profanityLevel: z.enum(['none', 'minimal', 'moderate', 'high']).describe('Profanity usage'),
});

// ═══════════════════════════════════════════════════════════════
// 6. COMIC-SPECIFIC SETTINGS (17 parameters)
// ═══════════════════════════════════════════════════════════════

const ComicSpecificSchema = z.object({
  comicPageCount: z.number().min(1).max(200).optional().describe('Target number of pages'),
  comicPanelCount: z.number().min(1).max(500).optional().describe('Target number of panels'),
  panelLayoutStyle: z.enum([
    'grid-3x3', 'grid-4x4', '4-panel-strip', 'vertical-webtoon', 'manga', 'freeform', 'mixed'
  ]).describe('Panel layout style'),
  establishingShotPercent: z.number().min(0).max(100).describe('Percentage establishing shots'),
  mediumShotPercent: z.number().min(0).max(100).describe('Percentage medium shots'),
  closeUpPercent: z.number().min(0).max(100).describe('Percentage close-ups'),
  reactionPanelPercent: z.number().min(0).max(100).describe('Percentage reaction/emotion panels'),
  actionDensity: z.number().min(0).max(10).describe('How action-packed vs quiet (0-10)'),
  visualTone: z.enum(['bright', 'noir', 'neon', 'pastel', 'muted', 'high-contrast']).describe('Visual tone/color palette'),
  artStyleTags: z.array(z.string()).max(5).describe('Art style tags (anime, western-comics, watercolor, etc.)'),
  sfxFrequency: z.enum(['none', 'minimal', 'moderate', 'heavy']).describe('Sound effect text frequency'),
  textDensityPerPanel: z.enum(['low', 'medium', 'high']).describe('Amount of text per panel'),
  balloonType: z.enum(['standard-dialogue', 'caption-heavy', 'thought-heavy', 'minimal']).describe('Speech balloon style'),
  includeCameraDirections: z.boolean().default(true).describe('Include camera/framing directions'),
  includeMoodNotes: z.boolean().default(true).describe('Include mood and tone notes'),
  panelTransitionStyle: z.enum(['action-to-action', 'subject-to-subject', 'scene-to-scene', 'aspect-to-aspect']).describe('Panel transition type'),
  marginNotes: z.boolean().default(false).describe('Include margin notes for artist'),
});

// ═══════════════════════════════════════════════════════════════
// 7. OUTPUT STRUCTURE & FORMATTING (12 parameters)
// ═══════════════════════════════════════════════════════════════

const OutputStructureSchema = z.object({
  chapterCount: z.number().min(1).max(100).optional().describe('Number of chapters/episodes'),
  maxWordsPerChapter: z.number().min(100).max(50000).optional().describe('Max words per chapter'),
  maxTokensPerResponse: z.number().min(500).max(4000).default(2000).describe('Max tokens per AI response (for streaming)'),
  outputFormat: z.enum(['markdown', 'json', 'html', 'hybrid-markdown-json']).describe('Output format preference'),
  includeLogline: z.boolean().default(true).describe('Include one-line story logline'),
  includeSynopsis: z.boolean().default(true).describe('Include short synopsis'),
  includeDetailedOutline: z.boolean().default(true).describe('Include chapter-by-chapter outline'),
  includeCharacterSheets: z.boolean().default(true).describe('Include character profiles'),
  includeWorldBible: z.boolean().default(false).describe('Include world/lore appendix'),
  includePanelBreakdown: z.boolean().default(true).describe('Include comic panel JSON (for comics)'),
  outputSections: z.array(z.string()).describe('Custom output sections to include'),
  pageNumbering: z.boolean().default(false).describe('Include page numbers in output'),
});

// ═══════════════════════════════════════════════════════════════
// 8. SAFETY & COMPLIANCE (8 parameters)
// ═══════════════════════════════════════════════════════════════

const SafetyComplianceSchema = z.object({
  nsfwToggle: z.enum(['strict', 'standard', 'relaxed']).describe('NSFW content level'),
  contentFilters: z.object({
    violence: z.boolean().default(true),
    gore: z.boolean().default(true),
    substanceAbuse: z.boolean().default(true),
    selfHarm: z.boolean().default(true),
    abuse: z.boolean().default(true),
    darkThemes: z.boolean().default(false),
  }).describe('Content filter toggles'),
  blockRealPeopleTrademarks: z.boolean().default(true).describe('Block real people and trademarked content'),
  regionSpecificCompliance: z.string().optional().describe('Region for compliance (US, EU, CN, etc.)'),
  horrorIntensityMax: z.number().min(0).max(10).describe('Maximum horror intensity allowed'),
  psychologicalThemesMax: z.number().min(0).max(10).describe('Maximum psychological distress level'),
  externalReviewRequired: z.boolean().default(false).describe('Flag content for human review'),
});

// ═══════════════════════════════════════════════════════════════
// 9. PERFORMANCE & COST CONTROLS (11 parameters)
// ═══════════════════════════════════════════════════════════════

const PerformanceCostSchema = z.object({
  latencyPriority: z.enum(['lowest-latency', 'balanced', 'quality-first']).describe('Optimization priority'),
  temperature: z.number().min(0).max(2).default(0.7).describe('Sampling temperature (0-2)'),
  topP: z.number().min(0).max(1).default(0.9).describe('Top-p sampling (0-1)'),
  topK: z.number().min(1).max(100).optional().describe('Top-k sampling (1-100)'),
  maxTokensOverride: z.number().min(100).max(32000).optional().describe('Override max tokens for thisgeneration'),
  useGroqForDraft: z.boolean().default(false).describe('Use Groq for initial draft, Gemini for polish'),
  enableDraftExpand: z.boolean().default(false).describe('Generate draft first, then expand to full length'),
  useStreaming: z.boolean().default(true).describe('Stream response chunks to frontend'),
  cachePreviousResults: z.boolean().default(true).describe('Cache intermediate results'),
  costWarnThreshold: z.number().optional().describe('Warn if estimated cost exceeds (in cents)'),
  timeoutMs: z.number().default(120000).describe('Generation timeout in milliseconds'),
});

// ═══════════════════════════════════════════════════════════════
// COMPLETE AI STORY STUDIO CONFIG SCHEMA
// ═══════════════════════════════════════════════════════════════

export const AIStoryConfigSchema = z.object({
  // Tab 1: Core Setup
  ...CoreSetupSchema.shape,

  // Tab 2: World & Tone
  ...WorldToneSchema.shape,

  // Tab 3: Character Design
  ...CharacterDesignSchema.shape,

  // Tab 4: Plot & Theme
  ...PlotThemeSchema.shape,

  // Tab 5: Style & Voice
  ...StyleVoiceSchema.shape,

  // Tab 6: Comic-Specific
  ...ComicSpecificSchema.shape,

  // Tab 7: Output Structure
  ...OutputStructureSchema.shape,

  // Tab 8: Safety & Compliance
  ...SafetyComplianceSchema.shape,

  // Tab 9: Performance & Cost
  ...PerformanceCostSchema.shape,
});

export type AIStoryConfig = z.infer<typeof AIStoryConfigSchema>;

// ═══════════════════════════════════════════════════════════════
// DEFAULT VALUES FOR ALL PARAMETERS
// ═══════════════════════════════════════════════════════════════

export const defaultAIStoryConfig: Partial<AIStoryConfig> = {
  // Core
  mode: 'story-only',
  primaryGenre: 'fantasy',
  secondaryGenres: [],
  subgenre: '',
  targetLength: 'novella',
  narrativePOV: 'third-limited',
  tense: 'past',
  language: 'en',
  audienceRating: 'teen-13',
  includeCharacterSheet: true,
  includeOutline: true,

  // World & Tone
  worldComplexity: 'medium',
  techLevel: 'modern',
  tone: ['hopeful', 'wholesome'],
  pacing: 'balanced',
  humorLevel: 'light',
  violenceIntensity: 5,
  romanceIntensity: 3,
  loreDensity: 5,
  emotionalDepth: 'moderate',
  ambitionLevel: 'regional',

  // Character
  mainCharacterCount: 1,
  supportingCharacterCount: 5,
  protagonistArchetype: 'everyperson',
  antagonistType: 'person',
  moralAlignment: 'grey-ambiguous',
  characterArcType: 'growth',
  conflictType: ['external-action', 'internal-struggle'],
  characterCompetence: 'capable',

  // Plot & Theme
  structureTemplate: 'three-act',
  themes: ['identity', 'growth'],
  endingStyle: 'bittersweet',
  twistIntensity: 'mild',
  mysteryClarity: 'gradual-reveal',
  foreshadowingAmount: 5,
  narrativeComplexity: 'linear',
  subplotCount: 2,

  // Style
  proseDensity: 'balanced',
  dialogueToDescriptionRatio: 40,
  interiorMonologueAmount: 5,
  showVsTellBias: 'balanced',
  styleFlavorPresets: ['literary'],
  avoidRepetition: true,
  sentenceVariation: 'high',
  paragraphLength: 'medium',
  readingLevel: 'high-school',

  // Comic
  panelLayoutStyle: 'grid-3x3',
  actionDensity: 6,
  visualTone: 'bright',
  artStyleTags: [],
  textDensityPerPanel: 'medium',
  balloonType: 'standard-dialogue',

  // Output
  outputFormat: 'markdown',
  maxTokensPerResponse: 2000,
  includeLogline: true,
  includeSynopsis: true,
  includeDetailedOutline: true,

  // Safety
  nsfwToggle: 'standard',
  blockRealPeopleTrademarks: true,
  horrorIntensityMax: 7,

  // Performance
  latencyPriority: 'balanced',
  temperature: 0.7,
  topP: 0.9,
  useStreaming: true,
};

// ═══════════════════════════════════════════════════════════════
// TAB CATEGORIES FOR UI
// ═══════════════════════════════════════════════════════════════

export const AIStoryConfigTabs = [
  { id: 'core-setup', label: 'Core Setup', description: 'Mode, genre, length, POV, audience' },
  { id: 'world-tone', label: 'World & Tone', description: 'Setting, atmosphere, pacing, intensity' },
  { id: 'character', label: 'Character Design', description: 'Protagonists, antagonists, arcs, diversity' },
  { id: 'plot-theme', label: 'Plot & Theme', description: 'Structure, themes, ending, complexity' },
  { id: 'style-voice', label: 'Style & Voice', description: 'Prose, dialogue, tone, stylistic flavor' },
  { id: 'comic', label: 'Comic-Specific', description: 'Panels, layout, art style, framing' },
  { id: 'output', label: 'Output Structure', description: 'Format, sections, chapter breakdowns' },
  { id: 'safety', label: 'Safety & Compliance', description: 'Content filters, ratings, compliance' },
  { id: 'performance', label: 'Performance & Cost', description: 'Speed, quality, streaming, caching' },
];
