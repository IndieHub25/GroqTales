'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, BookOpen, Wand2, RefreshCw } from 'lucide-react';
import React, { useState, useCallback } from 'react';

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
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

interface StoryGeneratorProps {
  onStoryGenerated?: (story: string) => void;
  className?: string;
}

interface StoryParams {
  genre: string;
  theme: string;
  length: 'short' | 'medium' | 'long';
  tone: string;
  characters: string;
  setting: string;
}

const GENRES = [
  'Fantasy',
  'Science Fiction',
  'Mystery',
  'Romance',
  'Horror',
  'Adventure',
  'Drama',
  'Comedy',
  'Thriller',
  'Historical',
];

const TONES = [
  'Adventurous',
  'Dark',
  'Humorous',
  'Romantic',
  'Mysterious',
  'Inspirational',
  'Dramatic',
  'Whimsical',
  'Suspenseful',
  'Heartwarming',
];

const LENGTH_OPTIONS = [
  {
    value: 'short',
    label: 'Short (500-1000 words)',
    description: 'Quick read, focused narrative',
  },
  {
    value: 'medium',
    label: 'Medium (1000-2500 words)',
    description: 'Balanced story with development',
  },
  {
    value: 'long',
    label: 'Long (2500+ words)',
    description: 'Detailed, immersive experience',
  },
];

/**
 * AI Story Generator Backup Component
 * Provides a clean interface for generating AI-powered stories with customizable parameters
 */
export default function AIStoryGeneratorBackup({
  onStoryGenerated,
  className = '',
}: StoryGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<string>('');
  const [storyParams, setStoryParams] = useState<StoryParams>({
    genre: '',
    theme: '',
    length: 'medium',
    tone: '',
    characters: '',
    setting: '',
  });

  const handleInputChange = useCallback(
    (field: keyof StoryParams, value: string) => {
      setStoryParams((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const validateParams = (): boolean => {
    if (!storyParams.genre) {
      toast({
        title: 'Missing Genre',
        description: 'Please select a genre for your story.',
        variant: 'destructive',
      });
      return false;
    }

    if (!storyParams.theme.trim()) {
      toast({
        title: 'Missing Theme',
        description: 'Please provide a theme or main idea for your story.',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const generateStory = async () => {
    if (!validateParams()) return;

    setIsGenerating(true);

    try {
      // Simulate API call for story generation
      toast({
        title: 'Generating Story',
        description: 'Creating your personalized story with AI...',
      });

      // Mock story generation - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const mockStory = `# ${storyParams.theme}

In the ${storyParams.tone.toLowerCase()} world of ${
        storyParams.setting || 'a distant realm'
      }, ${
        storyParams.characters || 'our protagonist'
      } embarked on an extraordinary journey.

This ${storyParams.genre.toLowerCase()} tale unfolds with unexpected twists and turns, weaving together elements of adventure, emotion, and discovery. The story explores themes of courage, friendship, and the power of determination in the face of adversity.

As the narrative progresses, readers will find themselves immersed in a richly detailed world where every character has depth and every scene serves to advance both plot and character development.

The conclusion brings together all the story threads in a satisfying resolution that speaks to the universal human experience while staying true to the ${storyParams.genre.toLowerCase()} genre conventions.

*This is a sample story generated based on your parameters. In a full implementation, this would be replaced with actual AI-generated content.*`;

      setGeneratedStory(mockStory);
      onStoryGenerated?.(mockStory);

      toast({
        title: 'Story Generated!',
        description: 'Your personalized story is ready to read.',
      });
    } catch (error) {
      console.error('Story generation error:', error);
      toast({
        title: 'Generation Failed',
        description: 'Unable to generate story. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setStoryParams({
      genre: '',
      theme: '',
      length: 'medium',
      tone: '',
      characters: '',
      setting: '',
    });
    setGeneratedStory('');
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-background via-background to-primary/5">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-primary" />
            AI Story Generator
            <Wand2 className="h-6 w-6 text-primary" />
          </CardTitle>
          <p className="text-muted-foreground">
            Create personalized stories with the power of artificial
            intelligence
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Genre Selection */}
          <div className="space-y-2">
            <Label htmlFor="genre">Genre *</Label>
            <Select
              value={storyParams.genre}
              onValueChange={(value) => handleInputChange('genre', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a genre..." />
              </SelectTrigger>
              <SelectContent>
                {GENRES.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Theme Input */}
          <div className="space-y-2">
            <Label htmlFor="theme">Story Theme *</Label>
            <Input
              id="theme"
              placeholder="e.g., A young wizard discovers their true heritage..."
              value={storyParams.theme}
              onChange={(e) => handleInputChange('theme', e.target.value)}
              className="min-h-[40px]"
            />
          </div>

          {/* Length Selection */}
          <div className="space-y-2">
            <Label>Story Length</Label>
            <div className="grid gap-2">
              {LENGTH_OPTIONS.map((option) => (
                <Card
                  key={option.value}
                  className={`cursor-pointer transition-all hover:border-primary/50 ${
                    storyParams.length === option.value
                      ? 'border-primary bg-primary/5'
                      : ''
                  }`}
                  onClick={() => handleInputChange('length', option.value)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                      {storyParams.length === option.value && (
                        <Badge variant="default">Selected</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Tone Selection */}
          <div className="space-y-2">
            <Label htmlFor="tone">Tone</Label>
            <Select
              value={storyParams.tone}
              onValueChange={(value) => handleInputChange('tone', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select story tone..." />
              </SelectTrigger>
              <SelectContent>
                {TONES.map((tone) => (
                  <SelectItem key={tone} value={tone}>
                    {tone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Characters Input */}
          <div className="space-y-2">
            <Label htmlFor="characters">Main Characters</Label>
            <Textarea
              id="characters"
              placeholder="Describe your main characters (optional)..."
              value={storyParams.characters}
              onChange={(e) => handleInputChange('characters', e.target.value)}
              rows={2}
            />
          </div>

          {/* Setting Input */}
          <div className="space-y-2">
            <Label htmlFor="setting">Setting</Label>
            <Input
              id="setting"
              placeholder="Where does your story take place? (optional)"
              value={storyParams.setting}
              onChange={(e) => handleInputChange('setting', e.target.value)}
            />
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={generateStory}
              disabled={isGenerating}
              className="flex-1"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Story...
                </>
              ) : (
                <>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Generate Story
                </>
              )}
            </Button>

            <Button
              onClick={resetForm}
              variant="outline"
              disabled={isGenerating}
              size="lg"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Story Display */}
      <AnimatePresence>
        {generatedStory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-background">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <BookOpen className="h-5 w-5" />
                  Your Generated Story
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {generatedStory}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
