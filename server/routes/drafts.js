/**
 * Drafts API Routes — Supabase
 * Handles story draft CRUD with version history via Supabase PostgreSQL
 */

const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

const DEFAULT_MAX_VERSIONS = 5;

function normalizeVersionLimit(value) {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed)) return DEFAULT_MAX_VERSIONS;
  return Math.max(1, Math.min(20, parsed));
}

function cleanText(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

function normalizeSnapshot(rawSnapshot, existingVersion) {
  const now = new Date();
  const parsedUpdatedAt = rawSnapshot?.updatedAt ? new Date(rawSnapshot.updatedAt) : null;
  const normalizedUpdatedAt = parsedUpdatedAt && !Number.isNaN(parsedUpdatedAt.getTime()) ? parsedUpdatedAt : now;

  return {
    title: cleanText(rawSnapshot?.title, 140),
    description: cleanText(rawSnapshot?.description, 2000),
    genre: cleanText(rawSnapshot?.genre, 80),
    content: cleanText(rawSnapshot?.content, 100000),
    coverImageName: cleanText(rawSnapshot?.coverImageName, 260),
    updatedAt: normalizedUpdatedAt.toISOString(),
    version: Number(rawSnapshot?.version) > 0 ? Number(rawSnapshot.version) : existingVersion || 1,
  };
}

function hasMeaningfulContent(snapshot) {
  return Boolean(snapshot.title || snapshot.description || snapshot.genre || snapshot.content || snapshot.coverImageName);
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

function serializeDraft(draft) {
  return {
    draftKey: draft.draft_key,
    storyType: draft.story_type,
    storyFormat: draft.story_format,
    ownerWallet: draft.owner_wallet,
    ownerRole: draft.owner_role,
    current: {
      title: draft.current_title || '',
      description: draft.current_description || '',
      genre: draft.current_genre || '',
      content: draft.current_content || '',
      coverImageName: draft.current_cover_image || '',
      updatedAt: new Date(draft.current_updated_at || Date.now()).getTime(),
      version: draft.current_version || 1,
    },
    versions: (draft.versions || []).map(v => ({
      id: v.id || v._id || '',
      title: v.title || '',
      description: v.description || '',
      genre: v.genre || '',
      content: v.content || '',
      coverImageName: v.coverImageName || '',
      updatedAt: new Date(v.updatedAt || Date.now()).getTime(),
      version: v.version || 1,
      reason: v.reason || 'autosave',
    })),
    aiMetadata: {
      pipelineState: draft.ai_pipeline_state || 'idle',
      suggestedEdits: draft.ai_suggested_edits || [],
      lastEditedByAIAt: draft.ai_last_edited_at ? new Date(draft.ai_last_edited_at).getTime() : null,
    },
    createdAt: new Date(draft.created_at).getTime(),
    updatedAt: new Date(draft.updated_at).getTime(),
  };
}

/**
 * @swagger
 * /api/v1/drafts:
 *   get:
 *     tags:
 *       - Drafts
 *     summary: Get a draft by key
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: draftKey
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique draft key.
 *     responses:
 *       200:
 *         description: Draft retrieved.
 *       404:
 *         description: Draft not found.
 *       500:
 *         description: Internal server error.
 */
router.get('/', authRequired, async (req, res) => {
  try {
    const { draftKey } = req.query;
    if (!draftKey || typeof draftKey !== 'string') {
      return res.status(400).json({ error: 'draftKey is required' });
    }

    const { data: draft, error } = await supabaseAdmin
      .from('drafts')
      .select('*')
      .eq('draft_key', draftKey)
      .eq('owner_id', req.user.id)
      .single();

    if (error || !draft) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    return res.json({ draft: serializeDraft(draft) });
  } catch (error) {
    console.error('Failed to fetch draft:', error);
    return res.status(500).json({ error: 'Failed to fetch draft' });
  }
});

/**
 * @swagger
 * /api/v1/drafts:
 *   put:
 *     tags:
 *       - Drafts
 *     summary: Save or update a draft
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - draftKey
 *               - snapshot
 *             properties:
 *               draftKey:
 *                 type: string
 *               snapshot:
 *                 type: object
 *               storyType:
 *                 type: string
 *               storyFormat:
 *                 type: string
 *               saveReason:
 *                 type: string
 *               maxVersions:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Draft saved.
 *       201:
 *         description: Draft created.
 *       400:
 *         description: Invalid request.
 *       500:
 *         description: Internal server error.
 */
router.put('/', authRequired, async (req, res) => {
  try {
    const {
      draftKey, storyType = 'text', storyFormat = 'free',
      ownerWallet, ownerRole = 'wallet',
      snapshot, saveReason = 'autosave', maxVersions,
    } = req.body || {};

    if (!draftKey || typeof draftKey !== 'string') {
      return res.status(400).json({ error: 'draftKey is required' });
    }
    if (!snapshot || typeof snapshot !== 'object') {
      return res.status(400).json({ error: 'snapshot payload is required' });
    }

    const versionLimit = normalizeVersionLimit(maxVersions);

    // Check existing
    const { data: existing } = await supabaseAdmin
      .from('drafts')
      .select('*')
      .eq('draft_key', draftKey)
      .single();

    const normalizedSnapshot = normalizeSnapshot(snapshot, existing?.current_version);

    if (!hasMeaningfulContent(normalizedSnapshot)) {
      return res.status(400).json({ error: 'Snapshot is empty and cannot be saved' });
    }

    if (!existing) {
      // Create new draft
      const { data: created, error } = await supabaseAdmin
        .from('drafts')
        .insert({
          draft_key: draftKey,
          story_type: storyType,
          story_format: storyFormat,
          owner_id: req.user.id,
          owner_wallet: typeof ownerWallet === 'string' ? ownerWallet.toLowerCase() : null,
          owner_role: ownerRole,
          current_title: normalizedSnapshot.title,
          current_description: normalizedSnapshot.description,
          current_genre: normalizedSnapshot.genre,
          current_content: normalizedSnapshot.content,
          current_cover_image: normalizedSnapshot.coverImageName,
          current_version: 1,
          current_updated_at: normalizedSnapshot.updatedAt,
          versions: [],
          ai_pipeline_state: 'ready',
        })
        .select()
        .single();

      if (error) {
        console.error('Draft creation error:', error);
        return res.status(500).json({ error: 'Failed to create draft' });
      }

      return res.status(201).json({ draft: serializeDraft(created) });
    }

    // Update existing draft
    let versions = existing.versions || [];

    const currentSnapshot = {
      title: existing.current_title,
      description: existing.current_description,
      genre: existing.current_genre,
      content: existing.current_content,
      coverImageName: existing.current_cover_image,
    };

    if (hasMeaningfulContent(currentSnapshot) && hasSnapshotChanged(currentSnapshot, normalizedSnapshot)) {
      versions.unshift({
        id: require('crypto').randomUUID(),
        ...currentSnapshot,
        updatedAt: existing.current_updated_at,
        version: existing.current_version,
        reason: saveReason,
      });
    }

    versions = versions.slice(0, versionLimit);
    const newVersion = (existing.current_version || 0) + 1;

    const { data: updated, error } = await supabaseAdmin
      .from('drafts')
      .update({
        story_type: storyType,
        story_format: storyFormat,
        owner_role: ownerRole,
        current_title: normalizedSnapshot.title,
        current_description: normalizedSnapshot.description,
        current_genre: normalizedSnapshot.genre,
        current_content: normalizedSnapshot.content,
        current_cover_image: normalizedSnapshot.coverImageName,
        current_version: newVersion,
        current_updated_at: new Date().toISOString(),
        versions,
      })
      .eq('draft_key', draftKey)
      .select()
      .single();

    if (error) {
      console.error('Draft update error:', error);
      return res.status(500).json({ error: 'Failed to save draft' });
    }

    return res.json({ draft: serializeDraft(updated) });
  } catch (error) {
    console.error('Failed to save draft:', error);
    return res.status(500).json({ error: 'Failed to save draft' });
  }
});

/**
 * @swagger
 * /api/v1/drafts:
 *   patch:
 *     tags:
 *       - Drafts
 *     summary: Restore a draft version
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - draftKey
 *               - versionId
 *             properties:
 *               draftKey:
 *                 type: string
 *               versionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Version restored.
 *       404:
 *         description: Draft or version not found.
 *       500:
 *         description: Internal server error.
 */
router.patch('/', authRequired, async (req, res) => {
  try {
    const { draftKey, versionId, maxVersions } = req.body || {};
    if (!draftKey) return res.status(400).json({ error: 'draftKey is required' });
    if (!versionId) return res.status(400).json({ error: 'versionId is required' });

    const versionLimit = normalizeVersionLimit(maxVersions);

    const { data: draft, error } = await supabaseAdmin
      .from('drafts')
      .select('*')
      .eq('draft_key', draftKey)
      .eq('owner_id', req.user.id)
      .single();

    if (error || !draft) return res.status(404).json({ error: 'Draft not found' });

    let versions = draft.versions || [];
    const selectedVersion = versions.find(v => v.id === versionId);
    if (!selectedVersion) return res.status(404).json({ error: 'Version not found' });

    // Push current to versions
    const currentSnapshot = {
      title: draft.current_title,
      description: draft.current_description,
      genre: draft.current_genre,
      content: draft.current_content,
      coverImageName: draft.current_cover_image,
    };

    if (hasMeaningfulContent(currentSnapshot)) {
      versions.unshift({
        id: require('crypto').randomUUID(),
        ...currentSnapshot,
        updatedAt: draft.current_updated_at,
        version: draft.current_version,
        reason: 'restore',
      });
    }

    versions = versions.filter(v => v.id !== versionId).slice(0, versionLimit);
    const newVersion = (draft.current_version || 0) + 1;

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('drafts')
      .update({
        current_title: selectedVersion.title || '',
        current_description: selectedVersion.description || '',
        current_genre: selectedVersion.genre || '',
        current_content: selectedVersion.content || '',
        current_cover_image: selectedVersion.coverImageName || '',
        current_version: newVersion,
        current_updated_at: new Date().toISOString(),
        versions,
      })
      .eq('draft_key', draftKey)
      .select()
      .single();

    if (updateError) return res.status(500).json({ error: 'Failed to restore draft version' });

    return res.json({ draft: serializeDraft(updated) });
  } catch (error) {
    console.error('Failed to restore draft version:', error);
    return res.status(500).json({ error: 'Failed to restore draft version' });
  }
});

/**
 * @swagger
 * /api/v1/drafts:
 *   delete:
 *     tags:
 *       - Drafts
 *     summary: Delete a draft
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: draftKey
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Draft deleted.
 *       500:
 *         description: Internal server error.
 */
router.delete('/', authRequired, async (req, res) => {
  try {
    const { draftKey } = req.query;
    if (!draftKey) return res.status(400).json({ error: 'draftKey is required' });

    await supabaseAdmin
      .from('drafts')
      .delete()
      .eq('draft_key', draftKey)
      .eq('owner_id', req.user.id);

    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete draft:', error);
    return res.status(500).json({ error: 'Failed to delete draft' });
  }
});

module.exports = router;
