const express = require('express');

const Draft = require('../models/Draft');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

const DEFAULT_MAX_VERSIONS = 5;
const ALLOWED_OWNER_ROLES = new Set(['wallet', 'admin', 'guest']);
const ALLOWED_SAVE_REASONS = new Set(['autosave', 'blur', 'manual', 'restore']);

function normalizeVersionLimit(value) {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_MAX_VERSIONS;
  }
  return Math.max(1, Math.min(20, parsed));
}

function cleanText(value, maxLength) {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim().slice(0, maxLength);
}

function normalizeSnapshot(rawSnapshot, existingVersion) {
  const now = new Date();
  const parsedUpdatedAt = rawSnapshot?.updatedAt
    ? new Date(rawSnapshot.updatedAt)
    : null;
  const normalizedUpdatedAt =
    parsedUpdatedAt && !Number.isNaN(parsedUpdatedAt.getTime())
      ? parsedUpdatedAt
      : now;

  return {
    title: cleanText(rawSnapshot?.title, 140),
    description: cleanText(rawSnapshot?.description, 2000),
    genre: cleanText(rawSnapshot?.genre, 80),
    content: cleanText(rawSnapshot?.content, 100000),
    coverImageName: cleanText(rawSnapshot?.coverImageName, 260),
    updatedAt: normalizedUpdatedAt,
    version:
      Number(rawSnapshot?.version) > 0
        ? Number(rawSnapshot.version)
        : existingVersion || 1,
  };
}

function hasMeaningfulContent(snapshot) {
  return Boolean(
    snapshot.title ||
      snapshot.description ||
      snapshot.genre ||
      snapshot.content ||
      snapshot.coverImageName
  );
}

function hasSnapshotChanged(previous, next) {
  return (
    previous.title !== next.title ||
    previous.description !== next.description ||
    previous.genre !== next.genre ||
    previous.content !== next.content ||
    previous.coverImageName !== next.coverImageName
  );
}

function serializeVersion(versionDoc) {
  return {
    id: versionDoc._id.toString(),
    title: versionDoc.title || '',
    description: versionDoc.description || '',
    genre: versionDoc.genre || '',
    content: versionDoc.content || '',
    coverImageName: versionDoc.coverImageName || '',
    updatedAt: new Date(versionDoc.updatedAt).getTime(),
    version: versionDoc.version || 1,
    reason: versionDoc.reason || 'autosave',
  };
}

function serializeDraft(draftDoc) {
  return {
    draftKey: draftDoc.draftKey,
    storyType: draftDoc.storyType,
    storyFormat: draftDoc.storyFormat,
    ownerWallet: draftDoc.ownerWallet,
    ownerRole: draftDoc.ownerRole,
    current: {
      title: draftDoc.current?.title || '',
      description: draftDoc.current?.description || '',
      genre: draftDoc.current?.genre || '',
      content: draftDoc.current?.content || '',
      coverImageName: draftDoc.current?.coverImageName || '',
      updatedAt: new Date(draftDoc.current?.updatedAt || Date.now()).getTime(),
      version: draftDoc.current?.version || 1,
    },
    versions: (draftDoc.versions || []).map(serializeVersion),
    aiMetadata: {
      pipelineState: draftDoc.aiMetadata?.pipelineState || 'idle',
      suggestedEdits: draftDoc.aiMetadata?.suggestedEdits || [],
      lastEditedByAIAt: draftDoc.aiMetadata?.lastEditedByAIAt
        ? new Date(draftDoc.aiMetadata.lastEditedByAIAt).getTime()
        : null,
    },
    createdAt: new Date(draftDoc.createdAt).getTime(),
    updatedAt: new Date(draftDoc.updatedAt).getTime(),
  };
}

router.get('/', authRequired, async (req, res) => {
  try {
    const { draftKey, ownerWallet } = req.query;

    if (!draftKey || typeof draftKey !== 'string') {
      return res.status(400).json({ error: 'draftKey is required' });
    }

    const query = { draftKey };
    if (ownerWallet && typeof ownerWallet === 'string') {
      query.ownerWallet = ownerWallet.toLowerCase();
    }

    const draft = await Draft.findOne(query).lean();
    if (!draft) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    return res.json({ draft: serializeDraft(draft) });
  } catch (error) {
    console.error('Failed to fetch draft:', error);
    return res.status(500).json({ error: 'Failed to fetch draft' });
  }
});

router.put('/', authRequired, async (req, res) => {
  try {
    const {
      draftKey,
      storyType = 'text',
      storyFormat = 'free',
      ownerWallet,
      ownerRole = 'wallet',
      snapshot,
      saveReason = 'autosave',
      maxVersions,
    } = req.body || {};

    if (!draftKey || typeof draftKey !== 'string') {
      return res.status(400).json({ error: 'draftKey is required' });
    }
    if (!snapshot || typeof snapshot !== 'object') {
      return res.status(400).json({ error: 'snapshot payload is required' });
    }

    const versionLimit = normalizeVersionLimit(maxVersions);
    const normalizedOwnerRole = ALLOWED_OWNER_ROLES.has(ownerRole)
      ? ownerRole
      : 'wallet';
    const normalizedReason = ALLOWED_SAVE_REASONS.has(saveReason)
      ? saveReason
      : 'autosave';
    const existing = await Draft.findOne({ draftKey });
    const normalizedSnapshot = normalizeSnapshot(
      snapshot,
      existing?.current?.version
    );

    if (!hasMeaningfulContent(normalizedSnapshot)) {
      return res
        .status(400)
        .json({ error: 'Snapshot is empty and cannot be saved' });
    }

    if (!existing) {
      const created = await Draft.create({
        draftKey,
        storyType,
        storyFormat,
        ownerWallet:
          typeof ownerWallet === 'string' ? ownerWallet.toLowerCase() : null,
        ownerRole: normalizedOwnerRole,
        current: normalizedSnapshot,
        versions: [],
        aiMetadata: {
          pipelineState: 'ready',
          suggestedEdits: [],
          lastEditedByAIAt: null,
        },
      });
      return res.status(201).json({ draft: serializeDraft(created) });
    }

    if (
      hasMeaningfulContent(existing.current) &&
      hasSnapshotChanged(existing.current, normalizedSnapshot)
    ) {
      existing.versions.unshift({
        ...normalizeSnapshot(existing.current, existing.current.version),
        reason: normalizedReason,
      });
    }

    existing.storyType = storyType;
    existing.storyFormat = storyFormat;
    existing.ownerRole = normalizedOwnerRole;
    if (typeof ownerWallet === 'string' && ownerWallet.trim()) {
      existing.ownerWallet = ownerWallet.toLowerCase();
    }
    existing.current = {
      ...normalizedSnapshot,
      version: (existing.current?.version || 0) + 1,
      updatedAt: new Date(),
    };
    existing.versions = existing.versions.slice(0, versionLimit);
    existing.aiMetadata = existing.aiMetadata || {
      pipelineState: 'ready',
      suggestedEdits: [],
      lastEditedByAIAt: null,
    };

    await existing.save();
    return res.json({ draft: serializeDraft(existing) });
  } catch (error) {
    console.error('Failed to save draft:', error);
    return res.status(500).json({ error: 'Failed to save draft' });
  }
});

router.patch('/', authRequired, async (req, res) => {
  try {
    const { draftKey, versionId, maxVersions } = req.body || {};
    if (!draftKey || typeof draftKey !== 'string') {
      return res.status(400).json({ error: 'draftKey is required' });
    }
    if (!versionId || typeof versionId !== 'string') {
      return res.status(400).json({ error: 'versionId is required' });
    }

    const versionLimit = normalizeVersionLimit(maxVersions);
    const draft = await Draft.findOne({ draftKey });
    if (!draft) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    const selectedVersion = draft.versions.find(
      (version) => version._id.toString() === versionId
    );
    if (!selectedVersion) {
      return res.status(404).json({ error: 'Version not found' });
    }

    if (hasMeaningfulContent(draft.current)) {
      draft.versions.unshift({
        ...normalizeSnapshot(draft.current, draft.current.version),
        reason: 'restore',
      });
    }

    draft.versions = draft.versions.filter(
      (version) => version._id.toString() !== versionId
    );
    draft.current = {
      ...normalizeSnapshot(selectedVersion, draft.current.version + 1),
      updatedAt: new Date(),
      version: (draft.current?.version || 0) + 1,
    };
    draft.versions = draft.versions.slice(0, versionLimit);

    await draft.save();
    return res.json({ draft: serializeDraft(draft) });
  } catch (error) {
    console.error('Failed to restore draft version:', error);
    return res.status(500).json({ error: 'Failed to restore draft version' });
  }
});

router.delete('/', authRequired, async (req, res) => {
  try {
    const { draftKey } = req.query;
    if (!draftKey || typeof draftKey !== 'string') {
      return res.status(400).json({ error: 'draftKey is required' });
    }

    await Draft.deleteOne({ draftKey });
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete draft:', error);
    return res.status(500).json({ error: 'Failed to delete draft' });
  }
});

module.exports = router;
