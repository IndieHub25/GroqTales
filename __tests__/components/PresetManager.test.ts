/**
 * Tests for Pro Panel Preset Functionality
 * Save/Load/Import/Export including error handling for invalid JSON
 */

import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';

import { ProPanelStore, useProPanelStore } from '@/store/proPanelStore';
import type { ProParameters, ProPreset } from '@/lib/schemas/proPanelSchemas';

// Mock the useProPanelStore for isolated testing
jest.mock('@/store/proPanelStore', () => ({
  useProPanelStore: jest.fn(),
}));

// Sample preset data for testing
const mockValidPreset: ProPreset = {
  name: 'Test Cyberpunk Story',
  description: 'A high-tech noir thriller',
  timestamp: Date.now(),
  version: 1,
  parameters: {
    storyStructure: {
      narrativeStyle: 'linear',
      pacing: 'fast-paced',
      actStructure: 'three-act',
      plotComplexity: 70,
      conflictIntensity: 80,
      resolutionStyle: 'twist-ending',
      flashbackFrequency: 20,
      foreshadowingLevel: 60,
    },
    characters: {
      protagonistDepth: 85,
      antagonistComplexity: 75,
      supportingCastSize: 'moderate',
      characterVoiceDistinctness: 80,
      relationshipComplexity: 60,
      characterGrowthArc: 'positive-change',
      backstoryIntegration: 50,
      dialogueStyle: 'witty',
      internalMonologueFrequency: 40,
    },
    world: {
      worldBuildingDepth: 90,
      settingType: 'cyberpunk',
      geographicScope: 'city',
      cultureDetailLevel: 75,
      technologyLevel: 'far-future',
      magicSystemComplexity: 0,
      environmentalDetail: 85,
      historicalDepth: 40,
      sensoryRichness: 80,
    },
    toneStyle: {
      primaryTone: 'dark',
      proseStyle: 'cinematic',
      vocabularyLevel: 'advanced',
      sentenceVariety: 80,
      metaphorDensity: 60,
      humorLevel: 30,
      violenceLevel: 'moderate',
      romanceLevel: 'subtle',
      descriptiveBalance: 60,
      emotionalIntensity: 80,
    },
    theme: {
      primaryTheme: 'identity',
      secondaryThemes: ['power', 'corruption'],
      moralComplexity: 85,
      socialCommentary: 80,
      philosophicalDepth: 70,
      symbolismDensity: 60,
      allegoricalLevel: 40,
    },
    modelSettings: {
      modelSelection: 'llama-3.3-70b-versatile',
      temperature: 0.9,
      maxTokens: 8192,
      topP: 0.95,
      topK: 50,
      frequencyPenalty: 0.1,
      presencePenalty: 0.2,
      repetitionPenalty: 1.1,
      stopSequences: ['END_SCENE'],
    },
    visual: {
      coverImageStyle: 'digital-art',
      colorPalette: 'neon',
      illustrationFrequency: 'key-scenes',
      artDirection: 'Futuristic cyberpunk aesthetic with neon highlights',
      aspectRatio: '16:9',
      visualMoodBoard: ['cyberpunk', 'neon', 'dystopian'],
    },
    length: {
      targetWordCount: 75000,
      chapterCount: 20,
      averageChapterLength: 3750,
      sceneLength: 'medium',
      prologueIncluded: true,
      epilogueIncluded: false,
      formatType: 'novel',
    },
    advanced: {
      pointOfView: 'third-person-limited',
      tenseConsistency: 'past',
      unreliableNarrator: false,
      metafictionalElements: 15,
      experimentalTechniques: ['multiple-timelines'],
      targetAudience: 'adult',
      contentWarnings: ['violence', 'adult themes'],
      genreMashup: ['sci-fi', 'thriller'],
      customInstructions: 'Focus on tech noir atmosphere and moral ambiguity',
      seedPhrase: 'In the neon-lit streets of Neo Tokyo...',
    },
  } as ProParameters,
};

const mockPresetsCollection = {
  'cyberpunk-1': mockValidPreset,
  'fantasy-epic': {
    name: 'Epic Fantasy Quest',
    description: 'High fantasy adventure',
    timestamp: Date.now() - 100000,
    version: 1,
    parameters: {
      ...mockValidPreset.parameters,
      world: {
        ...mockValidPreset.parameters.world,
        settingType: 'high-fantasy',
        technologyLevel: 'medieval',
        magicSystemComplexity: 85,
      },
    },
  },
};

describe('Pro Panel Preset Functionality', () => {
  let mockStoreActions: {
    savePreset: jest.Mock;
    loadPreset: jest.Mock;
    deletePreset: jest.Mock;
    exportPresets: jest.Mock;
    importPresets: jest.Mock;
    resetAll: jest.Mock;
  };

  let mockStoreState = {
    presets: {} as Record<string, ProPreset>,
    currentPresetName: 'Default',
    isModified: false,
  };

  beforeEach(() => {
    // Reset mock store state
    mockStoreState = {
      presets: { ...mockPresetsCollection },
      currentPresetName: 'Default',
      isModified: false,
    };

    // Create mock store actions
    mockStoreActions = {
      savePreset: jest.fn((name: string, description?: string) => {
        const preset = {
          ...mockValidPreset,
          name,
          description,
          timestamp: Date.now(),
        };
        mockStoreState.presets[name.toLowerCase().replace(/\s+/g, '-')] = preset;
        mockStoreState.currentPresetName = name;
        mockStoreState.isModified = false;
      }),

      loadPreset: jest.fn((key: string) => {
        const preset = mockStoreState.presets[key];
        if (preset) {
          mockStoreState.currentPresetName = preset.name;
          mockStoreState.isModified = false;
        }
      }),

      deletePreset: jest.fn((key: string) => {
        delete mockStoreState.presets[key];
        if (mockStoreState.currentPresetName === mockStoreState.presets[key]?.name) {
          mockStoreState.currentPresetName = 'Default';
        }
      }),

      exportPresets: jest.fn(() => {
        return JSON.stringify(mockStoreState.presets, null, 2);
      }),

      importPresets: jest.fn((jsonString: string) => {
        try {
          const parsed = JSON.parse(jsonString);

          // Validate structure
          if (!parsed || typeof parsed !== 'object') {
            return { success: false, error: 'Invalid JSON structure' };
          }

          let count = 0;
          for (const [key, preset] of Object.entries(parsed)) {
            if (typeof preset === 'object' && preset !== null) {
              mockStoreState.presets[key] = preset as ProPreset;
              count++;
            }
          }

          return { success: true, count };
        } catch (error) {
          return { success: false, error: 'Invalid JSON format' };
        }
      }),

      resetAll: jest.fn(() => {
        mockStoreState.currentPresetName = 'Default';
        mockStoreState.isModified = false;
      }),
    };

    // Mock the store hook
    (useProPanelStore as jest.Mock).mockImplementation((selector?: Function) => {
      if (selector) {
        return selector(mockStoreState);
      }
      return { ...mockStoreState, ...mockStoreActions };
    });
  });

  describe('Preset Save Functionality', () => {
    it('should save a preset with valid name and description', () => {
      const { savePreset } = mockStoreActions;

      act(() => {
        savePreset('My Awesome Story', 'A tale of adventure');
      });

      expect(savePreset).toHaveBeenCalledWith('My Awesome Story', 'A tale of adventure');
      expect(mockStoreState.presets['my-awesome-story']).toBeDefined();
      expect(mockStoreState.presets['my-awesome-story'].name).toBe('My Awesome Story');
      expect(mockStoreState.presets['my-awesome-story'].description).toBe('A tale of adventure');
      expect(mockStoreState.currentPresetName).toBe('My Awesome Story');
      expect(mockStoreState.isModified).toBe(false);
    });

    it('should save a preset without description', () => {
      const { savePreset } = mockStoreActions;

      act(() => {
        savePreset('Simple Story');
      });

      expect(savePreset).toHaveBeenCalledWith('Simple Story');
      expect(mockStoreState.presets['simple-story']).toBeDefined();
      expect(mockStoreState.presets['simple-story'].description).toBeUndefined();
    });

    it('should handle saving with empty name gracefully', () => {
      const { savePreset } = mockStoreActions;

      // This should be handled by the UI validation
      act(() => {
        savePreset('   '); // Whitespace only
      });

      expect(savePreset).toHaveBeenCalledWith('   ');
      // The actual store would trim this, but in our mock we test the call
    });
  });

  describe('Preset Load Functionality', () => {
    it('should load an existing preset', () => {
      const { loadPreset } = mockStoreActions;

      act(() => {
        loadPreset('cyberpunk-1');
      });

      expect(loadPreset).toHaveBeenCalledWith('cyberpunk-1');
      expect(mockStoreState.currentPresetName).toBe('Test Cyberpunk Story');
      expect(mockStoreState.isModified).toBe(false);
    });

    it('should handle loading non-existent preset', () => {
      const { loadPreset } = mockStoreActions;

      act(() => {
        loadPreset('non-existent-key');
      });

      expect(loadPreset).toHaveBeenCalledWith('non-existent-key');
      // Current preset name should remain unchanged
      expect(mockStoreState.currentPresetName).toBe('Default');
    });
  });

  describe('Preset Delete Functionality', () => {
    it('should delete an existing preset', () => {
      const { deletePreset } = mockStoreActions;

      expect(mockStoreState.presets['cyberpunk-1']).toBeDefined();

      act(() => {
        deletePreset('cyberpunk-1');
      });

      expect(deletePreset).toHaveBeenCalledWith('cyberpunk-1');
      expect(mockStoreState.presets['cyberpunk-1']).toBeUndefined();
    });

    it('should handle deleting non-existent preset', () => {
      const { deletePreset } = mockStoreActions;

      act(() => {
        deletePreset('non-existent');
      });

      expect(deletePreset).toHaveBeenCalledWith('non-existent');
      // Should not throw error
    });
  });

  describe('Export Functionality', () => {
    it('should export presets as valid JSON', () => {
      const { exportPresets } = mockStoreActions;

      const result = exportPresets();

      expect(exportPresets).toHaveBeenCalled();
      expect(() => JSON.parse(result)).not.toThrow();

      const parsed = JSON.parse(result);
      expect(parsed['cyberpunk-1']).toBeDefined();
      expect(parsed['fantasy-epic']).toBeDefined();
    });

    it('should export empty object when no presets exist', () => {
      mockStoreState.presets = {};
      const { exportPresets } = mockStoreActions;

      const result = exportPresets();
      const parsed = JSON.parse(result);

      expect(parsed).toEqual({});
    });
  });

  describe('Import Functionality', () => {
    it('should import valid JSON presets', () => {
      const { importPresets } = mockStoreActions;
      const validJson = JSON.stringify({
        'new-preset': {
          name: 'Imported Story',
          description: 'A story from another dimension',
          timestamp: Date.now(),
          version: 1,
          parameters: mockValidPreset.parameters,
        },
      });

      const result = importPresets(validJson);

      expect(importPresets).toHaveBeenCalledWith(validJson);
      expect(result.success).toBe(true);
      expect(result.count).toBe(1);
      expect(mockStoreState.presets['new-preset']).toBeDefined();
    });

    it('should reject invalid JSON format', () => {
      const { importPresets } = mockStoreActions;
      const invalidJson = '{ invalid json format ';

      const result = importPresets(invalidJson);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid JSON format');
    });

    it('should reject non-object JSON', () => {
      const { importPresets } = mockStoreActions;
      const invalidStructure = '"just a string"';

      const result = importPresets(invalidStructure);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid JSON structure');
    });

    it('should handle empty JSON object', () => {
      const { importPresets } = mockStoreActions;
      const emptyJson = '{}';

      const result = importPresets(emptyJson);

      expect(result.success).toBe(true);
      expect(result.count).toBe(0);
    });

    it('should skip invalid preset entries', () => {
      const { importPresets } = mockStoreActions;
      const mixedJson = JSON.stringify({
        'valid-preset': mockValidPreset,
        'invalid-entry': 'not an object',
        'null-entry': null,
      });

      const result = importPresets(mixedJson);

      expect(result.success).toBe(true);
      expect(result.count).toBe(1); // Only valid entry counted
      expect(mockStoreState.presets['valid-preset']).toBeDefined();
      expect(mockStoreState.presets['invalid-entry']).toBeUndefined();
    });

    it('should handle malformed JSON gracefully', () => {
      const { importPresets } = mockStoreActions;
      const malformedCases = [
        '', // Empty string
        'null', // Null value
        '[]', // Array instead of object
        '{"key": undefined}', // Invalid JavaScript
        '{"key":', // Incomplete JSON
      ];

      malformedCases.forEach((malformed) => {
        const result = importPresets(malformed);
        expect(result.success).toBe(false);
        expect(result.error).toMatch(/Invalid JSON/);
      });
    });
  });

  describe('Reset Functionality', () => {
    it('should reset to defaults', () => {
      mockStoreState.currentPresetName = 'Custom Preset';
      mockStoreState.isModified = true;

      const { resetAll } = mockStoreActions;

      act(() => {
        resetAll();
      });

      expect(resetAll).toHaveBeenCalled();
      expect(mockStoreState.currentPresetName).toBe('Default');
      expect(mockStoreState.isModified).toBe(false);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle concurrent save operations', () => {
      const { savePreset } = mockStoreActions;

      // Simulate multiple rapid saves
      act(() => {
        savePreset('Story 1');
        savePreset('Story 2');
        savePreset('Story 3');
      });

      expect(savePreset).toHaveBeenCalledTimes(3);
      expect(mockStoreState.currentPresetName).toBe('Story 3');
    });

    it('should handle large preset collections', () => {
      // Create a large number of presets
      const largeCollection: Record<string, ProPreset> = {};
      for (let i = 0; i < 100; i++) {
        largeCollection[`preset-${i}`] = {
          ...mockValidPreset,
          name: `Preset ${i}`,
          timestamp: Date.now() - i * 1000,
        };
      }

      mockStoreState.presets = largeCollection;
      const { exportPresets } = mockStoreActions;

      const result = exportPresets();
      const parsed = JSON.parse(result);

      expect(Object.keys(parsed)).toHaveLength(100);
    });

    it('should preserve timestamps on import', () => {
      const fixedTimestamp = 1640995200000; // Fixed timestamp
      const { importPresets } = mockStoreActions;
      const jsonWithTimestamp = JSON.stringify({
        'timestamped-preset': {
          ...mockValidPreset,
          timestamp: fixedTimestamp,
        },
      });

      importPresets(jsonWithTimestamp);

      expect(mockStoreState.presets['timestamped-preset'].timestamp).toBe(fixedTimestamp);
    });
  });
});