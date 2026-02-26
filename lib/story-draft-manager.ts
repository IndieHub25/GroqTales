export type DraftSaveReason = 'autosave' | 'blur' | 'manual' | 'restore';

export interface StoryDraftSnapshot {
  title: string;
  description: string;
  genre: string;
  content: string;
  coverImageName?: string;
  updatedAt: number;
  version: number;
}

export interface StoryDraftVersion extends StoryDraftSnapshot {
  id: string;
  reason: DraftSaveReason;
}

export interface StoryDraftAiMetadata {
  pipelineState: 'idle' | 'ready' | 'processing';
  suggestedEdits: string[];
  lastEditedByAIAt?: number;
}

export interface StoryDraftRecord {
  draftKey: string;
  storyType: string;
  storyFormat: string;
  current: StoryDraftSnapshot;
  versions: StoryDraftVersion[];
  createdAt: number;
  updatedAt: number;
  aiMetadata: StoryDraftAiMetadata;
}

interface StoryDraftStore {
  activeDraftKey: string | null;
  drafts: Record<string, StoryDraftRecord>;
}

const DRAFT_STORE_KEY = 'groqtales_story_drafts_store_v1';
const LEGACY_DRAFT_KEY = 'groqtales_text_story_draft_v1';
const DEFAULT_MAX_VERSIONS = 5;

function createEmptyStore(): StoryDraftStore {
  return {
    activeDraftKey: null,
    drafts: {},
  };
}

function hasStorage(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function readStore(): StoryDraftStore {
  if (!hasStorage()) {
    return createEmptyStore();
  }

  try {
    const raw = localStorage.getItem(DRAFT_STORE_KEY);
    if (!raw) {
      return createEmptyStore();
    }

    const parsed = JSON.parse(raw) as StoryDraftStore;
    return {
      activeDraftKey: parsed.activeDraftKey ?? null,
      drafts: parsed.drafts ?? {},
    };
  } catch {
    return createEmptyStore();
  }
}

function writeStore(store: StoryDraftStore): void {
  if (!hasStorage()) {
    return;
  }

  try {
    localStorage.setItem(DRAFT_STORE_KEY, JSON.stringify(store));
  } catch (error) {
    console.warn('[story-draft-manager] Failed to persist draft store:', error);
  }
}

function hasMeaningfulContent(snapshot: StoryDraftSnapshot): boolean {
  return Boolean(
    snapshot.title.trim() ||
      snapshot.description.trim() ||
      snapshot.genre.trim() ||
      snapshot.content.trim() ||
      snapshot.coverImageName
  );
}

function isDifferentSnapshot(
  previous: StoryDraftSnapshot,
  next: StoryDraftSnapshot
): boolean {
  return (
    previous.title !== next.title ||
    previous.description !== next.description ||
    previous.genre !== next.genre ||
    previous.content !== next.content ||
    previous.coverImageName !== next.coverImageName
  );
}

function createVersionFromSnapshot(
  snapshot: StoryDraftSnapshot,
  reason: DraftSaveReason
): StoryDraftVersion {
  return {
    ...snapshot,
    id: createVersionId(),
    reason,
  };
}

function createVersionId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  return `version-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

function normalizeVersionCount(maxVersions?: number): number {
  if (!maxVersions || Number.isNaN(maxVersions)) {
    return DEFAULT_MAX_VERSIONS;
  }
  return Math.max(1, Math.min(20, Math.floor(maxVersions)));
}

function cloneRecord(record: StoryDraftRecord): StoryDraftRecord {
  return JSON.parse(JSON.stringify(record)) as StoryDraftRecord;
}

export function createDraftKey(prefix: string = 'text-story'): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

export function getActiveDraftKey(): string | null {
  return readStore().activeDraftKey ?? null;
}

export function setActiveDraftKey(draftKey: string | null): void {
  const store = readStore();
  store.activeDraftKey = draftKey;
  writeStore(store);
}

export function getDraftRecord(draftKey: string): StoryDraftRecord | null {
  const store = readStore();
  const draft = store.drafts[draftKey];
  return draft ? cloneRecord(draft) : null;
}

export function getLatestDraftRecord(
  filter?: (record: StoryDraftRecord) => boolean
): StoryDraftRecord | null {
  const store = readStore();
  const drafts = Object.values(store.drafts)
    .filter((record) => (filter ? filter(record) : true))
    .sort((a, b) => b.updatedAt - a.updatedAt);

  if (drafts.length === 0) {
    return null;
  }

  const [latest] = drafts;
  return latest ? cloneRecord(latest) : null;
}

export function upsertDraftRecord(record: StoryDraftRecord): StoryDraftRecord {
  const store = readStore();
  const cloned = cloneRecord(record);
  store.drafts[record.draftKey] = cloned;
  store.activeDraftKey = record.draftKey;
  writeStore(store);
  return cloneRecord(cloned);
}

export function saveDraftSnapshot(params: {
  draftKey: string;
  storyType: string;
  storyFormat: string;
  snapshot: StoryDraftSnapshot;
  reason?: DraftSaveReason;
  maxVersions?: number;
}): StoryDraftRecord {
  const {
    draftKey,
    storyType,
    storyFormat,
    snapshot,
    reason = 'autosave',
    maxVersions,
  } = params;
  const versionLimit = normalizeVersionCount(maxVersions);
  const now = Date.now();
  const store = readStore();
  const existing = store.drafts[draftKey];

  const normalizedSnapshot: StoryDraftSnapshot = {
    ...snapshot,
    updatedAt: snapshot.updatedAt || now,
    version: existing ? existing.current.version + 1 : 1,
  };

  if (!existing) {
    const created: StoryDraftRecord = {
      draftKey,
      storyType,
      storyFormat,
      current: normalizedSnapshot,
      versions: [],
      createdAt: now,
      updatedAt: normalizedSnapshot.updatedAt,
      aiMetadata: {
        pipelineState: 'ready',
        suggestedEdits: [],
      },
    };
    store.drafts[draftKey] = created;
    store.activeDraftKey = draftKey;
    writeStore(store);
    return cloneRecord(created);
  }

  const nextVersions = [...existing.versions];
  if (
    hasMeaningfulContent(existing.current) &&
    isDifferentSnapshot(existing.current, normalizedSnapshot)
  ) {
    nextVersions.unshift(createVersionFromSnapshot(existing.current, reason));
  }

  const updated: StoryDraftRecord = {
    ...existing,
    storyType,
    storyFormat,
    current: normalizedSnapshot,
    versions: nextVersions.slice(0, versionLimit),
    updatedAt: normalizedSnapshot.updatedAt,
  };

  store.drafts[draftKey] = updated;
  store.activeDraftKey = draftKey;
  writeStore(store);
  return cloneRecord(updated);
}

export function restoreDraftVersion(params: {
  draftKey: string;
  versionId: string;
  maxVersions?: number;
}): StoryDraftRecord | null {
  const { draftKey, versionId, maxVersions } = params;
  const versionLimit = normalizeVersionCount(maxVersions);
  const store = readStore();
  const existing = store.drafts[draftKey];
  if (!existing) {
    return null;
  }

  const selected = existing.versions.find(
    (version) => version.id === versionId
  );
  if (!selected) {
    return null;
  }

  const currentAsVersion = createVersionFromSnapshot(
    existing.current,
    'restore'
  );
  const remainingVersions = existing.versions.filter(
    (version) => version.id !== versionId
  );

  const restoredCurrent: StoryDraftSnapshot = {
    title: selected.title,
    description: selected.description,
    genre: selected.genre,
    content: selected.content,
    coverImageName: selected.coverImageName,
    updatedAt: Date.now(),
    version: existing.current.version + 1,
  };

  const updated: StoryDraftRecord = {
    ...existing,
    current: restoredCurrent,
    versions: [currentAsVersion, ...remainingVersions].slice(0, versionLimit),
    updatedAt: restoredCurrent.updatedAt,
  };

  store.drafts[draftKey] = updated;
  store.activeDraftKey = draftKey;
  writeStore(store);
  return cloneRecord(updated);
}

export function clearDraftRecord(draftKey: string): void {
  const store = readStore();
  delete store.drafts[draftKey];
  if (store.activeDraftKey === draftKey) {
    store.activeDraftKey = null;
  }
  writeStore(store);
}

export function migrateLegacyDraftToRecord(params: {
  draftKey: string;
  storyType: string;
  storyFormat: string;
}): StoryDraftRecord | null {
  const { draftKey, storyType, storyFormat } = params;
  if (!hasStorage()) {
    return null;
  }

  try {
    const raw = localStorage.getItem(LEGACY_DRAFT_KEY);
    if (!raw) {
      return null;
    }
    const legacy = JSON.parse(raw) as Partial<StoryDraftSnapshot>;

    const snapshot: StoryDraftSnapshot = {
      title: legacy.title || '',
      description: legacy.description || '',
      genre: legacy.genre || '',
      content: legacy.content || '',
      coverImageName: legacy.coverImageName,
      updatedAt: legacy.updatedAt || Date.now(),
      version: 1,
    };

    if (!hasMeaningfulContent(snapshot)) {
      return null;
    }

    const migrated = saveDraftSnapshot({
      draftKey,
      storyType,
      storyFormat,
      snapshot,
      reason: 'manual',
    });

    localStorage.removeItem(LEGACY_DRAFT_KEY);
    return migrated;
  } catch {
    return null;
  }
}
