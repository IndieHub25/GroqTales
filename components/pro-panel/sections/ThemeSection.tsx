'use client';

/**
 * Theme Section
 * Controls for story themes and symbolism
 */

import React from 'react';

import { selectParameters, useProPanelStore } from '@/store/proPanelStore';

import {
  CollapsibleGroup,
  ControlGrid,
  MultiSelectControl,
  SelectControl,
  SliderControl,
} from '../controls';

const PRIMARY_THEMES = [
  'love',
  'redemption',
  'revenge',
  'identity',
  'power',
  'survival',
  'justice',
  'freedom',
  'sacrifice',
  'coming-of-age',
  'loss-and-grief',
  'good-vs-evil',
  'nature-vs-technology',
  'isolation',
  'corruption',
] as const;

const SECONDARY_THEMES = [
  'love',
  'redemption',
  'revenge',
  'identity',
  'power',
  'survival',
  'justice',
  'freedom',
  'sacrifice',
  'coming-of-age',
  'loss-and-grief',
  'good-vs-evil',
  'nature-vs-technology',
  'isolation',
  'corruption',
  'family',
  'friendship',
  'betrayal',
  'hope',
  'faith',
] as const;

/** Parameter controls for primary/secondary themes and symbolism. */
export function ThemeSection() {
  const parameters = useProPanelStore(selectParameters);
  const updateParameter = useProPanelStore((s) => s.updateParameter);
  const theme = parameters.theme;

  return (
    <div className="space-y-6">
      <SelectControl
        label="Primary Theme"
        description="The central message or idea"
        value={theme.primaryTheme}
        options={PRIMARY_THEMES}
        onChange={(v) => updateParameter('theme', 'primaryTheme', v)}
      />

      <MultiSelectControl
        label="Secondary Themes"
        description="Supporting themes that enrich the story"
        values={theme.secondaryThemes}
        options={SECONDARY_THEMES}
        maxSelections={5}
        onChange={(v) => updateParameter('theme', 'secondaryThemes', v)}
      />

      {/* ── ADVANCED: Collapsed by default ── */}
      <CollapsibleGroup title="Advanced — Thematic Depth">
        <ControlGrid>
          <SliderControl
            label="Moral Complexity"
            description="Shades of gray in ethical choices"
            value={theme.moralComplexity}
            onChange={(v) => updateParameter('theme', 'moralComplexity', v)}
          />
          <SliderControl
            label="Social Commentary"
            description="Reflection on society and culture"
            value={theme.socialCommentary}
            onChange={(v) => updateParameter('theme', 'socialCommentary', v)}
          />
          <SliderControl
            label="Philosophical Depth"
            description="Exploration of big questions"
            value={theme.philosophicalDepth}
            onChange={(v) => updateParameter('theme', 'philosophicalDepth', v)}
          />
          <SliderControl
            label="Symbolism Density"
            description="Use of symbolic elements"
            value={theme.symbolismDensity}
            onChange={(v) => updateParameter('theme', 'symbolismDensity', v)}
          />
          <SliderControl
            label="Allegorical Level"
            description="Story as extended metaphor"
            value={theme.allegoricalLevel}
            onChange={(v) => updateParameter('theme', 'allegoricalLevel', v)}
          />
        </ControlGrid>
      </CollapsibleGroup>
    </div>
  );
}
