const router = require("express").Router();
const { authRequired: requireAuth } = require("../../middleware/auth");

/**
 * @swagger
 * /api/v1/settings/privacy:
 *   get:
 *     tags:
 *       - Settings
 *     summary: Get privacy settings
 *     description: Returns the authenticated user's privacy preferences (profile visibility, comments, activity, reading history, data collection, personalization).
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */

router.get("/", requireAuth, async (req, res) => {
    try {
        const p = req.user.privacySettings || {};

        res.json({
            success: true,
            data: {
                profileVisible: p.profilePublic ?? true,
                allowComments: p.allowComments ?? true,
                showActivity: p.showActivity ?? true,
                showReadingHistory: p.showReadingHistory ?? true,
                dataCollection: p.dataCollection ?? true,
                personalization: p.personalization ?? true,
            },
        });
    } catch (err) {
        console.error("Fetch privacy settings failed:", err);
        res.status(500).json({
            success: false,
            error: { message: "Failed to fetch privacy settings" },
        });
    }
});

router.put("/", requireAuth, async (req, res) => {
    try {
        const {
            profileVisible,
            allowComments,
            showActivity,
            showReadingHistory,
            dataCollection,
            personalization,
        } = req.body;

        if (typeof profileVisible == "boolean")
            req.user.privacySettings.profilePublic = profileVisible;
        if (typeof allowComments == "boolean")
            req.user.privacySettings.allowComments = allowComments;
        if (typeof showActivity == "boolean")
            req.user.privacySettings.showActivity = showActivity;
        if (typeof showReadingHistory == "boolean")
            req.user.privacySettings.showReadingHistory = showReadingHistory;
        if (typeof dataCollection == "boolean")
            req.user.privacySettings.dataCollection = dataCollection;
        if (typeof personalization == "boolean")
            req.user.privacySettings.personalization = personalization;

        await req.user.save();

        res.json({
            success: true,
            data: {
                profileVisible: req.user.privacySettings.profilePublic ?? true,
                allowComments: req.user.privacySettings.allowComments ?? true,
                showActivity: req.user.privacySettings.showActivity ?? true,
                showReadingHistory: req.user.privacySettings.showReadingHistory ?? true,
                dataCollection: req.user.privacySettings.dataCollection ?? true,
                personalization: req.user.privacySettings.personalization ?? true,
            },
        });
    } catch (err) {
        console.error("Privacy settings update failed:", err);
        res.status(500).json({
            success: false,
            error: { message: "Failed to update privacy settings" },
        });
    }
});

module.exports = router;