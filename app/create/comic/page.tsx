'use client';

import {
  Plus,
  Trash2,
  GripVertical,
  Save,
  Sparkles,
  Share2,
} from 'lucide-react';
import { useState } from 'react';

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

export default function CreateComicPage() {
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

  // Panel management
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

  const movePanel = (fromIndex: number, toIndex: number) => {
    const newPanels = [...comicData.panels];
    const removed = newPanels.splice(fromIndex, 1)[0];
    if (removed) {
      newPanels.splice(toIndex, 0, removed);
      setComicData({ ...comicData, panels: newPanels });
    }
  };

  // Save actions
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      // Store to localStorage for draft
      localStorage.setItem(
        'comicDraft',
        JSON.stringify({
          ...comicData,
          savedAt: new Date().toISOString(),
        })
      );
      console.log('Comic draft saved to localStorage');
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateArt = () => {
    // TODO: Wire to AI Story Studio or external image generation
    console.log(
      'AI art generation coming soon! Use the AI Story page for full generation capabilities.'
    );
  };

  const handlePublish = async () => {
    if (!comicData.title.trim()) {
      console.warn('Please enter a title for your comic');
      return;
    }

    setIsSaving(true);
    try {
      // TODO: POST to /api/v1/comics with comicData
      console.log('Comic published:', comicData);
    } catch (error) {
      console.error('Error publishing comic:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const estimatedPages = Math.ceil(comicData.panels.length / 6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-slate-950 dark:to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Create Comic</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Design panel-based comics ready for AI-generated or hand-drawn art.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel: Configuration */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Comic Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="font-semi bold">
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
                  <Label htmlFor="genre" className="font-semibold">
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
                      <SelectItem value="other">Other</SelectItem>
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
                    className="text-sm resize-none h-24"
                  />
                </div>

                {/* Stats */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                  <div className="text-sm">
                    <span className="font-semibold">Panels:</span> {comicData.panels.length}
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">Est. Pages:</span>{' '}
                    {estimatedPages} (6 panels/page)
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-4">
                  <Button
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
                    onClick={handleGenerateArt}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Art
                  </Button>
                  <Button
                    onClick={handlePublish}
                    disabled={isSaving || !comicData.title}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Publish
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel: Panels Editor */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              {comicData.panels.map((panel, index) => (
                <Card key={panel.id} className="overflow-hidden">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0 bg-gray-50 dark:bg-slate-900/50">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      Panel {index + 1}
                    </CardTitle>
                    <Button
                      onClick={() => removePanel(panel.id)}
                      variant="ghost"
                      size="sm"
                      disabled={comicData.panels.length === 1}
                      className="h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    {/* Panel Description */}
                    <div className="space-y-2">
                      <Label
                        htmlFor={`desc-${panel.id}`}
                        className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400"
                      >
                        Scene Description
                      </Label>
                      <Textarea
                        id={`desc-${panel.id}`}
                        placeholder="Describe what happens in this panel..."
                        value={panel.description}
                        onChange={(e) =>
                          updatePanel(panel.id, 'description', e.target.value)
                        }
                        className="text-sm resize-none h-16"
                      />
                    </div>

                    {/* Dialogue */}
                    <div className="space-y-2">
                      <Label
                        htmlFor={`dialogue-${panel.id}`}
                        className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400"
                      >
                        Dialogue / Captions
                      </Label>
                      <Textarea
                        id={`dialogue-${panel.id}`}
                        placeholder="Character dialogue or narration..."
                        value={panel.dialogue}
                        onChange={(e) =>
                          updatePanel(panel.id, 'dialogue', e.target.value)
                        }
                        className="text-sm resize-none h-12"
                      />
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label
                        htmlFor={`notes-${panel.id}`}
                        className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400"
                      >
                        Camera Notes (Optional)
                      </Label>
                      <Textarea
                        id={`notes-${panel.id}`}
                        placeholder="e.g., Wide shot, close-up, action, reaction..."
                        value={panel.notes}
                        onChange={(e) =>
                          updatePanel(panel.id, 'notes', e.target.value)
                        }
                        className="text-sm resize-none h-10"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add Panel Button */}
              <Button
                onClick={addPanel}
                variant="outline"
                className="w-full h-12 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-900/50"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Panel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
