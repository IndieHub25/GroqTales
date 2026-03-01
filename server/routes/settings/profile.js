const express = require('express');
const router = express.Router();
const User = require('../../models/User'); // Mongoose user
const axios = require('axios');
const logger = require('../../utils/logger');
const { authRequired } = require('../../middleware/auth'); // assuming it works with supabase token

/**
 * @swagger
 * /api/v1/settings/profile:
 *   get:
 *     tags:
 *       - Settings
 *     summary: Get profile settings
 *     description: Returns the authenticated user's profile settings (username, display name, bio, avatar, etc.).
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
 *     description: Updates profile settings and syncs to both MongoDB and Cloudflare D1.
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
 *               avatarUrl:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */

// GET /api/v1/settings/profile
router.get('/', authRequired, async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.sub;
        const profile = await User.findOne({ "wallet.address": req.user?.walletAddress || userId }).lean();
        if (!profile) return res.json({}); // Default empty

        return res.json({
            username: profile.username || '',
            displayName: profile.firstName ? `${profile.firstName} ${profile.lastName || ''}`.trim() : '',
            bio: profile.bio || '',
            website: '',
            location: '',
            primaryGenre: 'other',
            avatarUrl: profile.avatar || null
        });
    } catch (error) {
        logger.error('Error in profile GET:', error);
        return res.status(500).json({ error: error.message });
    }
});

// PATCH /api/v1/settings/profile
router.patch('/', authRequired, async (req, res) => {
    try {
        const updates = req.body;

        // 1. Update MongoDB (if needed / still used as fallback)
        const userId = req.user?.id || req.user?.sub;
        const mongoUpdate = {
            username: updates.username,
            bio: updates.bio,
            'wallet.address': req.user?.walletAddress || userId
        };
        if (updates.displayName) {
            const parts = updates.displayName.split(' ');
            mongoUpdate.firstName = parts[0];
            mongoUpdate.lastName = parts.slice(1).join(' ');
        }

        await User.findOneAndUpdate(
            { "wallet.address": mongoUpdate['wallet.address'] },
            { $set: mongoUpdate },
            { upsert: true }
        );

        // 2. Sync to Cloudflare D1
        const workerUrl = process.env.CF_WORKER_URL || 'https://groqtales-backend-workers.mantejsingh.workers.dev';
        const CF_SYNC_ENDPOINT = `${workerUrl}/api/profiles/${userId}`;

        const token = req.headers.authorization?.split(' ')[1];

        try {
            await axios.put(CF_SYNC_ENDPOINT, {
                username: updates.username || updates.displayName,
                bio: updates.bio,
                avatar_url: req.body.avatarUrl || null
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`, // Pass the supabase token directly
                    'Content-Type': 'application/json'
                }
            });
            logger.info('Successfully synced profile to Cloudflare D1');
        } catch (cfError) {
            logger.error('Failed to sync profile to Cloudflare worker:', cfError.message);
            // We don't fail the whole request just because CF sync failed
        }

        res.json({ success: true, message: 'Profile updated' });
    } catch (error) {
        logger.error('Error in profile PATCH:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
