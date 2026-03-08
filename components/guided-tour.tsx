'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import styles from '@/styles/guided-tour.module.css';

export interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector
  position?: 'top' | 'bottom' | 'left' | 'right';
  highlightPadding?: number;
  action?: string; // Optional action to perform
}

interface GuidedTourProps {
  steps: TourStep[];
  tourId: string;
  enabled?: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
  autoStart?: boolean;
}

/**
 * GuidedTour Component
 * Provides step-by-step onboarding with spotlight highlights and contextual tooltips
 * Automatically remembers if tour was dismissed (localStorage)
 */
export const GuidedTour: React.FC<GuidedTourProps> = ({
  steps,
  tourId,
  enabled = true,
  onComplete,
  onSkip,
  autoStart = true,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [targetPosition, setTargetPosition] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  // Check if tour has been completed before
  useEffect(() => {
    if (!enabled) return;

    const tourDismissed = localStorage.getItem(`tour-${tourId}`);
    if (!tourDismissed && autoStart && steps.length > 0) {
      setIsActive(true);
    }
  }, [tourId, enabled, autoStart, steps.length]);

  // Update target position on step change
  useEffect(() => {
    if (!isActive || !steps[currentStep]) return;

    const step = steps[currentStep];
    const updatePosition = () => {
      if (step.target) {
        const element = document.querySelector(step.target);
        if (element) {
          const rect = element.getBoundingClientRect();
          const padding = step.highlightPadding ?? 8;

          setTargetPosition({
            top: rect.top - padding,
            left: rect.left - padding,
            width: rect.width + padding * 2,
            height: rect.height + padding * 2,
          });

          // Calculate tooltip position
          const tooltipOffset = 16;
          const position = step.position ?? 'bottom';

          let tooltipTop = rect.top;
          let tooltipLeft = rect.left;

          switch (position) {
            case 'bottom':
              tooltipTop = rect.bottom + tooltipOffset;
              tooltipLeft = rect.left + rect.width / 2;
              break;
            case 'top':
              tooltipTop = rect.top - tooltipOffset - 150;
              tooltipLeft = rect.left + rect.width / 2;
              break;
            case 'left':
              tooltipTop = rect.top + rect.height / 2;
              tooltipLeft = rect.left - tooltipOffset - 320;
              break;
            case 'right':
              tooltipTop = rect.top + rect.height / 2;
              tooltipLeft = rect.right + tooltipOffset;
              break;
          }

          // ── VIEWPORT CLAMPING — prevent tooltip from going off-screen ──
          const tooltipWidth = 340;
          const tooltipHeight = 200;
          const margin = 20;

          // Clamp horizontal
          if (tooltipLeft < margin) tooltipLeft = margin;
          if (tooltipLeft > window.innerWidth - tooltipWidth - margin) {
            tooltipLeft = window.innerWidth - tooltipWidth - margin;
          }
          // Clamp vertical
          if (tooltipTop < margin) tooltipTop = margin;
          if (tooltipTop > window.innerHeight - tooltipHeight - margin) {
            tooltipTop = window.innerHeight - tooltipHeight - margin;
          }

          setTooltipPos({ top: tooltipTop, left: tooltipLeft });
        }
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isActive, currentStep, steps]);

  if (!isActive || !enabled || steps.length === 0) return null;

  const step = steps[currentStep];
  if (!step) return null;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(`tour-${tourId}`, 'true');
    setIsActive(false);
    onComplete?.();
  };

  const handleSkip = () => {
    localStorage.setItem(`tour-${tourId}`, 'true');
    setIsActive(false);
    onSkip?.();
  };

  const handleShowAgain = () => {
    localStorage.removeItem(`tour-${tourId}`);
    setCurrentStep(0);
    setIsActive(true);
  };

  return (
    <>
      {/* Spotlight Overlay */}
      <div className={styles.overlay}>
        {/* Spotlight SVG Mask */}
        {targetPosition && (
          <svg
            className={styles.spotlight}
            width="100%"
            height="100%"
            viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}
          >
            <defs>
              <mask id="spotlight-mask">
                <rect width="100%" height="100%" fill="white" />
                <rect
                  x={targetPosition.left}
                  y={targetPosition.top}
                  width={targetPosition.width}
                  height={targetPosition.height}
                  rx="12"
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="rgba(0, 0, 0, 0.7)"
              mask="url(#spotlight-mask)"
            />
          </svg>
        )}
      </div>

      {/* Tooltip */}
      <div
        className={`${styles.tooltip} ${step.position === 'top' ? styles.tooltipPositionTop :
            step.position === 'left' ? styles.tooltipPositionLeft :
              step.position === 'right' ? styles.tooltipPositionRight :
                styles.tooltipPositionBottom
          }`}
        style={{
          top: `${tooltipPos.top}px`,
          left: `${tooltipPos.left}px`,
        }}
      >
        <div className={styles.tooltipContent}>
          {/* Step Counter */}
          <div className={styles.stepCounter}>
            <span className={styles.current}>{currentStep + 1}</span>
            <span className={styles.separator}>/</span>
            <span className={styles.total}>{steps.length}</span>
          </div>

          {/* Title */}
          <h3 className={styles.title}>{step.title}</h3>

          {/* Description */}
          <p className={styles.description}>{step.description}</p>

          {/* Action Buttons */}
          <div className={styles.actions}>
            {!isFirstStep && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                className={styles.actionButton}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleSkip}
              className={styles.skipButton}
            >
              Skip Tour
            </Button>

            <Button
              size="sm"
              onClick={handleNext}
              className={styles.actionButton}
            >
              {isLastStep ? 'Finish' : 'Next'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className={styles.progressBar}>
            <div
              className={styles.progress}
              style={{
                width: `${((currentStep + 1) / steps.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Close Button */}
        <button
          className={styles.closeButton}
          onClick={handleSkip}
          aria-label="Close tour"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Show Tour Again - appears at bottom after tour completes */}
      {!isActive && (
        <div className={styles.restartPrompt}>
          <button
            className={styles.restartButton}
            onClick={handleShowAgain}
            title="Show guided tour again"
          >
            🎯 Show Tour
          </button>
        </div>
      )}
    </>
  );
};

/**
 * Helper hook to manage guided tour state
 */
export function useGuidedTour(tourId: string) {
  const [isDone, setIsDone] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(`tour-${tourId}`);
  });

  const completeTour = () => {
    localStorage.setItem(`tour-${tourId}`, 'true');
    setIsDone(true);
  };

  const resetTour = () => {
    localStorage.removeItem(`tour-${tourId}`);
    setIsDone(false);
  };

  return { isDone, completeTour, resetTour };
}

/**
 * Predefined tour steps for story creation routes
 */

export const TEXT_STORY_TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Story Creator',
    description: 'Let\'s walk through creating your first text story. You\'ll see a canvas where you can outline your story structure.',
    position: 'bottom',
  },
  {
    id: 'canvas',
    title: 'Story Canvas',
    description: 'This canvas lets you visualize your story\'s structure. You can drag elements around, connect them, and organize your narrative.',
    target: '[data-tour="canvas"]',
    position: 'right',
  },
  {
    id: 'metadata',
    title: 'Story Metadata',
    description: 'Set your story\'s title, genre, and upload a cover image. These details help readers understand your story at a glance.',
    target: '[data-tour="metadata"]',
    position: 'left',
  },
  {
    id: 'editor',
    title: 'Story Content Editor',
    description: 'Write your full story content here. Use the formatting options to enhance your narrative.',
    target: '[data-tour="editor"]',
    position: 'top',
  },
  {
    id: 'save',
    title: 'Save Your Story',
    description: 'When ready, save your story as a draft or publish it to share with the community.',
    target: '[data-tour="save-button"]',
    position: 'top',
  },
];

export const COMIC_TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Comic Creator',
    description: 'Create a comic book story with visual panels, dialogue, and narration. Let\'s get started!',
    position: 'bottom',
  },
  {
    id: 'canvas',
    title: 'Panel Canvas',
    description: 'Arrange your comic panels on the canvas. Drag them to reorder, and they\'ll automatically snap to a grid layout.',
    target: '[data-tour="canvas"]',
    position: 'right',
  },
  {
    id: 'panel-editor',
    title: 'Panel Details',
    description: 'Edit each panel\'s scene description, dialogue, and artist notes. These details guide the cover artist.',
    target: '[data-tour="panel-editor"]',
    position: 'left',
  },
  {
    id: 'publication',
    title: 'Publish & Mint',
    description: 'Once complete, publish your comic and mint it as an NFT to prove ownership and earn rewards.',
    target: '[data-tour="publish-button"]',
    position: 'top',
  },
];

export const AI_STORY_TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to VedaScript Engine',
    description:
      'This is your AI-native writing studio with 70+ tunable parameters for deep narrative control. Let\'s walk through the 3-column workspace.',
    position: 'bottom',
  },
  {
    id: 'canvas',
    title: 'Chapter Structure Canvas',
    description:
      'Your story\'s backbone. Each node is a chapter — add, delete, or rearrange them to plan your narrative flow before writing.',
    target: '[data-tour="canvas"]',
    position: 'right',
    highlightPadding: 12,
  },
  {
    id: 'story-details',
    title: 'Story Details',
    description:
      'Set your title, genre, description, characters, and setting. These inform VedaScript\'s AI when generating content.',
    target: '[data-tour="story-details"]',
    position: 'bottom',
    highlightPadding: 10,
  },
  {
    id: 'parameters',
    title: 'VedaScript Parameters',
    description:
      'The heart of VedaScript — 70+ parameters across 10 categories. Use presets (Minimal, Standard, Advanced, Worldbuilder) for quick setup, or fine-tune each slider and selector individually.',
    target: '[data-tour="parameters"]',
    position: 'right',
    highlightPadding: 10,
  },
  {
    id: 'editor',
    title: 'Story Content Editor',
    description:
      'Write and edit your chapters here. Switch between "Current Chapter" to write and "Compiled Story" to preview the full narrative.',
    target: '[data-tour="editor"]',
    position: 'left',
    highlightPadding: 10,
  },
  {
    id: 'generate',
    title: 'Generate with VedaScript',
    description:
      'Hit this button to generate a chapter using your prompt, parameters, and story context. Each generation builds on your existing story memory.',
    target: '[data-tour="generate-btn"]',
    position: 'top',
    highlightPadding: 8,
  },
  {
    id: 'save-export',
    title: 'Save & Export',
    description:
      'Save your draft anytime, or export the compiled story when you\'re done. Your progress is also saved locally so you can pick up where you left off.',
    target: '[data-tour="save-export"]',
    position: 'bottom',
    highlightPadding: 8,
  },
];

