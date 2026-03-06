/**
 * Tests for Pro Panel Zod Schemas
 * Validates 70+ parameters across 9 categories
 */

import { describe, expect, it } from '@jest/globals';

import {
  ParametersSchema,
  PresetSchema,
  PresetsCollectionSchema,
  StoryStructureSchema,
  CharacterSchema,
  WorldSchema,
  ToneStyleSchema,
  ThemeSchema,
  ModelSettingsSchema,
  VisualSchema,
  LengthSchema,
  AdvancedSchema,
} from '@/lib/schemas/proPanelSchemas';

// Sample valid data for testing
const validStoryStructure = {
  narrativeStyle: 'linear' as const,
  pacing: 'moderate' as const,
  actStructure: 'three-act' as const,
  plotComplexity: 50,
  conflictIntensity: 70,
  resolutionStyle: 'conclusive' as const,
  flashbackFrequency: 20,
  foreshadowingLevel: 40,
};

const validCharacter = {
  protagonistDepth: 80,
  antagonistComplexity: 60,
  supportingCastSize: 'moderate' as const,
  characterVoiceDistinctness: 70,
  relationshipComplexity: 50,
  characterGrowthArc: 'positive-change' as const,
  backstoryIntegration: 40,
  dialogueStyle: 'naturalistic' as const,
  internalMonologueFrequency: 30,
};

const validWorld = {
  worldBuildingDepth: 60,
  settingType: 'real-world-contemporary' as const,
  geographicScope: 'city' as const,
  cultureDetailLevel: 40,
  technologyLevel: 'modern' as const,
  magicSystemComplexity: 0,
  environmentalDetail: 50,
  historicalDepth: 30,
  sensoryRichness: 60,
};

const validToneStyle = {
  primaryTone: 'serious' as const,
  proseStyle: 'literary' as const,
  vocabularyLevel: 'moderate' as const,
  sentenceVariety: 70,
  metaphorDensity: 30,
  humorLevel: 20,
  violenceLevel: 'mild' as const,
  romanceLevel: 'subtle' as const,
  descriptiveBalance: 50,
  emotionalIntensity: 60,
};

const validTheme = {
  primaryTheme: 'identity' as const,
  secondaryThemes: ['friendship', 'growth'] as const,
  moralComplexity: 70,
  socialCommentary: 40,
  philosophicalDepth: 50,
  symbolismDensity: 30,
  allegoricalLevel: 20,
};

const validModelSettings = {
  modelSelection: 'llama-3.3-70b-versatile' as const,
  temperature: 0.8,
  maxTokens: 4096,
  topP: 0.9,
  topK: 50,
  frequencyPenalty: 0.0,
  presencePenalty: 0.0,
  repetitionPenalty: 1.0,
  stopSequences: ['END', 'STOP'],
};

const validVisual = {
  coverImageStyle: 'digital-art' as const,
  colorPalette: 'vibrant' as const,
  illustrationFrequency: 'key-scenes' as const,
  artDirection: 'Modern digital art style with vibrant colors',
  aspectRatio: '16:9' as const,
  visualMoodBoard: ['cyberpunk', 'neon', 'futuristic'],
};

const validLength = {
  targetWordCount: 50000,
  chapterCount: 15,
  averageChapterLength: 3333,
  sceneLength: 'medium' as const,
  prologueIncluded: true,
  epilogueIncluded: false,
  formatType: 'novel' as const,
};

const validAdvanced = {
  pointOfView: 'third-person-limited' as const,
  tenseConsistency: 'past' as const,
  unreliableNarrator: false,
  metafictionalElements: 10,
  experimentalTechniques: ['footnotes'] as const,
  targetAudience: 'adult' as const,
  contentWarnings: ['violence', 'strong language'],
  genreMashup: ['sci-fi', 'thriller'] as const,
  customInstructions: 'Focus on character development and world building',
  seedPhrase: 'In the year 2157...',
};

const validParameters = {
  storyStructure: validStoryStructure,
  characters: validCharacter,
  world: validWorld,
  toneStyle: validToneStyle,
  theme: validTheme,
  modelSettings: validModelSettings,
  visual: validVisual,
  length: validLength,
  advanced: validAdvanced,
};

describe('Pro Panel Zod Schemas', () => {
  // Individual Schema Tests
  describe('StoryStructureSchema', () => {
    it('should validate correct story structure data', () => {
      const result = StoryStructureSchema.safeParse(validStoryStructure);
      expect(result.success).toBe(true);
    });

    it('should reject invalid narrative style', () => {
      const invalid = { ...validStoryStructure, narrativeStyle: 'invalid' };
      const result = StoryStructureSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject plot complexity out of range', () => {
      const invalid = { ...validStoryStructure, plotComplexity: 150 };
      const result = StoryStructureSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('CharacterSchema', () => {
    it('should validate correct character data', () => {
      const result = CharacterSchema.safeParse(validCharacter);
      expect(result.success).toBe(true);
    });

    it('should reject invalid supporting cast size', () => {
      const invalid = { ...validCharacter, supportingCastSize: 'huge' };
      const result = CharacterSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('ModelSettingsSchema', () => {
    it('should validate correct model settings', () => {
      const result = ModelSettingsSchema.safeParse(validModelSettings);
      expect(result.success).toBe(true);
    });

    it('should reject invalid model selection', () => {
      const invalid = { ...validModelSettings, modelSelection: 'gpt-4' };
      const result = ModelSettingsSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject temperature out of range', () => {
      const invalid = { ...validModelSettings, temperature: 5.0 };
      const result = ModelSettingsSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject too many stop sequences', () => {
      const invalid = {
        ...validModelSettings,
        stopSequences: ['END', 'STOP', 'FINISH', 'DONE', 'COMPLETE'],
      };
      const result = ModelSettingsSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('AdvancedSchema', () => {
    it('should validate correct advanced settings', () => {
      const result = AdvancedSchema.safeParse(validAdvanced);
      expect(result.success).toBe(true);
    });

    it('should reject too many genre mashups', () => {
      const invalid = {
        ...validAdvanced,
        genreMashup: ['fantasy', 'sci-fi', 'romance', 'thriller'],
      };
      const result = AdvancedSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject custom instructions that are too long', () => {
      const longText = 'x'.repeat(2001);
      const invalid = { ...validAdvanced, customInstructions: longText };
      const result = AdvancedSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  // Combined Parameters Schema Test
  describe('ParametersSchema', () => {
    it('should validate complete valid parameters', () => {
      const result = ParametersSchema.safeParse(validParameters);
      expect(result.success).toBe(true);
    });

    it('should provide detailed error paths for nested validation failures', () => {
      const invalid = {
        ...validParameters,
        modelSettings: { ...validModelSettings, temperature: 10.0 },
        advanced: { ...validAdvanced, targetAudience: 'invalid' },
      };
      const result = ParametersSchema.safeParse(invalid);
      expect(result.success).toBe(false);

      if (!result.success) {
        const errorPaths = result.error.errors.map((e) => e.path.join('.'));
        expect(errorPaths).toContain('modelSettings.temperature');
        expect(errorPaths).toContain('advanced.targetAudience');
      }
    });
  });

  // Preset Schema Tests
  describe('PresetSchema', () => {
    const validPreset = {
      name: 'Cyberpunk Thriller',
      description: 'A high-tech noir story set in the future',
      timestamp: Date.now(),
      version: 1,
      parameters: validParameters,
    };

    it('should validate correct preset data', () => {
      const result = PresetSchema.safeParse(validPreset);
      expect(result.success).toBe(true);
    });

    it('should reject preset with empty name', () => {
      const invalid = { ...validPreset, name: '' };
      const result = PresetSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject preset name that is too long', () => {
      const longName = 'x'.repeat(101);
      const invalid = { ...validPreset, name: longName };
      const result = PresetSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should allow optional description', () => {
      const { description, ...presetWithoutDescription } = validPreset;
      const result = PresetSchema.safeParse(presetWithoutDescription);
      expect(result.success).toBe(true);
    });
  });

  describe('PresetsCollectionSchema', () => {
    const validCollection = {
      preset1: {
        name: 'Fantasy Epic',
        timestamp: Date.now(),
        version: 1,
        parameters: validParameters,
      },
      preset2: {
        name: 'Modern Romance',
        description: 'Contemporary love story',
        timestamp: Date.now(),
        version: 1,
        parameters: validParameters,
      },
    };

    it('should validate valid presets collection', () => {
      const result = PresetsCollectionSchema.safeParse(validCollection);
      expect(result.success).toBe(true);
    });

    it('should reject collection with invalid preset', () => {
      const invalid = {
        ...validCollection,
        'invalid-preset': {
          name: '',
          timestamp: 'invalid',
          version: 0,
          parameters: {},
        },
      };
      const result = PresetsCollectionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  // Edge Cases and Data Quality Tests
  describe('Data Quality Validation', () => {
    it('should enforce minimum and maximum constraints', () => {
      // Test various numeric constraints
      const testCases = [
        {
          schema: CharacterSchema,
          field: 'protagonistDepth',
          invalidValue: -1,
        },
        {
          schema: CharacterSchema,
          field: 'protagonistDepth',
          invalidValue: 101,
        },
        { schema: LengthSchema, field: 'targetWordCount', invalidValue: 50 },
        { schema: LengthSchema, field: 'chapterCount', invalidValue: 0 },
        { schema: ModelSettingsSchema, field: 'topK', invalidValue: 0 },
        { schema: ModelSettingsSchema, field: 'topK', invalidValue: 101 },
      ];

      testCases.forEach(({ schema, field, invalidValue }) => {
        const validData = getValidDataForSchema(schema);
        const invalid = { ...validData, [field]: invalidValue };
        const result = schema.safeParse(invalid);
        expect(result.success).toBe(false);
      });
    });

    it('should validate array length constraints', () => {
      // Test theme secondary themes max constraint
      const tooManyThemes = {
        ...validTheme,
        secondaryThemes: [
          'love',
          'redemption',
          'revenge',
          'identity',
          'power',
          'survival',
        ],
      };
      const result = ThemeSchema.safeParse(tooManyThemes);
      expect(result.success).toBe(false);
    });

    it('should validate string length constraints', () => {
      // Test visual art direction max length
      const tooLongDirection = {
        ...validVisual,
        artDirection: 'x'.repeat(501),
      };
      const result = VisualSchema.safeParse(tooLongDirection);
      expect(result.success).toBe(false);
    });
  });
});

// Helper function to get valid data for any schema
function getValidDataForSchema(schema: any) {
  if (schema === CharacterSchema) return validCharacter;
  if (schema === LengthSchema) return validLength;
  if (schema === ModelSettingsSchema) return validModelSettings;
  if (schema === ThemeSchema) return validTheme;
  if (schema === VisualSchema) return validVisual;
  // Add other schemas as needed
  return {};
}
