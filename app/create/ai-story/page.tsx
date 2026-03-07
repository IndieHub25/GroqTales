'use client';

import { motion } from 'framer-motion';
import {
  Sparkles,
  BookText,
  Zap,
  Send,
  RotateCcw,
  Copy,
  Check,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React, { useState, useEffect, Suspense } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

import { ParameterPanel } from '@/components/parameter-panel';
import { StoryCanvas } from '@/components/story-canvas';
import { GuidedTour, AI_STORY_TOUR_STEPS } from '@/components/guided-tour';
import { useStoryCanvas } from '@/hooks/useStoryCanvas';
import * as canvasUtils from '@/lib/canvas-utils';

interface StoryPrompt {
  title: string;
  mainCharacters: string;
  plotOutline: string;
  setting: string;
  themes: string;
}

export default function AIStoryGeneratorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900">
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <Sparkles className="w-12 h-12 text-emerald-500" />
          </motion.div>
        </div>
      }
    >
      <AIStoryContent />
    </Suspense>
  );
}

function AIStoryContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const { canvasState, setCanvasState } = useStoryCanvas({
    storageKey: 'aiStoryCanvasState',
    autoSave: true,
  });

  // Story creation state
  const [storyPrompt, setStoryPrompt] = useState<StoryPrompt>({
    title: '',
    mainCharacters: '',
    plotOutline: '',
    setting: '',
    themes: '',
  });

  const [selectedParameters, setSelectedParameters] = useState<Set<string>>(new Set());
  const [parameterValues, setParameterValues] = useState<Record<string, any>>({});
  const [generatedStory, setGeneratedStory] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const genre = searchParams.get('genre') || 'fantasy';

  // Load draft on mount
  useEffect(() => {
    try {
      const draft = localStorage.getItem('aiStoryDraft');
      if (draft) {
        const parsed = JSON.parse(draft);
        setStoryPrompt(parsed.prompt);
        setSelectedParameters(new Set(parsed.selectedParameters || []));
        setParameterValues(parsed.parameterValues || {});
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
  }, []);

  // Update canvas when parameters change
  useEffect(() => {
    const actCount = selectedParameters.has('acts') ? 3 : 1;

    if (canvasState.nodes.length === 0 && selectedParameters.size > 0) {
      let newState = canvasUtils.createEmptyCanvasState();

      // Add act nodes
      for (let i = 1; i <= actCount; i++) {
        const actNode = canvasUtils.createNode(
          `act-${i}`,
          'act',
          `Act ${i}`
        );
        actNode.x = (i - 1) * 200;
        newState = canvasUtils.addNode(newState, actNode);
      }

      setCanvasState(newState);
    }
  }, [selectedParameters.size]);

  // Handle parameter changes
  const handleParameterChange = (parameterId: string, value: any) => {
    setParameterValues({
      ...parameterValues,
      [parameterId]: value,
    });
  };

  const handleParameterToggle = (parameterId: string, enabled: boolean) => {
    const newParams = new Set(selectedParameters);
    if (enabled) {
      newParams.add(parameterId);
    } else {
      newParams.delete(parameterId);
    }
    setSelectedParameters(newParams);
  };

  // Generate story with AI
  const handleGenerateStory = async () => {
    if (!storyPrompt.title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a story title',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const mockStory = `# ${storyPrompt.title}

## Setting
${storyPrompt.setting || 'A mysterious world..'}

## Main Characters
${storyPrompt.mainCharacters || 'Waiting for characters...'}

## Plot
${storyPrompt.plotOutline || 'An epic tale unfolds...'}

## Themes
${storyPrompt.themes || 'Exploring life and meaning...'}

---

*Story generated with ${selectedParameters.size} custom parameters.*`;

      setGeneratedStory(mockStory);

      toast({
        title: 'Story generated!',
        description: 'Your AI-generated story is ready',
      });
    } catch (error) {
      console.error('Error generating story:', error);
      toast({
        title: 'Generation failed',
        description: 'Could not generate story',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy story to clipboard
  const handleCopyStory = async () => {
    try {
      await navigator.clipboard.writeText(generatedStory);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Copied!',
        description: 'Story copied to clipboard',
      });
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  // Save draft
  const handleSaveDraft = () => {
    try {
      localStorage.setItem(
        'aiStoryDraft',
        JSON.stringify({
          prompt: storyPrompt,
          selectedParameters: Array.from(selectedParameters),
          parameterValues,
          savedAt: new Date().toISOString(),
        })
      );
      toast({
        title: 'Saved!',
        description: 'Your draft has been saved',
      });
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  // Reset form
  const handleReset = () => {
    setStoryPrompt({
      title: '',
      mainCharacters: '',
      plotOutline: '',
      setting: '',
      themes: '',
    });
    setSelectedParameters(new Set());
    setParameterValues({});
    setGeneratedStory('');
    setCanvasState(canvasUtils.createEmptyCanvasState());
    localStorage.removeItem('aiStoryDraft');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white py-8 px-4"
    >
      <GuidedTour steps={AI_STORY_TOUR_STEPS} tourId="ai-story-creation" enabled={true} autoStart={true} />

      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-emerald-500" />
            <h1 className="text-4xl font-bold">AI Story Generator</h1>
          </div>
          <p className="text-gray-400">
            Create stories with 70+ customizable parameters for precise control over your narrative
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Parameter Panel */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3"
            data-tour="parameters"
          >
            <div className="sticky top-4">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm h-[800px] flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-emerald-500" />
                    Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                  <ParameterPanel
                    onParameterChange={handleParameterChange}
                    onParameterToggle={handleParameterToggle}
                    selectedParameters={selectedParameters}
                    defaultPreset="standard"
                    compact={true}
                    showStats={true}
                  />
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Center Column: Canvas Preview */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
            data-tour="canvas"
          >
            <Card className="bg-white/5 border-white/10 h-[800px] flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookText className="w-5 h-5 text-blue-500" />
                  Story Structure
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                {selectedParameters.size === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-white/50">
                    <BookText className="w-12 h-12 mb-3 opacity-30" />
                    <p className="text-sm">Enable parameters to visualize story structure</p>
                  </div>
                ) : (
                  <StoryCanvas
                    state={canvasState}
                    onChange={setCanvasState}
                    width="100%"
                    height="100%"
                    readOnly={true}
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column: Story Input & Output */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-6 space-y-6"
          >
            {/* Story Prompt Input */}
            <Card data-tour="prompt" className="bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Story Prompt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Story Title *</Label>
                  <Input
                    placeholder="Enter your story title..."
                    value={storyPrompt.title}
                    onChange={(e) =>
                      setStoryPrompt({ ...storyPrompt, title: e.target.value })
                    }
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  />
                </div>

                {/* Main Characters */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Main Characters</Label>
                  <Textarea
                    placeholder="Describe your main characters..."
                    value={storyPrompt.mainCharacters}
                    onChange={(e) =>
                      setStoryPrompt({
                        ...storyPrompt,
                        mainCharacters: e.target.value,
                      })
                    }
                    className="text-sm resize-none h-16 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  />
                </div>

                {/* Setting */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Setting</Label>
                  <Textarea
                    placeholder="Where and when does your story take place?..."
                    value={storyPrompt.setting}
                    onChange={(e) =>
                      setStoryPrompt({ ...storyPrompt, setting: e.target.value })
                    }
                    className="text-sm resize-none h-16 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  />
                </div>

                {/* Plot Outline */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Plot Outline</Label>
                  <Textarea
                    placeholder="Sketch your main plot..."
                    value={storyPrompt.plotOutline}
                    onChange={(e) =>
                      setStoryPrompt({
                        ...storyPrompt,
                        plotOutline: e.target.value,
                      })
                    }
                    className="text-sm resize-none h-16 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  />
                </div>

                {/* Themes */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Themes & Tone</Label>
                  <Textarea
                    placeholder="What themes and tone do you want..."
                    value={storyPrompt.themes}
                    onChange={(e) =>
                      setStoryPrompt({ ...storyPrompt, themes: e.target.value })
                    }
                    className="text-sm resize-none h-16 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button
                    data-tour="generate"
                    onClick={handleGenerateStory}
                    disabled={isGenerating}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isGenerating ? 'Generating...' : 'Generate Story'}
                  </Button>
                  <Button
                    onClick={handleSaveDraft}
                    variant="outline"
                    className="text-blue-400 border-blue-400/30 hover:bg-blue-400/10"
                  >
                    Save Draft
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Generated Story Output */}
            {generatedStory && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <Card data-tour="preview" className="bg-white/5 border-white/10 max-h-[600px] overflow-hidden">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0 bg-white/[0.02]">
                    <CardTitle className="text-lg">Generated Story</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleCopyStory}
                        variant="outline"
                        className="text-amber-400 border-amber-400/30 hover:bg-amber-400/10"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleReset}
                        variant="outline"
                        className="text-red-400 border-red-400/30 hover:bg-red-400/10"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="overflow-y-auto max-h-[500px]">
                    <div className="prose prose-invert max-w-none text-white/80 text-sm">
                      {generatedStory.split('\n').map((line, i) => (
                        <p key={i} className="whitespace-pre-wrap mb-2">
                          {line}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
