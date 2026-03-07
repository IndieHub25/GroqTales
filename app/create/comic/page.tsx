'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Save, RotateCcw, Sparkles } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';

import { StoryCanvas } from '@/components/story-canvas';
import { GuidedTour, COMIC_TOUR_STEPS } from '@/components/guided-tour';
import { useStoryCanvas } from '@/hooks/useStoryCanvas';
import * as canvasUtils from '@/lib/canvas-utils';
import { CanvasState } from '@/types/canvas';

interface ComicData {
  title: string;
  genre: string;
  rating: string;
  description: string;
}

export default function CreateComicPage() {
  const { canvasState, setCanvasState } = useStoryCanvas({
    storageKey: 'comicCanvasState',
    autoSave: true,
  });

  const [comicData, setComicData] = useState<ComicData>({
    title: '',
    genre: 'fantasy',
    rating: 'all-ages',
    description: '',
  });

  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load draft on mount
  useEffect(() => {
    try {
      const draft = localStorage.getItem('comicDraft');
      if (draft) {
        const parsed = JSON.parse(draft);
        setComicData({
          title: parsed.title,
          genre: parsed.genre,
          rating: parsed.rating,
          description: parsed.description,
        });
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
  }, []);

  // Add new panel to canvas
  const handleAddPanel = () => {
    const panelNumber = canvasState.nodes.filter(n => n.type === 'panel').length + 1;
    const newPanel = canvasUtils.createNode(`panel-${Date.now()}`, 'panel', `Panel ${panelNumber}`);
    const newState = canvasUtils.addNode(canvasState, newPanel);
    setCanvasState(newState);
    setSelectedPanelId(newPanel.id);
  };

  // Get selected panel data
  const selectedPanel = canvasState.nodes.find(n => n.id === selectedPanelId);

  // Update selected panel metadata
  const handleUpdatePanel = (field: string, value: any) => {
    if (!selectedPanelId) return;
    const updatedNode = {
      ...selectedPanel!,
      [field]: value,
    };
    const newState = canvasUtils.updateNode(canvasState, selectedPanelId, updatedNode);
    setCanvasState(newState);
  };

  // Delete selected panel
  const handleDeletePanel = () => {
    if (!selectedPanelId) return;
    const newState = canvasUtils.deleteNode(canvasState, selectedPanelId);
    setCanvasState(newState);
    setSelectedPanelId(null);
  };

  // Save draft
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem(
        'comicDraft',
        JSON.stringify({
          ...comicData,
          savedAt: new Date().toISOString(),
        })
      );
      localStorage.setItem('comicCanvasState', JSON.stringify(canvasState));
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setComicData({
      title: '',
      genre: 'fantasy',
      rating: 'all-ages',
      description: '',
    });
    setCanvasState(canvasUtils.createEmptyCanvasState());
    setSelectedPanelId(null);
    localStorage.removeItem('comicDraft');
    localStorage.removeItem('comicCanvasState');
  };

  const panelCount = canvasState.nodes.filter(n => n.type === 'panel').length;
  const estimatedPages = Math.ceil(panelCount / 6);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-slate-950 dark:to-slate-900 py-8 px-4"
    >
      <GuidedTour steps={COMIC_TOUR_STEPS} tourId="comic-creation" enabled={true} autoStart={true} />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            <h1 className="text-4xl font-bold">Create Comic</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Design your comic panel-by-panel with our visual canvas builder
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Metadata */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card
                data-tour="metadata"
                className="sticky top-4 bg-white/5 border-white/10 backdrop-blur-sm mb-6"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    Comic Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-semibold">
                      Title
                    </Label>
                    <Input
                      id="title"
                      placeholder="Your Comic Title"
                      value={comicData.title}
                      onChange={(e) =>
                        setComicData({ ...comicData, title: e.target.value })
                      }
                      className="text-sm"
                    />
                  </div>

                  {/* Genre */}
                  <div className="space-y-2">
                    <Label htmlFor="genre" className="text-sm font-semibold">
                      Genre
                    </Label>
                    <Select
                      value={comicData.genre}
                      onValueChange={(value) =>
                        setComicData({ ...comicData, genre: value })
                      }
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fantasy">Fantasy</SelectItem>
                        <SelectItem value="sci-fi">Sci-Fi</SelectItem>
                        <SelectItem value="comedy">Comedy</SelectItem>
                        <SelectItem value="drama">Drama</SelectItem>
                        <SelectItem value="horror">Horror</SelectItem>
                        <SelectItem value="romance">Romance</SelectItem>
                        <SelectItem value="adventure">Adventure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Rating */}
                  <div className="space-y-2">
                    <Label htmlFor="rating" className="text-sm font-semibold">
                      Content Rating
                    </Label>
                    <Select
                      value={comicData.rating}
                      onValueChange={(value) =>
                        setComicData({ ...comicData, rating: value })
                      }
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-ages">All Ages</SelectItem>
                        <SelectItem value="teen">Teen (13+)</SelectItem>
                        <SelectItem value="mature">Mature (18+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="What's your comic about?"
                      value={comicData.description}
                      onChange={(e) =>
                        setComicData({ ...comicData, description: e.target.value })
                      }
                      className="text-sm resize-none h-24 bg-white/5 border-white/10"
                    />
                  </div>

                  {/* Stats */}
                  <div className="pt-4 border-t border-white/10 space-y-2">
                    <div className="text-sm">
                      <span className="font-semibold text-white">Panels:</span>
                      <span className="text-white/70 ml-2">{panelCount}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold text-white">Est. Pages:</span>
                      <span className="text-white/70 ml-2">{estimatedPages} (6/page)</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-4">
                    <Button
                      data-tour="save-button"
                      onClick={handleSaveDraft}
                      disabled={isSaving}
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Draft
                    </Button>
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      className="w-full text-red-500 hover:text-red-600"
                      size="sm"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Clear All
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Columns: Canvas + Panel Editor */}
          <div className="lg:col-span-3 space-y-6">
            {/* Canvas Section */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card
                data-tour="canvas"
                className="bg-white/5 border-white/10 h-[600px] flex flex-col"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Comic Layout
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleAddPanel}
                      className="text-orange-500 border-orange-500/30 hover:bg-orange-500/10"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Panel
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                  <StoryCanvas
                    state={canvasState}
                    onChange={setCanvasState}
                    width="100%"
                    height="100%"
                    onNodeClick={(nodeId) => {
                      if (canvasState.nodes.find(n => n.id === nodeId)?.type === 'panel') {
                        setSelectedPanelId(nodeId);
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Panel Editor Section */}
            {selectedPanel && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card data-tour="panel-editor" className="bg-white/5 border-white/10">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">
                        {selectedPanel.label || 'Panel Editor'}
                      </CardTitle>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleDeletePanel}
                      >
                        Delete Panel
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* Scene Description */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Scene Description</Label>
                      <Textarea
                        placeholder="Describe what happens in this panel..."
                        value={selectedPanel.description || ''}
                        onChange={(e) =>
                          handleUpdatePanel('description', e.target.value)
                        }
                        className="text-sm resize-none h-20 bg-white/5 border-white/10"
                      />
                    </div>

                    {/* Dialogue */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Dialogue / Captions</Label>
                      <Textarea
                        placeholder="Character dialogue or narration..."
                        value={selectedPanel.content || ''}
                        onChange={(e) => handleUpdatePanel('content', e.target.value)}
                        className="text-sm resize-none h-20 bg-white/5 border-white/10"
                      />
                    </div>

                    {/* Camera Notes */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Camera Direction (Optional)</Label>
                      <Textarea
                        placeholder="e.g., Wide shot, close-up, action, reaction..."
                        value={selectedPanel.metadata?.cameraNotes || ''}
                        onChange={(e) =>
                          handleUpdatePanel('metadata', {
                            ...selectedPanel.metadata,
                            cameraNotes: e.target.value,
                          })
                        }
                        className="text-sm resize-none h-16 bg-white/5 border-white/10"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Empty State */}
            {panelCount === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center py-16 text-white/50"
              >
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium mb-2">No panels yet</p>
                <p className="text-sm mb-4">Create your first panel to get started</p>
                <Button
                  onClick={handleAddPanel}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Panel
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
