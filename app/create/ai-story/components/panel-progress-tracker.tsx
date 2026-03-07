'use client';

import React from 'react';

interface PanelProgressTrackerProps {
  totalPanels?: number;
  completedPanels: number;
  currentPanel: number;
  panelStatuses: Array<'pending' | 'generating' | 'complete' | 'error'>;
}

/**
 * PanelProgressTracker – Visual progress indicator for 7-panel stories.
 * Shows numbered steps with status coloring and a connecting line.
 * Requirement: 7.3
 */
export const PanelProgressTracker: React.FC<PanelProgressTrackerProps> = ({
  totalPanels = 7,
  completedPanels,
  currentPanel,
  panelStatuses,
}) => {
  const panels = Array.from({ length: totalPanels }, (_, i) => i + 1);

  const getStatusColor = (index: number) => {
    const status = panelStatuses[index - 1];
    if (status === 'complete') return 'var(--color-success, #22c55e)';
    if (status === 'generating') return 'var(--color-warning, #f59e0b)';
    if (status === 'error') return 'var(--color-error, #ef4444)';
    if (index === currentPanel) return 'var(--color-primary, #6366f1)';
    return 'var(--color-muted, #64748b)';
  };

  const getStatusLabel = (index: number) => {
    const status = panelStatuses[index - 1];
    if (status === 'complete') return '✓';
    if (status === 'generating') return '⟳';
    if (status === 'error') return '✕';
    return String(index);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '12px 0' }}>
      {panels.map((panelNum, idx) => (
        <React.Fragment key={panelNum}>
          {/* Step circle */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: getStatusColor(panelNum),
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
              transition: 'all 0.3s ease',
              boxShadow:
                panelNum === currentPanel
                  ? `0 0 0 3px color-mix(in srgb, ${getStatusColor(panelNum)} 30%, transparent)`
                  : 'none',
              cursor: 'default',
            }}
            title={`Panel ${panelNum} – ${panelStatuses[panelNum - 1] || 'pending'}`}
          >
            {getStatusLabel(panelNum)}
          </div>

          {/* Connecting line */}
          {idx < panels.length - 1 && (
            <div
              style={{
                flex: 1,
                height: 3,
                minWidth: 16,
                borderRadius: 2,
                background:
                  panelNum < completedPanels
                    ? 'var(--color-success, #22c55e)'
                    : 'var(--color-border, #334155)',
                transition: 'background 0.3s ease',
              }}
            />
          )}
        </React.Fragment>
      ))}

      {/* Summary */}
      <span
        style={{
          marginLeft: 12,
          fontSize: 13,
          color: 'var(--color-muted-foreground, #94a3b8)',
          whiteSpace: 'nowrap',
        }}
      >
        {completedPanels}/{totalPanels} complete
      </span>
    </div>
  );
};
