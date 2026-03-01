'use client';

/**
 * MissionNavigator — Left Panel Category Navigator
 * Dark "mission briefing board" with clickable category list.
 * Active category highlighted with red bg and left bar indicator.
 */

import React from 'react';
import {
  BookOpen,
  Bot,
  Globe,
  Lightbulb,
  Palette,
  Ruler,
  Settings,
  Theater,
  Users,
} from 'lucide-react';

import { CATEGORY_CONFIG } from '@/lib/constants/proPanelDefaults';
import type { CategoryKey } from '@/lib/schemas/proPanelSchemas';

// Map icon string identifiers to Lucide components
const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  'book-open': BookOpen,
  users: Users,
  globe: Globe,
  theater: Theater,
  lightbulb: Lightbulb,
  bot: Bot,
  palette: Palette,
  ruler: Ruler,
  settings: Settings,
};

interface MissionNavigatorProps {
  selectedCategory: CategoryKey;
  onSelectCategory: (key: CategoryKey) => void;
  sortedCategories: CategoryKey[];
}

// File number per category
const FILE_NUMBERS: Record<CategoryKey, string> = {
  storyStructure: '01',
  characters: '02',
  world: '03',
  toneStyle: '04',
  theme: '05',
  modelSettings: '06',
  visual: '07',
  length: '08',
  advanced: '09',
};

/** Left sidebar category navigator styled as a dark mission-briefing board. */
export function MissionNavigator({
  selectedCategory,
  onSelectCategory,
  sortedCategories,
}: MissionNavigatorProps) {
  return (
    <div className="h-full bg-[#050505] border-4 border-white/10 relative overflow-hidden">
      {/* Halftone texture overlay */}
      <div className="absolute inset-0 halftone-bg opacity-20 pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="px-5 py-5 border-b-2 border-[#8a0000]">
          <h3 className="font-marker text-[#8a0000] text-xl tracking-wider leading-tight">
            CLASSIFIED BRIEFINGS
          </h3>
          <p className="font-condensed text-gray-500 text-[10px] uppercase tracking-[0.2em] mt-1">
            Select a mission file to configure
          </p>
        </div>

        {/* Category List */}
        <div className="py-2">
          {sortedCategories.map((categoryKey) => {
            const config = CATEGORY_CONFIG[categoryKey];
            const fileNum = FILE_NUMBERS[categoryKey];
            const isActive = selectedCategory === categoryKey;

            return (
              <button
                key={categoryKey}
                type="button"
                onClick={() => onSelectCategory(categoryKey)}
                className={`
                  w-full text-left px-4 py-3 flex items-center gap-3 transition-all duration-200 relative group
                  ${
                    isActive
                      ? 'bg-[#8a0000] text-white'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                {/* Active left bar indicator */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-white" />
                )}

                {/* Icon */}
                <span className="shrink-0 w-7 flex items-center justify-center">
                  {(() => {
                    const IconComp = ICON_MAP[config.icon];
                    return IconComp ? (
                      <IconComp
                        className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`}
                      />
                    ) : (
                      <span className="text-lg">{config.icon}</span>
                    );
                  })()}
                </span>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-condensed text-[10px] uppercase tracking-wider ${isActive ? 'text-white/70' : 'text-gray-600'}`}
                    >
                      FILE {fileNum}
                    </span>
                    {isActive && (
                      <span className="font-condensed text-[8px] uppercase tracking-[0.15em] bg-white/20 text-white px-1.5 py-0.5 leading-none">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p
                    className={`font-condensed font-bold uppercase text-xs tracking-wider truncate ${isActive ? 'text-white' : ''}`}
                  >
                    {config.title}
                  </p>
                </div>

                {/* Arrow indicator */}
                <span
                  className={`text-xs transition-transform shrink-0 ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-gray-400'}`}
                >
                  {isActive ? '▶' : '›'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer stamp */}
        <div className="px-5 py-4 border-t border-white/10 mt-2">
          <div className="text-center">
            <span className="font-condensed text-[9px] text-gray-600 uppercase tracking-[0.2em]">
              9 ACTIVE CASE FILES
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
