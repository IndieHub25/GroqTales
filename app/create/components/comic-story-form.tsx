'use client';

import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  GripVertical,
  Save,
  Sparkles,
  Share2,
} from 'lucide-react';

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

interface Panel {
  id: string;
  description: string;
  dialogue: string;
  notes: string;
}

interface ComicData {
  title: string;
  genre: string;
  rating: string;
  description: string;
  panels: Panel[];
}

export default function ComicStoryForm() {
  const { toast } = useToast();
  const [comicData, setComicData] = useState<ComicData>({
    title: '',
    genre: 'fantasy',
    rating: 'all-ages',
    description: '',
    panels: [
      { id: '1', description: '', dialogue: '', notes: '' },
    ],
  });

  const [isSaving, setIsSaving] = useState(false);

  const addPanel = () => {
    const newPanel: Panel = {
      id: Date.now().toString(),
      description: '',
      dialogue: '',
      notes: '',
    };
    setComicData({
      ...comicData,
      panels: [...comicData.panels, newPanel],
    });
  };

  const removePanel = (id: string) => {
    if (comicData.panels.length > 1) {
      setComicData({
        ...comicData,
        panels: comicData.panels.filter((p) => p.id !== id),
      });
    }
  };

  const updatePanel = (id: string, field: keyof Panel, value: string) => {
    setComicData({
      ...comicData,
      panels: comicData.panels.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    });
  };

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
      toast({
        title: 'Draft Saved',
        description: 'Your comic has been saved to your device.',
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
  };

  const estimatedPages = Math.ceil(comicData.panels.length / 6);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel: Configuration */}
        <div className="lg:col-span-1">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-lg">Comic Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="font-semibold">
                  Title
                </Label>
                <Input
                  id="title"
                  placeholder="Your Comic Title"
                  value={comicData.title}
                  onChange={(e) =>
                    setComicData({ ...comicData, title: e.target.value })
                  }
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              {/* Genre */}
              <div className="space-y-2">
                <Label htmlFor="genre" className="font-semibold">
                  Genre
                </Label>
                <Select
                  value={comicData.genre}
                  onValueChange={(value) =>
                    setComicData({ ...comicData, genre: value })
                  }
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
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
                <Label htmlFor="rating" className="font-semibold">
                  Content Rating
                </Label>
                <Select
                  value={comicData.rating}
                  onValueChange={(value) =>
                    setComicData({ ...comicData, rating: value })
                  }
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
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
                <Label htmlFor="description" className="font-semibold">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="What's your comic about?"
                  value={comicData.description}
                  onChange={(e) =>
                    setComicData({ ...comicData, description: e.target.value })
                  }
                  className="text-sm resize-none h-20 bg-white/5 border-white/10 text-white"
                />
              </div>

              {/* Stats */}
              <div className="pt-4 border-t border-white/10 space-y-2">
                <div className="text-sm">
                  <span className="font-semibold">Panels:</span> {comicData.panels.length}
                </div>
                <div className="text-sm">
                  <span className="font-semibold">Est. Pages:</span>{' '}
                  {estimatedPages} (6 panels/page)
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-4">
                <Button
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                  className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Draft'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Panels Editor */}
        <div className="lg:col-span-3">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Story Panels</CardTitle>
              <Button
                onClick={addPanel}
                size="sm"
                className="bg-emerald-500 hover:bg-emerald-600 text-black"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Panel
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {comicData.panels.map((panel, index) => (
                  <div
                    key={panel.id}
                    className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-3"
                  >
                    {/* Panel Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-white/40" />
                        <span className="font-semibold text-white">Panel {index + 1}</span>
                      </div>
                      {comicData.panels.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePanel(panel.id)}
                          className="text-red-400 hover:bg-red-400/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {/* Panel Content */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-white/60">Scene Description</Label>
                        <Textarea
                          placeholder="Describe the visual scene..."
                          value={panel.description}
                          onChange={(e) =>
                            updatePanel(panel.id, 'description', e.target.value)
                          }
                          className="text-sm resize-none h-16 bg-white/5 border-white/10 text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-white/60">Dialogue</Label>
                        <Textarea
                          placeholder="Character dialogue for this panel..."
                          value={panel.dialogue}
                          onChange={(e) =>
                            updatePanel(panel.id, 'dialogue', e.target.value)
                          }
                          className="text-sm resize-none h-16 bg-white/5 border-white/10 text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-white/60">Notes</Label>
                      <Textarea
                        placeholder="Internal notes for artists..."
                        value={panel.notes}
                        onChange={(e) => updatePanel(panel.id, 'notes', e.target.value)}
                        className="text-sm resize-none h-12 bg-white/5 border-white/10 text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
