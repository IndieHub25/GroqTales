'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Cloud,
  CloudOff,
  RotateCcw,
  Save,
} from 'lucide-react';
import React, { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import type { WizardStep } from '@/hooks/use-creation-wizard';
import { useCreationWizard } from '@/hooks/use-creation-wizard';
import { useWizardAnalytics } from '@/hooks/use-wizard-analytics';

import { StepAdvancedParams } from './step-advanced-params';
import { StepCorePrompt } from './step-core-prompt';
import { StepModeSelect } from './step-mode-select';
import { StepPreview } from './step-preview';
import { StepPublish } from './step-publish';
import { WizardStepper } from './wizard-stepper';

interface CreationWizardProps {
  account: string | null;
  initialGenre?: string;
  initialFormat?: 'free' | 'nft';
}

// Slide animation variants
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -200 : 200,
    opacity: 0,
  }),
};

export function CreationWizard({
  account,
  initialGenre,
  initialFormat,
}: CreationWizardProps) {
  const wizard = useCreationWizard(account, {
    genre: initialGenre,
    format: initialFormat,
  });
  const analytics = useWizardAnalytics();
  const { toast } = useToast();

  const prevStepRef = useRef<WizardStep>(wizard.currentStep);
  const hasStartedRef = useRef(false);
  const directionRef = useRef(1);

  // Track wizard start
  useEffect(() => {
    if (wizard.isInitialised && !hasStartedRef.current) {
      hasStartedRef.current = true;
      analytics.onWizardStarted();
      analytics.onStepEnter(wizard.currentStep, wizard.wizardState);
    }
  }, [wizard.isInitialised]); // eslint-disable-line react-hooks/exhaustive-deps

  // Track step transitions
  useEffect(() => {
    const prev = prevStepRef.current;
    if (prev !== wizard.currentStep) {
      directionRef.current = wizard.currentStep > prev ? 1 : -1;
      analytics.onStepExit(prev, true);
      analytics.onStepEnter(wizard.currentStep, wizard.wizardState);
      prevStepRef.current = wizard.currentStep;
    }
  }, [wizard.currentStep]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save on step change
  useEffect(() => {
    void wizard.persistDraft('autosave');
  }, [wizard.currentStep]); // eslint-disable-line react-hooks/exhaustive-deps

  const validation = wizard.getValidation();
  const errors = wizard.getErrors();

  // ─── Draft Recovery Modal ────────────────────────────────────────────
  if (wizard.recoveredDraft) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-card border-4 border-foreground rounded-none p-8 max-w-md w-full shadow-[12px_12px_0px_0px_hsl(var(--foreground))]"
        >
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-400 border-4 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
              <Save className="h-8 w-8 text-foreground" />
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-2">Draft Recovered!</h3>
              <p className="text-sm text-muted-foreground">
                We found a previous draft. Would you like to continue where you
                left off?
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-bold uppercase tracking-widest border-4 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_hsl(var(--foreground))] active:translate-y-0 active:shadow-none transition-all"
                onClick={() => {
                  wizard.restoreRecoveredDraft();
                  analytics.onDraftRecovered();
                  toast({
                    title: 'Draft Restored!',
                    description: 'Your previous work has been recovered.',
                  });
                }}
              >
                Restore
              </button>
              <button
                type="button"
                className="flex-1 px-4 py-3 bg-card text-foreground font-bold uppercase tracking-widest border-4 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_hsl(var(--foreground))] active:translate-y-0 active:shadow-none transition-all"
                onClick={() => {
                  wizard.discardRecoveredDraft();
                  analytics.onDraftDiscarded();
                  toast({
                    title: 'Draft Discarded',
                    description: 'Starting fresh!',
                  });
                }}
              >
                Discard
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Main Wizard ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="container mx-auto px-4 max-w-4xl space-y-6">
        {/* Stepper */}
        <WizardStepper
          currentStep={wizard.currentStep}
          validation={validation}
          onStepClick={(step) => wizard.goToStep(step)}
        />

        {/* Step content card */}
        <div className="comic-container overflow-hidden">
          <div className="pb-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Step {wizard.currentStep} of 5
              </h3>

              {/* Save indicator */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {wizard.isSyncing ? (
                  <>
                    <Cloud className="h-3.5 w-3.5 animate-pulse" />
                    Syncing…
                  </>
                ) : wizard.syncError ? (
                  <>
                    <CloudOff className="h-3.5 w-3.5 text-amber-600" />
                    Local only
                  </>
                ) : wizard.lastSavedAt ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    Saved {new Date(wizard.lastSavedAt).toLocaleTimeString()}
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <div className="pt-4">
            <AnimatePresence mode="wait" custom={directionRef.current}>
              <motion.div
                key={wizard.currentStep}
                custom={directionRef.current}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                {/* ── Step 1: Mode ───────────────── */}
                {wizard.currentStep === 1 && (
                  <StepModeSelect
                    selectedMode={wizard.wizardState.mode}
                    onSelect={(mode) => {
                      wizard.setMode(mode);
                      analytics.onModeSelected(mode);
                    }}
                    onAnalytics={analytics.onModeSelected}
                  />
                )}

                {/* ── Step 2: Core Prompt ────────── */}
                {wizard.currentStep === 2 && (
                  <StepCorePrompt
                    mode={wizard.wizardState.mode}
                    data={wizard.wizardState.corePrompt}
                    onChange={wizard.setCorePrompt}
                    onBlur={() => void wizard.persistDraft('blur')}
                    errors={errors.step2}
                    onGenreAnalytics={analytics.onGenreSelected}
                    onPromptAnalytics={analytics.onPromptEntered}
                  />
                )}

                {/* ── Step 3: Advanced Params ────── */}
                {wizard.currentStep === 3 && (
                  <StepAdvancedParams
                    mode={wizard.wizardState.mode}
                    params={wizard.wizardState.advancedParams}
                    onChange={wizard.setAdvancedParams}
                    onParamAnalytics={analytics.onAdvancedParamChanged}
                  />
                )}

                {/* ── Step 4: Preview ────────────── */}
                {wizard.currentStep === 4 && (
                  <StepPreview
                    mode={wizard.wizardState.mode}
                    corePrompt={wizard.wizardState.corePrompt}
                    advancedParams={wizard.wizardState.advancedParams}
                    generatedContent={wizard.wizardState.generatedContent}
                    coverImagePreview={wizard.wizardState.coverImagePreview}
                    onContentChange={wizard.setGeneratedContent}
                    onCoverImageChange={wizard.setCoverImage}
                    onContentAnalytics={analytics.onContentGenerated}
                    errors={errors.step4}
                  />
                )}

                {/* ── Step 5: Publish ────────────── */}
                {wizard.currentStep === 5 && (
                  <StepPublish
                    mode={wizard.wizardState.mode}
                    corePrompt={wizard.wizardState.corePrompt}
                    generatedContent={wizard.wizardState.generatedContent}
                    coverImageFile={wizard.wizardState.coverImageFile}
                    publishFormat={wizard.wizardState.publishFormat}
                    onPublishFormatChange={wizard.setPublishFormat}
                    onPublishStarted={analytics.onPublishStarted}
                    onPublishSucceeded={analytics.onPublishSucceeded}
                    onPublishFailed={analytics.onPublishFailed}
                    onWizardCompleted={analytics.onWizardCompleted}
                    onDraftClear={wizard.resetWizard}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {wizard.currentStep > 1 && (
              <button
                type="button"
                onClick={wizard.goPrev}
                className="comic-button-secondary flex items-center text-sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                wizard.resetWizard();
                toast({
                  title: 'Wizard Reset',
                  description: 'All progress has been cleared.',
                });
              }}
              className="px-3 py-2 text-xs font-medium text-muted-foreground border rounded-md hover:bg-muted transition-all flex items-center"
            >
              <RotateCcw className="mr-1 h-3.5 w-3.5" />
              Reset
            </button>

            {wizard.currentStep < 5 && (
              <button
                type="button"
                onClick={wizard.goNext}
                disabled={!wizard.canGoNext()}
                className={`comic-button flex items-center text-sm ${!wizard.canGoNext() ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
