'use client';

import { Sparkles } from 'lucide-react';
import React from 'react';

import { genres } from '@/components/genre-selector';
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
import type { CorePromptData, StoryMode } from '@/hooks/use-creation-wizard';

interface StepCorePromptProps {
  mode: StoryMode | null;
  data: CorePromptData;
  onChange: (partial: Partial<CorePromptData>) => void;
  onBlur?: () => void;
  errors: string | null;
  onGenreAnalytics?: (genre: string) => void;
  onPromptAnalytics?: (length: number) => void;
}

export function StepCorePrompt({
  mode,
  data,
  onChange,
  onBlur,
  errors,
  onGenreAnalytics,
  onPromptAnalytics,
}: StepCorePromptProps) {
  const isComic = mode === 'comic';

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          {isComic ? 'Describe Your Comic' : 'Describe Your Story'}
        </h2>
        <p className="text-sm text-muted-foreground">
          Fill in the essentials — title, genre, and a prompt for the AI.
        </p>
      </div>

      {/* Error banner */}
      {errors && (
        <div className="border border-destructive bg-destructive/10 p-3 rounded-md text-sm font-medium text-destructive">
          {errors}
        </div>
      )}

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="wizard-title" className="text-sm font-medium">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="wizard-title"
          placeholder={
            isComic
              ? 'e.g. "Neon Samurai: Tokyo 2099"'
              : 'e.g. "The Last Library on Earth"'
          }
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          onBlur={onBlur}
        />
      </div>

      {/* Genre */}
      <div className="space-y-2">
        <Label htmlFor="wizard-genre" className="text-sm font-medium">
          Genre <span className="text-destructive">*</span>
        </Label>
        <Select
          value={data.genre}
          onValueChange={(val) => {
            onChange({ genre: val });
            onGenreAnalytics?.(val);
          }}
        >
          <SelectTrigger id="wizard-genre">
            <SelectValue placeholder="Select a genre" />
          </SelectTrigger>
          <SelectContent>
            {genres.map((g) => (
              <SelectItem key={g.slug} value={g.slug}>
                <span className="flex items-center gap-2">
                  <span>{g.icon}</span>
                  <span>{g.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Description (optional) */}
      <div className="space-y-2">
        <Label htmlFor="wizard-description" className="text-sm font-medium">
          Short Description
        </Label>
        <Textarea
          id="wizard-description"
          placeholder="A brief summary or logline (optional)"
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          onBlur={onBlur}
          rows={2}
        />
      </div>

      {/* Prompt / content */}
      <div className="space-y-2">
        <Label htmlFor="wizard-prompt" className="text-sm font-medium">
          {isComic ? 'Comic Script / Prompt' : 'Story Prompt / Content'}{' '}
          <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="wizard-prompt"
          placeholder={
            isComic
              ? 'Describe the scene, characters, and dialogue for your comic panels...'
              : 'Write your story or give the AI a detailed prompt to generate it...'
          }
          value={data.prompt}
          onChange={(e) => onChange({ prompt: e.target.value })}
          onBlur={() => {
            onBlur?.();
            if (data.prompt.trim()) {
              onPromptAnalytics?.(data.prompt.trim().length);
            }
          }}
          className="min-h-[200px]"
        />
      </div>
    </div>
  );
}
