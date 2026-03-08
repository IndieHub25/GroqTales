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

module.exports = router;
