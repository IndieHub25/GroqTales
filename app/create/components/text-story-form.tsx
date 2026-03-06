'use client';

import React, { useState, useCallback } from 'react';
import {
  Save,
  RotateCcw,
  Upload,
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
import { genres } from '@/components/genre-selector';

interface StoryFormData {
  title: string;
  description: string;
  genre: string;
  content: string;
  coverImage: File | null;
}

export default function TextStoryForm() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [storyData, setStoryData] = useState<StoryFormData>({
    title: '',
    description: '',
    genre: '',
    content: '',
    coverImage: null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleCoverImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setStoryData({ ...storyData, coverImage: file });
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    },
    [storyData]
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
      toast({
        title: 'Draft Saved',
        description: 'Your story has been saved to your device.',
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
  }, [storyData, toast]);

  const handleReset = () => {
    setStoryData({
      title: '',
      description: '',
      genre: '',
      content: '',
      coverImage: null,
    });
    setPreviewUrl(null);
    toast({
      title: 'Reset',
      description: 'Form has been cleared.',
      className: 'bg-black/80 border border-white/10 text-white backdrop-blur-md',
    });
  };

  const wordCount = storyData.content.split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel: Metadata */}
        <div className="lg:col-span-1">
          <Card className="bg-white/5 border-white/10 sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg">Story Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="font-semibold">
                  Title
                </Label>
                <Input
                  id="title"
                  placeholder="Your Story Title"
                  value={storyData.title}
                  onChange={(e) =>
                    setStoryData({ ...storyData, title: e.target.value })
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
                  value={storyData.genre}
                  onValueChange={(value) =>
                    setStoryData({ ...storyData, genre: value })
                  }
                >
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

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="font-semibold">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of your story..."
                  value={storyData.description}
                  onChange={(e) =>
                    setStoryData({ ...storyData, description: e.target.value })
                  }
                  className="text-sm resize-none h-20 bg-white/5 border-white/10 text-white"
                />
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <Label htmlFor="cover-image" className="font-semibold">
                  Cover Image
                </Label>
                <div className="space-y-2">
                  <Input
                    id="cover-image"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    className="bg-white/5 border-white/10 text-white"
                  />
                  {previewUrl && (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="pt-4 border-t border-white/10 space-y-2 text-sm">
                <div>
                  <span className="font-semibold">Word Count:</span> {wordCount}
                </div>
                <div>
                  <span className="font-semibold">Characters:</span>{' '}
                  {storyData.content.length}
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
                <Button
                  onClick={handleReset}
                  variant="ghost"
                  className="w-full text-white/70 hover:text-white hover:bg-white/5"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Clear Form
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Content Editor */}
        <div className="lg:col-span-3">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-lg">Story Content</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Begin your narrative here... Write freely and let your imagination flow."
                value={storyData.content}
                onChange={(e) =>
                  setStoryData({ ...storyData, content: e.target.value })
                }
                className="w-full min-h-[500px] p-4 bg-white/5 border-white/10 text-white rounded-lg font-mono text-sm resize-none"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
