'use client';

/**
 * Advanced Section
 * Controls for POV, experimental techniques, and custom instructions
 */

import React from 'react';

import { selectParameters, useProPanelStore } from '@/store/proPanelStore';

import {
  CollapsibleGroup,
  ControlGrid,
  InputControl,
  MultiSelectControl,
  SelectControl,
  SliderControl,
  SwitchControl,
  TagsInputControl,
  TextareaControl,
} from '../controls';

const POINT_OF_VIEW_OPTIONS = [
  'first-person',
  'second-person',
  'third-person-limited',
  'third-person-omniscient',
  'multiple-pov',
] as const;

const TENSE_OPTIONS = ['past', 'present', 'future', 'mixed'] as const;

const EXPERIMENTAL_TECHNIQUES = [
  'stream-of-consciousness',
  'epistolary',
  'multiple-timelines',
  'second-person',
  'footnotes',
  'mixed-media',
  'choose-your-path',
  'unreliable-narrator',
  'non-linear',
] as const;

const TARGET_AUDIENCES = [
  'children',
  'middle-grade',
  'young-adult',
  'new-adult',
  'adult',
  'mature',
] as const;

const GENRE_OPTIONS = [
  'fantasy',
  'sci-fi',
  'romance',
  'thriller',
  'mystery',
  'horror',
  'literary',
  'historical',
  'comedy',
  'drama',
  'action',
  'noir',
] as const;

/** Parameter controls for POV, experimental techniques, and custom instructions. */
export function AdvancedSection() {
  const parameters = useProPanelStore(selectParameters);
  const updateParameter = useProPanelStore((s) => s.updateParameter);
  const advanced = parameters.advanced;

  return (
    <div className="space-y-6">
      {/* ── CORE: Always visible ── */}
      <ControlGrid>
        <SelectControl
          label="Point of View"
          description="Narrative perspective"
          value={advanced.pointOfView}
          options={POINT_OF_VIEW_OPTIONS}
          onChange={(v) => updateParameter('advanced', 'pointOfView', v)}
          parameterKey="pointOfView"
        />
        <SelectControl
          label="Tense"
          description="Verb tense for narration"
          value={advanced.tenseConsistency}
          options={TENSE_OPTIONS}
          onChange={(v) => updateParameter('advanced', 'tenseConsistency', v)}
        />
      </ControlGrid>

      <SelectControl
        label="Target Audience"
        description="Intended reader demographic"
        value={advanced.targetAudience}
        options={TARGET_AUDIENCES}
        onChange={(v) => updateParameter('advanced', 'targetAudience', v)}
        parameterKey="targetAudience"
      />

      <MultiSelectControl
        label="Genre Mashup"
        description="Combine multiple genres (max 3)"
        values={advanced.genreMashup}
        options={GENRE_OPTIONS}
        maxSelections={3}
        onChange={(v) => updateParameter('advanced', 'genreMashup', v)}
      />

      {/* ── ADVANCED: Collapsed by default ── */}
      <CollapsibleGroup title="Advanced — Narrative Techniques">
        <SwitchControl
          label="Unreliable Narrator"
          description="The narrator may mislead the reader"
          checked={advanced.unreliableNarrator}
          onChange={(v) => updateParameter('advanced', 'unreliableNarrator', v)}
          parameterKey="unreliableNarrator"
        />
        <SliderControl
          label="Metafictional Elements"
          description="Self-referential and fourth-wall-breaking content"
          value={advanced.metafictionalElements}
          onChange={(v) =>
            updateParameter('advanced', 'metafictionalElements', v)
          }
        />
        <div className="mt-4">
          <MultiSelectControl
            label="Experimental Techniques"
            description="Advanced structural techniques"
            values={advanced.experimentalTechniques}
            options={EXPERIMENTAL_TECHNIQUES}
            maxSelections={5}
            onChange={(v) =>
              updateParameter('advanced', 'experimentalTechniques', v)
            }
          />
        </div>
      </CollapsibleGroup>

      <CollapsibleGroup title="Advanced — Content & Safety">
        <TagsInputControl
          label="Content Warnings"
          description="Topics that may require reader discretion"
          values={advanced.contentWarnings}
          maxTags={10}
          maxLength={50}
          placeholder="Add content warning..."
          onChange={(v) => updateParameter('advanced', 'contentWarnings', v)}
        />
      </CollapsibleGroup>

      <CollapsibleGroup title="Advanced — Custom Configuration">
        <InputControl
          label="Seed Phrase"
          description="Optional phrase for consistent generation"
          value={advanced.seedPhrase}
          placeholder="Enter a seed phrase for reproducibility..."
          onChange={(v) => updateParameter('advanced', 'seedPhrase', v)}
        />
        <div className="mt-4">
          <TextareaControl
            label="Custom Instructions"
            description="Additional guidance for the AI"
            value={advanced.customInstructions}
            maxLength={2000}
            rows={4}
            placeholder="Add any specific instructions, style notes, or requirements..."
            onChange={(v) =>
              updateParameter('advanced', 'customInstructions', v)
            }
          />
        </div>
      </CollapsibleGroup>
    </div>
  );
}
