'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import React from 'react';

import type { WizardStep, WizardValidation } from '@/hooks/use-creation-wizard';
import { STEP_LABELS } from '@/hooks/use-wizard-analytics';
import { cn } from '@/lib/utils';

interface WizardStepperProps {
  currentStep: WizardStep;
  validation: WizardValidation;
  onStepClick: (step: WizardStep) => void;
}

const STEPS: WizardStep[] = [1, 2, 3, 4, 5];

export function WizardStepper({
  currentStep,
  validation,
  onStepClick,
}: WizardStepperProps) {
  const progressValue = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="w-full space-y-4">
      {/* Progress bar */}
      <div className="w-full h-3 border-2 border-foreground/20 rounded-full bg-muted">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${progressValue}%` }}
        />
      </div>

      {/* Step indicators */}
      <nav
        aria-label="Wizard steps"
        className="flex items-center justify-between"
      >
        {STEPS.map((step) => {
          const isActive = step === currentStep;
          const isCompleted =
            step < currentStep &&
            validation[`step${step}` as keyof WizardValidation];
          const isAccessible =
            step <= currentStep ||
            STEPS.slice(0, step - 1).every(
              (s) => validation[`step${s}` as keyof WizardValidation]
            );
          const label = STEP_LABELS[step];

          return (
            <button
              key={step}
              type="button"
              disabled={!isAccessible}
              onClick={() => {
                if (isAccessible) onStepClick(step);
              }}
              className={cn(
                'group flex flex-col items-center gap-1.5 outline-none',
                isAccessible
                  ? 'cursor-pointer'
                  : 'cursor-not-allowed opacity-40'
              )}
              aria-current={isActive ? 'step' : undefined}
              aria-label={`Step ${step}: ${label}`}
            >
              {/* Circle */}
              <motion.div
                layout
                className={cn(
                  'relative flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all',
                  isActive
                    ? 'bg-primary border-primary shadow-md'
                    : isCompleted
                      ? 'bg-green-500 text-white border-green-700'
                      : 'bg-card text-primary border-muted-foreground',
                  isAccessible &&
                    !isActive &&
                    'group-hover:bg-primary/10 group-hover:border-primary'
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span>{step}</span>
                )}
              </motion.div>

              {/* Label — hide on small screens */}
              <span
                className={cn(
                  'hidden sm:block text-[10px] font-semibold uppercase tracking-tighter text-center max-w-[80px]',
                  isActive
                    ? 'text-primary'
                    : isCompleted
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-muted-foreground'
                )}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
