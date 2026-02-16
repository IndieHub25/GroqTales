'use client';

import { Loader2, BookOpen, BarChart3, Target } from 'lucide-react';
import React, { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface StoryAnalysisProps {
  className?: string;
}

export default function StoryAnalysis({ className = '' }: StoryAnalysisProps) {
  const [storyText, setStoryText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!storyText.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter some story text to analyze.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      // Placeholder analysis - in real implementation, this would call the API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setAnalysis({
        wordCount: storyText.split(' ').length,
        sentiment: 'positive',
        themes: ['adventure', 'friendship', 'growth'],
        readability: 'intermediate',
        structure: {
          introduction: 'Strong',
          development: 'Good',
          conclusion: 'Satisfactory',
        },
        suggestions: [
          'Consider adding more descriptive language',
          'The pacing could be improved in the middle section',
          'Strong character development throughout',
        ],
      });

      toast({
        title: 'Analysis Complete',
        description: 'Your story has been analyzed successfully.',
      });
    } catch (error) {
      toast({
        title: 'Analysis Failed',
        description:
          'There was an error analyzing your story. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Story Analysis
          </CardTitle>
          <CardDescription>
            Analyze your story for themes, sentiment, structure, and get
            improvement suggestions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="story-text" className="text-sm font-medium">
              Story Text
            </label>
            <Textarea
              id="story-text"
              placeholder="Paste your story here for analysis..."
              value={storyText}
              onChange={(e) => setStoryText(e.target.value)}
              className="min-h-[200px]"
            />
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !storyText.trim()}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <BarChart3 className="mr-2 h-4 w-4" />
                Analyze Story
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="structure">Structure</TabsTrigger>
                <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {analysis.wordCount}
                    </div>
                    <div className="text-sm text-muted-foreground">Words</div>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline">{analysis.sentiment}</Badge>
                    <div className="text-sm text-muted-foreground mt-1">
                      Sentiment
                    </div>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline">{analysis.readability}</Badge>
                    <div className="text-sm text-muted-foreground mt-1">
                      Readability
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {analysis.themes.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Themes</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Identified Themes</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.themes.map((theme: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="structure" className="space-y-4">
                <div className="space-y-3">
                  {Object.entries(analysis.structure).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between items-center"
                    >
                      <span className="capitalize">{key}</span>
                      <Badge
                        variant={
                          value === 'Strong'
                            ? 'default'
                            : value === 'Good'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {value as string}
                      </Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="suggestions" className="space-y-4">
                <div className="space-y-3">
                  {analysis.suggestions.map(
                    (suggestion: string, index: number) => (
                      <div key={index} className="p-3 bg-muted rounded-lg">
                        <p className="text-sm">{suggestion}</p>
                      </div>
                    )
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface StoryAnalysisProps {
  /** Story content to analyze */
  content: string;
  /** Optional story title */
  title?: string;
  /** Optional story genre */
  genre?: string;
  /** Optional API key for analysis service */
  apiKey?: string;
  /** Optional CSS class name */
  className?: string;
  /** Callback fired when analysis completes */
  onAnalysisComplete?: (result: any) => void;
}
