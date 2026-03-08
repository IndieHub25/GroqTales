/**
 * Unit tests for genre management utilities
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import * as fc from 'fast-check';
import {
    canModifyGenres,
    validateGenreSelection,
    lockGenres,
    getGenresForPanel,
    AVAILABLE_GENRES,
    MAX_GENRES,
} from '@/lib/utils/genre-manager';
import { PanelData } from '@/lib/types/story-session';

const mockPanel = (
    panelIndex: number,
    status: 'pending' | 'generating' | 'complete' | 'error' = 'complete'
): PanelData => ({
    panelIndex,
    title: `Panel ${panelIndex}`,
    parameters: {},
    generatedContent: status === 'complete' ? 'Content' : '',
    wordCount: status === 'complete' ? 100 : 0,
    status,
    metadata: {
        createdAt: new Date(),
        generatedAt: status === 'complete' ? new Date() : undefined,
    },
});

describe('Genre Manager', () => {
    describe('canModifyGenres', () => {
        it('should allow genre modification when no panels exist', () => {
            expect(canModifyGenres([])).toBe(true);
        });

        it('should disallow genre modification after Panel 1 is complete', () => {
            expect(canModifyGenres([mockPanel(1)])).toBe(false);
        });

        it('should allow genre modification when Panel 1 is pending', () => {
            expect(canModifyGenres([mockPanel(1, 'pending')])).toBe(true);
        });

        it('should disallow genre modification after any panel is complete', () => {
            expect(canModifyGenres([mockPanel(1), mockPanel(2)])).toBe(false);
        });
    });

    describe('validateGenreSelection', () => {
        it('should accept 1 valid genre', () => {
            const result = validateGenreSelection(['Fantasy']);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should accept 2 valid genres', () => {
            const result = validateGenreSelection(['Fantasy', 'Science Fiction']);
            expect(result.isValid).toBe(true);
        });

        it('should reject empty selection', () => {
            const result = validateGenreSelection([]);
            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toContain('At least one genre');
        });

        it('should reject more than MAX_GENRES', () => {
            const result = validateGenreSelection(['Fantasy', 'Horror', 'Romance']);
            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toContain('Maximum');
        });

        it('should reject duplicate genres', () => {
            const result = validateGenreSelection(['Fantasy', 'Fantasy']);
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.includes('Duplicate'))).toBe(true);
        });

        it('should reject unknown genres', () => {
            const result = validateGenreSelection(['Alien Cooking Show']);
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.includes('Unknown'))).toBe(true);
        });
    });

    describe('lockGenres', () => {
        it('should return a frozen copy', () => {
            const genres = ['Fantasy', 'Horror'];
            const locked = lockGenres(genres);
            expect(locked).toEqual(genres);
            expect(Object.isFrozen(locked)).toBe(true);
        });

        it('should not be affected by mutations to the original array', () => {
            const genres = ['Fantasy'];
            const locked = lockGenres(genres);
            genres.push('Horror');
            expect(locked).toHaveLength(1);
        });
    });

    describe('getGenresForPanel', () => {
        it('should return selected genres for Panel 1', () => {
            const result = getGenresForPanel(1, ['Fantasy'], null);
            expect(result).toEqual(['Fantasy']);
        });

        it('should return locked genres for Panel 2+', () => {
            const locked = lockGenres(['Fantasy', 'Horror']);
            const result = getGenresForPanel(2, ['Romance'], locked);
            expect(result).toEqual(['Fantasy', 'Horror']);
        });

        it('should throw when panels 2+ have no locked genres', () => {
            expect(() => getGenresForPanel(2, ['Fantasy'], null)).toThrow();
        });
    });

    describe('Property 4: Genre immutability after Panel 1', () => {
        test('PROPERTY: Genres cannot be modified after Panel 1 is complete', () => {
            fc.assert(
                fc.property(
                    fc.integer({ min: 1, max: 7 }),
                    (numCompletePanels) => {
                        const panels = Array.from({ length: numCompletePanels }, (_, i) =>
                            mockPanel(i + 1)
                        );
                        const modifiable = canModifyGenres(panels);

                        // PROPERTY: If any complete panel exists, genres cannot be modified
                        if (numCompletePanels >= 1) {
                            expect(modifiable).toBe(false);
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });

        test('PROPERTY: All panels 2-7 inherit Panel 1 genres', () => {
            fc.assert(
                fc.property(
                    fc.integer({ min: 2, max: 7 }),
                    fc.subarray([...AVAILABLE_GENRES], { minLength: 1, maxLength: MAX_GENRES }),
                    (panelIndex, selectedGenres) => {
                        const locked = lockGenres(selectedGenres);
                        const result = getGenresForPanel(panelIndex, ['Romance'], locked);

                        // PROPERTY: Panel 2-7 always gets locked genres, never the new selection
                        expect(result).toEqual([...locked]);
                        expect(result).not.toEqual(['Romance']);
                    }
                ),
                { numRuns: 100 }
            );
        });
    });
});
