/**
 * Property-Based Tests for PanelLifecycleManager
 * Tests sequential panel enforcement and lifecycle rules
 * 
 * **Validates: Requirements 1.3, 9.3, 9.5**
 */

import * as fc from 'fast-check';
import { PanelLifecycleManager } from '@/lib/services/panel-lifecycle-manager';
import { PanelData } from '@/lib/types/story-session';

describe('PanelLifecycleManager Property-Based Tests', () => {
  let manager: PanelLifecycleManager;

  beforeEach(() => {
    manager = new PanelLifecycleManager();
  });

  // Helper function to create a complete mock panel
  const createCompletePanelArbitrary = (panelIndex: number): fc.Arbitrary<PanelData> => {
    return fc.record({
      panelIndex: fc.constant(panelIndex),
      title: fc.string({ minLength: 1 }).map(s => `Panel ${panelIndex}: ${s}`),
      parameters: fc.constant({}),
      generatedContent: fc.string({ minLength: 10 }),
      wordCount: fc.integer({ min: 1, max: 10000 }),
      status: fc.constant('complete' as const),
      metadata: fc.record({
        createdAt: fc.date(),
        generatedAt: fc.date(),
        tokensUsed: fc.record({
          groq: fc.integer({ min: 0, max: 10000 }),
          gemini: fc.integer({ min: 0, max: 10000 }),
        }),
      }),
    });
  };

  // Helper to create a sequential array of complete panels from 1 to N
  const createSequentialPanelsArbitrary = (maxIndex: number): fc.Arbitrary<PanelData[]> => {
    if (maxIndex < 1 || maxIndex > 7) {
      return fc.constant([]);
    }
    
    const panelArbitraries = Array.from({ length: maxIndex }, (_, i) => 
      createCompletePanelArbitrary(i + 1)
    );
    
    return fc.tuple(...panelArbitraries).map(panels => panels);
  };

  describe('Property 2: Sequential panel enforcement', () => {
    /**
     * **Validates: Requirements 1.3, 9.3, 9.5**
     * 
     * This property test verifies that:
     * 1. Panel N cannot be created without panel N-1
     * 2. Panel indices are always sequential from 1 to 7
     */

    test('PROPERTY: Panel N cannot be created without panel N-1 existing', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 7 }), // Panel index to test (2-7)
          fc.integer({ min: 0, max: 6 }), // Number of existing panels (0-6)
          (targetPanelIndex, existingPanelCount) => {
            // Create sequential panels from 1 to existingPanelCount
            const existingPanels: PanelData[] = [];
            for (let i = 1; i <= existingPanelCount; i++) {
              existingPanels.push({
                panelIndex: i,
                title: `Panel ${i}`,
                parameters: {},
                generatedContent: 'Test content',
                wordCount: 100,
                status: 'complete',
                metadata: {
                  createdAt: new Date(),
                  generatedAt: new Date(),
                  tokensUsed: { groq: 100, gemini: 200 },
                },
              });
            }

            const canCreate = manager.canCreatePanel(targetPanelIndex, existingPanels);
            const previousPanelIndex = targetPanelIndex - 1;
            const hasPreviousPanel = existingPanels.some(p => p.panelIndex === previousPanelIndex);

            // PROPERTY: Panel N can only be created if panel N-1 exists and is complete
            if (hasPreviousPanel) {
              const previousPanel = existingPanels.find(p => p.panelIndex === previousPanelIndex);
              const isPreviousComplete = previousPanel?.status === 'complete' && 
                                        previousPanel.generatedContent.length > 0 &&
                                        previousPanel.wordCount > 0 &&
                                        previousPanel.title.length > 0 &&
                                        previousPanel.metadata.generatedAt !== undefined;
              
              // If previous panel exists and is complete, we should be able to create target panel
              // (unless target panel already exists)
              const targetAlreadyExists = existingPanels.some(p => p.panelIndex === targetPanelIndex);
              if (isPreviousComplete && !targetAlreadyExists) {
                expect(canCreate).toBe(true);
              }
            } else {
              // If previous panel doesn't exist, we cannot create target panel
              expect(canCreate).toBe(false);
            }
          }
        ),
        { numRuns: 200 }
      );
    });

    test('PROPERTY: Panel 1 can always be created if it does not exist', () => {
      fc.assert(
        fc.property(
          fc.boolean(), // Whether panel 1 already exists
          (panel1Exists) => {
            const existingPanels: PanelData[] = panel1Exists ? [{
              panelIndex: 1,
              title: 'Panel 1',
              parameters: {},
              generatedContent: 'Test content',
              wordCount: 100,
              status: 'complete',
              metadata: {
                createdAt: new Date(),
                generatedAt: new Date(),
                tokensUsed: { groq: 100, gemini: 200 },
              },
            }] : [];

            const canCreate = manager.canCreatePanel(1, existingPanels);

            // PROPERTY: Panel 1 can be created if and only if it doesn't already exist
            expect(canCreate).toBe(!panel1Exists);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('PROPERTY: Panel indices must always be sequential from 1 to N with no gaps', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 7 }), // Number of panels to create
          (numPanels) => {
            // Create sequential panels from 1 to numPanels
            const panels: PanelData[] = [];
            for (let i = 1; i <= numPanels; i++) {
              panels.push({
                panelIndex: i,
                title: `Panel ${i}`,
                parameters: {},
                generatedContent: 'Test content',
                wordCount: 100,
                status: 'complete',
                metadata: {
                  createdAt: new Date(),
                  generatedAt: new Date(),
                  tokensUsed: { groq: 100, gemini: 200 },
                },
              });
            }

            const validation = manager.validatePanelSequence(panels);

            // PROPERTY: Sequential panels from 1 to N should always be valid
            expect(validation.isValid).toBe(true);
            expect(validation.errors).toHaveLength(0);

            // PROPERTY: All panel indices should be in range [1, 7]
            panels.forEach(panel => {
              expect(panel.panelIndex).toBeGreaterThanOrEqual(1);
              expect(panel.panelIndex).toBeLessThanOrEqual(7);
            });

            // PROPERTY: Panel indices should be unique
            const indices = panels.map(p => p.panelIndex);
            const uniqueIndices = new Set(indices);
            expect(indices.length).toBe(uniqueIndices.size);

            // PROPERTY: Panel indices should form a continuous sequence starting from 1
            const sortedIndices = [...indices].sort((a, b) => a - b);
            for (let i = 0; i < sortedIndices.length; i++) {
              expect(sortedIndices[i]).toBe(i + 1);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('PROPERTY: Panels with gaps in sequence are always invalid', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }), // First panel index
          fc.integer({ min: 2, max: 6 }), // Gap size
          (firstIndex, gapSize) => {
            const secondIndex = firstIndex + gapSize + 1; // Create a gap
            
            // Only test if both indices are within valid range
            if (secondIndex > 7) {
              return true; // Skip this test case
            }

            const panels: PanelData[] = [
              {
                panelIndex: firstIndex,
                title: `Panel ${firstIndex}`,
                parameters: {},
                generatedContent: 'Test content',
                wordCount: 100,
                status: 'complete',
                metadata: {
                  createdAt: new Date(),
                  generatedAt: new Date(),
                  tokensUsed: { groq: 100, gemini: 200 },
                },
              },
              {
                panelIndex: secondIndex,
                title: `Panel ${secondIndex}`,
                parameters: {},
                generatedContent: 'Test content',
                wordCount: 100,
                status: 'complete',
                metadata: {
                  createdAt: new Date(),
                  generatedAt: new Date(),
                  tokensUsed: { groq: 100, gemini: 200 },
                },
              },
            ];

            const validation = manager.validatePanelSequence(panels);

            // PROPERTY: Panels with gaps should always be invalid (unless firstIndex is 1 and gap is 0)
            if (gapSize > 0 || firstIndex !== 1) {
              expect(validation.isValid).toBe(false);
              expect(validation.errors.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('PROPERTY: Cannot create panel with index outside range [1, 7]', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -10, max: 20 }), // Test various invalid indices
          (panelIndex) => {
            const existingPanels: PanelData[] = [];

            const canCreate = manager.canCreatePanel(panelIndex, existingPanels);

            // PROPERTY: Only indices 1-7 are valid
            if (panelIndex < 1 || panelIndex > 7) {
              expect(canCreate).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('PROPERTY: getNextPanelIndex always returns sequential next index or -1', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 7 }), // Number of complete panels
          (numCompletePanels) => {
            // Create sequential complete panels
            const panels: PanelData[] = [];
            for (let i = 1; i <= numCompletePanels; i++) {
              panels.push({
                panelIndex: i,
                title: `Panel ${i}`,
                parameters: {},
                generatedContent: 'Test content',
                wordCount: 100,
                status: 'complete',
                metadata: {
                  createdAt: new Date(),
                  generatedAt: new Date(),
                  tokensUsed: { groq: 100, gemini: 200 },
                },
              });
            }

            const nextIndex = manager.getNextPanelIndex(panels);

            // PROPERTY: Next index should be numCompletePanels + 1, or -1 if story is complete
            if (numCompletePanels === 0) {
              expect(nextIndex).toBe(1);
            } else if (numCompletePanels >= 7) {
              expect(nextIndex).toBe(-1);
            } else {
              expect(nextIndex).toBe(numCompletePanels + 1);
            }

            // PROPERTY: Next index should always be in range [1, 7] or -1
            if (nextIndex !== -1) {
              expect(nextIndex).toBeGreaterThanOrEqual(1);
              expect(nextIndex).toBeLessThanOrEqual(7);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('PROPERTY: Incomplete panels block creation of subsequent panels', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 6 }), // Index of incomplete panel
          fc.constantFrom('pending', 'generating', 'error'), // Incomplete status
          (incompletePanelIndex, incompleteStatus) => {
            // Create panels up to incompletePanelIndex, with the last one incomplete
            const panels: PanelData[] = [];
            
            // Add complete panels before the incomplete one
            for (let i = 1; i < incompletePanelIndex; i++) {
              panels.push({
                panelIndex: i,
                title: `Panel ${i}`,
                parameters: {},
                generatedContent: 'Test content',
                wordCount: 100,
                status: 'complete',
                metadata: {
                  createdAt: new Date(),
                  generatedAt: new Date(),
                  tokensUsed: { groq: 100, gemini: 200 },
                },
              });
            }

            // Add the incomplete panel
            panels.push({
              panelIndex: incompletePanelIndex,
              title: `Panel ${incompletePanelIndex}`,
              parameters: {},
              generatedContent: '',
              wordCount: 0,
              status: incompleteStatus as 'pending' | 'generating' | 'error',
              metadata: {
                createdAt: new Date(),
                tokensUsed: { groq: 0, gemini: 0 },
              },
            });

            const nextPanelIndex = incompletePanelIndex + 1;
            const canCreateNext = manager.canCreatePanel(nextPanelIndex, panels);

            // PROPERTY: Cannot create next panel if previous panel is incomplete
            expect(canCreateNext).toBe(false);

            // PROPERTY: getNextPanelIndex should return -1 or the incomplete panel index
            const nextIndex = manager.getNextPanelIndex(panels);
            expect(nextIndex === -1 || nextIndex === incompletePanelIndex).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('PROPERTY: Panel sequence validation is order-independent', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 7 }), // Number of panels
          (numPanels) => {
            // Create sequential panels
            const panels: PanelData[] = [];
            for (let i = 1; i <= numPanels; i++) {
              panels.push({
                panelIndex: i,
                title: `Panel ${i}`,
                parameters: {},
                generatedContent: 'Test content',
                wordCount: 100,
                status: 'complete',
                metadata: {
                  createdAt: new Date(),
                  generatedAt: new Date(),
                  tokensUsed: { groq: 100, gemini: 200 },
                },
              });
            }

            // Shuffle the panels
            const shuffledPanels = [...panels].sort(() => Math.random() - 0.5);

            const originalValidation = manager.validatePanelSequence(panels);
            const shuffledValidation = manager.validatePanelSequence(shuffledPanels);

            // PROPERTY: Validation result should be the same regardless of input order
            expect(originalValidation.isValid).toBe(shuffledValidation.isValid);
            expect(originalValidation.errors.length).toBe(shuffledValidation.errors.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('PROPERTY: Duplicate panel indices always result in invalid sequence', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 7 }), // Panel index to duplicate
          (duplicateIndex) => {
            const panels: PanelData[] = [
              {
                panelIndex: duplicateIndex,
                title: `Panel ${duplicateIndex} - First`,
                parameters: {},
                generatedContent: 'Test content',
                wordCount: 100,
                status: 'complete',
                metadata: {
                  createdAt: new Date(),
                  generatedAt: new Date(),
                  tokensUsed: { groq: 100, gemini: 200 },
                },
              },
              {
                panelIndex: duplicateIndex,
                title: `Panel ${duplicateIndex} - Duplicate`,
                parameters: {},
                generatedContent: 'Test content',
                wordCount: 100,
                status: 'complete',
                metadata: {
                  createdAt: new Date(),
                  generatedAt: new Date(),
                  tokensUsed: { groq: 100, gemini: 200 },
                },
              },
            ];

            const validation = manager.validatePanelSequence(panels);

            // PROPERTY: Duplicate indices should always be invalid
            expect(validation.isValid).toBe(false);
            expect(validation.errors.some(e => e.includes('Duplicate'))).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('PROPERTY: Story is complete if and only if it has 7 complete panels', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 8 }), // Number of panels
          (numPanels) => {
            // Create panels
            const panels: PanelData[] = [];
            for (let i = 1; i <= Math.min(numPanels, 7); i++) {
              panels.push({
                panelIndex: i,
                title: `Panel ${i}`,
                parameters: {},
                generatedContent: 'Test content',
                wordCount: 100,
                status: 'complete',
                metadata: {
                  createdAt: new Date(),
                  generatedAt: new Date(),
                  tokensUsed: { groq: 100, gemini: 200 },
                },
              });
            }

            const isComplete = manager.isStoryComplete(panels);

            // PROPERTY: Story is complete if and only if there are exactly 7 complete panels
            expect(isComplete).toBe(numPanels >= 7);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
