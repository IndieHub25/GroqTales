'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Save,
  RotateCcw,
  Upload,
  BookOpen,
} from 'lucide-react';
import { motion } from 'framer-motion';

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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { genres } from '@/components/genre-selector';
import { StoryCanvas } from '@/components/story-canvas';
import { GuidedTour, TEXT_STORY_TOUR_STEPS, useGuidedTour } from '@/components/guided-tour';
import * as canvasUtils from '@/lib/canvas-utils';
import { createEmptyCanvasState } from '@/lib/canvas-utils';

interface StoryFormData {
  title: string;
  description: string;
  genre: string;
  content: string;
  coverImage: File | null;
}

export default function TextStoryForm() {
  const { toast } = useToast();
  const { isDone } = useGuidedTour('text-story-creator');
  const [isSaving, setIsSaving] = useState(false);
  const [canvasState, setCanvasState] = useState(createEmptyCanvasState());
  const [storyData, setStoryData] = useState<StoryFormData>({
    title: '',
    description: '',
    genre: '',
    content: '',
    coverImage: null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('textStoryDraft');
    const canvasStateStorage = localStorage.getItem('textStoryCanvasState');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setStoryData(parsed);
        if (parsed.coverImage) {
          setPreviewUrl(`data:image/jpeg;base64,${parsed.coverImage}`);
        }
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
    if (canvasStateStorage) {
      try {
        const parsed = JSON.parse(canvasStateStorage);
        setCanvasState(parsed);
      } catch (e) {
        console.error('Failed to load canvas state:', e);
      }
    }
  }, []);

  const handleCoverImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setStoryData(prev => ({ ...prev, coverImage: file }));
      }
    },
    []
  );

  const handleSaveDraft = useCallback(async () => {
    setIsSaving(true);
    try {
      localStorage.setItem(
        'textStoryDraft',
        JSON.stringify({
          ...storyData,
          savedAt: new Date().toISOString(),
        })
      );
      localStorage.setItem('textStoryCanvasState', JSON.stringify(canvasState));
      toast({
        title: '✓ Draft Saved',
        description: 'Your story and canvas structure have been saved.',
        className: 'bg-black/80 border border-white/10 text-white backdrop-blur-md',
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: 'Error',
        description: 'Failed to save draft',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [storyData, canvasState, toast]);

  const handleReset = () => {
    setStoryData({
      title: '',
      description: '',
      genre: '',
      content: '',
      coverImage: null,
    });
    setCanvasState(createEmptyCanvasState());
    setPreviewUrl(null);
    localStorage.removeItem('textStoryDraft');
    localStorage.removeItem('textStoryCanvasState');
    toast({
      title: 'Reset',
      description: 'Form and canvas cleared.',
      className: 'bg-black/80 border border-white/10 text-white backdrop-blur-md',
    });
  };

  const handleAddChapter = () => {
    const chapterNum = canvasState.nodes.filter(n => n.type === 'chapter').length + 1;
    const newNode = canvasUtils.createNode(
      'chapter',
      `Chapter ${chapterNum}`,
      100 + chapterNum * 200,
      150,
      140,
      60,
      { chapterNumber: chapterNum }
    );
    setCanvasState(prev => canvasUtils.addNode(prev, newNode));
  };

  const wordCount = storyData.content.split(/\s+/).filter(w => w.length > 0).length;

  return (
    <>
      <GuidedTour steps={TEXT_STORY_TOUR_STEPS} tourId="text-story-creator" />

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Canvas Section */}
          <div data-tour="canvas" className="h-[600px]">
            <Card className="bg-white/5 border-white/10 h-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BookOpen className="w-5 h-5" />
                    Story Structure
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddChapter}
                    className="bg-white/5 border-white/10 hover:bg-white/10"
                  >
                    + Add Chapter
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <StoryCanvas state={canvasState} onChange={setCanvasState} />
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Metadata Panel */}
            <div data-tour="metadata">
              <Card className="bg-white/5 border-white/10 sticky top-4">
                <CardHeader>
                  <CardTitle className="text-lg">Story Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="font-semibold text-sm">
                      Title
                    </Label>
                    <Input
                      id="title"
                      placeholder="Your Story Title"
                      value={storyData.title}
                      onChange={(e) => setStoryData(prev => ({ ...prev, title: e.target.value }))}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="genre" className="font-semibold text-sm">
                      Genre
                    </Label>
                    <Select value={storyData.genre} onValueChange={(value) => setStoryData(prev => ({ ...prev, genre: value }))}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select a genre" />
                      </SelectTrigger>
                      <SelectContent>
                        {genres.map((g) => (
                          <SelectItem key={g.id} value={g.id}>
                            {g.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="font-semibold text-sm">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Your story description..."
                      value={storyData.description}
                      onChange={(e) => setStoryData(prev => ({ ...prev, description: e.target.value }))}
                      className="text-xs resize-none h-20 bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cover-image" className="font-semibold text-sm">
                      Cover Image
                    </Label>
                    <Input
                      id="cover-image"
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                      className="bg-white/5 border-white/10 text-white text-xs"
                    />
                    {previewUrl && (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border border-white/10">
                        <img src={previewUrl} alt="Cover preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-white/10 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-white/60">Words:</span>
                      <span className="font-semibold">{wordCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Characters:</span>
                      <span className="font-semibold">{storyData.content.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Chapters:</span>
                      <span className="font-semibold">{canvasState.nodes.filter(n => n.type === 'chapter').length}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-4">
                    <Button
                      onClick={handleSaveDraft}
                      disabled={isSaving}
                      data-tour="save-button"
                      className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save Draft'}
                    </Button>
                    <Button
                      onClick={handleReset}
                      variant="ghost"
                      className="w-full text-white/70 hover:text-white hover:bg-white/5"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Content Editor */}
            <div className="lg:col-span-2" data-tour="editor">
              <Card className="bg-white/5 border-white/10 h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg">Story Content</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <Textarea
                    placeholder="Begin your narrative here... Write freely and let your imagination flow."
                    value={storyData.content}
                    onChange={(e) => setStoryData(prev => ({ ...prev, content: e.target.value }))}
                    className="flex-1 w-full p-4 bg-white/5 border-white/10 text-white rounded-lg font-mono text-sm resize-none"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
