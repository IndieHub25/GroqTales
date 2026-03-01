'use client';

/**
 * SidebarPanels Component
 * Right sidebar panels matching reference HTML:
 * - Location Docks: noir-paper (#E5E5E5) card, border-[6px] border-black, white selects, black text
 * - Style Dossier: noir-paper card, font-condensed black labels, white selects
 * - Content Controls: dark card inside style dossier section
 * - Inspiration: bg-primary (#8a0000) red card with -rotate-2
 * All data dynamic from zustand store
 */

import React from 'react';
import {
  Building2,
  Castle,
  Clock,
  Cloud,
  Crosshair,
  Drama,
  FileText,
  Ghost,
  Heart,
  Map,
  Meh,
  Pencil,
  Rocket,
  Search,
  Theater,
} from 'lucide-react';

import {
  selectParameters,
  selectStoryInput,
  selectUI,
  useProPanelStore,
} from '@/store/proPanelStore';

// ============================================================
// LOCATION DOCKS PANEL
// Reference: bg-noir-paper border-[6px] border-black, white selects, black text
// ============================================================
/** Noir-styled location/setting quick-select sidebar panel. */
export function LocationDocksPanel() {
  const parameters = useProPanelStore(selectParameters);
  const updateParameter = useProPanelStore((s) => s.updateParameter);
  const ui = useProPanelStore(selectUI);
  const world = parameters.world;

  // Genre-specific location data
  const GENRE_LOCATIONS: Record<
    string,
    { name: string; icon: React.ReactNode; locationImage: string }
  > = {
    fantasy: {
      name: 'ENCHANTED REALM',
      icon: <Castle className="w-8 h-8 text-white" />,
      locationImage: '/images/presets/fantasylocation.jpg',
    },
    'sci-fi': {
      name: 'SPACE STATION',
      icon: <Rocket className="w-8 h-8 text-white" />,
      locationImage: '/images/presets/scifilocation.jpg',
    },
    horror: {
      name: 'HAUNTED MANOR',
      icon: <Ghost className="w-8 h-8 text-white" />,
      locationImage: '/images/presets/horrorlocation.jpg',
    },
    mystery: {
      name: 'CRIME SCENE',
      icon: <Search className="w-8 h-8 text-white" />,
      locationImage: '/images/presets/mysterylocation.jpg',
    },
    romance: {
      name: 'SUNSET TERRACE',
      icon: <Heart className="w-8 h-8 text-white" />,
      locationImage: '/images/presets/romanticlocation.jpg',
    },
    adventure: {
      name: 'LOST TEMPLE',
      icon: <Map className="w-8 h-8 text-white" />,
      locationImage: '/images/presets/adventurelocation.jpg',
    },
    comedy: {
      name: 'DOWNTOWN STAGE',
      icon: <Theater className="w-8 h-8 text-white" />,
      locationImage: '/images/presets/comedylocation.jpg',
    },
    cyberpunk: {
      name: 'NEON DISTRICT',
      icon: <Building2 className="w-8 h-8 text-white" />,
      locationImage: '/images/presets/cyberpunklocation.jpg',
    },
    thriller: {
      name: 'SAFE HOUSE',
      icon: <Crosshair className="w-8 h-8 text-white" />,
      locationImage: '/images/presets/thrillerlocation.jpg',
    },
    drama: {
      name: 'CITY STREETS',
      icon: <Drama className="w-8 h-8 text-white" />,
      locationImage: '/images/presets/dramalocation.jpg',
    },
  };

  const genreLoc = ui.selectedGenre ? GENRE_LOCATIONS[ui.selectedGenre] : null;
  const locationName = genreLoc?.name || 'LOCATION: DOCKS';
  const locationIcon = genreLoc?.icon || (
    <Building2 className="w-8 h-8 text-white" />
  );
  const locationImage = genreLoc?.locationImage || null;

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

  return (
    <div className="bg-[#E5E5E5] border-[6px] border-black p-2 shadow-comic relative">
      <div className="absolute -top-3 -right-3 bg-red-600 text-white font-condensed px-2 py-1 text-[10px] uppercase border-2 border-black z-30">
        SCENE REPORT
      </div>
      <div className="border-4 border-black bg-black p-1">
        <div className="relative h-56 w-full overflow-hidden grayscale contrast-125">
          {locationImage ? (
            <img
              src={locationImage}
              alt={locationName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center opacity-60">
              {locationIcon}
            </div>
          )}
          <div className="absolute inset-0 mugshot-overlay pointer-events-none" />
        </div>
      </div>
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 font-condensed text-black font-bold uppercase text-xs">
            <Clock className="w-4 h-4 text-black" /> Time Period
          </label>
          <select
            value={world.technologyLevel}
            onChange={(e) =>
              updateParameter(
                'world',
                'technologyLevel',
                e.target.value as (typeof TECHNOLOGY_LEVELS)[number]
              )
            }
            className="w-full bg-white border-2 border-black p-2 font-condensed text-sm text-black uppercase font-bold focus:ring-0 focus:outline-none"
          >
            {TECHNOLOGY_LEVELS.map((t) => (
              <option key={t} value={t}>
                {formatLabel(t)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 font-condensed text-black font-bold uppercase text-xs">
            <Cloud className="w-4 h-4 text-black" /> Atmosphere
          </label>
          <select
            value={world.settingType}
            onChange={(e) =>
              updateParameter(
                'world',
                'settingType',
                e.target.value as (typeof SETTING_TYPES)[number]
              )
            }
            className="w-full bg-white border-2 border-black p-2 font-condensed text-sm text-black uppercase font-bold focus:ring-0 focus:outline-none"
          >
            {SETTING_TYPES.map((s) => (
              <option key={s} value={s}>
                {formatLabel(s)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// STYLE DOSSIER PANEL
// Reference: bg-noir-paper card, black text labels, white selects
// ============================================================
/** Writing-style dossier sidebar panel with tone and content controls. */
export function StyleDossierPanel() {
  const parameters = useProPanelStore(selectParameters);
  const updateParameter = useProPanelStore((s) => s.updateParameter);
  const tone = parameters.toneStyle;

  const PROSE_STYLES = [
    'minimalist',
    'literary',
    'pulpy',
    'journalistic',
    'lyrical',
    'cinematic',
    'conversational',
  ] as const;
  const TONE_OPTIONS = [
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

  return (
    <div className="bg-[#E5E5E5] border-[6px] border-black p-6 shadow-comic flex flex-col gap-6">
      <h3 className="font-marker text-2xl text-black border-b-4 border-black inline-block">
        <Pencil className="w-5 h-5 text-black inline-block" /> STYLE DOSSIER
      </h3>
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="flex items-center gap-2 font-condensed text-black font-bold uppercase text-xs">
            <FileText className="w-4 h-4 text-[#8a0000]" /> Writing Style
          </label>
          <select
            value={tone.proseStyle}
            onChange={(e) =>
              updateParameter(
                'toneStyle',
                'proseStyle',
                e.target.value as (typeof PROSE_STYLES)[number]
              )
            }
            className="w-full bg-white border-2 border-black p-2 font-condensed text-sm text-black uppercase font-bold focus:ring-0 focus:outline-none"
          >
            {PROSE_STYLES.map((s) => (
              <option key={s} value={s}>
                {formatLabel(s)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="flex items-center gap-2 font-condensed text-black font-bold uppercase text-xs">
            <Meh className="w-4 h-4 text-[#8a0000]" /> Narrative Tone
          </label>
          <select
            value={tone.primaryTone}
            onChange={(e) =>
              updateParameter(
                'toneStyle',
                'primaryTone',
                e.target.value as (typeof TONE_OPTIONS)[number]
              )
            }
            className="w-full bg-white border-2 border-black p-2 font-condensed text-sm text-black uppercase font-bold focus:ring-0 focus:outline-none"
          >
            {TONE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {formatLabel(t)}
              </option>
            ))}
          </select>
        </div>

        {/* Dialogue % slider */}
        <div className="space-y-2 pt-4 border-t border-black/20">
          <label className="flex justify-between font-condensed text-black uppercase text-xs font-bold">
            <span>Dialogue %</span>
            <span>{tone.humorLevel}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={tone.humorLevel}
            onChange={(e) =>
              updateParameter('toneStyle', 'humorLevel', Number(e.target.value))
            }
            className="w-full h-1 bg-gray-400 appearance-none accent-black border border-black cursor-pointer"
          />
        </div>

        {/* Content Controls — dark card inside dossier */}
        <div className="space-y-2 pt-4 border-t border-black/20">
          <div className="bg-black text-white p-3 border-2 border-[#8a0000] rotate-1">
            <h4 className="font-condensed font-bold text-xs uppercase mb-2">
              CONTENT CONTROLS
            </h4>
            <div className="flex items-center justify-between text-[10px] uppercase font-bold font-condensed">
              <span>Violence</span>
              <span className="text-[#8a0000]">
                {formatLabel(tone.violenceLevel)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] uppercase font-bold font-condensed mt-1">
              <span>Language</span>
              <span className="text-[#8a0000]">
                {formatLabel(tone.romanceLevel)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CONTENT CONTROLS PANEL — Standalone version (if needed separate)
// ============================================================
/** Dark nested panel inside StyleDossierPanel for content controls. */
export function ContentControlsPanel() {
  const parameters = useProPanelStore(selectParameters);
  const updateParameter = useProPanelStore((s) => s.updateParameter);
  const tone = parameters.toneStyle;

  const VIOLENCE_OPTIONS = [
    'none',
    'mild',
    'moderate',
    'graphic',
    'extreme',
  ] as const;
  const ROMANCE_OPTIONS = [
    'none',
    'subtle',
    'moderate',
    'prominent',
    'central',
  ] as const;

  return (
    <div className="bg-[#E5E5E5] border-[6px] border-black p-6 shadow-comic">
      <div className="bg-black text-white p-4 border-2 border-[#8a0000] rotate-1">
        <h4 className="font-condensed font-bold text-sm uppercase mb-3 tracking-wider">
          CONTENT CONTROLS
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm uppercase font-bold font-condensed">
            <span>Violence</span>
            <span className="text-[#8a0000]">
              {formatLabel(tone.violenceLevel)}
            </span>
          </div>
          <select
            value={tone.violenceLevel}
            onChange={(e) =>
              updateParameter(
                'toneStyle',
                'violenceLevel',
                e.target.value as (typeof VIOLENCE_OPTIONS)[number]
              )
            }
            className="w-full bg-gray-900 border border-gray-600 p-2 font-condensed text-xs text-white uppercase font-bold focus:ring-0 focus:outline-none"
          >
            {VIOLENCE_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {formatLabel(v)}
              </option>
            ))}
          </select>
          <div className="flex items-center justify-between text-sm uppercase font-bold font-condensed mt-2">
            <span>Romance</span>
            <span className="text-[#8a0000]">
              {formatLabel(tone.romanceLevel)}
            </span>
          </div>
          <select
            value={tone.romanceLevel}
            onChange={(e) =>
              updateParameter(
                'toneStyle',
                'romanceLevel',
                e.target.value as (typeof ROMANCE_OPTIONS)[number]
              )
            }
            className="w-full bg-gray-900 border border-gray-600 p-2 font-condensed text-xs text-white uppercase font-bold focus:ring-0 focus:outline-none"
          >
            {ROMANCE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {formatLabel(r)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// INSPIRATION PANEL
// Reference: bg-primary (#8a0000) red card, -rotate-2, border-4 border-black
// ============================================================
const TROPES_AVOID = [
  'Chosen One',
  'Love Triangle',
  'Deus Ex Machina',
  'Amnesia Plot',
  'Evil Twin',
];
const TROPES_INCLUDE = [
  'Hero Journey',
  'Mentor Figure',
  'Found Family',
  'Redemption Arc',
  'Underdog Story',
];

/** Red inspiration card sidebar panel (–rotate-2) with random prompts. */
export function InspirationPanel() {
  const storyInput = useProPanelStore(selectStoryInput);
  const updateStoryInput = useProPanelStore((s) => s.updateStoryInput);

  const toggleTrope = (
    list: 'tropesToAvoid' | 'tropesToInclude',
    trope: string
  ) => {
    const current = storyInput[list] || [];
    const updated = current.includes(trope)
      ? current.filter((t: string) => t !== trope)
      : [...current, trope];
    updateStoryInput(list, updated);
  };

  return (
    <div className="bg-[#8a0000] p-5 border-4 border-black shadow-comic space-y-4 -rotate-1">
      {/* Title */}
      <h3 className="font-marker text-white text-xl tracking-wider uppercase">
        Inspiration
      </h3>

      {/* Similar To */}
      <div className="space-y-1">
        <label className="font-condensed text-white font-bold uppercase text-xs">
          Similar To (e.g., &quot;X meets Y&quot;)
        </label>
        <input
          type="text"
          placeholder="e.g., 'Lord of the Rings meets Cyberpunk 2077'"
          value={storyInput.inspirationPrompt || ''}
          onChange={(e) =>
            updateStoryInput('inspirationPrompt', e.target.value)
          }
          className="w-full bg-gray-900 border-2 border-gray-700 p-2 font-condensed text-xs text-white placeholder:text-gray-500 focus:ring-0 focus:outline-none focus:border-white"
        />
      </div>

      {/* Inspired By */}
      <div className="space-y-1">
        <label className="font-condensed text-white font-bold uppercase text-xs">
          Inspired By (Authors/Works)
        </label>
        <input
          type="text"
          placeholder="e.g., 'Tolkien, Asimov, Blade Runner'"
          value={storyInput.inspirationAuthor || ''}
          onChange={(e) =>
            updateStoryInput('inspirationAuthor', e.target.value)
          }
          className="w-full bg-gray-900 border-2 border-gray-700 p-2 font-condensed text-xs text-white placeholder:text-gray-500 focus:ring-0 focus:outline-none focus:border-white"
        />
      </div>

      {/* Tropes to Avoid */}
      <div className="space-y-2">
        <label className="font-condensed text-white font-bold uppercase text-[10px] tracking-wide">
          Tropes to Avoid
        </label>
        <div className="flex flex-wrap gap-1.5">
          {TROPES_AVOID.map((trope) => {
            const selected = (storyInput.tropesToAvoid || []).includes(trope);
            return (
              <button
                key={trope}
                type="button"
                onClick={() => toggleTrope('tropesToAvoid', trope)}
                className={`border-2 px-2 py-0.5 font-condensed text-[10px] font-bold transition-colors ${
                  selected
                    ? 'bg-white text-[#8a0000] border-white'
                    : 'bg-transparent text-white/80 border-white/40 hover:border-white hover:text-white'
                }`}
              >
                {trope}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tropes to Include */}
      <div className="space-y-2">
        <label className="font-condensed text-white font-bold uppercase text-[10px] tracking-wide">
          Tropes to Include
        </label>
        <div className="flex flex-wrap gap-1.5">
          {TROPES_INCLUDE.map((trope) => {
            const selected = (storyInput.tropesToInclude || []).includes(trope);
            return (
              <button
                key={trope}
                type="button"
                onClick={() => toggleTrope('tropesToInclude', trope)}
                className={`border-2 px-2 py-0.5 font-condensed text-[10px] font-bold transition-colors ${
                  selected
                    ? 'bg-white text-[#8a0000] border-white'
                    : 'bg-transparent text-white/80 border-white/40 hover:border-white hover:text-white'
                }`}
              >
                {trope}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// HELPERS
// ============================================================
function formatLabel(value: string): string {
  return value
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
