'use client';

/**
 * StoryInputSection Component
 * Inline story input for FILE 02: THE INCIDENT
 * Lives inside noir-paper card — uses BLACK text, WHITE inputs with border-4 border-black
 * Matches reference HTML exactly
 */

import React from 'react';
import { useProPanelStore, selectStoryInput, selectParameters } from '@/store/proPanelStore';
import { Search, Brain, TrendingUp, Zap } from 'lucide-react';

type NarrativeStyle = 'linear' | 'nonlinear' | 'episodic' | 'circular' | 'parallel' | 'frame-story' | 'stream-of-consciousness';
type ActStructure = 'three-act' | 'five-act' | 'heros-journey' | 'kishōtenketsu' | 'seven-point' | 'fichtean-curve';
type ResolutionStyle = 'conclusive' | 'open-ended' | 'ambiguous' | 'twist-ending' | 'cliffhanger' | 'bittersweet';
type Pacing = 'slow-burn' | 'moderate' | 'fast-paced' | 'breakneck' | 'variable';

const NARRATIVE_STYLES: NarrativeStyle[] = ['linear', 'nonlinear', 'episodic', 'circular', 'parallel', 'frame-story', 'stream-of-consciousness'];
const ACT_STRUCTURES: ActStructure[] = ['three-act', 'five-act', 'heros-journey', 'kishōtenketsu', 'seven-point', 'fichtean-curve'];
const RESOLUTION_STYLES: ResolutionStyle[] = ['conclusive', 'open-ended', 'ambiguous', 'twist-ending', 'cliffhanger', 'bittersweet'];
const PACING_OPTIONS: Pacing[] = ['slow-burn', 'moderate', 'fast-paced', 'breakneck', 'variable'];

function formatLabel(value: string): string {
    return value.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function StoryInputSection() {
    const storyInput = useProPanelStore(selectStoryInput);
    const parameters = useProPanelStore(selectParameters);
    const updateStoryInput = useProPanelStore((s) => s.updateStoryInput);
    const updateParameter = useProPanelStore((s) => s.updateParameter);

    return (
        <div className="space-y-8">
            {/* Main Story Prompt */}
            <div className="mb-8">
                <label className="font-marker text-3xl text-black mb-4 block">
                    WHAT&apos;S THE STORY, HERO?*
                </label>
                <textarea
                    value={storyInput.storyPrompt}
                    onChange={(e) => updateStoryInput('storyPrompt', e.target.value)}
                    placeholder="Enter your prompt here... (e.g., A cyberpunk detective hunting a ghost in the machine)"
                    rows={6}
                    className="w-full bg-white border-4 border-black p-6 font-display text-xl text-black focus:ring-0 focus:outline-none shadow-[inset_4px_4px_0_0_#ccc] resize-none placeholder:text-gray-400"
                />
                <div className="flex justify-between mt-2 font-condensed font-bold text-gray-600 text-sm tracking-widest uppercase">
                    <span>{storyInput.storyPrompt.length} CHARS</span>
                    <span className="text-[#8a0000] italic">Required Field</span>
                </div>
            </div>

            {/* Quick Config Grid — 2 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <label className="flex items-center gap-2 font-condensed text-black font-bold uppercase">
                        <Search className="w-4 h-4 text-[#8a0000]" /> Plot Type
                    </label>
                    <select
                        value={parameters.storyStructure.narrativeStyle}
                        onChange={(e) => updateParameter('storyStructure', 'narrativeStyle', e.target.value as NarrativeStyle)}
                        className="w-full bg-white border-4 border-black p-3 font-condensed font-bold uppercase text-black focus:ring-0 focus:outline-none"
                    >
                        {NARRATIVE_STYLES.map(s => (
                            <option key={s} value={s}>{formatLabel(s)}</option>
                        ))}
                    </select>

                    <label className="flex items-center gap-2 font-condensed text-black font-bold uppercase mt-6">
                        <Brain className="w-4 h-4 text-[#8a0000]" /> Conflict Type
                    </label>
                    <select
                        value={parameters.storyStructure.actStructure}
                        onChange={(e) => updateParameter('storyStructure', 'actStructure', e.target.value as ActStructure)}
                        className="w-full bg-white border-4 border-black p-3 font-condensed font-bold uppercase text-black focus:ring-0 focus:outline-none"
                    >
                        {ACT_STRUCTURES.map(s => (
                            <option key={s} value={s}>{formatLabel(s)}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-4">
                    <label className="flex items-center gap-2 font-condensed text-black font-bold uppercase">
                        <TrendingUp className="w-4 h-4 text-[#8a0000]" /> Story Arc
                    </label>
                    <select
                        value={parameters.storyStructure.resolutionStyle}
                        onChange={(e) => updateParameter('storyStructure', 'resolutionStyle', e.target.value as ResolutionStyle)}
                        className="w-full bg-white border-4 border-black p-3 font-condensed font-bold uppercase text-black focus:ring-0 focus:outline-none"
                    >
                        {RESOLUTION_STYLES.map(s => (
                            <option key={s} value={s}>{formatLabel(s)}</option>
                        ))}
                    </select>

                    <label className="flex items-center gap-2 font-condensed text-black font-bold uppercase mt-6">
                        <Zap className="w-4 h-4 text-[#8a0000]" /> Pacing
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {PACING_OPTIONS.map(p => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => updateParameter('storyStructure', 'pacing', p)}
                                className={`border-2 border-black px-3 py-2 font-condensed font-bold uppercase text-[10px] leading-tight text-center transition-colors whitespace-nowrap ${parameters.storyStructure.pacing === p
                                    ? 'bg-black text-white'
                                    : 'bg-white text-black hover:bg-black hover:text-white'
                                    }`}
                            >
                                {formatLabel(p)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
