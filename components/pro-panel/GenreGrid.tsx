'use client';

/**
 * GenreGrid Component
 * Displays genre preset cards in a responsive grid
 * Handles selection and auto-routes parameters per genre
 */

import React from 'react';
import { useProPanelStore, selectUI } from '@/store/proPanelStore';
import { GenreCard } from './GenreCard';
import type { GenrePresetMeta } from '@/lib/constants/proPanelDefaults';

// Genre-specific default parameters applied on selection
const GENRE_DEFAULTS: Record<string, {
  settingType: string;
  technologyLevel: string;
  primaryTone: string;
  proseStyle: string;
  primaryTheme: string;
}> = {
  fantasy: { settingType: 'high-fantasy', technologyLevel: 'medieval', primaryTone: 'hopeful', proseStyle: 'literary', primaryTheme: 'good-vs-evil' },
  'sci-fi': { settingType: 'science-fiction', technologyLevel: 'far-future', primaryTone: 'suspenseful', proseStyle: 'cinematic', primaryTheme: 'identity' },
  horror: { settingType: 'real-world-contemporary', technologyLevel: 'modern', primaryTone: 'dark', proseStyle: 'literary', primaryTheme: 'survival' },
  mystery: { settingType: 'real-world-contemporary', technologyLevel: 'modern', primaryTone: 'suspenseful', proseStyle: 'conversational', primaryTheme: 'justice' },
  romance: { settingType: 'real-world-contemporary', technologyLevel: 'modern', primaryTone: 'romantic', proseStyle: 'lyrical', primaryTheme: 'love' },
  adventure: { settingType: 'real-world-historical', technologyLevel: 'industrial', primaryTone: 'hopeful', proseStyle: 'cinematic', primaryTheme: 'survival' },
  comedy: { settingType: 'real-world-contemporary', technologyLevel: 'modern', primaryTone: 'humorous', proseStyle: 'conversational', primaryTheme: 'identity' },
  cyberpunk: { settingType: 'cyberpunk', technologyLevel: 'near-future', primaryTone: 'gritty', proseStyle: 'cinematic', primaryTheme: 'corruption' },
  thriller: { settingType: 'real-world-contemporary', technologyLevel: 'modern', primaryTone: 'suspenseful', proseStyle: 'cinematic', primaryTheme: 'survival' },
  drama: { settingType: 'real-world-contemporary', technologyLevel: 'modern', primaryTone: 'melancholic', proseStyle: 'literary', primaryTheme: 'identity' },
};

interface GenreGridProps {
  presets: GenrePresetMeta[];
}

export function GenreGrid({ presets }: GenreGridProps) {
  const ui = useProPanelStore(selectUI);
  const setSelectedGenre = useProPanelStore((s) => s.setSelectedGenre);
  const loadPreset = useProPanelStore((s) => s.loadPreset);
  const savedPresets = useProPanelStore((s) => s.savedPresets);
  const updateParameter = useProPanelStore((s) => s.updateParameter);

  const handleSelect = (presetId: string) => {
    if (ui.selectedGenre === presetId) {
      setSelectedGenre(null);
      return;
    }

    setSelectedGenre(presetId);

    // Load the preset if it exists in saved presets
    if (savedPresets[presetId]) {
      loadPreset(presetId);
    }

    // Auto-route parameters based on genre
    const defaults = GENRE_DEFAULTS[presetId];
    if (defaults) {
      updateParameter('world', 'settingType', defaults.settingType);
      updateParameter('world', 'technologyLevel', defaults.technologyLevel);
      updateParameter('toneStyle', 'primaryTone', defaults.primaryTone);
      updateParameter('toneStyle', 'proseStyle', defaults.proseStyle);
      updateParameter('theme', 'primaryTheme', defaults.primaryTheme);
    }
  };

  return (
    <div className="space-y-4">
      {/* Genre Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {presets.map((preset) => (
          <GenreCard
            key={preset.id}
            id={preset.id}
            title={preset.title}
            description={preset.description}
            imageUrl={preset.imageUrl}
            badge={preset.badge}
            caseId={preset.caseId}
            archetype={preset.archetype}
            isSelected={ui.selectedGenre === preset.id}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  );
}
