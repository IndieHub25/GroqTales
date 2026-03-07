/**
 * Profile Settings Route — Supabase
 */

const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../../config/supabase');
const logger = require('../../utils/logger');
const { authRequired } = require('../../middleware/auth');

/**
 * @swagger
 * /api/v1/settings/profile:
 *   get:
 *     tags:
 *       - Settings
 *     summary: Get profile settings
 *     description: Returns the authenticated user's profile settings.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile settings retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                 displayName:
 *                   type: string
 *                 bio:
 *                   type: string
 *                 website:
 *                   type: string
 *                 location:
 *                   type: string
 *                 primaryGenre:
 *                   type: string
 *                 avatarUrl:
 *                   type: string
 *                   nullable: true
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 *   patch:
 *     tags:
 *       - Settings
 *     summary: Update profile settings
 *     description: Updates profile settings in Supabase.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               displayName:
 *                 type: string
 *                 example: John Doe
 *               bio:
 *                 type: string
 *                 example: "Writer and dreamer."
 *               website:
 *                 type: string
 *               location:
 *                 type: string
 *               primaryGenre:
 *                 type: string
 *               avatarUrl:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */

router.get('/', authRequired, async (req, res) => {
    try {
        const { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (error || !profile) {
            // Return defaults if no profile exists yet
            return res.json({
                username: '',
                displayName: '',
                bio: '',
                website: '',
                location: '',
                primaryGenre: 'other',
                avatarUrl: null,
            });
        }

        return res.json({
            username: profile.username || '',
            displayName: profile.display_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
            bio: profile.bio || '',
            website: profile.website || profile.social_website || '',
            location: profile.location || '',
            primaryGenre: profile.primary_genre || 'other',
            avatarUrl: profile.avatar_url || null,
        });
    } catch (error) {
        logger.error('Error in profile GET:', error);
        return res.status(500).json({ error: error.message });
    }
});

router.patch('/', authRequired, async (req, res) => {
    try {
        const updates = req.body;

        const dbUpdates = {};
        if (updates.username !== undefined) dbUpdates.username = updates.username;
        if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
        if (updates.website !== undefined) dbUpdates.website = updates.website;
        if (updates.location !== undefined) dbUpdates.location = updates.location;
        if (updates.primaryGenre !== undefined) dbUpdates.primary_genre = updates.primaryGenre;
        if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;

        if (updates.displayName) {
            dbUpdates.display_name = updates.displayName;
            const parts = updates.displayName.split(' ');
            dbUpdates.first_name = parts[0];
            dbUpdates.last_name = parts.slice(1).join(' ');
        }

        const { error } = await supabaseAdmin
            .from('profiles')
            .upsert({ id: req.user.id, ...dbUpdates })
            .eq('id', req.user.id);

        if (error) {
            logger.error('Profile update error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }

        res.json({ success: true, message: 'Profile updated' });
    } catch (error) {
        logger.error('Error in profile PATCH:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
