/**
 * Pro Panel Zustand Store
 * Centralized state management for all Pro Panel parameters and presets
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import {
  DEFAULT_PARAMETERS,
  initializeBuiltInPresets,
} from '../../lib/constants/proPanelDefaults';
import {
  type ProParameters,
  type ProPreset,
  PresetsCollectionSchema,
  type CategoryKey,
} from '../../lib/schemas/proPanelSchemas';

// ============================================================
// STORE INTERFACE
// ============================================================
/** UI state for the Pro Panel (open categories, selected genre). */
export interface ProPanelUI {
  openCategories: string[];
  selectedGenre: string | null;
}

/** User-supplied story metadata (character, title, prompts, tropes). */
export interface StoryInput {
  characterName: string;
  ageRange: string;
  characterBackground: string;
  storyTitle: string;
  storyPrompt: string;
  inspirationPrompt: string;
  inspirationAuthor: string;
  tropesToAvoid: string[];
  tropesToInclude: string[];
}

/** Complete Zustand store shape — data, UI state, and all actions. */
export interface ProPanelState {
  // Core data
  parameters: ProParameters;
  currentPresetName: string;
  savedPresets: Record<string, ProPreset>;

  // UI state
  ui: ProPanelUI;

  // Story input
  storyInput: StoryInput;

  // Metadata
  isModified: boolean;
  lastSaved: number | null;

  // Parameter actions
  updateParameter: <C extends CategoryKey, K extends keyof ProParameters[C]>(
    category: C,
    key: K,
    value: ProParameters[C][K]
  ) => void;

  updateCategory: <C extends CategoryKey>(
    category: C,
    updates: Partial<ProParameters[C]>
  ) => void;

  resetCategory: (category: CategoryKey) => void;
  resetAll: () => void;

  // Preset actions
  savePreset: (name: string, description?: string) => void;
  loadPreset: (name: string) => void;
  deletePreset: (name: string) => void;

  // Import/Export
  exportPresets: () => string;
  importPresets: (
    json: string
  ) => { success: true; count: number } | { success: false; error: string };

  // UI actions
  setSelectedGenre: (key: string | null) => void;
  toggleCategoryOpen: (id: string) => void;
  setOpenCategories: (categories: string[]) => void;

  // Story input actions
  updateStoryInput: <K extends keyof StoryInput>(
    key: K,
    value: StoryInput[K]
  ) => void;
  resetStoryInput: () => void;
}

// ============================================================
// STORE IMPLEMENTATION
// ============================================================
/** Primary Zustand hook — persisted to localStorage under `pro-panel-store`. */
export const useProPanelStore = create<ProPanelState>()(
  persist(
    (set, get) => ({
      // Initial state
      parameters: { ...DEFAULT_PARAMETERS },
      currentPresetName: 'Default',
      savedPresets: initializeBuiltInPresets(),
      ui: {
        openCategories: ['storyStructure'],
        selectedGenre: null,
      },
      storyInput: {
        characterName: '',
        ageRange: '',
        characterBackground: '',
        storyTitle: '',
        storyPrompt: '',
        inspirationPrompt: '',
        inspirationAuthor: '',
        tropesToAvoid: [],
        tropesToInclude: [],
      },
      isModified: false,
      lastSaved: null,

      // ============================================================
      // PARAMETER ACTIONS
      // ============================================================
      updateParameter: (category, key, value) => {
        set((state) => ({
          parameters: {
            ...state.parameters,
            [category]: {
              ...state.parameters[category],
              [key]: value,
            },
          },
          isModified: true,
        }));
      },

      updateCategory: (category, updates) => {
        set((state) => ({
          parameters: {
            ...state.parameters,
            [category]: {
              ...state.parameters[category],
              ...updates,
            },
          },
          isModified: true,
        }));
      },

      resetCategory: (category) => {
        set((state) => ({
          parameters: {
            ...state.parameters,
            [category]: { ...DEFAULT_PARAMETERS[category] },
          },
          isModified: true,
        }));
      },

      resetAll: () => {
        set({
          parameters: { ...DEFAULT_PARAMETERS },
          currentPresetName: 'Default',
          isModified: false,
        });
      },

      // ============================================================
      // PRESET ACTIONS
      // ============================================================
      savePreset: (name, description) => {
        const state = get();
        const newPreset: ProPreset = {
          name,
          description,
          timestamp: Date.now(),
          version: 1,
          parameters: { ...state.parameters },
        };

        set({
          savedPresets: {
            ...state.savedPresets,
            [name.toLowerCase().replace(/\s+/g, '-')]: newPreset,
          },
          currentPresetName: name,
          isModified: false,
          lastSaved: Date.now(),
        });
      },

      loadPreset: (name) => {
        const state = get();
        const preset = state.savedPresets[name];

        if (preset) {
          set({
            parameters: { ...preset.parameters },
            currentPresetName: preset.name,
            isModified: false,
            ui: {
              ...state.ui,
              selectedGenre: name,
            },
          });
        }
      },

      deletePreset: (name) => {
        const state = get();
        const { [name]: deleted, ...remaining } = state.savedPresets;
        // Compare against both the key and the preset's display name
        const deletedName = deleted?.name;
        const shouldResetName =
          state.currentPresetName === name ||
          state.currentPresetName === deletedName;

        set({
          savedPresets: remaining,
          currentPresetName: shouldResetName
            ? 'Default'
            : state.currentPresetName,
        });
      },

      // ============================================================
      // IMPORT/EXPORT
      // ============================================================
      exportPresets: () => {
        const state = get();
        return JSON.stringify(state.savedPresets, null, 2);
      },

      importPresets: (json) => {
        try {
          const parsed = JSON.parse(json);
          const validated = PresetsCollectionSchema.parse(parsed);

          const state = get();
          const importCount = Object.keys(validated).length;

          set({
            savedPresets: {
              ...state.savedPresets,
              ...validated,
            },
          });

          return { success: true, count: importCount };
        } catch (error) {
          if (error instanceof SyntaxError) {
            return { success: false, error: 'Invalid JSON format' };
          }
          if (error instanceof Error) {
            // Extract Zod error messages
            const zodError = error as {
              errors?: Array<{ path: (string | number)[]; message: string }>;
            };
            if (zodError.errors && Array.isArray(zodError.errors)) {
              const messages = zodError.errors
                .slice(0, 3)
                .map((e) => `${e.path.join('.')}: ${e.message}`)
                .join('; ');
              return {
                success: false,
                error: `Validation failed: ${messages}`,
              };
            }
            return { success: false, error: error.message };
          }
          return { success: false, error: 'Unknown error occurred' };
        }
      },

      // ============================================================
      // UI ACTIONS
      // ============================================================
      setSelectedGenre: (key) => {
        set((state) => ({
          ui: {
            ...state.ui,
            selectedGenre: key,
          },
        }));
      },

      toggleCategoryOpen: (id) => {
        set((state) => {
          const isOpen = state.ui.openCategories.includes(id);
          return {
            ui: {
              ...state.ui,
              openCategories: isOpen
                ? state.ui.openCategories.filter((c) => c !== id)
                : [...state.ui.openCategories, id],
            },
          };
        });
      },

      setOpenCategories: (categories) => {
        set((state) => ({
          ui: {
            ...state.ui,
            openCategories: categories,
          },
        }));
      },

      // ============================================================
      // STORY INPUT ACTIONS
      // ============================================================
      updateStoryInput: (key, value) => {
        set((state) => ({
          storyInput: {
            ...state.storyInput,
            [key]: value,
          },
        }));
      },

      resetStoryInput: () => {
        set({
          storyInput: {
            characterName: '',
            ageRange: '',
            characterBackground: '',
            storyTitle: '',
            storyPrompt: '',
            inspirationPrompt: '',
            inspirationAuthor: '',
            tropesToAvoid: [],
            tropesToInclude: [],
          },
        });
      },
    }),
    {
      name: 'groqtales-pro-panel',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        parameters: state.parameters,
        currentPresetName: state.currentPresetName,
        savedPresets: state.savedPresets,
        ui: state.ui,
        storyInput: state.storyInput,
        lastSaved: state.lastSaved,
      }),
    }
  )
);

// ============================================================
// SELECTORS (for performance optimization)
// ============================================================
/** Selector: returns the full `ProParameters` object. */
export const selectParameters = (state: ProPanelState) => state.parameters;
/** Selector: returns a single category's parameters. */
export const selectCategory =
  <C extends CategoryKey>(category: C) =>
  (state: ProPanelState) =>
    state.parameters[category];
/** Selector: returns saved presets map. */
export const selectPresets = (state: ProPanelState) => state.savedPresets;
/** Selector: returns UI state (open categories, selected genre). */
export const selectUI = (state: ProPanelState) => state.ui;
/** Selector: true when parameters differ from last saved preset. */
export const selectIsModified = (state: ProPanelState) => state.isModified;
/** Selector: returns story input fields. */
export const selectStoryInput = (state: ProPanelState) => state.storyInput;
