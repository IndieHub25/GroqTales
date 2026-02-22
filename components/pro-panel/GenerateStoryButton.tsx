'use client';

/**
 * GenerateStoryButton Component
 * Matches reference HTML exactly:
 * - bg-primary (#8a0000) red button
 * - border-[8px] border-black
 * - Offset black shadow (translate-x-4 translate-y-4)
 * - font-marker text-5xl/7xl
 * - -rotate-1 → rotate-0 on hover
 * - Fire icon with pulse animation
 */

import React, { useState } from 'react';
import { useProPanelStore, selectStoryInput, selectParameters } from '@/store/proPanelStore';
import { Flame, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function GenerateStoryButton() {
  const { toast } = useToast();
  const storyInput = useProPanelStore(selectStoryInput);
  const parameters = useProPanelStore(selectParameters);
  const resetStoryInput = useProPanelStore((s) => s.resetStoryInput);

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!storyInput.storyPrompt.trim()) {
      toast({
        title: 'Required',
        description: 'Please enter a story prompt in the "What\'s the Story, Hero?" field above.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          prompt: storyInput.storyPrompt,
          title: storyInput.storyTitle || storyInput.characterName || 'Untitled Story',
          characterName: storyInput.characterName,
          characterBackground: storyInput.characterBackground,
          ageRange: storyInput.ageRange,
          proConfig: parameters,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Generation failed');
      }

      await response.json();

      toast({
        title: 'Story Generated!',
        description: 'Your story has been created successfully.',
      });

      resetStoryInput();
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Reference-style massive red button with offset shadow */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isGenerating || !storyInput.storyPrompt.trim()}
        className="relative group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {/* Black offset shadow */}
        <div className="absolute inset-0 bg-black translate-x-4 translate-y-4" />
        {/* Red button — bg-[#8a0000] for explicit red color */}
        <div className="relative bg-[#8a0000] border-[8px] border-black px-16 py-8 text-white font-marker text-5xl md:text-7xl -rotate-1 group-hover:rotate-0 transition-transform flex items-center gap-6">
          {isGenerating ? (
            <>
              <Loader2 className="w-10 h-10 text-white animate-spin" />
              <span>WORKING...</span>
            </>
          ) : (
            <>
              <span>GENERATE STORY!</span>
              <Flame className="w-14 h-14 text-white animate-pulse" />
            </>
          )}
        </div>
      </button>

      {/* No prompt hint */}
      {!storyInput.storyPrompt.trim() && (
        <p className="text-sm font-condensed uppercase tracking-wider text-gray-500 text-center">
          ↑ Enter a story prompt in the &quot;What&apos;s the Story, Hero?&quot; section above to enable generation
        </p>
      )}
    </div>
  );
}
