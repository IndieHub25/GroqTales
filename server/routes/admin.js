/**
 * Admin API Routes
 * Handles superadmin operations for managing users and roles
 */

const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const logger = require('../utils/logger');
const { isSuperAdmin } = require('../middleware/auth');
const router = express.Router();

// GET /api/v1/admin/access/users - Get all connected users
router.get('/access/users', isSuperAdmin, async (req, res) => {
    try {
        const { data: profiles, error: profilesError } = await supabaseAdmin
            .from('profiles')
            .select('id, username, email, wallet_address, first_name, last_name, role, created_at');

        if (profilesError) throw profilesError;

        // Fetch story counts for each user
        const { data: stories, error: storiesError } = await supabaseAdmin
            .from('stories')
            .select('author_id');

        if (storiesError) throw storiesError;

        // Count stories per author
        const storyCountMap = {};
        if (stories) {
            stories.forEach(story => {
                storyCountMap[story.author_id] = (storyCountMap[story.author_id] || 0) + 1;
            });
        }

        const usersWithStats = (profiles || []).map(profile => ({
            ...profile,
            storyCount: storyCountMap[profile.id] || 0,
        }));

        return res.json({
            success: true,
            data: usersWithStats,
        });
    } catch (error) {
        logger.error('Admin Fetch Users Error:', error.message);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// PATCH /api/v1/admin/access/roles - Update user role
router.patch('/access/roles', isSuperAdmin, async (req, res) => {
    try {
        const { userId, newRole, adminPassword } = req.body;

        if (!userId || !newRole || !adminPassword) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        // Verify admin master password
        // Get the superadmin's profile to verify password against master override
        const adminUser = await supabaseAdmin.auth.admin.getUserById(req.user.id);
        if (!adminUser) {
            return res.status(404).json({ success: false, error: 'Superadmin not found' });
        }

        // Allow 'groqtales' as a master override for this demo requirement
        const isValidPassword = (adminPassword === 'groqtales');

        if (!isValidPassword) {
            return res.status(401).json({ success: false, error: 'Invalid admin password' });
        }

        const validRoles = ['user', 'moderator', 'admin'];
        if (!validRoles.includes(newRole)) {
            return res.status(400).json({ success: false, error: 'Invalid role' });
        }

        const { data: userToUpdate, error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId)
            .select('username, email, role')
            .single();

        if (updateError || !userToUpdate) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        return res.json({
            success: true,
            message: 'Role updated successfully',
            data: userToUpdate,
        });
    } catch (error) {
        logger.error('Admin Role Update Error:', error.message);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// ═══════════════════════════════════════════════════════════════════
// NFT Mint Request Review Pipeline
// ═══════════════════════════════════════════════════════════════════

// GET /api/v1/admin/mint-requests - List all mint requests (with story + author data)
router.get('/mint-requests', isSuperAdmin, async (req, res) => {
    try {
        const status = req.query.status; // optional filter: 'pending_review', 'approved', 'rejected'
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        let query = supabaseAdmin
            .from('nft_mint_requests')
            .select(`
                *,
                stories:story_id (id, title, cover_image, genre, description),
                profiles:author_id (id, username, first_name, last_name, avatar_url)
            `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error, count } = await query;

        if (error) throw error;

        return res.json({
            success: true,
            data: data || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                pages: Math.ceil((count || 0) / limit),
            },
        });
    } catch (error) {
        logger.error('Admin Fetch Mint Requests Error:', error.message);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// POST /api/v1/admin/mint-requests/:id/approve
router.post('/mint-requests/:id/approve', isSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const { data: mintReq, error: fetchError } = await supabaseAdmin
            .from('nft_mint_requests')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !mintReq) {
            return res.status(404).json({ success: false, error: 'Mint request not found' });
        }
        if (mintReq.status !== 'pending_review') {
            return res.status(400).json({ success: false, error: `Cannot approve a request with status: ${mintReq.status}` });
        }

        const { data: updated, error: updateError } = await supabaseAdmin
            .from('nft_mint_requests')
            .update({ status: 'approved', updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw updateError;

        // Update the story's is_minted status to true
        if (updated && updated.story_id) {
            const { error: storyUpdateError } = await supabaseAdmin
                .from('stories')
                .update({ is_minted: true })
                .eq('id', updated.story_id);

            if (storyUpdateError) {
                logger.error(`Failed to update is_minted for story ${updated.story_id}:`, storyUpdateError.message);
            }
        }

        // TODO: Trigger actual minting/listing pipeline here in the future:
        // - Mint the NFT on-chain
        // - Create marketplace listing
        // - Notify the creator

        return res.json({
            success: true,
            message: 'Mint request approved',
            data: updated,
        });
    } catch (error) {
        logger.error('Admin Approve Mint Request Error:', error.message);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// POST /api/v1/admin/mint-requests/:id/reject
router.post('/mint-requests/:id/reject', isSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason || !reason.trim()) {
            return res.status(400).json({ success: false, error: 'Rejection reason is required' });
        }

        const { data: mintReq, error: fetchError } = await supabaseAdmin
            .from('nft_mint_requests')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !mintReq) {
            return res.status(404).json({ success: false, error: 'Mint request not found' });
        }
        if (mintReq.status !== 'pending_review') {
            return res.status(400).json({ success: false, error: `Cannot reject a request with status: ${mintReq.status}` });
        }

        const { data: updated, error: updateError } = await supabaseAdmin
            .from('nft_mint_requests')
            .update({
                status: 'rejected',
                rejection_reason: reason.trim(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw updateError;

        return res.json({
            success: true,
            message: 'Mint request rejected',
            data: updated,
        });
    } catch (error) {
        logger.error('Admin Reject Mint Request Error:', error.message);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

module.exports = router;
