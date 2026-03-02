'use client';

import { Settings, Palette, Map, Zap } from 'lucide-react';
import React from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import type { AdvancedParams, StoryMode } from '@/hooks/use-creation-wizard';

interface StepAdvancedParamsProps {
  mode: StoryMode | null;
  params: AdvancedParams;
  onChange: (partial: Partial<AdvancedParams>) => void;
  onParamAnalytics?: (param: string, value: unknown) => void;
}

export function StepAdvancedParams({
  mode,
  params,
  onChange,
  onParamAnalytics,
}: StepAdvancedParamsProps) {
  const isComic = mode === 'comic';

  const handleChange = (key: keyof AdvancedParams, value: unknown) => {
    onChange({ [key]: value });
    onParamAnalytics?.(key, value);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          Fine-tune Your Creation
        </h2>
        <p className="text-sm text-muted-foreground">
          All settings below are optional — defaults work great. Expand any
          section to customise.
        </p>
      </div>

      <Accordion type="multiple" className="w-full space-y-3">
        {/* ── Writing / Narrative ── */}
        <AccordionItem
          value="writing"
          className="border rounded-lg bg-card px-4"
        >
          <AccordionTrigger className="text-base font-medium">
            <span className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" />
              {isComic ? 'Art & Style' : 'Writing & Style'}
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 px-1">
            {isComic ? (
              <>
                {/* Art style */}
                <div className="space-y-2">
                  <Label>Art Style</Label>
                  <Select
                    value={params.artStyle}
                    onValueChange={(v) => handleChange('artStyle', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select art style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manga">Manga</SelectItem>
                      <SelectItem value="american">American Comics</SelectItem>
                      <SelectItem value="european">European BD</SelectItem>
                      <SelectItem value="webtoon">Webtoon</SelectItem>
                      <SelectItem value="pixel">Pixel Art</SelectItem>
                      <SelectItem value="watercolor">Watercolor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Panel layout */}
                <div className="space-y-2">
                  <Label>Panel Layout</Label>
                  <Select
                    value={params.panelLayout}
                    onValueChange={(v) => handleChange('panelLayout', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select layout" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2x2">2 x 2 Grid</SelectItem>
                      <SelectItem value="3x3">3 x 3 Grid</SelectItem>
                      <SelectItem value="strip">Comic Strip</SelectItem>
                      <SelectItem value="full-page">Full Page</SelectItem>
                      <SelectItem value="free-form">Free-form</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                {/* Narrative voice */}
                <div className="space-y-2">
                  <Label>Narrative Voice</Label>
                  <Select
                    value={params.narrativeVoice}
                    onValueChange={(v) => handleChange('narrativeVoice', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select voice" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="first-person">First Person</SelectItem>
                      <SelectItem value="third-person-limited">
                        Third Person Limited
                      </SelectItem>
                      <SelectItem value="third-person-omniscient">
                        Third Person Omniscient
                      </SelectItem>
                      <SelectItem value="second-person">
                        Second Person
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tone */}
                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select
                    value={params.tone}
                    onValueChange={(v) => handleChange('tone', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="lighthearted">Lighthearted</SelectItem>
                      <SelectItem value="serious">Serious</SelectItem>
                      <SelectItem value="humorous">Humorous</SelectItem>
                      <SelectItem value="suspenseful">Suspenseful</SelectItem>
                      <SelectItem value="whimsical">Whimsical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Writing style */}
                <div className="space-y-2">
                  <Label>Writing Style</Label>
                  <Select
                    value={params.writingStyle}
                    onValueChange={(v) => handleChange('writingStyle', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="descriptive">Descriptive</SelectItem>
                      <SelectItem value="minimalist">Minimalist</SelectItem>
                      <SelectItem value="poetic">Poetic</SelectItem>
                      <SelectItem value="journalistic">Journalistic</SelectItem>
                      <SelectItem value="conversational">
                        Conversational
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* ── Setting & World ── */}
        <AccordionItem
          value="setting"
          className="border rounded-lg bg-card px-4"
        >
          <AccordionTrigger className="text-base font-medium">
            <span className="flex items-center gap-2">
              <Map className="h-4 w-4 text-primary" />
              Setting & World
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 px-1">
            <div className="space-y-2">
              <Label>Time Period</Label>
              <Input
                placeholder="e.g. Medieval, 2150, Victorian era"
                value={params.timePeriod}
                onChange={(e) => handleChange('timePeriod', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Location Type</Label>
              <Input
                placeholder="e.g. Space station, enchanted forest, cyberpunk city"
                value={params.locationType}
                onChange={(e) => handleChange('locationType', e.target.value)}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ── Pacing & Structure ── */}
        <AccordionItem
          value="structure"
          className="border rounded-lg bg-card px-4"
        >
          <AccordionTrigger className="text-base font-medium">
            <span className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Pacing & Structure
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 px-1">
            <div className="space-y-2">
              <Label>Story Length</Label>
              <Select
                value={params.storyLength}
                onValueChange={(v) => handleChange('storyLength', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flash">Flash (~500 words)</SelectItem>
                  <SelectItem value="short">Short (~1 500 words)</SelectItem>
                  <SelectItem value="medium">Medium (~3 000 words)</SelectItem>
                  <SelectItem value="long">Long (~6 000 words)</SelectItem>
                  <SelectItem value="epic">Epic (~10 000+ words)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Pacing</Label>
              <Select
                value={params.pacing}
                onValueChange={(v) => handleChange('pacing', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slow">Slow Burn</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="fast">Fast-paced</SelectItem>
                  <SelectItem value="breakneck">Breakneck</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ending Type</Label>
              <Select
                value={params.endingType}
                onValueChange={(v) => handleChange('endingType', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ending style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="happy">Happy Ending</SelectItem>
                  <SelectItem value="tragic">Tragic</SelectItem>
                  <SelectItem value="open">Open-ended</SelectItem>
                  <SelectItem value="twist">Twist Ending</SelectItem>
                  <SelectItem value="bittersweet">Bittersweet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ── AI Technical ── */}
        <AccordionItem value="ai" className="border rounded-lg bg-card px-4">
          <AccordionTrigger className="text-base font-medium">
            <span className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              AI Model Settings
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 px-1">
            <div className="space-y-2">
              <Label>Model</Label>
              <Select
                value={params.modelSelection}
                onValueChange={(v) => handleChange('modelSelection', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default (Recommended)</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="precise">Precise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Temperature</Label>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {params.temperature.toFixed(2)}
                </span>
              </div>
              <Slider
                value={[params.temperature]}
                min={0}
                max={1}
                step={0.05}
                onValueChange={([v]) => handleChange('temperature', v)}
              />
              <p className="text-xs text-muted-foreground">
                Lower = more deterministic, Higher = more creative
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
