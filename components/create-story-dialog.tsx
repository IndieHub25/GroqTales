'use client';

import {
  PenSquare,
  Sparkles,
  BookMarked,
  ChevronRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CreateStoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CreateOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  gradient: string;
  accentColor: string;
}

const createOptions: CreateOption[] = [
  {
    id: 'ai',
    title: 'AI Story',
    description: 'Co-create with AI using fine-grained controls for prose and comics.',
    icon: <Sparkles className="w-8 h-8" />,
    path: '/create?tab=ai',
    gradient: 'from-blue-500/20 to-purple-500/20',
    accentColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'text',
    title: 'Text Story',
    description: 'Write every word yourself in our distraction-free editor.',
    icon: <PenSquare className="w-8 h-8" />,
    path: '/create?tab=text',
    gradient: 'from-emerald-500/20 to-green-500/20',
    accentColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'comic',
    title: 'Comic Story',
    description: 'Design panel-based comics ready for AI-generated or hand-drawn art.',
    icon: <BookMarked className="w-8 h-8" />,
    path: '/create?tab=comic',
    gradient: 'from-orange-500/20 to-red-500/20',
    accentColor: 'text-orange-600 dark:text-orange-400',
  },
];

export function CreateStoryDialog({ isOpen, onClose }: CreateStoryDialogProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const router = useRouter();

  const handleOptionSelect = (option: CreateOption) => {
    setSelectedOption(option.id);
    
    try {
      // Store the selection in localStorage
      const storyData = {
        type: option.id,
        timestamp: new Date().getTime(),
      };

      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('storyCreationData', JSON.stringify(storyData));
      }

      // Close dialog and navigate
      onClose();

      setTimeout(() => {
        router.push(option.path);
      }, 50);
    } catch (error) {
      console.error('Error navigating to create page:', error);
      if (typeof window !== 'undefined') {
        window.location.href = option.path;
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-8 border border-gray-200 dark:border-gray-800 shadow-lg dark:shadow-2xl bg-white dark:bg-slate-950 text-foreground max-h-[90vh] flex flex-col overflow-hidden rounded-lg">
        <DialogHeader className="text-center space-y-2">
          <DialogTitle className="text-3xl font-bold tracking-tight">
            Create Story
          </DialogTitle>
          <p className="text-gray-600 dark:text-gray-400 text-base">
            Choose your creative path.
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 flex-1">
          {createOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option)}
              className={`relative group h-full min-h-[260px] rounded-lg border border-gray-200 dark:border-gray-700 bg-gradient-to-br ${option.gradient} backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md dark:hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-950
                ${selectedOption === option.id ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-slate-950 shadow-md dark:shadow-xl' : ''}
              `}
              aria-label={`${option.title}: ${option.description}`}
              aria-pressed={selectedOption === option.id}
            >
              {/* Background accent gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 dark:from-slate-900/40 to-transparent dark:to-slate-950/40" />

              {/* Content container */}
              <div className="absolute inset-0 p-6 flex flex-col justify-between">
                {/* Top: Icon */}
                <div className={`flex justify-center ${option.accentColor} group-hover:scale-110 transition-transform duration-300`}>
                  {option.icon}
                </div>

                {/* Middle: Title & Description */}
                <div className="space-y-2 text-center flex-1 flex flex-col justify-center">
                  <h3 className="text-xl font-bold tracking-tight text-foreground">
                    {option.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-tight">
                    {option.description}
                  </p>
                </div>

                {/* Bottom: CTA */}
                <div className={`flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${option.accentColor}`}>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
          All stories are saved as drafts until you choose to publish.
        </p>
      </DialogContent>
    </Dialog>
  );
}
