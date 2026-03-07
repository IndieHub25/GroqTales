'use client';

import React, { useState } from 'react';
import { StoryMemory } from '@/lib/types/story-session';

interface StoryMemoryDisplayProps {
  memory: StoryMemory | null;
  panelCount: number;
}

/**
 * StoryMemoryDisplay – Shows tracked narrative elements.
 * Displays characters, world-building, events, facts, and themes.
 * Requirement: 4.3, 4.4
 */
export const StoryMemoryDisplay: React.FC<StoryMemoryDisplayProps> = ({
  memory,
  panelCount,
}) => {
  const [expanded, setExpanded] = useState(false);

  if (!memory || panelCount === 0) {
    return (
      <div
        style={{
          padding: '16px',
          borderRadius: 10,
          background: 'var(--color-card, #1e293b)',
          border: '1px solid var(--color-border, #334155)',
          color: 'var(--color-muted-foreground, #94a3b8)',
          fontSize: 13,
        }}
      >
        <p style={{ margin: 0 }}>📖 Story memory will appear here after Panel 1 is generated.</p>
      </div>
    );
  }

  const sections = [
    {
      label: '👥 Characters',
      count: memory.characters.length,
      items: memory.characters.map(
        (c) => `${c.name} (${c.role}) — ${c.traits.slice(0, 3).join(', ')}`
      ),
    },
    {
      label: '🌍 Locations',
      count: memory.worldBuilding.locations.length,
      items: memory.worldBuilding.locations,
    },
    {
      label: '⚡ Major Events',
      count: memory.majorEvents.length,
      items: memory.majorEvents.map((e) => e.description),
    },
    {
      label: '📌 Established Facts',
      count: memory.establishedFacts.length,
      items: memory.establishedFacts.slice(0, 5),
    },
    {
      label: '🎭 Themes',
      count: memory.themes.length,
      items: memory.themes,
    },
    {
      label: '❓ Unresolved',
      count: memory.unresolvedQuestions.length,
      items: memory.unresolvedQuestions.slice(0, 3),
    },
  ].filter((s) => s.count > 0);

  return (
    <div
      style={{
        padding: '16px',
        borderRadius: 10,
        background: 'var(--color-card, #1e293b)',
        border: '1px solid var(--color-border, #334155)',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-foreground, #f1f5f9)',
          fontWeight: 600,
          fontSize: 14,
          padding: 0,
        }}
      >
        <span>📖 Story Memory ({panelCount} panel{panelCount !== 1 ? 's' : ''})</span>
        <span style={{ fontSize: 18, transition: 'transform 0.2s' }}>
          {expanded ? '▾' : '▸'}
        </span>
      </button>

      {/* Mini summary always visible */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          marginTop: 8,
          fontSize: 12,
          color: 'var(--color-muted-foreground, #94a3b8)',
        }}
      >
        {sections.map((s) => (
          <span key={s.label}>
            {s.label.split(' ')[0]} {s.count}
          </span>
        ))}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ marginTop: 12 }}>
          {sections.map((section) => (
            <div key={section.label} style={{ marginBottom: 10 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 13,
                  color: 'var(--color-foreground, #f1f5f9)',
                  marginBottom: 4,
                }}
              >
                {section.label}
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 18,
                  fontSize: 12,
                  color: 'var(--color-muted-foreground, #94a3b8)',
                  lineHeight: 1.6,
                }}
              >
                {section.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}

          {/* Tone */}
          {memory.tone && (
            <div
              style={{
                fontSize: 12,
                color: 'var(--color-muted-foreground, #94a3b8)',
                marginTop: 8,
              }}
            >
              <strong>Tone:</strong> {memory.tone}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
