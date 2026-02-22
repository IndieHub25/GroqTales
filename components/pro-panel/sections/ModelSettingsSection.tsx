'use client';

/**
 * Model Settings Section
 * Controls for Groq AI model parameters
 */

import React from 'react';
import { useProPanelStore, selectParameters } from '@/store/proPanelStore';
import {
  SliderControl,
  SelectControl,
  NumberInputControl,
  TagsInputControl,
  ControlGrid,
  CollapsibleGroup,
} from '../controls';

const MODEL_OPTIONS = [
  { value: 'llama3-70b-8192', label: 'LLaMA 3 70B (Recommended)' },
  { value: 'llama3-8b-8192', label: 'LLaMA 3 8B (Fast)' },
  { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B (Long Context)' },
  { value: 'gemma-7b-it', label: 'Gemma 7B' },
  { value: 'gemma2-9b-it', label: 'Gemma 2 9B' },
  { value: 'llama-3.1-70b-versatile', label: 'LLaMA 3.1 70B Versatile' },
  { value: 'llama-3.1-8b-instant', label: 'LLaMA 3.1 8B Instant' },
  { value: 'llama-3.2-90b-vision-preview', label: 'LLaMA 3.2 90B Vision' },
  { value: 'llama-3.3-70b-versatile', label: 'LLaMA 3.3 70B Versatile' },
] as const;

export function ModelSettingsSection() {
  const parameters = useProPanelStore(selectParameters);
  const updateParameter = useProPanelStore((s) => s.updateParameter);
  const model = parameters.modelSettings;

  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      <div className="p-3 bg-primary/10 border-2 border-primary text-sm">
        <strong className="text-primary">⚠️ Advanced Settings:</strong>{' '}
        These parameters directly affect AI generation. Changes can significantly impact output quality and behavior.
      </div>

      <SelectControl
        label="Model Selection"
        description="Choose the Groq AI model for generation"
        value={model.modelSelection}
        options={MODEL_OPTIONS}
        onChange={(v) => updateParameter('modelSettings', 'modelSelection', v)}
      />

      {/* ── CORE: Generation Parameters ── */}
      <ControlGrid>
        <SliderControl
          label="Temperature"
          description="Randomness of output (higher = more creative)"
          value={model.temperature}
          min={0}
          max={2}
          step={0.1}
          onChange={(v) => updateParameter('modelSettings', 'temperature', v)}
        />
        <NumberInputControl
          label="Max Tokens"
          description="Maximum length of generated text"
          value={model.maxTokens}
          min={256}
          max={32768}
          step={256}
          onChange={(v) => updateParameter('modelSettings', 'maxTokens', v)}
        />
      </ControlGrid>

      {/* ── ADVANCED: Collapsed by default ── */}
      <CollapsibleGroup title="Advanced — Sampling & Penalties">
        <ControlGrid>
          <SliderControl
            label="Top P (Nucleus Sampling)"
            description="Cumulative probability threshold"
            value={model.topP}
            min={0}
            max={1}
            step={0.05}
            onChange={(v) => updateParameter('modelSettings', 'topP', v)}
          />
          <NumberInputControl
            label="Top K"
            description="Number of top tokens to consider"
            value={model.topK}
            min={1}
            max={100}
            step={1}
            onChange={(v) => updateParameter('modelSettings', 'topK', v)}
          />
          <SliderControl
            label="Frequency Penalty"
            description="Reduce repetition of frequent tokens"
            value={model.frequencyPenalty}
            min={-2}
            max={2}
            step={0.1}
            onChange={(v) => updateParameter('modelSettings', 'frequencyPenalty', v)}
          />
          <SliderControl
            label="Presence Penalty"
            description="Encourage new topics"
            value={model.presencePenalty}
            min={-2}
            max={2}
            step={0.1}
            onChange={(v) => updateParameter('modelSettings', 'presencePenalty', v)}
          />
          <SliderControl
            label="Repetition Penalty"
            description="General repetition reduction"
            value={model.repetitionPenalty}
            min={0}
            max={2}
            step={0.1}
            onChange={(v) => updateParameter('modelSettings', 'repetitionPenalty', v)}
          />
        </ControlGrid>

        <TagsInputControl
          label="Stop Sequences"
          description="Strings that will stop generation"
          values={model.stopSequences}
          maxTags={4}
          maxLength={50}
          placeholder="Add stop sequence..."
          onChange={(v) => updateParameter('modelSettings', 'stopSequences', v)}
        />
      </CollapsibleGroup>
    </div>
  );
}

