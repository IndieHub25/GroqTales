'use client';

/**
 * Story Structure Section
 * Controls for narrative structure, pacing, and plot
 */

import React from 'react';

import { selectParameters, useProPanelStore } from '@/store/proPanelStore';

import {
  CollapsibleGroup,
  ControlGrid,
  SelectControl,
  SliderControl,
} from '../controls';

const NARRATIVE_STYLES = [
  'linear',
  'nonlinear',
  'episodic',
  'circular',
  'parallel',
  'frame-story',
  'stream-of-consciousness',
] as const;

const PACING_OPTIONS = [
  'slow-burn',
  'moderate',
  'fast-paced',
  'breakneck',
  'variable',
] as const;

const ACT_STRUCTURES = [
  'three-act',
  'five-act',
  'heros-journey',
  'kishōtenketsu',
  'seven-point',
  'fichtean-curve',
] as const;

const RESOLUTION_STYLES = [
  'conclusive',
  'open-ended',
  'ambiguous',
  'twist-ending',
  'cliffhanger',
  'bittersweet',
] as const;

/** Parameter controls for narrative style, pacing, and plot complexity. */
export function StoryStructureSection() {
  const parameters = useProPanelStore(selectParameters);
  const updateParameter = useProPanelStore((s) => s.updateParameter);
  const structure = parameters.storyStructure;

  return (
    <div className="space-y-6">
      {/* ── CORE: Always visible ── */}
      <ControlGrid>
        <SelectControl
          label="Narrative Style"
          description="The overall storytelling approach"
          value={structure.narrativeStyle}
          options={NARRATIVE_STYLES}
          onChange={(v) =>
            updateParameter('storyStructure', 'narrativeStyle', v)
          }
        />
        <SelectControl
          label="Pacing"
          description="Story momentum and tension flow"
          value={structure.pacing}
          options={PACING_OPTIONS}
          onChange={(v) => updateParameter('storyStructure', 'pacing', v)}
        />
      </ControlGrid>

      <ControlGrid>
        <SelectControl
          label="Act Structure"
          description="Dramatic framework for the story"
          value={structure.actStructure}
          options={ACT_STRUCTURES}
          onChange={(v) => updateParameter('storyStructure', 'actStructure', v)}
        />
        <SelectControl
          label="Resolution Style"
          description="How the story concludes"
          value={structure.resolutionStyle}
          options={RESOLUTION_STYLES}
          onChange={(v) =>
            updateParameter('storyStructure', 'resolutionStyle', v)
          }
        />
      </ControlGrid>

      {/* ── ADVANCED: Collapsed by default ── */}
      <CollapsibleGroup title="Advanced — Intensity Controls">
        <ControlGrid>
          <SliderControl
            label="Plot Complexity"
            description="Number and intricacy of plot threads"
            value={structure.plotComplexity}
            onChange={(v) =>
              updateParameter('storyStructure', 'plotComplexity', v)
            }
          />
          <SliderControl
            label="Conflict Intensity"
            description="Level of drama and stakes"
            value={structure.conflictIntensity}
            onChange={(v) =>
              updateParameter('storyStructure', 'conflictIntensity', v)
            }
          />
          <SliderControl
            label="Flashback Frequency"
            description="Use of past events and memories"
            value={structure.flashbackFrequency}
            onChange={(v) =>
              updateParameter('storyStructure', 'flashbackFrequency', v)
            }
          />
          <SliderControl
            label="Foreshadowing Level"
            description="Hints and setup for future events"
            value={structure.foreshadowingLevel}
            onChange={(v) =>
              updateParameter('storyStructure', 'foreshadowingLevel', v)
            }
          />
        </ControlGrid>
      </CollapsibleGroup>
    </div>
  );
}
