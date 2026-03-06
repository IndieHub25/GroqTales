/**
 * Pro Panel Preset Save/Load Tests
 * Tests import/export functionality, including invalid JSON handling
 */

import {
  PresetsCollectionSchema,
  PresetSchema,
  ParametersSchema,
} from '../lib/schemas/proPanelSchemas';
import {
  DEFAULT_PARAMETERS,
  BUILT_IN_PRESETS,
  initializeBuiltInPresets,
} from '../lib/constants/proPanelDefaults';

// ============================================================
// PRESET EXPORT (Serialization)
// ============================================================
describe('Preset Export', () => {
  it('serializes presets to valid JSON', () => {
    const presets = initializeBuiltInPresets();
    const json = JSON.stringify(presets, null, 2);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('exported JSON round-trips back through schema validation', () => {
    const presets = initializeBuiltInPresets();
    const json = JSON.stringify(presets, null, 2);
    const parsed = JSON.parse(json);
    const result = PresetsCollectionSchema.safeParse(parsed);
    expect(result.success).toBe(true);
  });

  it('preserves all preset fields after round-trip', () => {
    const original = initializeBuiltInPresets();
    const json = JSON.stringify(original, null, 2);
    const parsed = JSON.parse(json);
    const validated = PresetsCollectionSchema.parse(parsed);

    for (const key of Object.keys(original)) {
      expect(validated[key].name).toBe(original[key].name);
      expect(validated[key].version).toBe(original[key].version);
      expect(validated[key].parameters).toEqual(original[key].parameters);
    }
  });
});

// ============================================================
// PRESET IMPORT (Deserialization)
// ============================================================
describe('Preset Import', () => {
  const validPreset = {
    name: 'Custom Preset',
    description: 'My custom config',
    timestamp: Date.now(),
    version: 1,
    parameters: DEFAULT_PARAMETERS,
  };

  it('accepts valid JSON with one preset', () => {
    const json = JSON.stringify({ 'custom-preset': validPreset });
    const parsed = JSON.parse(json);
    const result = PresetsCollectionSchema.safeParse(parsed);
    expect(result.success).toBe(true);
  });

  it('accepts valid JSON with multiple presets', () => {
    const json = JSON.stringify({
      'preset-a': validPreset,
      'preset-b': { ...validPreset, name: 'Preset B' },
      'preset-c': { ...validPreset, name: 'Preset C' },
    });
    const parsed = JSON.parse(json);
    const result = PresetsCollectionSchema.safeParse(parsed);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(Object.keys(result.data).length).toBe(3);
    }
  });

  it('rejects completely invalid JSON string', () => {
    const badJson = '{this is not json!!!';
    expect(() => JSON.parse(badJson)).toThrow(SyntaxError);
  });

  it('rejects truncated JSON', () => {
    const truncated = '{"name": "Test", "params":';
    expect(() => JSON.parse(truncated)).toThrow(SyntaxError);
  });

  it('rejects empty string', () => {
    expect(() => JSON.parse('')).toThrow(SyntaxError);
  });

  it('rejects valid JSON that is not an object', () => {
    const result = PresetsCollectionSchema.safeParse(
      JSON.parse('"just a string"')
    );
    expect(result.success).toBe(false);
  });

  it('rejects JSON array instead of object', () => {
    const result = PresetsCollectionSchema.safeParse(
      JSON.parse('[{"name": "test"}]')
    );
    expect(result.success).toBe(false);
  });

  it('rejects preset with missing parameters', () => {
    const badPreset = {
      name: 'Bad Preset',
      timestamp: Date.now(),
      version: 1,
      // parameters missing
    };
    const result = PresetsCollectionSchema.safeParse({
      'bad-preset': badPreset,
    });
    expect(result.success).toBe(false);
  });

  it('rejects preset with invalid parameters', () => {
    const badPreset = {
      name: 'Bad Preset',
      timestamp: Date.now(),
      version: 1,
      parameters: {
        storyStructure: { narrativeStyle: 'INVALID' },
        // Missing all other categories
      },
    };
    const result = PresetsCollectionSchema.safeParse({
      'bad-preset': badPreset,
    });
    expect(result.success).toBe(false);
  });

  it('rejects null input', () => {
    const result = PresetsCollectionSchema.safeParse(null);
    expect(result.success).toBe(false);
  });

  it('rejects undefined input', () => {
    const result = PresetsCollectionSchema.safeParse(undefined);
    expect(result.success).toBe(false);
  });

  it('rejects numeric input', () => {
    const result = PresetsCollectionSchema.safeParse(42);
    expect(result.success).toBe(false);
  });
});

// ============================================================
// BUILT-IN PRESETS INTEGRITY
// ============================================================
describe('Built-in Presets', () => {
  it('all built-in presets pass ParametersSchema validation', () => {
    for (const [key, preset] of Object.entries(BUILT_IN_PRESETS)) {
      const result = ParametersSchema.safeParse(preset.parameters);
      expect(result.success).toBe(true);
      if (!result.success) {
        console.error(
          `Built-in preset "${key}" failed validation:`,
          result.error.errors
        );
      }
    }
  });

  it('initializeBuiltInPresets adds timestamps', () => {
    const initialized = initializeBuiltInPresets();
    for (const [, preset] of Object.entries(initialized)) {
      expect(preset.timestamp).toBeDefined();
      expect(typeof preset.timestamp).toBe('number');
      expect(preset.timestamp).toBeGreaterThan(0);
    }
  });

  it('all initialized presets pass full PresetSchema validation', () => {
    const initialized = initializeBuiltInPresets();
    for (const [key, preset] of Object.entries(initialized)) {
      const result = PresetSchema.safeParse(preset);
      expect(result.success).toBe(true);
      if (!result.success) {
        console.error(
          `Initialized preset "${key}" failed:`,
          result.error.errors
        );
      }
    }
  });

  it('noir-dossier preset exists with expected values', () => {
    const preset = BUILT_IN_PRESETS['noir-dossier'];
    expect(preset).toBeDefined();
    expect(preset.name).toBe('Noir Dossier');
    expect(preset.parameters.toneStyle.primaryTone).toBe('dark');
    expect(preset.parameters.storyStructure.pacing).toBe('slow-burn');
  });

  it('fast-thriller preset exists with expected values', () => {
    const preset = BUILT_IN_PRESETS['fast-thriller'];
    expect(preset).toBeDefined();
    expect(preset.name).toBe('Fast Thriller');
    expect(preset.parameters.storyStructure.pacing).toBe('breakneck');
    expect(preset.parameters.storyStructure.conflictIntensity).toBe(95);
  });
});

// ============================================================
// IMPORT → MERGE LOGIC (simulates store's importPresets)
// ============================================================
describe('Import merge logic', () => {
  function simulateImport(
    existingPresets: Record<string, unknown>,
    json: string
  ): { success: true; count: number } | { success: false; error: string } {
    try {
      const parsed = JSON.parse(json);
      const validated = PresetsCollectionSchema.parse(parsed);
      const importCount = Object.keys(validated).length;
      // Simulate merge (spread)
      const merged = { ...existingPresets, ...validated };
      expect(Object.keys(merged).length).toBeGreaterThanOrEqual(importCount);
      return { success: true, count: importCount };
    } catch (error) {
      if (error instanceof SyntaxError) {
        return { success: false, error: 'Invalid JSON format' };
      }
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Unknown error occurred' };
    }
  }

  it('merges imported presets with existing', () => {
    const existing = initializeBuiltInPresets();
    const newPreset = {
      name: 'New Custom',
      timestamp: Date.now(),
      version: 1,
      parameters: DEFAULT_PARAMETERS,
    };
    const json = JSON.stringify({ 'new-custom': newPreset });
    const result = simulateImport(existing, json);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.count).toBe(1);
    }
  });

  it('overwrites existing preset key on import', () => {
    const existing = initializeBuiltInPresets();
    const updated = {
      name: 'Updated Noir',
      timestamp: Date.now(),
      version: 1,
      parameters: {
        ...DEFAULT_PARAMETERS,
        toneStyle: {
          ...DEFAULT_PARAMETERS.toneStyle,
          primaryTone: 'hopeful' as const,
        },
      },
    };
    const json = JSON.stringify({ 'noir-dossier': updated });
    const result = simulateImport(existing, json);
    expect(result.success).toBe(true);
  });

  it('returns error for invalid JSON', () => {
    const result = simulateImport({}, 'not json');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Invalid JSON format');
    }
  });

  it('returns error for valid JSON but invalid schema', () => {
    const result = simulateImport({}, JSON.stringify({ bad: { x: 1 } }));
    expect(result.success).toBe(false);
  });
});
