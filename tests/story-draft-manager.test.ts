import {
  clearDraftRecord,
  createDraftKey,
  getDraftRecord,
  getLatestDraftRecord,
  migrateLegacyDraftToRecord,
  restoreDraftVersion,
  saveDraftSnapshot,
  StoryDraftSnapshot,
} from '../lib/story-draft-manager';

function makeSnapshot(
  partial?: Partial<StoryDraftSnapshot>
): StoryDraftSnapshot {
  return {
    title: 'Title',
    description: 'Description',
    genre: 'fantasy',
    content: 'Once upon a time',
    coverImageName: '',
    updatedAt: Date.now(),
    version: 1,
    ...partial,
  };
}

describe('story-draft-manager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('saves and retrieves a draft snapshot', () => {
    const draftKey = createDraftKey('unit');

    const saved = saveDraftSnapshot({
      draftKey,
      storyType: 'text',
      storyFormat: 'free',
      snapshot: makeSnapshot(),
      reason: 'manual',
      maxVersions: 5,
    });

    const loaded = getDraftRecord(draftKey);

    expect(saved.draftKey).toBe(draftKey);
    expect(loaded).not.toBeNull();
    expect(loaded?.current.title).toBe('Title');
    expect(loaded?.versions.length).toBe(0);
  });

  test('creates version history when snapshot changes', () => {
    const draftKey = createDraftKey('unit');

    saveDraftSnapshot({
      draftKey,
      storyType: 'text',
      storyFormat: 'free',
      snapshot: makeSnapshot({ content: 'v1 content' }),
      reason: 'manual',
      maxVersions: 5,
    });
    const updated = saveDraftSnapshot({
      draftKey,
      storyType: 'text',
      storyFormat: 'free',
      snapshot: makeSnapshot({ content: 'v2 content' }),
      reason: 'autosave',
      maxVersions: 5,
    });

    expect(updated.versions.length).toBe(1);
    expect(updated.versions[0]?.content).toBe('v1 content');
    expect(updated.current.content).toBe('v2 content');
  });

  test('restores a previous version', () => {
    const draftKey = createDraftKey('unit');

    saveDraftSnapshot({
      draftKey,
      storyType: 'text',
      storyFormat: 'free',
      snapshot: makeSnapshot({ content: 'original' }),
      reason: 'manual',
      maxVersions: 5,
    });
    const updated = saveDraftSnapshot({
      draftKey,
      storyType: 'text',
      storyFormat: 'free',
      snapshot: makeSnapshot({ content: 'changed' }),
      reason: 'autosave',
      maxVersions: 5,
    });

    const previousVersionId = updated.versions[0]?.id;
    expect(previousVersionId).toBeTruthy();

    if (!previousVersionId) {
      throw new Error('Expected at least one previous version');
    }

    const restored = restoreDraftVersion({
      draftKey,
      versionId: previousVersionId,
      maxVersions: 5,
    });

    expect(restored).not.toBeNull();
    expect(restored?.current.content).toBe('original');
    expect(restored?.versions.length).toBeGreaterThanOrEqual(1);
  });

  test('returns latest draft by recency', async () => {
    const firstKey = createDraftKey('unit');
    const secondKey = createDraftKey('unit');

    saveDraftSnapshot({
      draftKey: firstKey,
      storyType: 'text',
      storyFormat: 'free',
      snapshot: makeSnapshot({ title: 'Older draft' }),
      reason: 'manual',
      maxVersions: 5,
    });

    await new Promise((resolve) => setTimeout(resolve, 2));

    saveDraftSnapshot({
      draftKey: secondKey,
      storyType: 'text',
      storyFormat: 'free',
      snapshot: makeSnapshot({ title: 'Newest draft' }),
      reason: 'manual',
      maxVersions: 5,
    });

    const latest = getLatestDraftRecord();
    expect(latest?.draftKey).toBe(secondKey);

    clearDraftRecord(secondKey);
    expect(getDraftRecord(secondKey)).toBeNull();
  });

  test('limits version history to maxVersions', () => {
    const draftKey = createDraftKey('unit');

    saveDraftSnapshot({
      draftKey,
      storyType: 'text',
      storyFormat: 'free',
      snapshot: makeSnapshot({ content: 'v1' }),
      reason: 'manual',
      maxVersions: 3,
    });

    saveDraftSnapshot({
      draftKey,
      storyType: 'text',
      storyFormat: 'free',
      snapshot: makeSnapshot({ content: 'v2' }),
      reason: 'autosave',
      maxVersions: 3,
    });

    saveDraftSnapshot({
      draftKey,
      storyType: 'text',
      storyFormat: 'free',
      snapshot: makeSnapshot({ content: 'v3' }),
      reason: 'autosave',
      maxVersions: 3,
    });

    saveDraftSnapshot({
      draftKey,
      storyType: 'text',
      storyFormat: 'free',
      snapshot: makeSnapshot({ content: 'v4' }),
      reason: 'autosave',
      maxVersions: 3,
    });

    const loaded = getDraftRecord(draftKey);
    expect(loaded).not.toBeNull();
    expect(loaded?.current.content).toBe('v4');
    expect(loaded?.versions.length).toBe(3);
    expect(loaded?.versions[0]?.content).toBe('v3');
    expect(loaded?.versions[2]?.content).toBe('v1');
  });

  test('migrates legacy draft into structured record', () => {
    const draftKey = createDraftKey('legacy');
    localStorage.setItem(
      'groqtales_text_story_draft_v1',
      JSON.stringify({
        title: 'Legacy title',
        description: 'Legacy description',
        genre: 'mystery',
        content: 'Legacy content',
        updatedAt: Date.now(),
      })
    );

    const migrated = migrateLegacyDraftToRecord({
      draftKey,
      storyType: 'text',
      storyFormat: 'free',
    });

    expect(migrated).not.toBeNull();
    expect(migrated?.current.title).toBe('Legacy title');
    expect(getDraftRecord(draftKey)?.current.content).toBe('Legacy content');
    expect(localStorage.getItem('groqtales_text_story_draft_v1')).toBeNull();
  });

  test('returns empty store when persisted store is corrupted', () => {
    const draftKey = createDraftKey('unit');

    saveDraftSnapshot({
      draftKey,
      storyType: 'text',
      storyFormat: 'free',
      snapshot: makeSnapshot({ title: 'Corruption test' }),
      reason: 'manual',
      maxVersions: 5,
    });

    localStorage.setItem('groqtales_story_drafts_store_v1', '{broken-json');

    expect(getDraftRecord(draftKey)).toBeNull();
    expect(getLatestDraftRecord()).toBeNull();
  });
});
