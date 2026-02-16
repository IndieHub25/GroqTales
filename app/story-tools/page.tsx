'use client';

import { Loader2, Upload, Save } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import StoryAnalysis from '@/components/story-analysis';
import { StoryRecommendations } from '@/components/story-recommendations';
import { StorySummary } from '@/components/story-summary';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

const DRAFT_KEY = "groqtales_story_tools_draft_v1";

interface StoryToolsDraft {
  title: string;
  genre: string;
  content: string;
  updatedAt: number;
  version: number;
}

export default function StoryToolsPage() {
  const { toast } = useToast();
  const [storyId, setStoryId] = useState('demo-story-' + Date.now());
  const [storyTitle, setStoryTitle] = useState('');
  const [storyGenre, setStoryGenre] = useState('');
  const [storyContent, setStoryContent] = useState('');
  const [activeTab, setActiveTab] = useState('editor');
  const [isLoading, setIsLoading] = useState(false);
  const [summaryKeywords, setSummaryKeywords] = useState<string[]>([]);

  // Draft Recovery State
  const [recoveredDraft, setRecoveredDraft] = useState<StoryToolsDraft | null>(null);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);

  // Draft recovery detection on mount
  useEffect(() => {
    try {
      const draftStr = localStorage.getItem(DRAFT_KEY);
      if (draftStr) {
        const draft: StoryToolsDraft = JSON.parse(draftStr);
        setRecoveredDraft(draft);
        setShowRecoveryModal(true);
      }
    } catch (error) {
      console.warn('Draft recovery failed:', error);
    }
  }, []);

  // Autosave logic with debounce
  useEffect(() => {
    // Don't autosave while recovery modal is shown
    if (showRecoveryModal) {
      return;
    }

    if (!storyContent.trim()) {
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch (error) {
        console.warn('Draft cleanup failed:', error);
      }
      return;
    }

    const timeout = setTimeout(() => {
      const draft: StoryToolsDraft = {
        title: storyTitle,
        genre: storyGenre,
        content: storyContent,
        updatedAt: Date.now(),
        version: 1,
      };

      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      } catch (error) {
        console.warn('Autosave failed:', error);
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch (removeError) {
          console.warn('Draft cleanup failed:', removeError);
        }
      }
    }, 1000); // autosave every 1s after typing stops

    return () => clearTimeout(timeout);
  }, [storyTitle, storyGenre, storyContent, showRecoveryModal]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const text = await file.text();
      setStoryContent(text);

      // Try to extract title from first line if not set
      if (!storyTitle) {
        const lines = text.split('\n');
        const firstLine = lines.length > 0 && lines[0] ? lines[0].trim() : '';
        if (firstLine && firstLine.length < 100) {
          setStoryTitle(firstLine);
        }
      }
    } catch (error) {
      console.error('Error reading file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummaryGenerated = (summary: any) => {
    if (summary?.keywords) {
      setSummaryKeywords(summary.keywords);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Groq-Powered Story Tools</h1>
          <p className="text-lg text-muted-foreground">
            Analyze, summarize, and get recommendations for your stories with AI
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="editor">Story Editor</TabsTrigger>
            <TabsTrigger value="summary">AI Summary</TabsTrigger>
            <TabsTrigger value="analysis">Story Analysis</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="editor">
            {/* Draft Recovery Modal */}
            {showRecoveryModal && recoveredDraft && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white border-4 border-black rounded-2xl p-8 max-w-md w-full shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                  <div className="text-center space-y-6">
                    <div className="inline-block bg-yellow-400 p-4 rounded-full border-4 border-black">
                      <Save className="h-8 w-8 text-black" />
                    </div>

                    <div>
                      <h3 className="font-bangers text-2xl mb-2">
                        DRAFT RECOVERED!
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        We found an unsaved draft from{' '}
                        {new Date(recoveredDraft.updatedAt).toLocaleString()}.
                        Would you like to restore it?
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        onClick={() => {
                          // Restore draft
                          setStoryTitle(recoveredDraft.title);
                          setStoryGenre(recoveredDraft.genre);
                          setStoryContent(recoveredDraft.content);
                          setShowRecoveryModal(false);
                          setRecoveredDraft(null);
                          toast({
                            title: 'DRAFT RESTORED!',
                            description: 'Your previous work has been recovered.',
                            className: 'font-bangers bg-green-400 text-black border-4 border-black',
                          });
                        }}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bangers px-6 py-3"
                      >
                        RESTORE DRAFT
                      </Button>
                      <Button
                        onClick={() => {
                          // Discard draft
                          try {
                            localStorage.removeItem(DRAFT_KEY);
                          } catch (error) {
                            console.warn('Draft discard failed:', error);
                          }
                          setShowRecoveryModal(false);
                          setRecoveredDraft(null);
                          toast({
                            title: 'DRAFT DISCARDED',
                            description: 'Starting fresh!',
                            className: 'font-bangers bg-gray-400 text-black border-4 border-black',
                          });
                        }}
                        className="flex-1 font-bangers border-4 border-black bg-white text-black hover:bg-gray-100"
                      >
                        DISCARD
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Enter Your Story</CardTitle>
                <CardDescription>
                  Paste your story text or upload a file to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Story Title</label>
                    <Input
                      placeholder="Enter a title for your story"
                      value={storyTitle}
                      onChange={(e) => setStoryTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Genre</label>
                    <Input
                      placeholder="Enter the genre (e.g., Fantasy, Sci-Fi, Romance)"
                      value={storyGenre}
                      onChange={(e) => setStoryGenre(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Story Content</label>
                    <span className="text-xs text-muted-foreground">
                      {storyContent.length} characters
                    </span>
                  </div>
                  <Textarea
                    placeholder="Paste your story here..."
                    className="min-h-[300px]"
                    value={storyContent}
                    onChange={(e) => setStoryContent(e.target.value)}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={() =>
                      document.getElementById('file-upload')?.click()
                    }
                    className="flex items-center gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Upload Text File
                    <input
                      id="file-upload"
                      type="file"
                      accept=".txt,.md,.rtf"
                      className="hidden"
                      onChange={handleFileUpload}
                      aria-label="Upload text file for story analysis"
                    />
                  </Button>

                  <Button
               onClick={() => {
                     setActiveTab('summary');                   
                    }}
                    disabled={!storyContent || storyContent.length < 100}
                  >
                    Continue to Summary
                  </Button>
                </div>

                {storyContent && storyContent.length < 100 && (
                  <p className="text-sm text-red-500">
                    Please enter at least 100 characters to use the AI tools
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary">
            <StorySummary
              title={storyTitle || 'Story Summary'}
              author="Anonymous"
              genre="General"
              readTime="5 min"
              summary={storyContent.slice(0, 200) + '...'}
              tags={['AI Generated']}
              onShare={() => console.log('Share clicked')}
              onDownload={() => console.log('Download clicked')}
              onLike={() => console.log('Like clicked')}
              isLiked={false}
              likeCount={0}
            />

            <div className="flex justify-end mt-4">
              <Button onClick={() => setActiveTab('analysis')}>
                Continue to Analysis
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="analysis">
            <StoryAnalysis
              content={storyContent}
              title={storyTitle}
              genre={storyGenre}
            />

            <div className="flex justify-end mt-4">
              <Button onClick={() => setActiveTab('recommendations')}>
                Continue to Recommendations
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="recommendations">
            <StoryRecommendations
              storyId={storyId}
              content={storyContent}
              keywords={summaryKeywords}
              genre={storyGenre}
              limit={4}
            />

            <div className="flex justify-end mt-4">
              <Button onClick={() => setActiveTab('editor')}>
                Back to Editor
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-12 p-6 border rounded-xl bg-muted/20">
          <h2 className="text-xl font-semibold mb-4">About These Tools</h2>
          <div className="space-y-4 text-sm">
            <p>
              These writer's tools use Groq's powerful large language models to
              analyze and enhance your stories. The tools process your story
              text to generate summaries, detailed analysis, and find similar
              stories based on themes and content.
            </p>
            <p>
              <strong>AI Summary:</strong> Generates a concise summary of your
              story along with key points, sentiment analysis, and keywords.
            </p>
            <p>
              <strong>Story Analysis:</strong> Provides comprehensive feedback
              on plot structure, character development, themes, and style.
            </p>
            <p>
              <strong>Recommendations:</strong> Suggests similar stories based
              on content, themes, and genre to inspire your writing.
            </p>
            <p className="text-xs text-muted-foreground">
              Note: Your story content is processed through our secure API and
              temporarily stored for analysis purposes. We do not permanently
              store or share your original content.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
