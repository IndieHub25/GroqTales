/**
 * Notification Settings Route — Supabase
 */

const router = require('express').Router();
const { authRequired: requireAuth } = require('../../middleware/auth');
const { supabaseAdmin } = require('../../config/supabase');

/**
 * @swagger
 * /api/v1/settings/notifications:
 *   get:
 *     tags:
 *       - Settings
 *     summary: Get notification settings
 *     description: Returns the authenticated user's notification preferences.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Notification settings retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: boolean
 *                     push:
 *                       type: boolean
 *                     sms:
 *                       type: boolean
 *                     marketing:
 *                       type: boolean
 *                     updates:
 *                       type: boolean
 *                     comments:
 *                       type: boolean
 *                     likes:
 *                       type: boolean
 *                     follows:
 *                       type: boolean
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 *   put:
 *     tags:
 *       - Settings
 *     summary: Update notification settings
 *     description: Updates notification preferences. All fields are optional booleans.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: boolean
 *               push:
 *                 type: boolean
 *               comments:
 *                 type: boolean
 *               likes:
 *                 type: boolean
 *               follows:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Notification settings updated.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */

router.get('/', requireAuth, async (req, res) => {
    try {
        const { data: settings, error } = await supabaseAdmin
            .from('user_settings')
            .select('*')
            .eq('user_id', req.user.id)
            .single();

        if (error || !settings) {
            // Return defaults
            return res.json({
                success: true,
                data: {
                    email: false, push: false, sms: false,
                    marketing: false, updates: false,
                    comments: true, likes: true, follows: true,
                },
            });
        }

        return res.json({
            success: true,
            data: {
                email: settings.notif_email_platform ?? false,
                push: settings.notif_inapp_messages ?? false,
                sms: false,
                marketing: settings.notif_email_platform ?? false,
                updates: settings.notif_email_platform ?? false,
                comments: settings.notif_email_comments ?? true,
                likes: settings.notif_email_likes ?? true,
                follows: settings.notif_email_followers ?? true,
            },
        });
    } catch (err) {
        console.error('Fetch notification settings failed:', err);
        res.status(500).json({ success: false, error: { message: 'Failed to fetch notification settings' } });
    }
});

router.put('/', requireAuth, async (req, res) => {
    try {
        const { email, push, comments, likes, follows } = req.body;

        const updates = {};
        if (typeof comments === 'boolean') updates.notif_email_comments = comments;
        if (typeof likes === 'boolean') updates.notif_email_likes = likes;
        if (typeof follows === 'boolean') updates.notif_email_followers = follows;
        if (typeof email === 'boolean') updates.notif_email_platform = email;
        if (typeof push === 'boolean') updates.notif_inapp_messages = push;

        const { data, error } = await supabaseAdmin
            .from('user_settings')
            .upsert({ user_id: req.user.id, ...updates })
            .select()
            .single();

        if (error) {
            console.error('Notification settings update error:', error);
            return res.status(500).json({ success: false, error: { message: 'Failed to update notification settings' } });
        }

        return res.json({
            success: true,
            data: {
                email: data.notif_email_platform,
                push: data.notif_inapp_messages,
                comments: data.notif_email_comments,
                likes: data.notif_email_likes,
                follows: data.notif_email_followers,
            },
        });
    } catch (err) {
        console.error('Notification settings update failed:', err);
        res.status(500).json({ success: false, error: { message: 'Failed to update notification settings' } });
    }
});

module.exports = router;
