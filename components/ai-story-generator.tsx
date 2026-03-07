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
} from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface AIStoryGeneratorProps {
  className?: string;
}

const genres = [
  'Fantasy',
  'Sci-Fi',
  'Mystery',
  'Romance',
  'Thriller',
  'Horror',
  'Adventure',
  'Comedy',
  'Drama',
  'Historical',
  'Western',
  'Cyberpunk',
];

function LoadingStateIndicator({ message }: { message: string | null }) {
  const messages = [
    'Generating story',
    'Creating worlds',
    'Crafting characters',
    'Building plot',
    'Finalizing details',
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

export default function AIStoryGenerator({
  className = '',
}: AIStoryGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [mainCharacters, setMainCharacters] = useState('');
  const [setting, setSetting] = useState('');
  const [themes, setThemes] = useState('');
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
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
          format: 'short',
          maxTokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`Generation failed (${response.status})`);
      }

      const data = await response.json();
      setGeneratedContent(
        data.story || data.content || data.result || 'Story generated successfully.'
      );
      setActiveTab('preview');
      toast({
        title: 'Story Generated!',
        description: 'Your AI-powered story has been created successfully.',
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
            <span>AI Story Generator</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="input">Story Input</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="input" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Story Prompt *
                  </label>
                  <Textarea
                    placeholder="Enter your story idea, theme, or concept..."
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
                        variant={
                          selectedGenres.includes(genre) ? 'default' : 'outline'
                        }
                        className="cursor-pointer"
                        onClick={() => handleGenreToggle(genre)}
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={generateStory}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <LoadingStateIndicator message="Generating your story..." />
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Story
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              {generatedContent ? (
                <div className="space-y-4">
                  <div className="prose prose-sm max-w-none bg-muted/50 p-6 rounded-lg">
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
