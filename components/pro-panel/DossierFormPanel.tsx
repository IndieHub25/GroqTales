'use client';

/**
 * DossierFormPanel — Right Panel Classified Document Form
 * Displays the selected category's controls styled as a classified spy dossier.
 * Features: document header, watermark, stamps, aged paper texture, footer.
 */

import {
  BookOpen,
  Bot,
  Gem,
  Globe,
  Lightbulb,
  Palette,
  Ruler,
  Settings,
  Theater,
  Users,
} from 'lucide-react';
import React from 'react';

import { CATEGORY_CONFIG } from '@/lib/constants/proPanelDefaults';
import type { CategoryKey } from '@/lib/schemas/proPanelSchemas';
import { useProPanelStore } from '@/store/proPanelStore';

import { ICON_MAP } from './iconMap';
import { AdvancedSection } from './sections/AdvancedSection';
import { CharacterSection } from './sections/CharacterSection';
import { LengthSection } from './sections/LengthSection';
import { ModelSettingsSection } from './sections/ModelSettingsSection';
import { StoryStructureSection } from './sections/StoryStructureSection';
import { ThemeSection } from './sections/ThemeSection';
import { ToneStyleSection } from './sections/ToneStyleSection';
import { VisualSection } from './sections/VisualSection';
import { WorldSection } from './sections/WorldSection';

const SECTION_COMPONENTS: { [K in CategoryKey]: React.FC } = {
  storyStructure: StoryStructureSection,
  characters: CharacterSection,
  world: WorldSection,
  toneStyle: ToneStyleSection,
  theme: ThemeSection,
  modelSettings: ModelSettingsSection,
  visual: VisualSection,
  length: LengthSection,
  advanced: AdvancedSection,
};

// Dossier metadata per category
const DOSSIER_META: Record<
  CategoryKey,
  {
    fileNumber: string;
    docTitle: string;
    stamps: string[];
    watermark: React.ReactNode;
  }
> = {
  storyStructure: {
    fileNumber: '01',
    docTitle: 'NARRATIVE OPERATIONS BRIEFING',
    stamps: ['PLOT APPROVED', 'STRUCTURE VERIFIED'],
    watermark: <BookOpen className="w-full h-full text-black" />,
  },
  characters: {
    fileNumber: '02',
    docTitle: 'PERSONNEL DOSSIER',
    stamps: ['IDENTITY CONFIRMED', 'BACKGROUND CLEARED'],
    watermark: <Users className="w-full h-full text-black" />,
  },
  world: {
    fileNumber: '03',
    docTitle: 'LOCATION INTELLIGENCE REPORT',
    stamps: ['LOCATION SECURED', 'TERRAIN MAPPED'],
    watermark: <Globe className="w-full h-full text-black" />,
  },
  toneStyle: {
    fileNumber: '04',
    docTitle: 'COMMUNICATION PROTOCOL',
    stamps: ['TONE AUTHORIZED', 'STYLE APPROVED'],
    watermark: <Theater className="w-full h-full text-black" />,
  },
  theme: {
    fileNumber: '05',
    docTitle: 'OPERATIONAL THEMES & OBJECTIVES',
    stamps: ['THEMES CLASSIFIED', 'OBJECTIVES SET'],
    watermark: <Gem className="w-full h-full text-black" />,
  },
  modelSettings: {
    fileNumber: '06',
    docTitle: 'TECHNICAL SPECIFICATIONS - CLASSIFIED',
    stamps: ['TECH AUTHORIZED', 'AI CLEARANCE LVL 5'],
    watermark: <Bot className="w-full h-full text-black" />,
  },
  visual: {
    fileNumber: '07',
    docTitle: 'VISUAL INTELLIGENCE BRIEFING',
    stamps: ['VISUAL APPROVED', 'COVER ART CLEARED'],
    watermark: <Palette className="w-full h-full text-black" />,
  },
  length: {
    fileNumber: '08',
    docTitle: 'DOCUMENT SPECIFICATIONS',
    stamps: ['LENGTH CONFIRMED', 'FORMAT APPROVED'],
    watermark: <Ruler className="w-full h-full text-black" />,
  },
  advanced: {
    fileNumber: '09',
    docTitle: 'SPECIAL OPERATIONS PARAMETERS',
    stamps: ['CLASSIFIED', 'AUTHORIZED ONLY'],
    watermark: <Settings className="w-full h-full text-black" />,
  },
};

interface DossierFormPanelProps {
  selectedCategory: CategoryKey;
}

/** Right-panel classified document form showing the active category's controls. */
export function DossierFormPanel({ selectedCategory }: DossierFormPanelProps) {
  const resetCategory = useProPanelStore((s) => s.resetCategory);
  const config = CATEGORY_CONFIG[selectedCategory];
  const meta = DOSSIER_META[selectedCategory];
  const SectionComponent = SECTION_COMPONENTS[selectedCategory];

  const handleReset = () => {
    resetCategory(selectedCategory);
  };

  return (
    <div className="bg-[#E5E5E5] border-[6px] border-black shadow-[6px_6px_0px_rgba(138,0,0,0.5)] relative overflow-x-visible overflow-y-hidden min-h-[600px]">
      {/* ── Watermark — faded category icon ── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 opacity-[0.04] rotate-[-15deg] pointer-events-none select-none">
        {meta.watermark}
      </div>

      {/* ── Faded diagonal text watermark ── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[30deg] pointer-events-none select-none whitespace-nowrap">
        <span className="font-marker text-black/[0.04] text-6xl tracking-[0.3em]">
          FILE COPY
        </span>
      </div>

      {/* ── Aged paper stains (decorative) ── */}
      <div className="absolute top-8 right-16 w-16 h-16 rounded-full bg-yellow-900/[0.06] pointer-events-none" />
      <div className="absolute bottom-20 left-12 w-10 h-10 rounded-full bg-yellow-900/[0.05] pointer-events-none" />
      <div className="absolute top-1/3 right-8 w-6 h-6 rounded-full bg-yellow-900/[0.04] pointer-events-none" />

      {/* ── Document Header ── */}
      <div className="relative z-10 border-b-4 border-black px-8 lg:px-12 py-5 flex items-start justify-between">
        {/* Left side: Department & File info */}
        <div>
          <p className="font-condensed text-[9px] text-gray-500 uppercase tracking-[0.2em]">
            DEPARTMENT OF NARRATIVE OPERATIONS
          </p>
          <h2 className="font-marker text-black text-xl md:text-2xl leading-tight mt-1">
            {meta.docTitle}
          </h2>
          <div className="flex items-center gap-3 mt-2">
            <span className="font-condensed text-[10px] text-gray-500 uppercase tracking-wider">
              FILE NO. {meta.fileNumber}-
              {selectedCategory.slice(0, 4).toUpperCase()}
            </span>
            <span className="font-condensed text-[10px] text-gray-400 uppercase tracking-wider">
              •
            </span>
            <span className="font-condensed text-[10px] text-gray-500 uppercase tracking-wider">
              REV. 2026
            </span>
          </div>
        </div>

        {/* Right side: CONFIDENTIAL stamp */}
        <div className="shrink-0 ml-4">
          <div className="border-3 border-[#8a0000] px-3 py-1.5 rotate-[-4deg] select-none">
            <span className="font-marker text-[#8a0000] text-sm tracking-wider">
              CONFIDENTIAL
            </span>
          </div>
        </div>
      </div>

      {/* ── Category Icon & Title Bar ── */}
      <div className="relative z-10 border-b-2 border-dashed border-black/20 px-8 lg:px-12 py-3 bg-black/[0.03]">
        <div className="flex items-center gap-3">
          {(() => {
            const IconComp = ICON_MAP[config.icon];
            return IconComp ? (
              <IconComp className="w-6 h-6 text-black" />
            ) : null;
          })()}
          <div>
            <h3 className="font-condensed text-black text-sm font-bold uppercase tracking-wider">
              {config.title}
            </h3>
            <p className="font-condensed text-[10px] text-gray-500 uppercase tracking-wider">
              {config.description}
            </p>
          </div>
        </div>
      </div>

      {/* ── Document Body — form controls ── */}
      <div className="relative z-10 px-8 lg:px-12 py-8">
        {/* Dark container for controls — full width with max constraint */}
        <div className="bg-black/90 border-2 border-white/10 p-6 lg:p-8 rounded-sm max-w-5xl">
          <SectionComponent />
        </div>
      </div>

      {/* ── Red stamps row ── */}
      <div className="relative z-10 px-8 lg:px-12 pb-4">
        <div className="flex flex-wrap gap-3">
          {meta.stamps.map((stamp, i) => (
            <span
              key={stamp}
              className={`
                inline-block font-marker text-[11px] tracking-wider border-2 px-2 py-0.5 select-none
                ${
                  i === 0
                    ? 'text-[#8a0000] border-[#8a0000] rotate-[-2deg]'
                    : 'text-gray-500 border-gray-400 rotate-[1deg]'
                }
              `}
            >
              {stamp}
            </span>
          ))}
        </div>
      </div>

      {/* ── Document Footer ── */}
      <div className="relative z-10 border-t-4 border-black px-8 lg:px-12 py-4 flex items-center justify-between bg-black/[0.04]">
        {/* Left: TOP SECRET stamp + file info */}
        <div className="flex items-center gap-4">
          <div className="border-2 border-[#8a0000] bg-[#8a0000]/10 px-3 py-1 -rotate-1 select-none">
            <span className="font-marker text-[#8a0000] text-xs tracking-wider">
              TOP SECRET
            </span>
          </div>
          <span className="font-condensed text-[9px] text-gray-400 uppercase tracking-[0.2em]">
            FILE {meta.fileNumber} OF 09
          </span>
        </div>

        {/* Right: Reset button */}
        <button
          type="button"
          onClick={handleReset}
          className="font-condensed text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-[#8a0000] border border-black/30 hover:border-[#8a0000] bg-white px-3 py-1.5 transition-colors cursor-pointer select-none"
        >
          ↺ RESET TO DEFAULTS
        </button>
      </div>

      {/* ── Corner fingerprint decoration ── */}
      <div className="absolute bottom-4 right-4 text-4xl opacity-[0.06] rotate-[20deg] pointer-events-none select-none">
        🔍
      </div>
    </div>
  );
}
