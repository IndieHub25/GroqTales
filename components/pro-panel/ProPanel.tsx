'use client';

/**
 * ProPanel Component
 * Main orchestrator for the Noir Dossier Pro Panel
 * Matches reference HTML exactly:
 * - Red header (bg-[#8a0000])
 * - Halftone background
 * - noir-paper (bg-[#E5E5E5]) FILE 01/FILE 02 cards with border-[8px] border-black
 * - Dark TECHNICAL PARAMETERS section
 * - Grey sidebar panels
 * - Red GENERATE STORY button
 * - Noir footer
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  Cake,
  ClipboardList,
  Columns,
  LayoutList,
  Search,
  User,
} from 'lucide-react';

import { Accordion } from '@/components/ui/accordion';
import {
  CATEGORY_CONFIG,
  GENRE_PRESET_META,
} from '@/lib/constants/proPanelDefaults';
import type { CategoryKey } from '@/lib/schemas/proPanelSchemas';
import {
  selectStoryInput,
  selectUI,
  useProPanelStore,
} from '@/store/proPanelStore';

import { CategorySection } from './CategorySection';
import { DossierFormPanel } from './DossierFormPanel';
import { GenerateStoryButton } from './GenerateStoryButton';
import { GenreGrid } from './GenreGrid';
import { ICON_MAP } from './iconMap';
import { MissionNavigator } from './MissionNavigator';
import { PresetManager } from './PresetManager';
import {
  InspirationPanel,
  LocationDocksPanel,
  StyleDossierPanel,
} from './SidebarPanels';
import { StoryInputSection } from './StoryInputSection';
import { AdvancedSection } from './sections/AdvancedSection';
import { CharacterSection as CharacterSectionContent } from './sections/CharacterSection';
import { LengthSection } from './sections/LengthSection';
import { ModelSettingsSection } from './sections/ModelSettingsSection';
import { StoryStructureSection } from './sections/StoryStructureSection';
import { ThemeSection } from './sections/ThemeSection';
import { ToneStyleSection } from './sections/ToneStyleSection';
import { VisualSection } from './sections/VisualSection';
import { WorldSection } from './sections/WorldSection';

const SECTION_COMPONENTS: { [K in CategoryKey]: React.FC } = {
  storyStructure: StoryStructureSection,
  characters: CharacterSectionContent,
  world: WorldSection,
  toneStyle: ToneStyleSection,
  theme: ThemeSection,
  modelSettings: ModelSettingsSection,
  visual: VisualSection,
  length: LengthSection,
  advanced: AdvancedSection,
};

const CATEGORY_KEYS = Object.keys(CATEGORY_CONFIG) as CategoryKey[];

// Step tags for the noir dossier workflow
const STEP_TAGS = [
  { label: '01-INPUT', step: 1, active: true },
  { label: '02-PREVIEW', step: 2, active: false },
  { label: '03-MINT', step: 3, active: false },
];

/** Main Pro Panel orchestrator — Noir Dossier layout with genre grid, parameters, and generation. */
export function ProPanel() {
  const ui = useProPanelStore(selectUI);
  const storyInput = useProPanelStore(selectStoryInput);
  const updateStoryInput = useProPanelStore((s) => s.updateStoryInput);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryKey>('storyStructure');
  const [displayedCategory, setDisplayedCategory] =
    useState<CategoryKey>('storyStructure');
  const [isPageTurning, setIsPageTurning] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'accordion'>('split');
  const pageRef = useRef<HTMLDivElement>(null);

  const handleCategoryChange = useCallback(
    (newCategory: CategoryKey) => {
      if (newCategory === selectedCategory || isPageTurning) return;
      setIsPageTurning(true);
      setSelectedCategory(newCategory);

      // Phase 1: gentle fade-tilt out
      if (pageRef.current) {
        pageRef.current.classList.remove('dossier-page-enter');
        pageRef.current.classList.add('dossier-page-exit');
      }

      // Phase 2: swap content and ease in smoothly
      setTimeout(() => {
        setDisplayedCategory(newCategory);
        if (pageRef.current) {
          pageRef.current.classList.remove('dossier-page-exit');
          pageRef.current.classList.add('dossier-page-enter');
        }
        setTimeout(() => {
          setIsPageTurning(false);
          if (pageRef.current) {
            pageRef.current.classList.remove('dossier-page-enter');
          }
        }, 700);
      }, 400);
    },
    [selectedCategory, isPageTurning]
  );

  const sortedCategories = [...CATEGORY_KEYS].sort(
    (a, b) => CATEGORY_CONFIG[a].order - CATEGORY_CONFIG[b].order
  );

  return (
    <div className="font-display bg-[#050505] text-white relative min-h-screen">
      {/* ── Fixed Background Textures ── */}
      <div className="fixed inset-0 z-0 halftone-bg pointer-events-none opacity-40" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
          {/* ── Step Tags Row ── */}
          <div className="flex justify-center items-center gap-4 mb-12">
            {STEP_TAGS.map((tag, index) => (
              <React.Fragment key={tag.step}>
                <div
                  className={`flex flex-col items-center ${index === 0 ? 'rotate-3 translate-y-2' : index === 1 ? '-rotate-2' : 'rotate-1 translate-y-2'}`}
                >
                  <div
                    className={`px-4 py-1 font-marker text-sm border-2 border-black shadow-comic ${
                      tag.active
                        ? 'bg-white text-black'
                        : 'bg-gray-400 text-gray-700'
                    }`}
                  >
                    TAG: {tag.label}
                  </div>
                  <div
                    className={`w-1 h-8 ${tag.active ? 'bg-black' : 'bg-black/40'}`}
                  />
                </div>
                {index < STEP_TAGS.length - 1 && (
                  <div className="w-16 h-1 border-b-4 border-dashed border-gray-600" />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* ── Hero Title ── */}
          <div className="text-center mb-12">
            <h1 className="font-marker text-[#8a0000] text-6xl md:text-8xl lg:text-9xl -rotate-2 drop-shadow-[8px_8px_0_rgba(0,0,0,1)] text-stroke-black leading-tight">
              {ui.selectedGenre
                ? ui.selectedGenre.toUpperCase() + ' DOSSIER'
                : 'NOIR DOSSIER'}
            </h1>
            <div className="inline-block bg-black border-2 border-[#8a0000] px-6 py-2 rotate-1 mt-4">
              <span className="font-condensed text-[#E5E5E5] text-xl uppercase tracking-widest">
                CREATIVE MODE: <span className="text-green-500">ON</span>
              </span>
            </div>
          </div>

          {/* ── Main Content Grid ── */}
          <form
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            onSubmit={(e) => e.preventDefault()}
          >
            {/* ─── LEFT COLUMN: Main Parameters ─── */}
            <div className="lg:col-span-8 space-y-12">
              {/* FILE 01: SUBJECTS — noir-paper card */}
              <section className="relative">
                <div className="absolute -top-6 left-8 bg-[#8a0000] text-white font-marker px-6 py-2 border-4 border-black z-20 shadow-comic -rotate-2 clip-tab">
                  FILE 01: SUBJECTS
                </div>
                <div className="bg-[#E5E5E5] border-[8px] border-black p-8 pt-12 shadow-comic-red relative overflow-hidden">
                  {/* Fingerprint watermark */}
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-10 rotate-12 pointer-events-none">
                    <Search className="w-full h-full text-black" />
                  </div>

                  {/* Character Name + Age Range — matching reference */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <div className="space-y-2">
                      <label
                        htmlFor="char-name"
                        className="flex items-center gap-2 font-condensed text-black font-bold uppercase tracking-tighter"
                      >
                        <User className="w-4 h-4 text-[#8a0000]" /> Main
                        Character Name
                      </label>
                      <input
                        id="char-name"
                        type="text"
                        value={storyInput.characterName}
                        onChange={(e) =>
                          updateStoryInput('characterName', e.target.value)
                        }
                        placeholder="e.g., Alex 'The Ghost'"
                        className="w-full bg-white border-4 border-black p-4 font-marker text-black focus:ring-0 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="age-range"
                        className="flex items-center gap-2 font-condensed text-black font-bold uppercase tracking-tighter"
                      >
                        <Cake className="w-4 h-4 text-[#8a0000]" /> Age Range
                      </label>
                      <select
                        id="age-range"
                        value={storyInput.ageRange}
                        onChange={(e) =>
                          updateStoryInput('ageRange', e.target.value)
                        }
                        className="w-full bg-white border-4 border-black p-4 font-condensed font-bold uppercase text-black focus:ring-0 focus:outline-none"
                      >
                        <option value="young">Young (18-25)</option>
                        <option value="prime">Prime (26-45)</option>
                        <option value="veteran">Veteran (46+)</option>
                      </select>
                    </div>
                  </div>

                  {/* Genre Preset Cards */}
                  <div className="mb-8">
                    <label className="font-condensed text-black font-bold uppercase mb-4 block underline decoration-4 underline-offset-4 decoration-[#8a0000] text-lg">
                      MUGSHOT ARCHETYPES
                    </label>
                    <GenreGrid presets={GENRE_PRESET_META} />
                  </div>

                  {/* Character Background inside FILE 01 */}
                  <div className="bg-white/50 border-4 border-black p-6 relative">
                    <label
                      htmlFor="char-bg"
                      className="font-condensed text-black font-bold uppercase mb-2 flex items-center gap-2"
                    >
                      <ClipboardList className="w-4 h-4 text-[#8a0000]" />{' '}
                      Character Background
                    </label>
                    <textarea
                      id="char-bg"
                      value={storyInput.characterBackground}
                      onChange={(e) =>
                        updateStoryInput('characterBackground', e.target.value)
                      }
                      placeholder="A disgraced detective with a drinking problem and a heart of gold..."
                      rows={3}
                      className="w-full bg-white border-2 border-black p-3 font-display text-black resize-none focus:ring-0 focus:outline-none placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </section>

              {/* FILE 02: THE INCIDENT — noir-paper card */}
              <section className="relative">
                <div className="absolute -top-6 right-8 bg-black text-white font-marker px-6 py-2 border-4 border-white z-20 shadow-comic-red rotate-2">
                  FILE 02: THE INCIDENT
                </div>
                <div className="bg-[#E5E5E5] border-[8px] border-black p-8 pt-12 shadow-comic relative">
                  <StoryInputSection />
                </div>
              </section>
            </div>

            {/* ─── RIGHT COLUMN: Sidebar Panels (vertical stack beside FILE 01/02) ─── */}
            <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
              <LocationDocksPanel />
              <StyleDossierPanel />
              <InspirationPanel />
            </div>

            {/* ── MISSION PARAMETERS — Full width section ── */}
            <section className="lg:col-span-12">
              {/* Section Title + View Toggle */}
              <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <div className="text-center sm:text-left">
                  <h3 className="font-marker text-[#8a0000] text-3xl drop-shadow-[3px_3px_0_rgba(0,0,0,1)]">
                    MISSION PARAMETERS
                  </h3>
                  <p className="font-condensed text-gray-500 text-[10px] uppercase tracking-[0.2em] mt-1">
                    {viewMode === 'split'
                      ? 'Select a case file from the left \u2022 Configure on the right'
                      : 'Expand any case file to configure parameters'}
                  </p>
                </div>

                {/* View Mode Toggle */}
                <div
                  className="flex items-center gap-1 border-2 border-white/10 bg-black/60 p-0.5"
                  role="group"
                  aria-label="View mode"
                >
                  <button
                    type="button"
                    aria-pressed={viewMode === 'split'}
                    onClick={() => setViewMode('split')}
                    title="Split Panel View"
                    className={`px-3 py-1.5 font-condensed text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                      viewMode === 'split'
                        ? 'bg-[#8a0000] text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Columns className="w-3.5 h-3.5" /> Dossier
                  </button>
                  <button
                    type="button"
                    aria-pressed={viewMode === 'accordion'}
                    onClick={() => setViewMode('accordion')}
                    title="Accordion View"
                    className={`px-3 py-1.5 font-condensed text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                      viewMode === 'accordion'
                        ? 'bg-[#8a0000] text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <LayoutList className="w-3.5 h-3.5" /> Accordion
                  </button>
                </div>
              </div>

              {/* Preset Manager Bar */}
              <div className="mb-6 bg-black/60 border-2 border-white/10 p-4">
                <PresetManager />
              </div>

              {/* ── VIEW: Split Panel (Dossier) ── */}
              {viewMode === 'split' && (
                <>
                  {/* Mobile: Horizontal scrollable tabs */}
                  <div className="lg:hidden mb-4 overflow-x-auto">
                    <div
                      className="flex gap-1 pb-2 min-w-max"
                      role="tablist"
                      aria-label="Category tabs"
                    >
                      {sortedCategories.map((categoryKey) => {
                        const config = CATEGORY_CONFIG[categoryKey];
                        const isActive = selectedCategory === categoryKey;
                        return (
                          <button
                            key={categoryKey}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            onClick={() => handleCategoryChange(categoryKey)}
                            className={`
                              px-3 py-2 font-condensed text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border-2 transition-all
                              ${
                                isActive
                                  ? 'bg-[#8a0000] text-white border-[#8a0000]'
                                  : 'bg-black/80 text-gray-400 border-white/10 hover:text-white hover:border-white/30'
                              }
                            `}
                          >
                            {(() => {
                              const IconComp = ICON_MAP[config.icon];
                              return IconComp ? (
                                <IconComp
                                  className={`w-3.5 h-3.5 inline-block mr-1 ${isActive ? 'text-white' : 'text-gray-400'}`}
                                />
                              ) : null;
                            })()}
                            {config.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Desktop: Split panel layout — 20% nav / 80% form */}
                  <div className="grid grid-cols-1 lg:grid-cols-10 gap-0">
                    {/* Left: Mission Navigator */}
                    <div className="hidden lg:block lg:col-span-2">
                      <MissionNavigator
                        selectedCategory={selectedCategory}
                        onSelectCategory={handleCategoryChange}
                        sortedCategories={sortedCategories}
                      />
                    </div>

                    {/* Right: Dossier Form Panel — with page-turn animation */}
                    <div className="lg:col-span-8 [perspective:1200px]">
                      <div
                        ref={pageRef}
                        style={{ transformOrigin: 'left center' }}
                      >
                        <DossierFormPanel
                          selectedCategory={displayedCategory}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ── VIEW: Accordion (all categories expandable) ── */}
              {viewMode === 'accordion' && (
                <Accordion
                  type="multiple"
                  defaultValue={['storyStructure']}
                  className="space-y-3"
                >
                  {sortedCategories.map((categoryKey) => {
                    const config = CATEGORY_CONFIG[categoryKey];
                    const SectionComponent = SECTION_COMPONENTS[categoryKey];
                    return (
                      <CategorySection
                        key={categoryKey}
                        id={categoryKey}
                        title={config.title}
                        description={config.description}
                        icon={config.icon}
                      >
                        <SectionComponent />
                      </CategorySection>
                    );
                  })}
                </Accordion>
              )}
            </section>

            {/* ─── FULL WIDTH: Generate CTA ─── */}
            <div className="lg:col-span-12 mt-12 mb-24 flex flex-col items-center gap-8">
              <div className="w-full h-1 border-b-4 border-dashed border-gray-800" />
              <GenerateStoryButton />
              <div className="max-w-xl text-center">
                <p className="font-condensed text-gray-500 uppercase tracking-widest text-xs">
                  CAUTION: Narrative synthesis using Groq AI involves heavy
                  gritty filters and unexpected plot twists. Proceed at your own
                  peril, detective.
                </p>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
