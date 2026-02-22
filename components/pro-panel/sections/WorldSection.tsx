'use client';

/**
 * World Section
 * Controls for world building and setting
 */

import React from 'react';
import { useProPanelStore, selectParameters } from '@/store/proPanelStore';
import {
  SliderControl,
  SelectControl,
  ControlGrid,
  CollapsibleGroup,
} from '../controls';

const SETTING_TYPES = [
  'real-world-contemporary',
  'real-world-historical',
  'alternate-history',
  'low-fantasy',
  'high-fantasy',
  'science-fiction',
  'post-apocalyptic',
  'dystopian',
  'urban-fantasy',
  'steampunk',
  'cyberpunk',
] as const;

const GEOGRAPHIC_SCOPES = [
  'single-location',
  'city',
  'region',
  'country',
  'continent',
  'world',
  'multiverse',
] as const;

const TECHNOLOGY_LEVELS = [
  'primitive',
  'medieval',
  'renaissance',
  'industrial',
  'modern',
  'near-future',
  'far-future',
  'mixed',
] as const;

export function WorldSection() {
  const parameters = useProPanelStore(selectParameters);
  const updateParameter = useProPanelStore((s) => s.updateParameter);
  const world = parameters.world;

  return (
    <div className="space-y-6">
      {/* ── CORE: Always visible ── */}
      <ControlGrid>
        <SelectControl
          label="Setting Type"
          description="The genre/era of your world"
          value={world.settingType}
          options={SETTING_TYPES}
          onChange={(v) => updateParameter('world', 'settingType', v)}
        />
        <SelectControl
          label="Geographic Scope"
          description="How much of the world is explored"
          value={world.geographicScope}
          options={GEOGRAPHIC_SCOPES}
          onChange={(v) => updateParameter('world', 'geographicScope', v)}
        />
      </ControlGrid>

      <SelectControl
        label="Technology Level"
        description="The technological advancement of the world"
        value={world.technologyLevel}
        options={TECHNOLOGY_LEVELS}
        onChange={(v) => updateParameter('world', 'technologyLevel', v)}
      />

      {/* ── ADVANCED: Collapsed by default ── */}
      <CollapsibleGroup title="Advanced — Detail Levels">
        <ControlGrid>
          <SliderControl
            label="World Building Depth"
            description="Overall detail of world creation"
            value={world.worldBuildingDepth}
            onChange={(v) => updateParameter('world', 'worldBuildingDepth', v)}
          />
          <SliderControl
            label="Culture Detail"
            description="Depth of social and cultural elements"
            value={world.cultureDetailLevel}
            onChange={(v) => updateParameter('world', 'cultureDetailLevel', v)}
          />
          <SliderControl
            label="Magic/Supernatural Systems"
            description="Complexity of magical elements (0 = none)"
            value={world.magicSystemComplexity}
            onChange={(v) => updateParameter('world', 'magicSystemComplexity', v)}
          />
          <SliderControl
            label="Environmental Detail"
            description="Richness of landscape descriptions"
            value={world.environmentalDetail}
            onChange={(v) => updateParameter('world', 'environmentalDetail', v)}
          />
          <SliderControl
            label="Historical Depth"
            description="World history woven into narrative"
            value={world.historicalDepth}
            onChange={(v) => updateParameter('world', 'historicalDepth', v)}
          />
          <SliderControl
            label="Sensory Richness"
            description="Detail of sights, sounds, smells, etc."
            value={world.sensoryRichness}
            onChange={(v) => updateParameter('world', 'sensoryRichness', v)}
          />
        </ControlGrid>
      </CollapsibleGroup>
    </div>
  );
}

