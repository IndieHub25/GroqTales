'use client';

/**
 * Character Section
 * Controls for character development and dialogue
 */

import React from 'react';
import { useProPanelStore, selectParameters } from '@/store/proPanelStore';
import {
  SliderControl,
  SelectControl,
  ControlGrid,
  CollapsibleGroup,
} from '../controls';

const SUPPORTING_CAST_SIZES = [
  'minimal',
  'small',
  'moderate',
  'large',
  'ensemble',
] as const;

const CHARACTER_GROWTH_ARCS = [
  'positive-change',
  'negative-change',
  'flat-arc',
  'disillusionment',
  'fall-and-rise',
  'steadfast',
] as const;

const DIALOGUE_STYLES = [
  'naturalistic',
  'stylized',
  'minimal',
  'verbose',
  'witty',
  'poetic',
] as const;

export function CharacterSection() {
  const parameters = useProPanelStore(selectParameters);
  const updateParameter = useProPanelStore((s) => s.updateParameter);
  const chars = parameters.characters;

  return (
    <div className="space-y-6">
      {/* ── CORE: Always visible ── */}
      <ControlGrid>
        <SelectControl
          label="Supporting Cast Size"
          description="Number of secondary characters"
          value={chars.supportingCastSize}
          options={SUPPORTING_CAST_SIZES}
          onChange={(v) => updateParameter('characters', 'supportingCastSize', v)}
        />
        <SelectControl
          label="Character Growth Arc"
          description="Type of character development"
          value={chars.characterGrowthArc}
          options={CHARACTER_GROWTH_ARCS}
          onChange={(v) => updateParameter('characters', 'characterGrowthArc', v)}
        />
      </ControlGrid>

      <SelectControl
        label="Dialogue Style"
        description="How characters speak"
        value={chars.dialogueStyle}
        options={DIALOGUE_STYLES}
        onChange={(v) => updateParameter('characters', 'dialogueStyle', v)}
      />

      {/* ── ADVANCED: Collapsed by default ── */}
      <CollapsibleGroup title="Advanced — Character Depth">
        <ControlGrid>
          <SliderControl
            label="Protagonist Depth"
            description="Complexity of the main character"
            value={chars.protagonistDepth}
            onChange={(v) => updateParameter('characters', 'protagonistDepth', v)}
          />
          <SliderControl
            label="Antagonist Complexity"
            description="Moral complexity of the villain/obstacle"
            value={chars.antagonistComplexity}
            onChange={(v) => updateParameter('characters', 'antagonistComplexity', v)}
          />
          <SliderControl
            label="Voice Distinctness"
            description="How unique each character sounds"
            value={chars.characterVoiceDistinctness}
            onChange={(v) => updateParameter('characters', 'characterVoiceDistinctness', v)}
          />
          <SliderControl
            label="Relationship Complexity"
            description="Intricacy of character interactions"
            value={chars.relationshipComplexity}
            onChange={(v) => updateParameter('characters', 'relationshipComplexity', v)}
          />
          <SliderControl
            label="Backstory Integration"
            description="How much past is woven into the story"
            value={chars.backstoryIntegration}
            onChange={(v) => updateParameter('characters', 'backstoryIntegration', v)}
          />
          <SliderControl
            label="Internal Monologue"
            description="Frequency of character thoughts shown"
            value={chars.internalMonologueFrequency}
            onChange={(v) => updateParameter('characters', 'internalMonologueFrequency', v)}
          />
        </ControlGrid>
      </CollapsibleGroup>
    </div>
  );
}

