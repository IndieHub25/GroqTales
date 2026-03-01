'use client';

/**
 * Visual Section
 * Controls for cover art and illustration preferences
 */

import React from 'react';

import { selectParameters, useProPanelStore } from '@/store/proPanelStore';

import {
  CollapsibleGroup,
  ControlGrid,
  SelectControl,
  TagsInputControl,
  TextareaControl,
} from '../controls';

const COVER_STYLES = [
  'photorealistic',
  'digital-art',
  'illustration',
  'comic-book',
  'watercolor',
  'oil-painting',
  'minimalist',
  'noir',
  'vintage',
  'abstract',
] as const;

const COLOR_PALETTES = [
  'vibrant',
  'muted',
  'monochromatic',
  'warm',
  'cool',
  'earth-tones',
  'neon',
  'pastel',
  'dark',
  'high-contrast',
] as const;

const ILLUSTRATION_FREQUENCIES = [
  'none',
  'chapter-headers',
  'key-scenes',
  'frequent',
  'graphic-novel',
] as const;

const ASPECT_RATIOS = ['1:1', '4:3', '16:9', '3:4', '9:16', '2:3'] as const;

/** Parameter controls for cover art style and colour palette. */
export function VisualSection() {
  const parameters = useProPanelStore(selectParameters);
  const updateParameter = useProPanelStore((s) => s.updateParameter);
  const visual = parameters.visual;

  return (
    <div className="space-y-6">
      {/* ── CORE: Always visible ── */}
      <ControlGrid>
        <SelectControl
          label="Cover Image Style"
          description="Artistic style for cover generation"
          value={visual.coverImageStyle}
          options={COVER_STYLES}
          onChange={(v) => updateParameter('visual', 'coverImageStyle', v)}
        />
        <SelectControl
          label="Color Palette"
          description="Overall color scheme"
          value={visual.colorPalette}
          options={COLOR_PALETTES}
          onChange={(v) => updateParameter('visual', 'colorPalette', v)}
        />
      </ControlGrid>

      <ControlGrid>
        <SelectControl
          label="Illustration Frequency"
          description="How often illustrations appear"
          value={visual.illustrationFrequency}
          options={ILLUSTRATION_FREQUENCIES}
          onChange={(v) =>
            updateParameter('visual', 'illustrationFrequency', v)
          }
        />
        <SelectControl
          label="Aspect Ratio"
          description="Preferred image dimensions"
          value={visual.aspectRatio}
          options={ASPECT_RATIOS}
          onChange={(v) => updateParameter('visual', 'aspectRatio', v)}
        />
      </ControlGrid>

      {/* ── ADVANCED: Collapsed by default ── */}
      <CollapsibleGroup title="Advanced — Art Direction">
        <TextareaControl
          label="Art Direction Notes"
          description="Custom instructions for visual generation"
          value={visual.artDirection}
          maxLength={500}
          rows={3}
          placeholder="Describe specific visual elements, references, or mood..."
          onChange={(v) => updateParameter('visual', 'artDirection', v)}
        />

        <TagsInputControl
          label="Visual Mood Board"
          description="Keywords to guide visual style"
          values={visual.visualMoodBoard}
          maxTags={10}
          maxLength={100}
          placeholder="Add mood keyword..."
          onChange={(v) => updateParameter('visual', 'visualMoodBoard', v)}
        />
      </CollapsibleGroup>
    </div>
  );
}
