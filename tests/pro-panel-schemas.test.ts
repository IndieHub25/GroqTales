/**
 * Pro Panel Zod Schema Tests
 * Validates all 9 category schemas and the combined ParametersSchema
 */

import {
  StoryStructureSchema,
  CharacterSchema,
  WorldSchema,
  ToneStyleSchema,
  ThemeSchema,
  ModelSettingsSchema,
  VisualSchema,
  LengthSchema,
  AdvancedSchema,
  ParametersSchema,
  PresetSchema,
  PresetsCollectionSchema,
} from '../lib/schemas/proPanelSchemas';
import { DEFAULT_PARAMETERS } from '../lib/constants/proPanelDefaults';

// ============================================================
// STORY STRUCTURE SCHEMA
// ============================================================
describe('StoryStructureSchema', () => {
  it('accepts valid defaults', () => {
    const result = StoryStructureSchema.safeParse(
      DEFAULT_PARAMETERS.storyStructure
    );
    expect(result.success).toBe(true);
  });

  it('rejects invalid narrativeStyle', () => {
    const result = StoryStructureSchema.safeParse({
      ...DEFAULT_PARAMETERS.storyStructure,
      narrativeStyle: 'invalid-style',
    });
    expect(result.success).toBe(false);
  });

  it('rejects plotComplexity outside 0-100', () => {
    const over = StoryStructureSchema.safeParse({
      ...DEFAULT_PARAMETERS.storyStructure,
      plotComplexity: 150,
    });
    expect(over.success).toBe(false);

    const under = StoryStructureSchema.safeParse({
      ...DEFAULT_PARAMETERS.storyStructure,
      plotComplexity: -1,
    });
    expect(under.success).toBe(false);
  });

  it('rejects missing required fields', () => {
    const result = StoryStructureSchema.safeParse({ narrativeStyle: 'linear' });
    expect(result.success).toBe(false);
  });
});

// ============================================================
// CHARACTER SCHEMA
// ============================================================
describe('CharacterSchema', () => {
  it('accepts valid defaults', () => {
    const result = CharacterSchema.safeParse(DEFAULT_PARAMETERS.characters);
    expect(result.success).toBe(true);
  });

  it('rejects invalid supportingCastSize', () => {
    const result = CharacterSchema.safeParse({
      ...DEFAULT_PARAMETERS.characters,
      supportingCastSize: 'gigantic',
    });
    expect(result.success).toBe(false);
  });

  it('rejects protagonistDepth > 100', () => {
    const result = CharacterSchema.safeParse({
      ...DEFAULT_PARAMETERS.characters,
      protagonistDepth: 101,
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================
// WORLD SCHEMA
// ============================================================
describe('WorldSchema', () => {
  it('accepts valid defaults', () => {
    const result = WorldSchema.safeParse(DEFAULT_PARAMETERS.world);
    expect(result.success).toBe(true);
  });

  it('rejects invalid settingType', () => {
    const result = WorldSchema.safeParse({
      ...DEFAULT_PARAMETERS.world,
      settingType: 'mars-colony',
    });
    expect(result.success).toBe(false);
  });

  it('clamps number fields to 0-100', () => {
    const result = WorldSchema.safeParse({
      ...DEFAULT_PARAMETERS.world,
      worldBuildingDepth: -5,
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================
// TONE & STYLE SCHEMA
// ============================================================
describe('ToneStyleSchema', () => {
  it('accepts valid defaults', () => {
    const result = ToneStyleSchema.safeParse(DEFAULT_PARAMETERS.toneStyle);
    expect(result.success).toBe(true);
  });

  it('rejects invalid primaryTone', () => {
    const result = ToneStyleSchema.safeParse({
      ...DEFAULT_PARAMETERS.toneStyle,
      primaryTone: 'furious',
    });
    expect(result.success).toBe(false);
  });

  it('accepts all valid violence levels', () => {
    for (const level of ['none', 'mild', 'moderate', 'graphic', 'extreme']) {
      const result = ToneStyleSchema.safeParse({
        ...DEFAULT_PARAMETERS.toneStyle,
        violenceLevel: level,
      });
      expect(result.success).toBe(true);
    }
  });
});

// ============================================================
// THEME SCHEMA
// ============================================================
describe('ThemeSchema', () => {
  it('accepts valid defaults', () => {
    const result = ThemeSchema.safeParse(DEFAULT_PARAMETERS.theme);
    expect(result.success).toBe(true);
  });

  it('rejects more than 5 secondary themes', () => {
    const result = ThemeSchema.safeParse({
      ...DEFAULT_PARAMETERS.theme,
      secondaryThemes: [
        'love',
        'redemption',
        'revenge',
        'identity',
        'power',
        'survival',
      ],
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid theme values', () => {
    const result = ThemeSchema.safeParse({
      ...DEFAULT_PARAMETERS.theme,
      primaryTheme: 'friendship',
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================
// MODEL SETTINGS SCHEMA
// ============================================================
describe('ModelSettingsSchema', () => {
  it('accepts valid defaults', () => {
    const result = ModelSettingsSchema.safeParse(
      DEFAULT_PARAMETERS.modelSettings
    );
    expect(result.success).toBe(true);
  });

  it('rejects temperature > 2', () => {
    const result = ModelSettingsSchema.safeParse({
      ...DEFAULT_PARAMETERS.modelSettings,
      temperature: 3.0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects maxTokens < 256', () => {
    const result = ModelSettingsSchema.safeParse({
      ...DEFAULT_PARAMETERS.modelSettings,
      maxTokens: 100,
    });
    expect(result.success).toBe(false);
  });

  it('rejects maxTokens > 32768', () => {
    const result = ModelSettingsSchema.safeParse({
      ...DEFAULT_PARAMETERS.modelSettings,
      maxTokens: 99999,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid model selection', () => {
    const result = ModelSettingsSchema.safeParse({
      ...DEFAULT_PARAMETERS.modelSettings,
      modelSelection: 'gpt-4-turbo',
    });
    expect(result.success).toBe(false);
  });

  it('rejects more than 4 stop sequences', () => {
    const result = ModelSettingsSchema.safeParse({
      ...DEFAULT_PARAMETERS.modelSettings,
      stopSequences: ['a', 'b', 'c', 'd', 'e'],
    });
    expect(result.success).toBe(false);
  });

  it('accepts all valid model selections', () => {
    const models = [
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'llama-3.2-90b-vision-preview',
      'gemma2-9b-it',
      'mixtral-8x7b-32768',
    ];
    for (const model of models) {
      const result = ModelSettingsSchema.safeParse({
        ...DEFAULT_PARAMETERS.modelSettings,
        modelSelection: model,
      });
      expect(result.success).toBe(true);
    }
  });
});

// ============================================================
// VISUAL SCHEMA
// ============================================================
describe('VisualSchema', () => {
  it('accepts valid defaults', () => {
    const result = VisualSchema.safeParse(DEFAULT_PARAMETERS.visual);
    expect(result.success).toBe(true);
  });

  it('rejects artDirection > 500 chars', () => {
    const result = VisualSchema.safeParse({
      ...DEFAULT_PARAMETERS.visual,
      artDirection: 'x'.repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it('rejects more than 10 mood board entries', () => {
    const result = VisualSchema.safeParse({
      ...DEFAULT_PARAMETERS.visual,
      visualMoodBoard: Array(11).fill('mood'),
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================
// LENGTH SCHEMA
// ============================================================
describe('LengthSchema', () => {
  it('accepts valid defaults', () => {
    const result = LengthSchema.safeParse(DEFAULT_PARAMETERS.length);
    expect(result.success).toBe(true);
  });

  it('rejects targetWordCount < 100', () => {
    const result = LengthSchema.safeParse({
      ...DEFAULT_PARAMETERS.length,
      targetWordCount: 50,
    });
    expect(result.success).toBe(false);
  });

  it('rejects targetWordCount > 200000', () => {
    const result = LengthSchema.safeParse({
      ...DEFAULT_PARAMETERS.length,
      targetWordCount: 300000,
    });
    expect(result.success).toBe(false);
  });

  it('accepts boolean prologue/epilogue flags', () => {
    const result = LengthSchema.safeParse({
      ...DEFAULT_PARAMETERS.length,
      prologueIncluded: true,
      epilogueIncluded: true,
    });
    expect(result.success).toBe(true);
  });
});

// ============================================================
// ADVANCED SCHEMA
// ============================================================
describe('AdvancedSchema', () => {
  it('accepts valid defaults', () => {
    const result = AdvancedSchema.safeParse(DEFAULT_PARAMETERS.advanced);
    expect(result.success).toBe(true);
  });

  it('rejects more than 5 experimental techniques', () => {
    const result = AdvancedSchema.safeParse({
      ...DEFAULT_PARAMETERS.advanced,
      experimentalTechniques: [
        'stream-of-consciousness',
        'epistolary',
        'multiple-timelines',
        'second-person',
        'footnotes',
        'mixed-media',
      ],
    });
    expect(result.success).toBe(false);
  });

  it('rejects more than 3 genre mashups', () => {
    const result = AdvancedSchema.safeParse({
      ...DEFAULT_PARAMETERS.advanced,
      genreMashup: ['fantasy', 'sci-fi', 'romance', 'thriller'],
    });
    expect(result.success).toBe(false);
  });

  it('rejects customInstructions > 2000 chars', () => {
    const result = AdvancedSchema.safeParse({
      ...DEFAULT_PARAMETERS.advanced,
      customInstructions: 'x'.repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================
// COMBINED PARAMETERS SCHEMA
// ============================================================
describe('ParametersSchema', () => {
  it('accepts full valid default parameters', () => {
    const result = ParametersSchema.safeParse(DEFAULT_PARAMETERS);
    expect(result.success).toBe(true);
  });

  it('rejects empty object', () => {
    const result = ParametersSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects partial parameters (missing categories)', () => {
    const result = ParametersSchema.safeParse({
      storyStructure: DEFAULT_PARAMETERS.storyStructure,
    });
    expect(result.success).toBe(false);
  });

  it('provides meaningful error messages on failure', () => {
    const result = ParametersSchema.safeParse({
      storyStructure: { narrativeStyle: 'invalid' },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.length).toBeGreaterThan(0);
      expect(result.error.errors[0].path.length).toBeGreaterThan(0);
    }
  });
});

// ============================================================
// PRESET SCHEMA
// ============================================================
describe('PresetSchema', () => {
  const validPreset = {
    name: 'Test Preset',
    description: 'A test preset',
    timestamp: Date.now(),
    version: 1,
    parameters: DEFAULT_PARAMETERS,
  };

  it('accepts a valid preset', () => {
    const result = PresetSchema.safeParse(validPreset);
    expect(result.success).toBe(true);
  });

  it('rejects preset without name', () => {
    const result = PresetSchema.safeParse({
      ...validPreset,
      name: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects preset with name > 100 chars', () => {
    const result = PresetSchema.safeParse({
      ...validPreset,
      name: 'x'.repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it('allows optional description', () => {
    const { description, ...noDesc } = validPreset;
    const result = PresetSchema.safeParse(noDesc);
    expect(result.success).toBe(true);
  });

  it('rejects version < 1', () => {
    const result = PresetSchema.safeParse({
      ...validPreset,
      version: 0,
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================
// PRESETS COLLECTION SCHEMA
// ============================================================
describe('PresetsCollectionSchema', () => {
  const validPreset = {
    name: 'Test',
    timestamp: Date.now(),
    version: 1,
    parameters: DEFAULT_PARAMETERS,
  };

  it('accepts a valid collection', () => {
    const result = PresetsCollectionSchema.safeParse({
      'test-preset': validPreset,
      'another-preset': { ...validPreset, name: 'Another' },
    });
    expect(result.success).toBe(true);
  });

  it('accepts an empty collection', () => {
    const result = PresetsCollectionSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('rejects collection with invalid preset', () => {
    const result = PresetsCollectionSchema.safeParse({
      'bad-preset': { name: '' },
    });
    expect(result.success).toBe(false);
  });
});
