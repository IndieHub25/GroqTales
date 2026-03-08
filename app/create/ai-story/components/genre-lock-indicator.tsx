'use client';

import React from 'react';

interface GenreLockIndicatorProps {
  genres: string[];
  isLocked: boolean;
  canModify: boolean;
  onUnlockRequest?: () => void;
}

/**
 * GenreLockIndicator – Shows locked/unlocked genre status.
 * After Panel 1 completes, genres are locked and this shows a lock icon.
 * Requirement: 2.3
 */
export const GenreLockIndicator: React.FC<GenreLockIndicatorProps> = ({
  genres,
  isLocked,
  canModify,
}) => {
  if (genres.length === 0) return null;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 14px',
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 500,
        background: isLocked
          ? 'color-mix(in srgb, var(--color-warning, #f59e0b) 15%, transparent)'
          : 'color-mix(in srgb, var(--color-primary, #6366f1) 15%, transparent)',
        border: `1px solid ${
          isLocked
            ? 'color-mix(in srgb, var(--color-warning, #f59e0b) 30%, transparent)'
            : 'color-mix(in srgb, var(--color-primary, #6366f1) 30%, transparent)'
        }`,
        color: isLocked
          ? 'var(--color-warning, #f59e0b)'
          : 'var(--color-primary, #6366f1)',
        transition: 'all 0.3s ease',
      }}
    >
      <span style={{ fontSize: 16 }}>{isLocked ? '🔒' : '🔓'}</span>
      <span>{genres.join(' + ')}</span>
      {isLocked && (
        <span
          style={{
            fontSize: 11,
            opacity: 0.7,
            marginLeft: 4,
          }}
        >
          Locked
        </span>
      )}
      {!isLocked && canModify && (
        <span
          style={{
            fontSize: 11,
            opacity: 0.7,
            marginLeft: 4,
          }}
        >
          Editable
        </span>
      )}
    </div>
  );
};
