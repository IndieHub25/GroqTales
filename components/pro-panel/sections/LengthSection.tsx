'use client';

/**
 * Length Section
 * Controls for story length and format
 */

import React from 'react';
import { useProPanelStore, selectParameters } from '@/store/proPanelStore';
import {
  SelectControl,
  NumberInputControl,
  SwitchControl,
  ControlGrid,
  CollapsibleGroup,
} from '../controls';

const SCENE_LENGTHS = [
  'short',
  'medium',
  'long',
  'variable',
] as const;

const FORMAT_TYPES = [
  'flash-fiction',
  'short-story',
  'novelette',
  'novella',
  'novel',
  'epic',
] as const;

// Word count presets for quick selection
const WORD_COUNT_PRESETS = [
  { label: 'Flash Fiction (<1K)', value: 500 },
  { label: 'Short Story (1-7.5K)', value: 5000 },
  { label: 'Novelette (7.5-17.5K)', value: 12000 },
  { label: 'Novella (17.5-40K)', value: 30000 },
  { label: 'Novel (40-100K)', value: 70000 },
  { label: 'Epic (100K+)', value: 120000 },
];

export function LengthSection() {
  const parameters = useProPanelStore(selectParameters);
  const updateParameter = useProPanelStore((s) => s.updateParameter);
  const updateCategory = useProPanelStore((s) => s.updateCategory);
  const length = parameters.length;

  const applyPreset = (wordCount: number) => {
    const presets: Record<number, { chapters: number; avgLength: number; format: typeof FORMAT_TYPES[number] }> = {
      500: { chapters: 1, avgLength: 500, format: 'flash-fiction' },
      5000: { chapters: 5, avgLength: 1000, format: 'short-story' },
      12000: { chapters: 8, avgLength: 1500, format: 'novelette' },
      30000: { chapters: 15, avgLength: 2000, format: 'novella' },
      70000: { chapters: 25, avgLength: 2800, format: 'novel' },
      120000: { chapters: 40, avgLength: 3000, format: 'epic' },
    };
    
    const preset = presets[wordCount];
    if (preset) {
      updateCategory('length', {
        targetWordCount: wordCount,
        chapterCount: preset.chapters,
        averageChapterLength: preset.avgLength,
        formatType: preset.format,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Presets */}
      <div>
        <label className="text-sm font-medium mb-2 block">Quick Presets</label>
        <div className="flex flex-wrap gap-2">
          {WORD_COUNT_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => applyPreset(preset.value)}
              className={`
                px-3 py-1.5 text-xs font-medium border-2 transition-all
                ${length.targetWordCount === preset.value
                  ? 'bg-primary text-primary-foreground border-foreground shadow-[2px_2px_0px_0px_var(--foreground)]'
                  : 'bg-card text-foreground border-foreground/50 hover:border-foreground hover:bg-muted'
                }
              `}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <ControlGrid>
        <NumberInputControl
          label="Target Word Count"
          description="Approximate total word count"
          value={length.targetWordCount}
          min={100}
          max={200000}
          step={100}
          onChange={(v) => updateParameter('length', 'targetWordCount', v)}
        />
        <SelectControl
          label="Format Type"
          description="Story format classification"
          value={length.formatType}
          options={FORMAT_TYPES}
          onChange={(v) => updateParameter('length', 'formatType', v)}
        />
      </ControlGrid>

      {/* ── ADVANCED: Collapsed by default ── */}
      <CollapsibleGroup title="Advanced — Chapter & Scene Details">
        <ControlGrid>
          <NumberInputControl
            label="Chapter Count"
            description="Number of chapters"
            value={length.chapterCount}
            min={1}
            max={100}
            onChange={(v) => updateParameter('length', 'chapterCount', v)}
          />
          <NumberInputControl
            label="Average Chapter Length"
            description="Words per chapter"
            value={length.averageChapterLength}
            min={100}
            max={10000}
            step={100}
            onChange={(v) => updateParameter('length', 'averageChapterLength', v)}
          />
          <SelectControl
            label="Scene Length"
            description="Typical length of individual scenes"
            value={length.sceneLength}
            options={SCENE_LENGTHS}
            onChange={(v) => updateParameter('length', 'sceneLength', v)}
          />
        </ControlGrid>

        <div className="space-y-2 mt-2">
          <SwitchControl
            label="Include Prologue"
            description="Add an opening prologue section"
            checked={length.prologueIncluded}
            onChange={(v) => updateParameter('length', 'prologueIncluded', v)}
          />
          <SwitchControl
            label="Include Epilogue"
            description="Add a closing epilogue section"
            checked={length.epilogueIncluded}
            onChange={(v) => updateParameter('length', 'epilogueIncluded', v)}
          />
        </div>
      </CollapsibleGroup>
    </div>
  );
}

