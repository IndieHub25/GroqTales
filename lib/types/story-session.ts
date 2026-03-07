/**
 * Core TypeScript interfaces for ComicCraft AI Story Studio
 * Supports story sessions with 1-7 panels, 70+ parameters, and narrative continuity
 */

/**
 * Main story session containing all panels and metadata
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10
 */
export interface StorySession {
  sessionId: string;
  userId?: string;
  title: string;
  panels: PanelData[];
  genres: string[]; // Max 2, locked after Panel 1
  genresLocked: boolean;
  storyMemory: StoryMemory;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    totalWordCount: number;
    estimatedReadingTime: number;
  };
  status: 'draft' | 'in-progress' | 'complete';
}

/**
 * Individual panel (chapter) data
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10
 */
export interface PanelData {
  panelIndex: number; // 1-7
  title: string;
  parameters: PanelParameters;
  generatedContent: string;
  wordCount: number;
  status: 'pending' | 'generating' | 'complete' | 'error';
  metadata: {
    createdAt: Date;
    generatedAt?: Date;
    tokensUsed?: {
      groq: number;
      gemini: number;
    };
  };
  error?: {
    message: string;
    code: string;
    timestamp: Date;
  };
}

/**
 * Comprehensive parameter schema for panel generation (70+ parameters)
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10
 */
export interface PanelParameters {
  // Character Development (11 parameters) - Requirement 3.2
  characterCount?: number;
  characterDepth?: number;
  protagonistArchetype?: string;
  antagonistPresence?: number;
  sideCharacterCount?: number;
  characterDiversity?: number;
  relationshipComplexity?: number;
  characterMotivationClarity?: number;
  characterVoiceDistinctness?: number;
  characterFlaws?: number;
  characterGrowth?: number;
  
  // Plot Structure (9 parameters) - Requirement 3.3
  plotComplexity?: number;
  pacingSpeed?: number;
  cliffhangerFrequency?: number;
  plotStructureType?: string;
  twistCount?: number;
  conflictType?: string[];
  resolutionType?: string;
  flashbackUsage?: number;
  foreshadowingLevel?: number;
  
  // Worldbuilding (9 parameters) - Requirement 3.4
  settingDetail?: number;
  settingType?: string;
  worldMagicSystem?: number;
  technologyLevel?: number;
  worldHistoryDepth?: number;
  politicsComplexity?: number;
  economicSystem?: number;
  culturalDiversity?: number;
  atmosphere?: string;
  
  // Tone & Style (8 parameters) - Requirement 3.5
  narrativeVoice?: string;
  proseStyle?: string;
  dialogueLevel?: number;
  dialogueNaturalism?: number;
  humorLevel?: number;
  humorStyle?: string[];
  darknessLevel?: number;
  sentimentTone?: string;
  
  // Technical Parameters (7 parameters) - Requirement 3.10
  targetWordCount?: number;
  readingLevel?: string;
  pointOfView?: string;
  verbTense?: string;
  chapterStructure?: string;
  descriptionIntensity?: number;
  narrativeTimeSpan?: string;
  
  // Thematic Elements (5 parameters) - Requirement 3.6
  themeDepth?: number;
  themeSubtlety?: number;
  symbolismLevel?: number;
  metaphorDensity?: number;
  moralComplexity?: number;
  
  // Sensory & Immersion (5 parameters)
  sensoryDetail?: number;
  actionDescription?: number;
  emotionalDepth?: number;
  tensionCurve?: string;
  immersionLevel?: number;
  
  // Audience (4 parameters) - Requirement 3.6 (Content Controls)
  ageRating?: string;
  contentWarnings?: string[];
  genderRepresentation?: string;
  culturalSensitivity?: number;
  
  // Advanced Options (6 parameters) - Requirement 3.10
  creativityLevel?: number;
  coherenceStrictness?: number;
  randomizationSeed?: string;
  modelTemperature?: number;
  detailLevel?: number;
  guardrailsStrictness?: number;
  
  // Special Effects (4 parameters) - Requirement 3.8
  specialNarrativeDevice?: string[];
  easterEggs?: boolean;
  crossReferences?: boolean;
  genreBlending?: number;
  
  // Panel-specific parameters
  chapterRole?: 'setup' | 'development' | 'climax' | 'resolution';
  hookStrength?: number;
  endingType?: 'cliffhanger' | 'resolution' | 'emotional-beat' | 'open';
}

/**
 * Story memory tracking for narrative continuity
 * Requirements: 4.1, 4.2
 */
export interface StoryMemory {
  characters: CharacterMemory[];
  worldBuilding: WorldBuildingMemory;
  majorEvents: EventMemory[];
  unresolvedQuestions: string[];
  establishedFacts: string[];
  themes: string[];
  tone: string;
}

/**
 * Character tracking across panels
 * Requirements: 4.1, 4.2
 */
export interface CharacterMemory {
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting';
  traits: string[];
  relationships: Record<string, string>; // characterName -> relationship type
  arc: string;
  firstAppearance: number; // panel index
}

/**
 * World-building elements tracking
 * Requirements: 4.1, 4.2
 */
export interface WorldBuildingMemory {
  setting: string;
  timePeriod: string;
  rules: string[]; // magic system, technology, etc.
  locations: string[];
  cultures: string[];
}

/**
 * Major event tracking for narrative continuity
 * Requirements: 4.1, 4.2
 */
export interface EventMemory {
  panelIndex: number;
  description: string;
  significance: 'major' | 'minor';
  consequences: string[];
}

/**
 * Backend API payload structure
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 4.1, 4.2
 */
export interface BackendPayload {
  storyId?: string;
  userId?: string;
  panelIndex: number;
  genres: string[];
  parameters: PanelParameters;
  storySoFar: string;
  storyMemory: StoryMemory;
  generatedContent: string;
  metadata: {
    tokensUsed: {
      groq: number;
      gemini: number;
    };
    generationTime: number;
    timestamp: Date;
  };
}

/**
 * Parameter validation result
 * Requirements: 3.11
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Validation error details
 * Requirements: 3.11
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Validation warning details
 * Requirements: 3.11
 */
export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}
