'use client';

import React, { useState } from 'react';

interface StoryOutputDisplayProps {
  content: string;
  panelIndex: number;
  wordCount: number;
  tokensUsed?: { groq: number; gemini: number };
  generationTime?: number;
}

/**
 * StoryOutputDisplay – Renders generated prose with metadata.
 * Shows word count, tokens, and generation time.
 * Requirements: 8.1, 8.2, 8.3
 */
export const StoryOutputDisplay: React.FC<StoryOutputDisplayProps> = ({
  content,
  panelIndex,
  wordCount,
  tokensUsed,
  generationTime,
}) => {
  const [showMeta, setShowMeta] = useState(false);

  if (!content) {
    return (
      <div
        style={{
          padding: '32px 24px',
          textAlign: 'center',
          color: 'var(--color-muted-foreground, #94a3b8)',
          fontSize: 14,
          borderRadius: 12,
          background: 'var(--color-card, #1e293b)',
          border: '1px dashed var(--color-border, #334155)',
        }}
      >
        Generated prose will appear here after you create Panel {panelIndex}.
      </div>
    );
  }

  return (
    <div
      style={{
        borderRadius: 12,
        background: 'var(--color-card, #1e293b)',
        border: '1px solid var(--color-border, #334155)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--color-border, #334155)',
          background: 'rgba(255,255,255,0.02)',
        }}
      >
        <span
          style={{
            fontWeight: 700,
            fontSize: 15,
            color: 'var(--color-foreground, #f1f5f9)',
          }}
        >
          📖 Panel {panelIndex}
        </span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span
            style={{
              fontSize: 12,
              color: 'var(--color-muted-foreground, #94a3b8)',
            }}
          >
            {wordCount.toLocaleString()} words
          </span>
          <button
            onClick={() => setShowMeta(!showMeta)}
            style={{
              background: 'none',
              border: '1px solid var(--color-border, #334155)',
              borderRadius: 6,
              padding: '4px 8px',
              fontSize: 11,
              color: 'var(--color-muted-foreground, #94a3b8)',
              cursor: 'pointer',
            }}
          >
            {showMeta ? 'Hide Meta' : 'Meta'}
          </button>
        </div>
      </div>

      {/* Metadata */}
      {showMeta && (
        <div
          style={{
            padding: '8px 20px',
            display: 'flex',
            gap: 20,
            fontSize: 12,
            color: 'var(--color-muted-foreground, #94a3b8)',
            borderBottom: '1px solid var(--color-border, #334155)',
            background: 'rgba(255,255,255,0.01)',
          }}
        >
          {tokensUsed && (
            <>
              <span>Groq: {tokensUsed.groq} tokens</span>
              <span>Gemini: {tokensUsed.gemini} tokens</span>
            </>
          )}
          {generationTime && <span>Generated in {(generationTime / 1000).toFixed(1)}s</span>}
        </div>
      )}

      {/* Content */}
      <div
        style={{
          padding: '24px 20px',
          fontSize: 15,
          lineHeight: 1.8,
          color: 'var(--color-foreground, #e2e8f0)',
          whiteSpace: 'pre-wrap',
          fontFamily: '"Georgia", "Times New Roman", serif',
          maxHeight: 500,
          overflowY: 'auto',
        }}
      >
        {content}
      </div>
    </div>
  );
};
