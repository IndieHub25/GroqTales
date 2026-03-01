const router = require("express").Router();
const { authRequired: requireAuth } = require("../../middleware/auth");

/**
 * @swagger
 * /api/v1/settings/notifications:
 *   get:
 *     tags:
 *       - Settings
 *     summary: Get notification settings
 *     description: Returns the authenticated user's notification preferences (email, push, comments, likes, follows).
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
        const User = require("../../models/User");
        const user = await User.findById(req.user.id).lean();
        if (!user) {
            return res.status(404).json({ success: false, error: { message: "User not found" } });
        }

        const settings = user.notificationSettings || {};
        const emailSettings = settings.email || {};
        const inAppSettings = settings.inApp || {};

        return res.json({
            success: true,
            data: {
                email: emailSettings.platform ?? false,
                push: inAppSettings.messages ?? false,
                sms: false,
                marketing: emailSettings.platform ?? false,
                updates: emailSettings.platform ?? false,
                comments: emailSettings.comments ?? false,
                likes: emailSettings.likes ?? false,
                follows: emailSettings.followers ?? false,

                // likes: req.user.notificationSettings.email.likes,
                // followers: req.user.notificationSettings.email.followers,
                // nftSales: req.user.notificationSettings.email.nftSales,
                // platform: req.user.notificationSettings.email.platform,

                // inApp: {
                //     comments: req.user.notificationSettings.inApp.comments,
                //     likes: req.user.notificationSettings.inApp.likes,
                //     followers: req.user.notificationSettings.inApp.follwers,
                //     messages: req.user.notificationSettings.inApp.messages,
                // },
            },
        });
    } catch (err) {
        console.log("Fetch notification settings failed:", err);
        res.status(500).json({
            success: false,
            error: { message: "Failed to fetch notification settings" },
        });
    }
});

router.put("/", requireAuth, async (req, res) => {
    try {
        const User = require("../../models/User");
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, error: { message: "User not found" } });
        }

        const { email, push, comments, likes, follows, } = req.body;

        // Ensure notificationSettings subdocs exist and are plain objects
        if (!user.notificationSettings || typeof user.notificationSettings !== 'object') {
            user.notificationSettings = {};
        }
        if (!user.notificationSettings.email || typeof user.notificationSettings.email !== 'object') {
            user.notificationSettings.email = {};
        }
        if (!user.notificationSettings.inApp || typeof user.notificationSettings.inApp !== 'object') {
            user.notificationSettings.inApp = {};
        }

        if (typeof comments === "boolean")
            user.notificationSettings.email.comments = comments;
        if (typeof likes === "boolean")
            user.notificationSettings.email.likes = likes;
        if (typeof follows === "boolean")
            user.notificationSettings.email.followers = follows;
        if (typeof email === "boolean")
            user.notificationSettings.email.platform = email;
        if (typeof push === "boolean")
            user.notificationSettings.inApp.messages = push;

        // Mongoose needs to know the subdocument was modified if not using set()
        user.markModified('notificationSettings');
        await user.save();

        return res.json({
            success: true,
            data: {
                email: user.notificationSettings.email.platform,
                push: user.notificationSettings.inApp.messages,
                comments: user.notificationSettings.email.comments,
                likes: user.notificationSettings.email.likes,
                follows: user.notificationSettings.email.followers,

            },
        });
    } catch (err) {
        console.error("Notification settings update failed:", err);
        res.status(500).json({
            success: false,
            error: { message: "Failed to update notification settings" },
        });
    }
});


module.exports = router;
