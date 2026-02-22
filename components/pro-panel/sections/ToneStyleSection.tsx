'use client';

/**
 * Tone & Style Section
 * Controls for emotional tone and writing style
 */

import React from 'react';
import { useProPanelStore, selectParameters } from '@/store/proPanelStore';
import {
  SliderControl,
  SelectControl,
  ControlGrid,
  CollapsibleGroup,
} from '../controls';

const PRIMARY_TONES = [
  'serious',
  'humorous',
  'satirical',
  'dark',
  'hopeful',
  'melancholic',
  'suspenseful',
  'romantic',
  'whimsical',
  'gritty',
] as const;

const PROSE_STYLES = [
  'minimalist',
  'literary',
  'pulpy',
  'journalistic',
  'lyrical',
  'cinematic',
  'conversational',
] as const;

const VOCABULARY_LEVELS = [
  'simple',
  'moderate',
  'advanced',
  'specialized',
  'archaic',
] as const;

const VIOLENCE_LEVELS = [
  'none',
  'mild',
  'moderate',
  'graphic',
  'extreme',
] as const;

const ROMANCE_LEVELS = [
  'none',
  'subtle',
  'moderate',
  'prominent',
  'central',
] as const;

export function ToneStyleSection() {
  const parameters = useProPanelStore(selectParameters);
  const updateParameter = useProPanelStore((s) => s.updateParameter);
  const tone = parameters.toneStyle;

  return (
    <div className="space-y-6">
      <ControlGrid>
        <SelectControl
          label="Primary Tone"
          description="The dominant emotional feel"
          value={tone.primaryTone}
          options={PRIMARY_TONES}
          onChange={(v) => updateParameter('toneStyle', 'primaryTone', v)}
        />
        <SelectControl
          label="Prose Style"
          description="Writing approach and technique"
          value={tone.proseStyle}
          options={PROSE_STYLES}
          onChange={(v) => updateParameter('toneStyle', 'proseStyle', v)}
        />
      </ControlGrid>

      <ControlGrid>
        <SelectControl
          label="Vocabulary Level"
          description="Complexity of language used"
          value={tone.vocabularyLevel}
          options={VOCABULARY_LEVELS}
          onChange={(v) => updateParameter('toneStyle', 'vocabularyLevel', v)}
        />
        <SelectControl
          label="Violence Level"
          description="Amount and intensity of violence"
          value={tone.violenceLevel}
          options={VIOLENCE_LEVELS}
          onChange={(v) => updateParameter('toneStyle', 'violenceLevel', v)}
        />
      </ControlGrid>

      <SelectControl
        label="Romance Level"
        description="Prominence of romantic elements"
        value={tone.romanceLevel}
        options={ROMANCE_LEVELS}
        onChange={(v) => updateParameter('toneStyle', 'romanceLevel', v)}
      />

      {/* ── ADVANCED: Collapsed by default ── */}
      <CollapsibleGroup title="Advanced — Style Intensity">
        <ControlGrid>
          <SliderControl
            label="Sentence Variety"
            description="Mix of short and long sentences"
            value={tone.sentenceVariety}
            onChange={(v) => updateParameter('toneStyle', 'sentenceVariety', v)}
          />
          <SliderControl
            label="Metaphor Density"
            description="Use of figurative language"
            value={tone.metaphorDensity}
            onChange={(v) => updateParameter('toneStyle', 'metaphorDensity', v)}
          />
          <SliderControl
            label="Humor Level"
            description="Amount of comedic elements"
            value={tone.humorLevel}
            onChange={(v) => updateParameter('toneStyle', 'humorLevel', v)}
          />
          <SliderControl
            label="Descriptive Balance"
            description="Action vs. description ratio"
            value={tone.descriptiveBalance}
            onChange={(v) => updateParameter('toneStyle', 'descriptiveBalance', v)}
          />
          <SliderControl
            label="Emotional Intensity"
            description="Dramatic weight of scenes"
            value={tone.emotionalIntensity}
            onChange={(v) => updateParameter('toneStyle', 'emotionalIntensity', v)}
          />
        </ControlGrid>
      </CollapsibleGroup>
    </div>
  );
}

