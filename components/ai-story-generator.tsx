'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  Wand2,
  Sparkles,
  MessageSquare,
  Save,
  Wallet,
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
import React, { useState, useEffect, useCallback, useRef } from 'react';

import { useWeb3 } from '@/components/providers/web3-provider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

// --- Constants & Options ---
const DRAFT_KEY = "groqtales_story_draft_v1";
const genres = ['Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Thriller', 'Horror', 'Adventure', 'Comedy', 'Drama', 'Historical', 'Western', 'Cyberpunk'];
const proseStyles = [
  { value: 'literary', label: 'Literary', desc: 'Rich, layered prose' },
  { value: 'simple', label: 'Simple', desc: 'Clear, accessible' },
  { value: 'cinematic', label: 'Cinematic', desc: 'Visual, scene-driven' },
  { value: 'poetic', label: 'Poetic', desc: 'Rhythm-focused, lyrical' },
  { value: 'minimalist', label: 'Minimalist', desc: 'Stripped-down, essential' },
];
const narrativeVoices = [{ value: 'intimate', label: 'Intimate' }, { value: 'omniscient', label: 'Omniscient' }, { value: 'detached', label: 'Detached' }, { value: 'conversational', label: 'Conversational' }, { value: 'dramatic', label: 'Dramatic' }];
const sentimentTones = [{ value: 'hopeful', label: 'Hopeful' }, { value: 'melancholic', label: 'Melancholic' }, { value: 'neutral', label: 'Neutral' }, { value: 'dark', label: 'Dark' }, { value: 'whimsical', label: 'Whimsical' }];
const plotStructures = [{ value: 'three-act', label: 'Three Act' }, { value: 'heros-journey', label: "Hero's Journey" }, { value: 'in-medias-res', label: 'In Medias Res' }, { value: 'nonlinear', label: 'Non-linear' }];
const conflictTypes = [{ value: 'person-vs-person', label: 'Person vs Person' }, { value: 'person-vs-nature', label: 'Person vs Nature' }, { value: 'person-vs-self', label: 'Person vs Self' }];
const endingTypes = [{ value: 'resolved', label: 'Resolved' }, { value: 'open', label: 'Open-ended' }, { value: 'twist', label: 'Twist' }, { value: 'bittersweet', label: 'Bittersweet' }];
const protagonistArchetypes = [{ value: 'hero', label: 'Hero' }, { value: 'antihero', label: 'Antihero' }, { value: 'rebel', label: 'Rebel' }];
const settingTypes = [{ value: 'urban', label: 'Urban' }, { value: 'rural', label: 'Rural' }, { value: 'fantasy-world', label: 'Fantasy World' }, { value: 'space', label: 'Space' }];
const atmospheres = [{ value: 'mysterious', label: 'Mysterious' }, { value: 'foreboding', label: 'Foreboding' }, { value: 'serene', label: 'Serene' }];
const pointsOfView = [{ value: 'first', label: 'First Person' }, { value: 'third-limited', label: 'Third Person Limited' }, { value: 'third-omniscient', label: 'Third Person Omniscient' }];
const readingLevels = [{ value: 'young-adult', label: 'Young Adult' }, { value: 'general', label: 'General' }, { value: 'literary', label: 'Literary' }];

// --- Helper Components ---
function CollapsibleSection({ title, icon: Icon, children, defaultOpen = false }: { title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-border/50 rounded-lg overflow-hidden mb-2">
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2 text-sm font-medium"><Icon className="h-4 w-4 text-muted-foreground" />{title}</div>
        {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {isOpen && <div className="p-4 pt-0 space-y-4 border-t border-border/30">{children}</div>}
    </div>
  );
}

function ParamSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: any[] }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 text-sm"><SelectValue placeholder={`Select ${label}`} /></SelectTrigger>
        <SelectContent>{options.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent>
      </Select>
    </div>
  );
}

function ParamSlider({ label, value, onChange, min = 1, max = 5, labels }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; labels?: Record<number, string> }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        <span className="text-xs text-muted-foreground">{labels?.[value] || value}</span>
      </div>
      <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={min} max={max} step={1} className="w-full" />
    </div>
  );
}

export default function AIStoryGenerator({ className = '' }: { className?: string }) {
  const { connected, connectWallet } = useWeb3();
  const { toast } = useToast();

  // State
  const [prompt, setPrompt] = useState('');
  const [storyTitle, setStoryTitle] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [mainCharacterName, setMainCharacterName] = useState('');
  const [storyLength, setStoryLength] = useState('medium');

  // Pipeline State
  const [proseStyle, setProseStyle] = useState('cinematic');
  const [narrativeVoice, setNarrativeVoice] = useState('');
  const [sentimentTone, setSentimentTone] = useState('');
  const [darknessLevel, setDarknessLevel] = useState(3);
  const [humorLevel, setHumorLevel] = useState(3);
  const [dialogueLevel, setDialogueLevel] = useState(3);
  const [plotComplexity, setPlotComplexity] = useState(3);
  const [pacingSpeed, setPacingSpeed] = useState(3);
  const [plotStructureType, setPlotStructureType] = useState('');
  const [conflictType, setConflictType] = useState('');
  const [endingType, setEndingType] = useState('');
  const [hookStrength, setHookStrength] = useState(3);
  const [protagonistArchetype, setProtagonistArchetype] = useState('');
  const [characterDepth, setCharacterDepth] = useState(3);
  const [settingType, setSettingType] = useState('');
  const [atmosphere, setAtmosphere] = useState('');
  const [modelTemperature, setModelTemperature] = useState(0.8);
  const [targetWordCount, setTargetWordCount] = useState(2000);
  const [pointOfView, setPointOfView] = useState('');
  const [readingLevel, setReadingLevel] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('input');
  const [copied, setCopied] = useState(false);

  // Autosave Logic
  useEffect(() => {
    if (!prompt.trim()) return;
    const timeout = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ prompt, storyTitle, selectedGenres }));
    }, 2000);
    return () => clearTimeout(timeout);
  }, [prompt, storyTitle, selectedGenres]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setActiveTab('preview');

    try {
      const pipelineParams = {
        proseStyle, darknessLevel, humorLevel, dialogueLevel,
        plotComplexity, pacingSpeed, hookStrength, characterDepth,
        modelTemperature, targetWordCount, narrativeVoice, sentimentTone,
        plotStructureType, conflictType, endingType, protagonistArchetype,
        settingType, atmosphere, pointOfView, readingLevel
      };

      const response = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          prompt: prompt.trim(),
          title: storyTitle,
          genre: selectedGenres.join(', '),
          length: storyLength,
          pipelineParams,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Generation failed');
      
      setGeneratedStory(data.result || data.story || '');
      toast({ title: 'STORY GENERATED!', className: 'font-bangers bg-green-400 border-4 border-black' });
    } catch (error: any) {
      toast({ title: 'ERROR', description: error.message, variant: 'destructive' });
      setActiveTab('input');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setPrompt('');
    setGeneratedStory(null);
    setActiveTab('input');
  };

  return (
    <div className={`w-full max-w-5xl mx-auto p-4 ${className}`}>
      <Card className="border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-white dark:bg-gray-900 overflow-hidden rounded-3xl">
        <CardHeader className="bg-yellow-400 border-b-4 border-black p-6">
          <CardTitle className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-full border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Wand2 className="h-8 w-8 text-black" />
            </div>
            <div>
              <span className="font-bangers text-4xl text-black">STORY MAKER 3000</span>
              <Badge variant="secondary" className="ml-3 border-2 border-black font-bold bg-white text-black">VEDASCRIPT: 71 PIPELINES</Badge>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-black p-2 flex justify-center gap-4 border-b-4 border-black h-auto rounded-none">
              <TabsTrigger value="input" className="font-bangers text-xl text-white data-[state=active]:bg-white data-[state=active]:text-black">1. INPUT</TabsTrigger>
              <TabsTrigger value="preview" disabled={!generatedStory && !isGenerating} className="font-bangers text-xl text-white data-[state=active]:bg-white data-[state=active]:text-black">2. PREVIEW</TabsTrigger>
              <TabsTrigger value="mint" disabled={!generatedStory} className="font-bangers text-xl text-white data-[state=active]:bg-white data-[state=active]:text-black">3. MINT NFT</TabsTrigger>
            </TabsList>

            <div className="p-6 md:p-10">
              <TabsContent value="input" className="space-y-8 mt-0">
                <div className="space-y-4">
                  <Label className="font-bangers text-2xl flex items-center gap-2"><MessageSquare /> WHAT'S THE STORY, HERO?</Label>
                  <Textarea 
                    placeholder="Enter your prompt here..." 
                    className="border-4 border-black rounded-xl p-6 text-lg min-h-[150px]" 
                    value={prompt} 
                    onChange={(e) => setPrompt(e.target.value)} 
                  />
                </div>

                <div className="space-y-3">
                  <Label className="font-bangers text-2xl uppercase">Genres</Label>
                  <div className="flex flex-wrap gap-2">
                    {genres.map((genre) => (
                      <Badge
                        key={genre}
                        variant={selectedGenres.includes(genre) ? 'default' : 'outline'}
                        className={`cursor-pointer border-2 border-black px-4 py-2 font-bold ${selectedGenres.includes(genre) ? 'bg-black text-white' : 'bg-white text-black'}`}
                        onClick={() => setSelectedGenres(prev => prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre])}
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Accordion type="single" collapsible className="border-4 border-black rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
                  <AccordionItem value="advanced" className="border-none">
                    <AccordionTrigger className="px-6 bg-gray-50 font-bangers text-xl hover:bg-yellow-400 transition-colors">
                      <div className="flex items-center gap-2 uppercase tracking-tight"><Settings2 className="h-5 w-5" /> Vedascript Parameters</div>
                    </AccordionTrigger>
                    <AccordionContent className="p-6 space-y-4">
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <Label className="font-bold text-xs uppercase">Story Title</Label>
                          <Input value={storyTitle} onChange={(e) => setStoryTitle(e.target.value)} className="border-2 border-black" />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-bold text-xs uppercase">Main Character</Label>
                          <Input value={mainCharacterName} onChange={(e) => setMainCharacterName(e.target.value)} className="border-2 border-black" />
                        </div>
                      </div>

                      <CollapsibleSection title="Style & Voice" icon={Palette}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <ParamSelect label="Prose Style" value={proseStyle} onChange={setProseStyle} options={proseStyles} />
                          <ParamSelect label="Narrative Voice" value={narrativeVoice} onChange={setNarrativeVoice} options={narrativeVoices} />
                          <ParamSlider label="Darkness" value={darknessLevel} onChange={setDarknessLevel} labels={{ 1: 'Light', 3: 'Moderate', 5: 'Dark' }} />
                          <ParamSlider label="Humor" value={humorLevel} onChange={setHumorLevel} labels={{ 1: 'None', 5: 'Comedy' }} />
                        </div>
                      </CollapsibleSection>

                      <CollapsibleSection title="Plot & World" icon={Layers}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <ParamSlider label="Plot Complexity" value={plotComplexity} onChange={setPlotComplexity} />
                          <ParamSelect label="Structure" value={plotStructureType} onChange={setPlotStructureType} options={plotStructures} />
                          <ParamSelect label="Setting" value={settingType} onChange={setSettingType} options={settingTypes} />
                        </div>
                      </CollapsibleSection>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating || !prompt.trim()} 
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bangers text-4xl py-10 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-none mt-4"
                >
                  {isGenerating ? <Loader2 className="animate-spin mr-3 h-8 w-8" /> : <Sparkles className="mr-3 h-8 w-8" />}
                  {isGenerating ? 'WRITING...' : 'GENERATE STORY!'}
                </Button>
              </TabsContent>

              <TabsContent value="preview" className="mt-0">
                <div className="space-y-6">
                  <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl prose max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-lg text-black">{generatedStory}</pre>
                  </div>
                  <div className="flex gap-4">
                    <Button onClick={() => { navigator.clipboard.writeText(generatedStory || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); }} variant="outline" className="flex-1 border-4 border-black font-bangers text-xl py-6">
                      {copied ? <Check className="mr-2" /> : <Copy className="mr-2" />} {copied ? 'COPIED!' : 'COPY STORY'}
                    </Button>
                    <Button onClick={resetForm} variant="outline" className="flex-1 border-4 border-black font-bangers text-xl py-6">
                      <RotateCcw className="mr-2" /> START OVER
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="mint" className="text-center py-10">
                <Wallet className="h-20 w-20 mx-auto mb-6" />
                <h3 className="font-bangers text-4xl mb-6">MINT AS NFT?</h3>
                {!connected ? (
                  <Button onClick={connectWallet} className="bg-black text-white font-bangers text-xl px-10 py-4 border-4 border-black">CONNECT WALLET</Button>
                ) : (
                  <Button className="bg-purple-500 text-white font-bangers text-2xl px-10 py-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">MINT MASTERPIECE</Button>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}