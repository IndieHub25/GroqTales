'use client';

import { motion } from 'framer-motion';
import {
  Loader2,
  Wand2,
  BookOpen,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Settings2,
  Palette,
  Users,
  Globe,
  Layers,
} from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface AIStoryGeneratorProps {
  className?: string;
}

// ---------------------------------------------------------------------------
// Pipeline parameter options (matching the pipeline files)
// ---------------------------------------------------------------------------

const genres = [
  'Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Thriller', 'Horror',
  'Adventure', 'Comedy', 'Drama', 'Historical', 'Western', 'Cyberpunk',
];

const proseStyles = [
  { value: 'literary', label: 'Literary', desc: 'Rich, layered prose' },
  { value: 'simple', label: 'Simple', desc: 'Clear, accessible' },
  { value: 'cinematic', label: 'Cinematic', desc: 'Visual, scene-driven' },
  { value: 'poetic', label: 'Poetic', desc: 'Rhythm-focused, lyrical' },
  { value: 'minimalist', label: 'Minimalist', desc: 'Stripped-down, essential' },
];

const narrativeVoices = [
  { value: 'intimate', label: 'Intimate' },
  { value: 'omniscient', label: 'Omniscient' },
  { value: 'detached', label: 'Detached' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'dramatic', label: 'Dramatic' },
];

const sentimentTones = [
  { value: 'hopeful', label: 'Hopeful' },
  { value: 'melancholic', label: 'Melancholic' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'dark', label: 'Dark' },
  { value: 'whimsical', label: 'Whimsical' },
];

const plotStructures = [
  { value: 'three-act', label: 'Three Act' },
  { value: 'heros-journey', label: "Hero's Journey" },
  { value: 'in-medias-res', label: 'In Medias Res' },
  { value: 'nonlinear', label: 'Non-linear' },
  { value: 'circular', label: 'Circular' },
  { value: 'episodic', label: 'Episodic' },
];

const conflictTypes = [
  { value: 'person-vs-person', label: 'Person vs Person' },
  { value: 'person-vs-nature', label: 'Person vs Nature' },
  { value: 'person-vs-self', label: 'Person vs Self' },
  { value: 'person-vs-society', label: 'Person vs Society' },
  { value: 'person-vs-technology', label: 'Person vs Technology' },
  { value: 'person-vs-fate', label: 'Person vs Fate' },
];

const endingTypes = [
  { value: 'resolved', label: 'Resolved' },
  { value: 'open', label: 'Open-ended' },
  { value: 'twist', label: 'Twist ending' },
  { value: 'bittersweet', label: 'Bittersweet' },
  { value: 'cliffhanger', label: 'Cliffhanger' },
  { value: 'tragic', label: 'Tragic' },
];

const protagonistArchetypes = [
  { value: 'hero', label: 'Hero' },
  { value: 'antihero', label: 'Antihero' },
  { value: 'reluctant', label: 'Reluctant Hero' },
  { value: 'trickster', label: 'Trickster' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'rebel', label: 'Rebel' },
  { value: 'innocent', label: 'Innocent' },
  { value: 'explorer', label: 'Explorer' },
];

const settingTypes = [
  { value: 'urban', label: 'Urban' },
  { value: 'rural', label: 'Rural' },
  { value: 'fantasy-world', label: 'Fantasy World' },
  { value: 'space', label: 'Space' },
  { value: 'underwater', label: 'Underwater' },
  { value: 'post-apocalyptic', label: 'Post-Apocalyptic' },
  { value: 'historical', label: 'Historical' },
];

const atmospheres = [
  { value: 'mysterious', label: 'Mysterious' },
  { value: 'foreboding', label: 'Foreboding' },
  { value: 'serene', label: 'Serene' },
  { value: 'chaotic', label: 'Chaotic' },
  { value: 'whimsical', label: 'Whimsical' },
  { value: 'oppressive', label: 'Oppressive' },
  { value: 'nostalgic', label: 'Nostalgic' },
];

const pointsOfView = [
  { value: 'first', label: 'First Person' },
  { value: 'third-limited', label: 'Third Person Limited' },
  { value: 'third-omniscient', label: 'Third Person Omniscient' },
  { value: 'second', label: 'Second Person' },
];

const readingLevels = [
  { value: 'young-adult', label: 'Young Adult' },
  { value: 'general', label: 'General' },
  { value: 'literary', label: 'Literary' },
  { value: 'academic', label: 'Academic' },
];

// ---------------------------------------------------------------------------
// Collapsible Section Component
// ---------------------------------------------------------------------------

function CollapsibleSection({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {title}
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 pt-0 space-y-4 border-t border-border/30">
          {children}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Select Field Component
// ---------------------------------------------------------------------------
function ParamSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; desc?: string }[];
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 text-sm">
          <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
              {opt.desc && (
                <span className="text-muted-foreground ml-1 text-xs">— {opt.desc}</span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Slider Field Component
// ---------------------------------------------------------------------------
function ParamSlider({
  label,
  value,
  onChange,
  min = 1,
  max = 5,
  step = 1,
  labels,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  labels?: Record<number, string>;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        <span className="text-xs text-muted-foreground">
          {labels?.[value] || value}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading State Component
// ---------------------------------------------------------------------------

function LoadingStateIndicator({ message }: { message: string | null }) {
  const messages = [
    'Running pipelines',
    'Building characters',
    'Crafting plot structure',
    'Designing world',
    'Generating story',
    'Polishing prose',
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center space-x-3">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="text-lg font-medium">
        {message || messages[currentIndex]}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function AIStoryGenerator({
  className = '',
}: AIStoryGeneratorProps) {
  // Essential params
  const [prompt, setPrompt] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [mainCharacters, setMainCharacters] = useState('');
  const [setting, setSetting] = useState('');
  const [themes, setThemes] = useState('');

  // Pipeline params — Style
  const [proseStyle, setProseStyle] = useState('cinematic');
  const [narrativeVoice, setNarrativeVoice] = useState('');
  const [sentimentTone, setSentimentTone] = useState('');
  const [darknessLevel, setDarknessLevel] = useState(3);
  const [humorLevel, setHumorLevel] = useState(3);
  const [dialogueLevel, setDialogueLevel] = useState(3);

  // Pipeline params — Plot
  const [plotComplexity, setPlotComplexity] = useState(3);
  const [pacingSpeed, setPacingSpeed] = useState(3);
  const [plotStructureType, setPlotStructureType] = useState('');
  const [conflictType, setConflictType] = useState('');
  const [endingType, setEndingType] = useState('');
  const [hookStrength, setHookStrength] = useState(3);
  const [twistCount, setTwistCount] = useState(1);

  // Pipeline params — Character
  const [protagonistArchetype, setProtagonistArchetype] = useState('');
  const [characterDepth, setCharacterDepth] = useState(3);
  const [characterGrowth, setCharacterGrowth] = useState(3);
  const [characterCount, setCharacterCount] = useState(3);
  const [antagonistPresence, setAntagonistPresence] = useState(true);

  // Pipeline params — World
  const [settingType, setSettingType] = useState('');
  const [atmosphere, setAtmosphere] = useState('');
  const [technologyLevel, setTechnologyLevel] = useState(3);
  const [worldMagicSystem, setWorldMagicSystem] = useState('');
  const [worldHistoryDepth, setWorldHistoryDepth] = useState(3);

  // Pipeline params — Advanced
  const [modelTemperature, setModelTemperature] = useState(0.8);
  const [creativityLevel, setCreativityLevel] = useState(3);
  const [targetWordCount, setTargetWordCount] = useState(2000);
  const [pointOfView, setPointOfView] = useState('');
  const [readingLevel, setReadingLevel] = useState('');

  // UI state
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('input');
  const [copied, setCopied] = useState(false);

  const { toast } = useToast();

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const generateStory = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Missing Prompt',
        description: 'Please enter a story prompt to generate content.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Build pipeline params object from all the form state
      const pipelineParams: Record<string, unknown> = {
        // Style
        proseStyle,
        darknessLevel,
        humorLevel,
        dialogueLevel,
        // Plot
        plotComplexity,
        pacingSpeed,
        hookStrength,
        twistCount,
        // Character
        characterDepth,
        characterGrowth,
        characterCount,
        antagonistPresence,
        // World
        technologyLevel,
        worldHistoryDepth,
        // Advanced
        modelTemperature,
        creativityLevel,
        targetWordCount,
      };

      // Add optional string params only if set
      if (narrativeVoice) pipelineParams.narrativeVoice = narrativeVoice;
      if (sentimentTone) pipelineParams.sentimentTone = sentimentTone;
      if (plotStructureType) pipelineParams.plotStructureType = plotStructureType;
      if (conflictType) pipelineParams.conflictType = conflictType;
      if (endingType) pipelineParams.endingType = endingType;
      if (protagonistArchetype) pipelineParams.protagonistArchetype = protagonistArchetype;
      if (settingType) pipelineParams.settingType = settingType;
      if (atmosphere) pipelineParams.atmosphere = atmosphere;
      if (worldMagicSystem) pipelineParams.worldMagicSystem = worldMagicSystem;
      if (pointOfView) pipelineParams.pointOfView = pointOfView;
      if (readingLevel) pipelineParams.readingLevel = readingLevel;

      let storyContent = '';
      let usedModel = 'Groq AI';
      let usedEngine = 'vedascript';

      // --- Try backend first (with 10s timeout) ---
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const backendController = new AbortController();
        const backendTimeout = setTimeout(() => backendController.abort(), 10000);

        const response = await fetch(`${apiUrl}/api/groq`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generate',
            prompt: prompt.trim(),
            title: title || undefined,
            genre: selectedGenres.join(', ') || undefined,
            setting: setting || undefined,
            characters: mainCharacters || undefined,
            themes: themes || undefined,
            pipelineParams,
          }),
          signal: backendController.signal,
        });

        clearTimeout(backendTimeout);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Backend error (${response.status})`);
        }

        const data = await response.json();
        storyContent = data.result || data.story || data.content || '';
        usedModel = data.model || 'Groq AI';
        usedEngine = data.engine || 'vedascript';
      } catch (backendErr) {
        // --- Fallback: Call Groq API directly from browser ---
        console.warn('[VedaScript] Backend failed, using client-side Groq fallback:', backendErr);

        const groqKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
        if (!groqKey) {
          throw new Error('Backend unavailable and no client-side API key configured');
        }

        // Build a rich prompt incorporating pipeline params
        const styleParts = [];
        styleParts.push(`Write in ${proseStyle} prose style.`);
        if (narrativeVoice) styleParts.push(`Use a ${narrativeVoice} narrative voice.`);
        if (sentimentTone) styleParts.push(`The tone should be ${sentimentTone}.`);
        if (pointOfView) styleParts.push(`Use ${pointOfView} point of view.`);
        if (protagonistArchetype) styleParts.push(`The protagonist is a ${protagonistArchetype} archetype.`);
        if (plotStructureType) styleParts.push(`Follow a ${plotStructureType} plot structure.`);
        if (conflictType) styleParts.push(`Central conflict: ${conflictType}.`);
        if (endingType) styleParts.push(`The ending should be ${endingType}.`);
        if (settingType) styleParts.push(`Setting type: ${settingType}.`);
        if (atmosphere) styleParts.push(`Atmosphere: ${atmosphere}.`);
        styleParts.push(`Plot complexity: ${plotComplexity}/5, Pacing: ${pacingSpeed}/5.`);
        styleParts.push(`Character depth: ${characterDepth}/5, Growth: ${characterGrowth}/5.`);
        styleParts.push(`Target approximately ${targetWordCount} words.`);

        const systemPrompt = [
          "You are the VedaScript Engine — Comicraft's flagship AI storytelling engine.",
          'You write immersive, publication-quality fiction.',
          'Follow every instruction precisely. Write only the story — no preamble, no commentary.',
          'Start immediately with the narrative.',
          '',
          ...styleParts,
        ].join('\n');

        const userParts = [];
        if (title) userParts.push(`Title: "${title}"`);
        userParts.push(prompt.trim());
        if (selectedGenres.length) userParts.push(`Genre: ${selectedGenres.join(', ')}`);
        if (setting) userParts.push(`Setting: ${setting}`);
        if (mainCharacters) userParts.push(`Characters: ${mainCharacters}`);
        if (themes) userParts.push(`Themes: ${themes}`);

        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userParts.join('\n') },
            ],
            max_tokens: Math.min(Math.ceil(targetWordCount * 1.5), 8000),
            temperature: modelTemperature,
            top_p: 0.9,
          }),
        });

        if (!groqResponse.ok) {
          const errText = await groqResponse.text();
          throw new Error(`Groq API error ${groqResponse.status}: ${errText}`);
        }

        const groqData = await groqResponse.json();
        storyContent = groqData.choices?.[0]?.message?.content || '';
        usedModel = groqData.model || 'llama-3.3-70b-versatile';
        usedEngine = 'vedascript-client';
      }

      if (!storyContent) {
        throw new Error('No story content received');
      }

      setGeneratedContent(storyContent);
      setActiveTab('preview');
      toast({
        title: 'Story Generated!',
        description: `VedaScript Engine — ${usedModel}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: 'Generation Failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: 'Copied!', description: 'Story copied to clipboard.' });
    } catch {
      toast({ title: 'Copy failed', variant: 'destructive' });
    }
  }, [generatedContent, toast]);

  const resetForm = () => {
    setPrompt('');
    setTitle('');
    setMainCharacters('');
    setSetting('');
    setThemes('');
    setSelectedGenres([]);
    setGeneratedContent('');
    setActiveTab('input');
  };

  return (
    <div className={`w-full max-w-6xl mx-auto p-6 space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wand2 className="h-6 w-6 text-primary" />
            <span>VedaScript Engine</span>
            <Badge variant="secondary" className="ml-2 text-xs">71 Pipelines</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Deep narrative control with tunable parameters across character, plot, style, world, and more.
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="input">Story Input</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="input" className="space-y-6 mt-4">
              {/* === Essential Params === */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Story Prompt *
                  </label>
                  <Textarea
                    placeholder="Describe your story idea, theme, or concept..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Title (Optional)
                    </label>
                    <Input
                      placeholder="Story title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Setting
                    </label>
                    <Input
                      placeholder="Where does your story take place?"
                      value={setting}
                      onChange={(e) => setSetting(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Main Characters
                  </label>
                  <Input
                    placeholder="Describe your main characters..."
                    value={mainCharacters}
                    onChange={(e) => setMainCharacters(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Themes
                  </label>
                  <Input
                    placeholder="Love, adventure, mystery, redemption..."
                    value={themes}
                    onChange={(e) => setThemes(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Genres
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {genres.map((genre) => (
                      <Badge
                        key={genre}
                        variant={selectedGenres.includes(genre) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => handleGenreToggle(genre)}
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* === Pipeline Parameter Sections === */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Settings2 className="h-4 w-4" />
                  Pipeline Parameters
                </h3>

                {/* Style Section */}
                <CollapsibleSection title="Style & Voice" icon={Palette}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <ParamSelect
                      label="Prose Style"
                      value={proseStyle}
                      onChange={setProseStyle}
                      options={proseStyles}
                    />
                    <ParamSelect
                      label="Narrative Voice"
                      value={narrativeVoice}
                      onChange={setNarrativeVoice}
                      options={narrativeVoices}
                    />
                    <ParamSelect
                      label="Sentiment Tone"
                      value={sentimentTone}
                      onChange={setSentimentTone}
                      options={sentimentTones}
                    />
                    <ParamSlider
                      label="Darkness Level"
                      value={darknessLevel}
                      onChange={setDarknessLevel}
                      labels={{ 1: 'Light', 2: 'Mild', 3: 'Moderate', 4: 'Dark', 5: 'Very Dark' }}
                    />
                    <ParamSlider
                      label="Humor Level"
                      value={humorLevel}
                      onChange={setHumorLevel}
                      labels={{ 1: 'None', 2: 'Subtle', 3: 'Moderate', 4: 'Frequent', 5: 'Comedy' }}
                    />
                    <ParamSlider
                      label="Dialogue Level"
                      value={dialogueLevel}
                      onChange={setDialogueLevel}
                      labels={{ 1: 'Minimal', 2: 'Light', 3: 'Balanced', 4: 'Heavy', 5: 'Dialogue-driven' }}
                    />
                  </div>
                </CollapsibleSection>

                {/* Plot Section */}
                <CollapsibleSection title="Plot Structure" icon={Layers}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <ParamSlider
                      label="Plot Complexity"
                      value={plotComplexity}
                      onChange={setPlotComplexity}
                      labels={{ 1: 'Simple', 2: 'Dual', 3: 'Layered', 4: 'Intricate', 5: 'Epic' }}
                    />
                    <ParamSlider
                      label="Pacing Speed"
                      value={pacingSpeed}
                      onChange={setPacingSpeed}
                      labels={{ 1: 'Slow burn', 2: 'Deliberate', 3: 'Moderate', 4: 'Fast', 5: 'Breakneck' }}
                    />
                    <ParamSelect
                      label="Structure Type"
                      value={plotStructureType}
                      onChange={setPlotStructureType}
                      options={plotStructures}
                    />
                    <ParamSelect
                      label="Conflict Type"
                      value={conflictType}
                      onChange={setConflictType}
                      options={conflictTypes}
                    />
                    <ParamSelect
                      label="Ending Type"
                      value={endingType}
                      onChange={setEndingType}
                      options={endingTypes}
                    />
                    <ParamSlider
                      label="Hook Strength"
                      value={hookStrength}
                      onChange={setHookStrength}
                      labels={{ 1: 'Gentle', 2: 'Mild', 3: 'Strong', 4: 'Gripping', 5: 'Explosive' }}
                    />
                    <ParamSlider
                      label="Plot Twists"
                      value={twistCount}
                      onChange={setTwistCount}
                      min={0}
                      max={5}
                      labels={{ 0: 'None', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' }}
                    />
                  </div>
                </CollapsibleSection>

                {/* Character Section */}
                <CollapsibleSection title="Characters" icon={Users}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <ParamSelect
                      label="Protagonist Archetype"
                      value={protagonistArchetype}
                      onChange={setProtagonistArchetype}
                      options={protagonistArchetypes}
                    />
                    <ParamSlider
                      label="Character Depth"
                      value={characterDepth}
                      onChange={setCharacterDepth}
                      labels={{ 1: 'Flat', 2: 'Shallow', 3: 'Moderate', 4: 'Deep', 5: 'Profound' }}
                    />
                    <ParamSlider
                      label="Character Growth"
                      value={characterGrowth}
                      onChange={setCharacterGrowth}
                      labels={{ 1: 'Static', 2: 'Slight', 3: 'Moderate', 4: 'Significant', 5: 'Transformative' }}
                    />
                    <ParamSlider
                      label="Character Count"
                      value={characterCount}
                      onChange={setCharacterCount}
                      min={1}
                      max={8}
                    />
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Antagonist</label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant={antagonistPresence ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setAntagonistPresence(true)}
                        >
                          Present
                        </Button>
                        <Button
                          type="button"
                          variant={!antagonistPresence ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setAntagonistPresence(false)}
                        >
                          Absent
                        </Button>
                      </div>
                    </div>
                  </div>
                </CollapsibleSection>

                {/* World Section */}
                <CollapsibleSection title="Worldbuilding" icon={Globe}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <ParamSelect
                      label="Setting Type"
                      value={settingType}
                      onChange={setSettingType}
                      options={settingTypes}
                    />
                    <ParamSelect
                      label="Atmosphere"
                      value={atmosphere}
                      onChange={setAtmosphere}
                      options={atmospheres}
                    />
                    <ParamSlider
                      label="Technology Level"
                      value={technologyLevel}
                      onChange={setTechnologyLevel}
                      labels={{ 1: 'Primitive', 2: 'Medieval', 3: 'Industrial', 4: 'Modern', 5: 'Futuristic' }}
                    />
                    <ParamSlider
                      label="World History Depth"
                      value={worldHistoryDepth}
                      onChange={setWorldHistoryDepth}
                      labels={{ 1: 'None', 2: 'Hints', 3: 'Moderate', 4: 'Rich', 5: 'Epic' }}
                    />
                  </div>
                </CollapsibleSection>

                {/* Advanced Section */}
                <CollapsibleSection title="Advanced / AI Tuning" icon={Settings2}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <ParamSelect
                      label="Point of View"
                      value={pointOfView}
                      onChange={setPointOfView}
                      options={pointsOfView}
                    />
                    <ParamSelect
                      label="Reading Level"
                      value={readingLevel}
                      onChange={setReadingLevel}
                      options={readingLevels}
                    />
                    <ParamSlider
                      label="Creativity Level"
                      value={creativityLevel}
                      onChange={setCreativityLevel}
                      labels={{ 1: 'Conservative', 2: 'Moderate', 3: 'Balanced', 4: 'Creative', 5: 'Experimental' }}
                    />
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-muted-foreground">AI Temperature</label>
                        <span className="text-xs text-muted-foreground">{modelTemperature.toFixed(1)}</span>
                      </div>
                      <Slider
                        value={[modelTemperature * 10]}
                        onValueChange={([v]) => setModelTemperature(v / 10)}
                        min={1}
                        max={20}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Precise</span>
                        <span>Balanced</span>
                        <span>Creative</span>
                        <span>Wild</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-muted-foreground">Target Word Count</label>
                        <span className="text-xs text-muted-foreground">{targetWordCount.toLocaleString()}</span>
                      </div>
                      <Slider
                        value={[targetWordCount]}
                        onValueChange={([v]) => setTargetWordCount(v)}
                        min={500}
                        max={6000}
                        step={250}
                        className="w-full"
                      />
                    </div>
                  </div>
                </CollapsibleSection>
              </div>

              {/* === Generate Button === */}
              <Button
                onClick={generateStory}
                disabled={isGenerating || !prompt.trim()}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <LoadingStateIndicator message={null} />
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Story
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              {generatedContent ? (
                <div className="space-y-4">
                  <div className="prose prose-sm max-w-none bg-muted/50 p-6 rounded-lg max-h-[600px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {generatedContent}
                    </pre>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleCopy} variant="outline" className="flex-1">
                      {copied ? (
                        <><Check className="mr-2 h-4 w-4" /> Copied</>
                      ) : (
                        <><Copy className="mr-2 h-4 w-4" /> Copy Story</>
                      )}
                    </Button>
                    <Button onClick={resetForm} variant="outline">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Create New Story
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No story generated yet. Go to Story Input to create one.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
