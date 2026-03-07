/**
 * Property-Based Tests for StoryMemoryManager
 * Tests narrative canon preservation and consistency
 * 
 * **Property 3: Narrative canon preservation**
 * **Validates: Requirements 4.5**
 */

import * as fc from 'fast-check';
import { StoryMemoryManager } from '@/lib/services/story-memory-manager';
import { PanelData, StoryMemory, CharacterMemory } from '@/lib/types/story-session';

describe('StoryMemoryManager Property-Based Tests', () => {
    let manager: StoryMemoryManager;

    beforeEach(() => {
        manager = new StoryMemoryManager();
    });

    // Helper: create a complete panel with specified content
    const createPanel = (
        panelIndex: number,
        content: string,
        params: Record<string, any> = {}
    ): PanelData => ({
        panelIndex,
        title: `Chapter ${panelIndex}`,
        parameters: params,
        generatedContent: content,
        wordCount: content.split(/\s+/).length,
        status: 'complete',
        metadata: {
            createdAt: new Date(),
            generatedAt: new Date(),
        },
    });

    const createEmptyMemory = (): StoryMemory => ({
        characters: [],
        worldBuilding: {
            setting: '',
            timePeriod: '',
            rules: [],
            locations: [],
            cultures: [],
        },
        majorEvents: [],
        unresolvedQuestions: [],
        establishedFacts: [],
        themes: [],
        tone: '',
    });

    describe('Property 3: Narrative canon preservation', () => {
        test('PROPERTY: Memory never loses established characters from previous panels', () => {
            fc.assert(
                fc.property(
                    fc.integer({ min: 2, max: 7 }),   // number of panels
                    fc.array(fc.string({ minLength: 3, maxLength: 10 }), { minLength: 1, maxLength: 5 }),
                    (numPanels, characterNames) => {
                        // Build up memory panel by panel
                        let memory: StoryMemory | undefined;

                        // Panel 1 introduces characters
                        const charContent = characterNames
                            .map(n => `${n.charAt(0).toUpperCase() + n.slice(1)} walked into the room.`)
                            .join(' ');
                        const panel1 = createPanel(1, charContent, { protagonistArchetype: 'hero' });
                        memory = manager.updateMemory(panel1);

                        const charsAfterPanel1 = memory.characters.length;

                        // Add subsequent panels with unrelated content
                        for (let i = 2; i <= numPanels; i++) {
                            const panel = createPanel(i, 'The wind blew through the trees. Nothing changed.', {
                                chapterRole: 'development',
                            });
                            memory = manager.updateMemory(panel, memory);
                        }

                        // PROPERTY: Number of characters should never decrease
                        expect(memory.characters.length).toBeGreaterThanOrEqual(charsAfterPanel1);
                    }
                ),
                { numRuns: 50 }
            );
        });

        test('PROPERTY: Established facts are never removed by new panels', () => {
            fc.assert(
                fc.property(
                    fc.integer({ min: 2, max: 5 }),
                    (numPanels) => {
                        let memory: StoryMemory | undefined;

                        // Panel 1 establishes facts
                        const panel1 = createPanel(1, 'The kingdom of Aldoria was founded a thousand years ago. Magic is forbidden.', {
                            settingType: 'Fantasy',
                            sentimentTone: 'dark',
                        });
                        memory = manager.updateMemory(panel1);

                        const factsAfterPanel1 = [...memory.establishedFacts];

                        // Add more panels
                        for (let i = 2; i <= numPanels; i++) {
                            const panel = createPanel(i, 'The hero continued the journey through uncharted lands.', {
                                chapterRole: 'development',
                            });
                            memory = manager.updateMemory(panel, memory);
                        }

                        // PROPERTY: All facts from panel 1 should still be present
                        factsAfterPanel1.forEach(fact => {
                            expect(memory!.establishedFacts).toContain(fact);
                        });
                    }
                ),
                { numRuns: 50 }
            );
        });

        test('PROPERTY: World-building locations are never removed', () => {
            fc.assert(
                fc.property(
                    fc.integer({ min: 2, max: 5 }),
                    (numPanels) => {
                        let memory: StoryMemory | undefined;

                        // Panel 1 establishes locations
                        const panel1 = createPanel(1, 'They arrived at the Crystal City, a gleaming fortress.', {
                            settingType: 'Fantasy',
                        });
                        memory = manager.updateMemory(panel1);

                        const locationsAfterPanel1 = [...memory.worldBuilding.locations];

                        // Add more panels
                        for (let i = 2; i <= numPanels; i++) {
                            const panel = createPanel(i, `Chapter ${i} continues the story.`);
                            memory = manager.updateMemory(panel, memory);
                        }

                        // PROPERTY: All locations from panel 1 should still be present
                        locationsAfterPanel1.forEach(loc => {
                            expect(memory!.worldBuilding.locations).toContain(loc);
                        });
                    }
                ),
                { numRuns: 50 }
            );
        });

        test('PROPERTY: Major events are monotonically increasing', () => {
            fc.assert(
                fc.property(
                    fc.integer({ min: 1, max: 7 }),
                    (numPanels) => {
                        let memory: StoryMemory | undefined;
                        const eventCounts: number[] = [];

                        for (let i = 1; i <= numPanels; i++) {
                            const panel = createPanel(i, `In chapter ${i}, a great battle occurred. The hero fought valiantly.`, {
                                chapterRole: i === numPanels ? 'climax' : 'development',
                            });
                            memory = manager.updateMemory(panel, memory);
                            eventCounts.push(memory.majorEvents.length);
                        }

                        // PROPERTY: Event count should never decrease
                        for (let i = 1; i < eventCounts.length; i++) {
                            expect(eventCounts[i]).toBeGreaterThanOrEqual(eventCounts[i - 1]!);
                        }
                    }
                ),
                { numRuns: 50 }
            );
        });

        test('PROPERTY: Themes count is monotonically non-decreasing', () => {
            fc.assert(
                fc.property(
                    fc.integer({ min: 1, max: 5 }),
                    (numPanels) => {
                        let memory: StoryMemory | undefined;
                        const themeCounts: number[] = [];

                        for (let i = 1; i <= numPanels; i++) {
                            const panel = createPanel(i, `A tale of love and betrayal in the ancient world.`, {
                                themeDepth: 5,
                                sentimentTone: 'dark',
                            });
                            memory = manager.updateMemory(panel, memory);
                            themeCounts.push(memory.themes.length);
                        }

                        // PROPERTY: Theme count should never decrease
                        for (let i = 1; i < themeCounts.length; i++) {
                            expect(themeCounts[i]).toBeGreaterThanOrEqual(themeCounts[i - 1]!);
                        }
                    }
                ),
                { numRuns: 50 }
            );
        });

        test('PROPERTY: generateSummary includes all panel titles', () => {
            fc.assert(
                fc.property(
                    fc.integer({ min: 1, max: 7 }),
                    (numPanels) => {
                        const panels: PanelData[] = [];
                        for (let i = 1; i <= numPanels; i++) {
                            panels.push(createPanel(i, `Content for chapter ${i}.`));
                        }

                        const summary = manager.generateSummary(panels);

                        // PROPERTY: Summary should reference every panel
                        for (let i = 1; i <= numPanels; i++) {
                            expect(summary).toContain(`Panel ${i}`);
                        }
                    }
                ),
                { numRuns: 50 }
            );
        });
    });
});
