'use client';

import { useCallback, useRef } from 'react';

import type { WizardStep, WizardState } from './use-creation-wizard';

// ---------------------------------------------------------------------------
// Event types
// ---------------------------------------------------------------------------

export type WizardAnalyticsEvent =
  | 'wizard_started'
  | 'step_entered'
  | 'step_completed'
  | 'step_skipped'
  | 'mode_selected'
  | 'genre_selected'
  | 'prompt_entered'
  | 'advanced_param_changed'
  | 'content_generated'
  | 'preview_viewed'
  | 'publish_started'
  | 'publish_succeeded'
  | 'publish_failed'
  | 'mint_started'
  | 'mint_succeeded'
  | 'mint_failed'
  | 'draft_recovered'
  | 'draft_discarded'
  | 'wizard_abandoned'
  | 'wizard_completed';

interface AnalyticsPayload {
  event: WizardAnalyticsEvent;
  step: WizardStep;
  timestamp: number;
  sessionId: string;
  metadata?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Step labels / names
// ---------------------------------------------------------------------------

export const STEP_LABELS: Record<WizardStep, string> = {
  1: 'Mode Selection',
  2: 'Core Prompt',
  3: 'Advanced Params',
  4: 'Preview',
  5: 'Publish / Mint',
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useWizardAnalytics() {
  const sessionIdRef = useRef(
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `session-${Date.now()}`
  );

  const stepTimersRef = useRef<Record<number, number>>({});

  /**
   * Fire an analytics event. In the real app this would push to your analytics
   * provider (Posthog, Amplitude, Mixpanel, GA4, etc.). For now it logs to the
   * console and optionally sends a beacon to `/api/analytics`.
   */
  const trackEvent = useCallback(
    (
      event: WizardAnalyticsEvent,
      step: WizardStep,
      metadata?: Record<string, unknown>
    ) => {
      const payload: AnalyticsPayload = {
        event,
        step,
        timestamp: Date.now(),
        sessionId: sessionIdRef.current,
        metadata: {
          stepLabel: STEP_LABELS[step],
          ...metadata,
        },
      };

      // Console log for dev
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.debug('[wizard-analytics]', payload);
      }

      // Non-blocking beacon
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        try {
          navigator.sendBeacon(
            '/api/analytics',
            new Blob([JSON.stringify(payload)], {
              type: 'application/json',
            })
          );
        } catch {
          // Silently fail — analytics should never block UX
        }
      }
    },
    []
  );

  /**
   * Call when entering a step — starts a timer for duration tracking.
   */
  const onStepEnter = useCallback(
    (step: WizardStep, state?: WizardState) => {
      stepTimersRef.current[step] = Date.now();
      trackEvent('step_entered', step, {
        mode: state?.mode,
      });
    },
    [trackEvent]
  );

  /**
   * Call when leaving a step — fires duration.
   */
  const onStepExit = useCallback(
    (step: WizardStep, completed: boolean) => {
      const start = stepTimersRef.current[step];
      const durationMs = start ? Date.now() - start : 0;
      trackEvent(completed ? 'step_completed' : 'step_skipped', step, {
        durationMs,
      });
    },
    [trackEvent]
  );

  /**
   * Mode selected in step 1.
   */
  const onModeSelected = useCallback(
    (mode: string) => {
      trackEvent('mode_selected', 1, { mode });
    },
    [trackEvent]
  );

  /**
   * Genre selected in step 2.
   */
  const onGenreSelected = useCallback(
    (genre: string) => {
      trackEvent('genre_selected', 2, { genre });
    },
    [trackEvent]
  );

  /**
   * Prompt entered in step 2.
   */
  const onPromptEntered = useCallback(
    (promptLength: number) => {
      trackEvent('prompt_entered', 2, { promptLength });
    },
    [trackEvent]
  );

  /**
   * Any advanced param changed in step 3.
   */
  const onAdvancedParamChanged = useCallback(
    (param: string, value: unknown) => {
      trackEvent('advanced_param_changed', 3, { param, value });
    },
    [trackEvent]
  );

  /**
   * Content generated / preview loaded in step 4.
   */
  const onContentGenerated = useCallback(
    (contentLength: number) => {
      trackEvent('content_generated', 4, { contentLength });
    },
    [trackEvent]
  );

  /**
   * Publish / mint events in step 5.
   */
  const onPublishStarted = useCallback(
    (format: 'free' | 'nft') => {
      trackEvent(format === 'nft' ? 'mint_started' : 'publish_started', 5, {
        format,
      });
    },
    [trackEvent]
  );

  const onPublishSucceeded = useCallback(
    (format: 'free' | 'nft', hash?: string) => {
      trackEvent(format === 'nft' ? 'mint_succeeded' : 'publish_succeeded', 5, {
        format,
        hash,
      });
    },
    [trackEvent]
  );

  const onPublishFailed = useCallback(
    (format: 'free' | 'nft', error: string) => {
      trackEvent(format === 'nft' ? 'mint_failed' : 'publish_failed', 5, {
        format,
        error,
      });
    },
    [trackEvent]
  );

  const onWizardStarted = useCallback(() => {
    trackEvent('wizard_started', 1);
  }, [trackEvent]);

  const onWizardCompleted = useCallback(() => {
    trackEvent('wizard_completed', 5);
  }, [trackEvent]);

  const onWizardAbandoned = useCallback(
    (step: WizardStep) => {
      trackEvent('wizard_abandoned', step);
    },
    [trackEvent]
  );

  const onDraftRecovered = useCallback(() => {
    trackEvent('draft_recovered', 1);
  }, [trackEvent]);

  const onDraftDiscarded = useCallback(() => {
    trackEvent('draft_discarded', 1);
  }, [trackEvent]);

  return {
    trackEvent,
    onStepEnter,
    onStepExit,
    onModeSelected,
    onGenreSelected,
    onPromptEntered,
    onAdvancedParamChanged,
    onContentGenerated,
    onPublishStarted,
    onPublishSucceeded,
    onPublishFailed,
    onWizardStarted,
    onWizardCompleted,
    onWizardAbandoned,
    onDraftRecovered,
    onDraftDiscarded,
  };
}
