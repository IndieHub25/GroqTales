'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  clearDraftRecord,
  createDraftKey,
  DraftSaveReason,
  getDraftRecord,
  getLatestDraftRecord,
  migrateLegacyDraftToRecord,
  saveDraftSnapshot,
  setActiveDraftKey,
  StoryDraftRecord,
  StoryDraftSnapshot,
  StoryDraftVersion,
  upsertDraftRecord,
} from '@/lib/story-draft-manager';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type WizardStep = 1 | 2 | 3 | 4 | 5;

export type StoryMode = 'story' | 'comic';

export interface CorePromptData {
  title: string;
  description: string;
  genre: string;
  prompt: string;
}

export interface AdvancedParams {
  storyLength: string;
  narrativeVoice: string;
  tone: string;
  writingStyle: string;
  timePeriod: string;
  locationType: string;
  pacing: string;
  endingType: string;
  temperature: number;
  modelSelection: string;
  // Comic-specific
  panelLayout: string;
  artStyle: string;
}

export interface WizardState {
  mode: StoryMode | null;
  corePrompt: CorePromptData;
  advancedParams: AdvancedParams;
  generatedContent: string | null;
  coverImageFile: File | null;
  coverImagePreview: string | null;
  publishFormat: 'free' | 'nft';
}

export interface WizardValidation {
  step1: boolean;
  step2: boolean;
  step3: boolean;
  step4: boolean;
  step5: boolean;
}

export interface WizardErrors {
  step1: string | null;
  step2: string | null;
  step3: string | null;
  step4: string | null;
  step5: string | null;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const EMPTY_CORE_PROMPT: CorePromptData = {
  title: '',
  description: '',
  genre: '',
  prompt: '',
};

const DEFAULT_ADVANCED_PARAMS: AdvancedParams = {
  storyLength: 'medium',
  narrativeVoice: '',
  tone: '',
  writingStyle: '',
  timePeriod: '',
  locationType: '',
  pacing: 'moderate',
  endingType: '',
  temperature: 0.7,
  modelSelection: 'default',
  panelLayout: '3x3',
  artStyle: 'manga',
};

const INITIAL_STATE: WizardState = {
  mode: null,
  corePrompt: EMPTY_CORE_PROMPT,
  advancedParams: DEFAULT_ADVANCED_PARAMS,
  generatedContent: null,
  coverImageFile: null,
  coverImagePreview: null,
  publishFormat: 'free',
};

const AUTOSAVE_INTERVAL_MS = 8_000;
const MAX_DRAFT_VERSIONS = 5;
const WIZARD_STATE_KEY = 'groqtales_wizard_state_v1';
const DRAFT_SYNC_ENDPOINT = '/api/v1/drafts';
const DRAFT_SYNC_TIMEOUT_MS = 10_000;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface WizardInitialValues {
  genre?: string;
  format?: 'free' | 'nft';
}

export function useCreationWizard(
  account: string | null,
  initialValues?: WizardInitialValues
) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [wizardState, setWizardState] = useState<WizardState>(() => {
    const base = { ...INITIAL_STATE };
    if (initialValues?.genre) {
      base.corePrompt = { ...base.corePrompt, genre: initialValues.genre };
    }
    if (initialValues?.format) {
      base.publishFormat = initialValues.format;
    }
    return base;
  });
  const [draftKey, setDraftKey] = useState('');
  const [draftVersions, setDraftVersions] = useState<StoryDraftVersion[]>([]);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [isInitialised, setIsInitialised] = useState(false);
  const [recoveredDraft, setRecoveredDraft] = useState<StoryDraftRecord | null>(
    null
  );

  const stateRef = useRef(wizardState);
  const latestSigRef = useRef('');
  const draftKeyRef = useRef(draftKey);

  useEffect(() => {
    stateRef.current = wizardState;
  }, [wizardState]);
  useEffect(() => {
    draftKeyRef.current = draftKey;
  }, [draftKey]);

  // -------------------------------------------------------------------------
  // Validation
  // -------------------------------------------------------------------------

  const getValidation = useCallback((): WizardValidation => {
    const s = stateRef.current;
    return {
      step1: s.mode !== null,
      step2:
        s.corePrompt.title.trim().length > 0 &&
        s.corePrompt.genre.trim().length > 0 &&
        s.corePrompt.prompt.trim().length > 0,
      step3: true, // all advanced params are optional
      step4:
        s.generatedContent !== null && s.generatedContent.trim().length > 0,
      step5: true,
    };
  }, []);

  const getErrors = useCallback((): WizardErrors => {
    const s = stateRef.current;
    return {
      step1: s.mode === null ? 'Please choose a mode to continue.' : null,
      step2: !s.corePrompt.title.trim()
        ? 'Title is required.'
        : !s.corePrompt.genre.trim()
          ? 'Select a genre.'
          : !s.corePrompt.prompt.trim()
            ? 'Enter a prompt or story content.'
            : null,
      step3: null,
      step4: !s.generatedContent?.trim()
        ? 'Generate or write your story content first.'
        : null,
      step5: null,
    };
  }, []);

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------

  const canGoNext = useCallback((): boolean => {
    const v = getValidation();
    const key = `step${currentStep}` as keyof WizardValidation;
    return v[key];
  }, [currentStep, getValidation]);

  const goNext = useCallback(() => {
    if (currentStep < 5 && canGoNext()) {
      setCurrentStep((s) => (s + 1) as WizardStep);
    }
  }, [currentStep, canGoNext]);

  const goPrev = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((s) => (s - 1) as WizardStep);
    }
  }, [currentStep]);

  const goToStep = useCallback(
    (step: WizardStep) => {
      // Allow going backwards or to a step whose prereqs are met
      if (step <= currentStep) {
        setCurrentStep(step);
        return;
      }
      // Check all intermediate steps are valid
      const v = getValidation();
      for (let i = 1; i < step; i++) {
        const key = `step${i}` as keyof WizardValidation;
        if (!v[key]) return;
      }
      setCurrentStep(step);
    },
    [currentStep, getValidation]
  );

  // -------------------------------------------------------------------------
  // State setters (per field)
  // -------------------------------------------------------------------------

  const setMode = useCallback((mode: StoryMode) => {
    setWizardState((prev) => ({ ...prev, mode }));
  }, []);

  const setCorePrompt = useCallback((partial: Partial<CorePromptData>) => {
    setWizardState((prev) => ({
      ...prev,
      corePrompt: { ...prev.corePrompt, ...partial },
    }));
  }, []);

  const setAdvancedParams = useCallback((partial: Partial<AdvancedParams>) => {
    setWizardState((prev) => ({
      ...prev,
      advancedParams: { ...prev.advancedParams, ...partial },
    }));
  }, []);

  const setGeneratedContent = useCallback((content: string | null) => {
    setWizardState((prev) => ({ ...prev, generatedContent: content }));
  }, []);

  const setCoverImage = useCallback((file: File | null) => {
    setWizardState((prev) => ({
      ...prev,
      coverImageFile: file,
      coverImagePreview: file ? URL.createObjectURL(file) : null,
    }));
  }, []);

  const setPublishFormat = useCallback((format: 'free' | 'nft') => {
    setWizardState((prev) => ({ ...prev, publishFormat: format }));
  }, []);

  // -------------------------------------------------------------------------
  // Progressive save  (localStorage + optional backend)
  // -------------------------------------------------------------------------

  const createSnapshotFromState = useCallback(
    (state: WizardState): StoryDraftSnapshot => ({
      title: state.corePrompt.title,
      description: state.corePrompt.description,
      genre: state.corePrompt.genre,
      content: state.generatedContent || state.corePrompt.prompt,
      coverImageName: state.coverImageFile?.name || '',
      updatedAt: Date.now(),
      version: 1,
    }),
    []
  );

  const syncDraftToBackend = useCallback(
    async (snapshot: StoryDraftSnapshot, reason: DraftSaveReason) => {
      const key = draftKeyRef.current;
      if (!key) return;
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setSyncError('Offline — draft saved locally.');
        return;
      }
      try {
        setIsSyncing(true);
        setSyncError(null);
        const ctrl = new AbortController();
        const tid = window.setTimeout(
          () => ctrl.abort(),
          DRAFT_SYNC_TIMEOUT_MS
        );
        const resp = await fetch(DRAFT_SYNC_ENDPOINT, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          signal: ctrl.signal,
          body: JSON.stringify({
            draftKey: key,
            storyType: stateRef.current.mode || 'story',
            storyFormat: stateRef.current.publishFormat || 'free',
            ownerWallet: account || null,
            ownerRole: account ? 'wallet' : 'admin',
            snapshot,
            saveReason: reason,
            maxVersions: MAX_DRAFT_VERSIONS,
          }),
        }).finally(() => window.clearTimeout(tid));
        if (!resp.ok) throw new Error('Sync failed');
        const payload = await resp.json();
        const remote = payload?.draft as StoryDraftRecord | undefined;
        if (remote) {
          const saved = upsertDraftRecord(remote);
          setDraftVersions(saved.versions);
          setLastSavedAt(saved.updatedAt);
        }
      } catch {
        setSyncError('Draft saved locally. Cloud sync unavailable.');
      } finally {
        setIsSyncing(false);
      }
    },
    [account]
  );

  const persistDraft = useCallback(
    async (reason: DraftSaveReason, force = false) => {
      const key = draftKeyRef.current;
      if (!key) return;
      const state = stateRef.current;
      const snapshot = createSnapshotFromState(state);
      const sig = JSON.stringify([
        snapshot.title,
        snapshot.description,
        snapshot.genre,
        snapshot.content,
        snapshot.coverImageName,
      ]);
      if (!force && reason === 'autosave' && sig === latestSigRef.current)
        return;
      latestSigRef.current = sig;

      const localDraft = saveDraftSnapshot({
        draftKey: key,
        storyType: state.mode || 'story',
        storyFormat: state.publishFormat || 'free',
        snapshot,
        reason,
        maxVersions: MAX_DRAFT_VERSIONS,
      });
      setDraftVersions(localDraft.versions);
      setLastSavedAt(localDraft.updatedAt);
      setActiveDraftKey(key);

      // Also save wizard-specific state (mode, advanced params, step) to localStorage
      try {
        localStorage.setItem(
          WIZARD_STATE_KEY,
          JSON.stringify({
            mode: state.mode,
            advancedParams: state.advancedParams,
            publishFormat: state.publishFormat,
            currentStep,
            generatedContent: state.generatedContent,
          })
        );
      } catch {
        // localStorage may be unavailable
      }

      await syncDraftToBackend(snapshot, reason);
    },
    [createSnapshotFromState, currentStep, syncDraftToBackend]
  );

  // -------------------------------------------------------------------------
  // Autosave interval
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (!draftKey) return;
    const id = window.setInterval(() => {
      void persistDraft('autosave');
    }, AUTOSAVE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [draftKey, persistDraft]);

  // Save on blur / visibility change
  useEffect(() => {
    if (!draftKey) return;
    const onVisChange = () => {
      if (document.visibilityState === 'hidden')
        void persistDraft('blur', true);
    };
    const onUnload = () => void persistDraft('blur', true);
    document.addEventListener('visibilitychange', onVisChange);
    window.addEventListener('beforeunload', onUnload);
    return () => {
      document.removeEventListener('visibilitychange', onVisChange);
      window.removeEventListener('beforeunload', onUnload);
    };
  }, [draftKey, persistDraft]);

  // -------------------------------------------------------------------------
  // Initialisation — restore from draft store + localStorage wizard state
  // -------------------------------------------------------------------------

  useEffect(() => {
    const key = createDraftKey('wizard');
    setDraftKey(key);
    setActiveDraftKey(key);

    // Try restoring wizard-specific state
    try {
      const raw = localStorage.getItem(WIZARD_STATE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setWizardState((prev) => ({
          ...prev,
          mode: parsed.mode ?? prev.mode,
          advancedParams: { ...prev.advancedParams, ...parsed.advancedParams },
          publishFormat: parsed.publishFormat ?? prev.publishFormat,
          generatedContent: parsed.generatedContent ?? prev.generatedContent,
        }));
        if (parsed.currentStep) {
          setCurrentStep(parsed.currentStep as WizardStep);
        }
      }
    } catch {
      // Ignore corrupt localStorage data
    }

    // Try restoring draft content
    const fallback = getLatestDraftRecord();
    const migrated = migrateLegacyDraftToRecord({
      draftKey: key,
      storyType: 'story',
      storyFormat: 'free',
    });
    const local = getDraftRecord(key) || migrated || fallback;
    if (local) {
      setDraftVersions(local.versions);
      setLastSavedAt(local.updatedAt);
      if (
        local.current.title.trim() ||
        local.current.content.trim() ||
        local.current.genre.trim()
      ) {
        setRecoveredDraft(local);
      }
    }

    setIsInitialised(true);
  }, []);

  const restoreRecoveredDraft = useCallback(() => {
    if (!recoveredDraft) return;
    const c = recoveredDraft.current;
    setWizardState((prev) => ({
      ...prev,
      corePrompt: {
        title: c.title,
        description: c.description,
        genre: c.genre,
        prompt: c.content,
      },
    }));
    setDraftVersions(recoveredDraft.versions);
    setLastSavedAt(recoveredDraft.updatedAt);
    setRecoveredDraft(null);
  }, [recoveredDraft]);

  const discardRecoveredDraft = useCallback(() => {
    if (draftKey) {
      clearDraftRecord(draftKey);
      setActiveDraftKey(null);
    }
    setRecoveredDraft(null);
    setDraftVersions([]);
    setLastSavedAt(null);
  }, [draftKey]);

  // -------------------------------------------------------------------------
  // Reset
  // -------------------------------------------------------------------------

  const resetWizard = useCallback(() => {
    setWizardState(INITIAL_STATE);
    setCurrentStep(1);
    if (draftKey) {
      clearDraftRecord(draftKey);
      setActiveDraftKey(null);
    }
    try {
      localStorage.removeItem(WIZARD_STATE_KEY);
    } catch {
      // Ignore localStorage errors during cleanup
    }
  }, [draftKey]);

  // -------------------------------------------------------------------------
  // Return
  // -------------------------------------------------------------------------

  return {
    // Step navigation
    currentStep,
    goNext,
    goPrev,
    goToStep,
    canGoNext,
    getValidation,
    getErrors,

    // State
    wizardState,
    setMode,
    setCorePrompt,
    setAdvancedParams,
    setGeneratedContent,
    setCoverImage,
    setPublishFormat,

    // Draft
    draftKey,
    draftVersions,
    lastSavedAt,
    isSyncing,
    syncError,
    persistDraft,

    // Recovery
    isInitialised,
    recoveredDraft,
    restoreRecoveredDraft,
    discardRecoveredDraft,

    // Reset
    resetWizard,
  };
}
