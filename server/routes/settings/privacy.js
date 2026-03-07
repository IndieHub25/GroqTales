/**
 * Privacy Settings Route — Supabase
 */

const router = require('express').Router();
const { authRequired: requireAuth } = require('../../middleware/auth');
const { supabaseAdmin } = require('../../config/supabase');

/**
 * @swagger
 * /api/v1/settings/privacy:
 *   get:
 *     tags:
 *       - Settings
 *     summary: Get privacy settings
 *     description: Returns the authenticated user's privacy preferences.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Privacy settings retrieved.
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
 *                     profileVisible:
 *                       type: boolean
 *                     allowComments:
 *                       type: boolean
 *                     showActivity:
 *                       type: boolean
 *                     showReadingHistory:
 *                       type: boolean
 *                     dataCollection:
 *                       type: boolean
 *                     personalization:
 *                       type: boolean
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 *   put:
 *     tags:
 *       - Settings
 *     summary: Update privacy settings
 *     description: Updates privacy preferences. All fields are optional booleans.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profileVisible:
 *                 type: boolean
 *               allowComments:
 *                 type: boolean
 *               showActivity:
 *                 type: boolean
 *               showReadingHistory:
 *                 type: boolean
 *               dataCollection:
 *                 type: boolean
 *               personalization:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Privacy settings updated.
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
            return res.json({
                success: true,
                data: {
                    profileVisible: true, allowComments: true,
                    showActivity: true, showReadingHistory: false,
                    dataCollection: true, personalization: true,
                },
            });
        }

        res.json({
            success: true,
            data: {
                profileVisible: settings.privacy_profile_public ?? true,
                allowComments: settings.privacy_allow_comments ?? true,
                showActivity: settings.privacy_show_activity ?? true,
                showReadingHistory: settings.privacy_show_reading_history ?? false,
                dataCollection: settings.privacy_data_collection ?? true,
                personalization: settings.privacy_personalization ?? true,
            },
        });
    } catch (err) {
        console.error('Fetch privacy settings failed:', err);
        res.status(500).json({ success: false, error: { message: 'Failed to fetch privacy settings' } });
    }
});

router.put('/', requireAuth, async (req, res) => {
    try {
        const {
            profileVisible, allowComments, showActivity,
            showReadingHistory, dataCollection, personalization,
        } = req.body;

        const updates = {};
        if (typeof profileVisible === 'boolean') updates.privacy_profile_public = profileVisible;
        if (typeof allowComments === 'boolean') updates.privacy_allow_comments = allowComments;
        if (typeof showActivity === 'boolean') updates.privacy_show_activity = showActivity;
        if (typeof showReadingHistory === 'boolean') updates.privacy_show_reading_history = showReadingHistory;
        if (typeof dataCollection === 'boolean') updates.privacy_data_collection = dataCollection;
        if (typeof personalization === 'boolean') updates.privacy_personalization = personalization;

        const { data, error } = await supabaseAdmin
            .from('user_settings')
            .upsert({ user_id: req.user.id, ...updates })
            .select()
            .single();

        if (error) {
            console.error('Privacy settings update error:', error);
            return res.status(500).json({ success: false, error: { message: 'Failed to update privacy settings' } });
        }

        res.json({
            success: true,
            data: {
                profileVisible: data.privacy_profile_public ?? true,
                allowComments: data.privacy_allow_comments ?? true,
                showActivity: data.privacy_show_activity ?? true,
                showReadingHistory: data.privacy_show_reading_history ?? false,
                dataCollection: data.privacy_data_collection ?? true,
                personalization: data.privacy_personalization ?? true,
            },
        });
    } catch (err) {
        console.error('Privacy settings update failed:', err);
        res.status(500).json({ success: false, error: { message: 'Failed to update privacy settings' } });
    }
});

module.exports = router;