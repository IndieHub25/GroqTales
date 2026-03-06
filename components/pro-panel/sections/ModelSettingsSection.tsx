'use client';

/**
 * Model Settings Section
 * Controls for Groq AI model parameters
 */

import React from 'react';

import { selectParameters, useProPanelStore } from '@/store/proPanelStore';

import {
  CollapsibleGroup,
  ControlGrid,
  NumberInputControl,
  SelectControl,
  SliderControl,
  TagsInputControl,
} from '../controls';

const MODEL_OPTIONS = [
  {
    value: 'llama-3.3-70b-versatile',
    label: 'LLaMA 3.3 70B Versatile (Recommended)',
  },
  { value: 'llama-3.1-8b-instant', label: 'LLaMA 3.1 8B Instant (Fast)' },
  { value: 'llama-3.2-90b-vision-preview', label: 'LLaMA 3.2 90B Vision' },
  { value: 'gemma2-9b-it', label: 'Gemma 2 9B' },
  { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B (Long Context)' },
] as const;

/** Parameter controls for Groq AI model, temperature, and token limits. */
export function ModelSettingsSection() {
  const parameters = useProPanelStore(selectParameters);
  const updateParameter = useProPanelStore((s) => s.updateParameter);
  const model = parameters.modelSettings;

  return (
    <div className="space-y-6">
      {/* Info Banner: Power vs Cost vs Quality */}
      <div className="p-3 bg-primary/10 border-2 border-primary text-sm space-y-2">
        <strong className="text-primary">⚠️ Advanced Settings:</strong> These
        parameters directly affect AI generation. Changes can significantly
        impact output quality and behavior.
        <ul className="text-xs text-gray-300 list-disc pl-5 space-y-1 mt-2">
          <li><strong>LLaMA 3.3 70B</strong> — Best quality, slower, higher cost per call</li>
          <li><strong>LLaMA 3.1 8B Instant</strong> — Fastest, lowest cost, good for drafts</li>
          <li><strong>Mixtral 8x7B</strong> — Long context (32k), balanced quality &amp; speed</li>
          <li><strong>Temperature</strong> — Default 0.8. Lower = predictable; higher = creative</li>
          <li><strong>Max Tokens</strong> — Default 4096. Increase for longer stories</li>
        </ul>
      </div>

      <SelectControl
        label="Model Selection"
        description="Choose the Groq AI model for generation"
        value={model.modelSelection}
        options={MODEL_OPTIONS}
        onChange={(v) => updateParameter('modelSettings', 'modelSelection', v)}
        parameterKey="modelSelection"
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
          parameterKey="temperature"
        />
        <NumberInputControl
          label="Max Tokens"
          description="Maximum length of generated text"
          value={model.maxTokens}
          min={256}
          max={32768}
          step={256}
          onChange={(v) => updateParameter('modelSettings', 'maxTokens', v)}
          parameterKey="maxTokens"
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
            parameterKey="topP"
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
            onChange={(v) =>
              updateParameter('modelSettings', 'frequencyPenalty', v)
            }
          />
          <SliderControl
            label="Presence Penalty"
            description="Encourage new topics"
            value={model.presencePenalty}
            min={-2}
            max={2}
            step={0.1}
            onChange={(v) =>
              updateParameter('modelSettings', 'presencePenalty', v)
            }
          />
          <SliderControl
            label="Repetition Penalty"
            description="General repetition reduction"
            value={model.repetitionPenalty}
            min={0}
            max={2}
            step={0.1}
            onChange={(v) =>
              updateParameter('modelSettings', 'repetitionPenalty', v)
            }
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
