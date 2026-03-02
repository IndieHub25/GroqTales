'use client';

import { motion } from 'framer-motion';
import {
  BookOpen,
  Eye,
  ImageIcon,
  Loader2,
  RefreshCw,
  Wand2,
} from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import type {
  AdvancedParams,
  CorePromptData,
  StoryMode,
} from '@/hooks/use-creation-wizard';

interface StepPreviewProps {
  mode: StoryMode | null;
  corePrompt: CorePromptData;
  advancedParams: AdvancedParams;
  generatedContent: string | null;
  coverImagePreview: string | null;
  onContentChange: (content: string | null) => void;
  onCoverImageChange: (file: File | null) => void;
  onContentAnalytics?: (length: number) => void;
  errors: string | null;
}

export function StepPreview({
  mode,
  corePrompt,
  advancedParams,
  generatedContent,
  coverImagePreview,
  onContentChange,
  onCoverImageChange,
  onContentAnalytics,
  errors,
}: StepPreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!corePrompt.prompt.trim()) {
      toast({
        title: 'Missing Prompt',
        description: 'Go back to Step 2 and enter a prompt first.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      const payload = {
        prompt: corePrompt.prompt,
        title: corePrompt.title,
        genre: corePrompt.genre,
        description: corePrompt.description,
        mode: mode || 'story',
        ...advancedParams,
      };

      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Generation failed. Please try again.');
      }

      const data = await response.json();
      const content = data.story || data.content || data.result || '';
      onContentChange(content);
      onContentAnalytics?.(content.length);

      toast({
        title: 'Content Generated!',
        description: `Your ${mode === 'comic' ? 'comic' : 'story'} is ready for review.`,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.';
      console.error('Generation error:', err);
      toast({
        title: 'Generation Failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onCoverImageChange(file);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Eye className="h-6 w-6 text-primary" />
          Preview & Refine
        </h2>
        <p className="text-sm text-muted-foreground">
          Generate your {mode === 'comic' ? 'comic' : 'story'} with AI, review
          it, and optionally edit before publishing.
        </p>
      </div>

      {/* Error banner */}
      {errors && (
        <div className="border border-destructive bg-destructive/10 p-3 rounded-md text-sm font-medium text-destructive">
          {errors}
        </div>
      )}

      {/* Generate Button */}
      <div className="flex justify-center gap-3">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !corePrompt.prompt.trim()}
          className="theme-gradient-bg text-lg"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating…
            </>
          ) : generatedContent ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate with AI
            </>
          )}
        </Button>
      </div>

      {/* Generated content preview */}
      {generatedContent ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="border rounded-lg bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                {corePrompt.title || 'Untitled'}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Done Editing' : 'Edit'}
              </Button>
            </div>

            {corePrompt.genre && (
              <span className="comic-badge">{corePrompt.genre}</span>
            )}

            {isEditing ? (
              <Textarea
                value={generatedContent}
                onChange={(e) => onContentChange(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none max-h-[500px] overflow-y-auto border rounded-md bg-muted/30 p-4 whitespace-pre-wrap">
                {generatedContent}
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        !isGenerating && (
          <div className="text-center py-16 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-card">
            <Wand2 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="font-medium text-muted-foreground text-sm">
              Click <span className="font-semibold">Generate with AI</span> to
              create your {mode === 'comic' ? 'comic' : 'story'}.
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Or paste your own content in Step 2 and skip generation.
            </p>
          </div>
        )
      )}

      {/* Cover image upload */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          Cover Image (optional)
        </h3>
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              document.getElementById('wizard-cover-upload')?.click()
            }
            className="font-medium text-xs"
          >
            Choose Image
          </Button>
          <input
            id="wizard-cover-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
        {coverImagePreview && (
          <Image
            src={coverImagePreview}
            alt="Cover preview"
            width={200}
            height={200}
            className="max-w-[200px] border rounded-md object-cover"
          />
        )}
      </div>
    </div>
  );
}
