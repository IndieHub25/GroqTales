/**
 * Genre Management Utilities for ComicCraft AI Story Studio
 *
 * Handles genre selection, locking after Panel 1, and validation.
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import { PanelData } from '@/lib/types/story-session';

/** Maximum genres a user can select */
export const MAX_GENRES = 2;

/** Available genres */
export const AVAILABLE_GENRES = [
    'Fantasy',
    'Science Fiction',
    'Mystery',
    'Romance',
    'Horror',
    'Thriller',
    'Historical',
    'Comedy',
    'Drama',
    'Adventure',
    'Dystopian',
    'Noir',
    'Superhero',
    'Slice of Life',
    'Mythology',
    'Steampunk',
    'Cyberpunk',
    'Post-Apocalyptic',
    'Western',
    'Magical Realism',
] as const;

export type GenreName = (typeof AVAILABLE_GENRES)[number];

export interface GenreValidationResult {
    isValid: boolean;
    errors: string[];
}

/**
 * Check whether genres can still be modified.
 *
 * Genres are only modifiable when no panels have been created yet or the
 * current panel index is 1 and it has not been completed.
 *
 * Requirements: 2.3, 2.5
 *
 * @param panels - Existing panels in the story session
 * @returns true if genres can be changed
 */
export function canModifyGenres(panels: PanelData[]): boolean {
    if (panels.length === 0) return true;

    // If there are any completed panels (Panel 1+), genres are locked
    const hasCompletedPanels = panels.some(
        (p) => p.status === 'complete' && p.panelIndex >= 1
    );

    return !hasCompletedPanels;
}

/**
 * Validate a genre selection.
 *
 * Requirements: 2.1, 2.2, 2.4
 *
 * @param genres - Array of selected genre strings
 * @returns Validation result with errors if invalid
 */
export function validateGenreSelection(genres: string[]): GenreValidationResult {
    const errors: string[] = [];

    if (!genres || genres.length === 0) {
        errors.push('At least one genre must be selected.');
    }

    if (genres.length > MAX_GENRES) {
        errors.push(`Maximum ${MAX_GENRES} genres allowed. You selected ${genres.length}.`);
    }

    // Check for duplicate genres
    const uniqueGenres = new Set(genres);
    if (uniqueGenres.size !== genres.length) {
        errors.push('Duplicate genres are not allowed.');
    }

    // Check that each genre is a known genre
    const unknownGenres = genres.filter(
        (g) => !AVAILABLE_GENRES.includes(g as GenreName)
    );
    if (unknownGenres.length > 0) {
        errors.push(`Unknown genre(s): ${unknownGenres.join(', ')}`);
    }

    return { isValid: errors.length === 0, errors };
}

/**
 * Lock genres for the story session.
 *
 * Returns a frozen copy of the genres array so it cannot be mutated.
 *
 * Requirements: 2.3
 *
 * @param genres - The genres to lock
 * @returns Frozen array of locked genres
 */
export function lockGenres(genres: string[]): readonly string[] {
    return Object.freeze([...genres]);
}

/**
 * Get genres for a given panel index.
 *
 * For Panel 1, returns the provided genres (user can still choose).
 * For Panel 2-7, returns the locked genres from Panel 1.
 *
 * Requirements: 2.5
 *
 * @param panelIndex - Current panel index
 * @param selectedGenres - User-selected genres (for panel 1)
 * @param lockedGenres - Previously locked genres (for panels 2-7)
 * @returns The genres to use for this panel
 */
export function getGenresForPanel(
    panelIndex: number,
    selectedGenres: string[],
    lockedGenres: readonly string[] | null
): string[] {
    if (panelIndex === 1) {
        return [...selectedGenres];
    }

    if (!lockedGenres || lockedGenres.length === 0) {
        throw new Error('Genres must be locked before creating Panel 2+');
    }

    return [...lockedGenres];
}
