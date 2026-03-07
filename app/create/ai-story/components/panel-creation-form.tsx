'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { PanelParameters, StoryMemory } from '@/lib/types/story-session';
import {
  AVAILABLE_GENRES,
  MAX_GENRES,
  validateGenreSelection,
  canModifyGenres,
} from '@/lib/utils/genre-manager';
import { PanelData } from '@/lib/types/story-session';

interface PanelCreationFormProps {
  panelIndex: number;
  genres: string[];
  genresLocked: boolean;
  existingPanels: PanelData[];
  parameters: PanelParameters;
  onGenreChange: (genres: string[]) => void;
  onParameterChange: (key: string, value: unknown) => void;
  onSubmit: () => void;
  isGenerating: boolean;
  error?: string | null;
}

/**
 * PanelCreationForm – Form for creating a new panel/chapter.
 * Includes genre selection (with locking), parameter summary, and submit button.
 * Requirements: 7.1, 7.2, 7.3, 2.1-2.5
 */
export const PanelCreationForm: React.FC<PanelCreationFormProps> = ({
  panelIndex,
  genres,
  genresLocked,
  existingPanels,
  parameters,
  onGenreChange,
  onParameterChange,
  onSubmit,
  isGenerating,
  error,
}) => {
  const [localGenres, setLocalGenres] = useState<string[]>(genres);
  const genreModifiable = useMemo(() => canModifyGenres(existingPanels), [existingPanels]);

  // Synchronize localGenres state with genres prop changes
  useEffect(() => {
    setLocalGenres(genres);
  }, [genres]);

  const handleGenreToggle = (genre: string) => {
    if (isGenerating) return;
    if (!genreModifiable || genresLocked) return;
    setLocalGenres((prev) => {
      let next: string[];
      if (prev.includes(genre)) {
        next = prev.filter((g) => g !== genre);
      } else if (prev.length < MAX_GENRES) {
        next = [...prev, genre];
      } else {
        return prev;
      }
      onGenreChange(next);
      return next;
    });
  };

  const genreValidation = useMemo(
    () => validateGenreSelection(localGenres),
    [localGenres]
  );

  const parameterCount = useMemo(
    () => Object.keys(parameters).filter((k) => (parameters as Record<string, unknown>)[k] !== undefined).length,
    [parameters]
  );

  const chapterRoles: Record<number, string> = {
    1: 'Opening Chapter — establishes characters, setting and genre',
    2: 'Rising Action — builds on the foundation',
    3: 'Deepening — explores characters and world',
    4: 'Midpoint — shifts the narrative direction',
    5: 'Escalation — raises the stakes',
    6: 'Climax — the turning point',
    7: 'Resolution — brings the story to a close',
  };

  return (
    <div
      style={{
        borderRadius: 12,
        background: 'var(--color-card, #1e293b)',
        border: '1px solid var(--color-border, #334155)',
        padding: '20px',
      }}
    >
      {/* Panel header */}
      <div style={{ marginBottom: 16 }}>
        <h3
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--color-foreground, #f1f5f9)',
          }}
        >
          ✍️ Create Panel {panelIndex}
        </h3>
        <p
          style={{
            margin: '4px 0 0',
            fontSize: 13,
            color: 'var(--color-muted-foreground, #94a3b8)',
          }}
        >
          {chapterRoles[panelIndex] || `Chapter ${panelIndex}`}
        </p>
      </div>

      {/* Genre Selection (only if panel 1 and not locked) */}
      {panelIndex === 1 && !genresLocked && (
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: 'block',
              fontWeight: 600,
              fontSize: 13,
              color: 'var(--color-foreground, #f1f5f9)',
              marginBottom: 8,
            }}
          >
            Select Genres (max {MAX_GENRES})
          </label>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
            }}
          >
            {AVAILABLE_GENRES.map((genre) => {
              const selected = localGenres.includes(genre);
              return (
                <button
                  key={genre}
                  onClick={() => handleGenreToggle(genre)}
                  disabled={isGenerating || !genreModifiable}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: selected ? 600 : 400,
                    border: selected
                      ? '1.5px solid var(--color-primary, #6366f1)'
                      : '1px solid var(--color-border, #334155)',
                    background: selected
                      ? 'color-mix(in srgb, var(--color-primary, #6366f1) 20%, transparent)'
                      : 'transparent',
                    color: selected
                      ? 'var(--color-primary, #818cf8)'
                      : 'var(--color-muted-foreground, #94a3b8)',
                    cursor: (isGenerating || !genreModifiable) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {genre}
                </button>
              );
            })}
          </div>
          {!genreValidation.isValid && (
            <p
              style={{
                marginTop: 6,
                fontSize: 12,
                color: 'var(--color-error, #ef4444)',
              }}
            >
              {genreValidation.errors[0]}
            </p>
          )}
        </div>
      )}

      {/* Locked genre display for panel 2+ */}
      {(genresLocked || panelIndex > 1) && genres.length > 0 && (
        <div
          style={{
            marginBottom: 16,
            padding: '8px 14px',
            borderRadius: 8,
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            fontSize: 13,
            color: '#f59e0b',
          }}
        >
          🔒 Genres locked: <strong>{genres.join(', ')}</strong>
        </div>
      )}

      {/* Parameter summary */}
      <div
        style={{
          marginBottom: 16,
          padding: '10px 14px',
          borderRadius: 8,
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.15)',
          fontSize: 13,
          color: 'var(--color-muted-foreground, #94a3b8)',
        }}
      >
        ⚙️  <strong>{parameterCount}</strong> parameters configured
      </div>

      {/* Error display */}
      {error && (
        <div
          style={{
            marginBottom: 16,
            padding: '10px 14px',
            borderRadius: 8,
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            fontSize: 13,
            color: '#ef4444',
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Submit button */}
      <button
        onClick={onSubmit}
        disabled={isGenerating || (panelIndex === 1 && !genreValidation.isValid)}
        style={{
          width: '100%',
          padding: '12px 24px',
          borderRadius: 10,
          border: 'none',
          fontWeight: 700,
          fontSize: 15,
          cursor: isGenerating ? 'wait' : 'pointer',
          background: isGenerating
            ? 'var(--color-muted, #475569)'
            : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          color: '#fff',
          transition: 'all 0.3s ease',
          boxShadow: isGenerating
            ? 'none'
            : '0 4px 14px rgba(99, 102, 241, 0.3)',
        }}
      >
        {isGenerating ? '⟳ Generating Panel...' : `✨ Generate Panel ${panelIndex}`}
      </button>
    </div>
  );
};
