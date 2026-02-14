'use client';

import {
  PenSquare,
  Camera,
  Palette,
  BookText,
  Coins,
  BookOpen,
  ChevronLeft,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { genres } from '@/components/genre-selector';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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
}
const createOptions: CreateOption[] = [
  {
    id: 'ai',
    title: 'AI Story',
    description: 'Create a story with AI assistance',
    icon: <BookText className="w-5 h-5" />,
    path: '/create/ai-story',
  },
  {
    id: 'text',
    title: 'Text Story',
    description: 'Create a story with your own writing',
    icon: <PenSquare className="w-5 h-5" />,
    path: '/create',
  },
  {
    id: 'image',
    title: 'Image Story',
    description: 'Create a story with images',
    icon: <Camera className="w-5 h-5" />,
    path: '/create',
  },
];

export function CreateStoryDialog({ isOpen, onClose }: CreateStoryDialogProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedFormat, setSelectedFormat] = useState<string>('free');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const router = useRouter();

  const handleOptionSelect = (option: CreateOption) => {
    setSelectedOption(option.id);
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
    setSelectedOption(null);
  };

  const handleFormatChange = (value: string) => {
    setSelectedFormat(value);
  };

  const handleGenreChange = (value: string) => {
    setSelectedGenre(value);
  };

  const handleContinue = () => {
    if (!selectedOption) return;

    // Create a path based on the selections
    let path = '/create';

    if (selectedOption === 'ai') {
      path = '/create/ai-story';
    }
    try {
      // Store the selection in localStorage with stringified JSON
      const storyData = {
        type: selectedOption,
        format: selectedFormat,
        genre: selectedGenre,
        timestamp: new Date().getTime(),
      };

      // Store to localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('storyCreationData', JSON.stringify(storyData));

        // Verify the data was saved correctly
        const savedData = localStorage.getItem('storyCreationData');
        if (!savedData) {
          throw new Error('Failed to save story creation data');
        }
      }
      console.log('Story creation data saved successfully:', storyData);

      // Close the dialog first to avoid UI issues
      onClose();

      // Force a slight delay to ensure the dialog is closed
      // and localStorage is updated before navigation
      setTimeout(() => {
        console.log('Navigating to:', path);
        // Use router.push with { forceOptimisticNavigation: true } for more reliable navigation
        router.push(path);
      }, 100); // Increased delay for more reliability
    } catch (error) {
      console.error('Error saving data or navigating:', error);
      // Show an error through toast notification if available
      if (typeof window !== 'undefined') {
        alert('Error creating story. Please try again.');
      }
      // Try direct navigation as fallback
      if (typeof window !== 'undefined') {
        window.location.href = path;
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-white max-h-[90vh] flex flex-col overflow-hidden" aria-describedby="create-story-description">
        <DialogHeader className="p-6 pb-2 text-left sm:text-left items-start space-y-0">
          <DialogTitle className="flex items-center gap-4 text-2xl font-black uppercase italic tracking-tight">
            <div className="flex items-center justify-center w-10 h-10 bg-black text-white shrink-0" aria-hidden="true">
              <PenSquare className="w-6 h-6" />
            </div>
            <span>{currentStep === 1 ? 'Create Story' : 'Story Details'}</span>
            {currentStep === 2 && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Go back to story type selection"
                className="h-8 w-8 ml-auto border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0"
                onClick={handleBack}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        {currentStep === 1 && (
          <div className="flex flex-col gap-4 p-6 pt-2 overflow-y-auto custom-scrollbar">
            <p id="create-story-description" className="text-sm font-bold text-muted-foreground uppercase mb-2">
              Choose your creative path:
            </p>
            {createOptions.map((option) => (
              <Button
                key={option.id}
                variant="outline"
                aria-label={`${option.title}: ${option.description}`}
                aria-pressed={selectedOption === option.id}
                className={`w-full h-auto p-4 justify-start gap-5 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none whitespace-normal text-left transition-all bg-white ${selectedOption === option.id
                    ? 'bg-primary/10 border-primary ring-2 ring-primary ring-inset'
                    : ''
                  }`}
                onClick={() => handleOptionSelect(option)}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-none bg-black text-white shrink-0 border-2 border-white/20 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" aria-hidden="true">
                  {React.cloneElement(option.icon as React.ReactElement, {
                    className: 'w-6 h-6',
                    color: 'white',
                    strokeWidth: 2.5,
                  })}
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-black uppercase leading-none">
                    {option.title}
                  </h3>
                  <p className="text-xs font-bold text-muted-foreground uppercase leading-tight">
                    {option.description}
                  </p>
                </div>
              </Button>
            ))}
          </div>
        )}

        {currentStep === 2 && (
          <div className="flex flex-col gap-6 p-6 pt-2 overflow-y-auto custom-scrollbar flex-1">
            <div className="space-y-4">
              <h3 className="font-black text-lg uppercase italic tracking-tight">
                1. Story Format
              </h3>
              <RadioGroup
                defaultValue={selectedFormat}
                onValueChange={handleFormatChange}
                className="grid grid-cols-2 gap-4"
              >
                <div
                  className={`flex items-center space-x-3 border-4 border-black p-4 cursor-pointer hover:bg-black/5 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${selectedFormat === 'free' ? 'bg-primary/5 border-primary' : ''}`}
                >
                  <RadioGroupItem
                    value="free"
                    id="free"
                    className="border-2 border-black"
                  />
                  <Label
                    htmlFor="free"
                    className="flex flex-col cursor-pointer"
                  >
                    <span className="font-black uppercase text-sm">Free</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      Public
                    </span>
                  </Label>
                </div>
                <div
                  className={`flex items-center space-x-3 border-4 border-black p-4 cursor-pointer hover:bg-black/5 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${selectedFormat === 'nft' ? 'bg-primary/5 border-primary' : ''}`}
                >
                  <RadioGroupItem
                    value="nft"
                    id="nft"
                    className="border-2 border-black"
                  />
                  <Label htmlFor="nft" className="flex flex-col cursor-pointer">
                    <span className="font-black uppercase text-sm">NFT</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      Mintable
                    </span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <h3 className="font-black text-lg uppercase italic tracking-tight">
                2. Choose Genre
              </h3>
              <div className="grid grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-2 pb-2 custom-scrollbar">
                {genres.map((genre) => (
                  <button
                    type="button"
                    key={genre.slug}
                    onClick={() => handleGenreChange(genre.slug)}
                    className={`border-4 border-black p-4 cursor-pointer hover:bg-black/5 flex items-center space-x-3 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none w-full text-left ${selectedGenre === genre.slug
                        ? 'bg-primary/10 border-primary shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-[2px] translate-y-[2px]'
                        : ''
                      }`}
                  >
                    <div className="text-2xl shrink-0">{genre.icon}</div>
                    <span className="text-xs font-black uppercase tracking-tighter">
                      {genre.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-2 pb-2">
              <Button
                onClick={handleContinue}
                disabled={!selectedGenre}
                className={`w-full h-14 text-lg font-black uppercase italic tracking-widest border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all ${!selectedGenre
                    ? 'bg-gray-200 text-gray-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-y-0 opacity-100 cursor-not-allowed'
                    : 'bg-primary text-white hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none'
                  }`}
              >
                Go to Editor!
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
