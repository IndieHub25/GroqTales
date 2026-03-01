/**
 * Users API Routes
 * Handles user authentication, profiles, and preferences
 */

const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Story = require('../models/Story');
const router = express.Router();
const { authRequired } = require('../middleware/auth');

/**
 * @swagger
 * /api/v1/users/profile:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get authenticated user profile
 *     description: Returns the authenticated user's profile, stories, and aggregate stats. Requires a valid JWT.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully.
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
 *                     username:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     bio:
 *                       type: string
 *                     avatar:
 *                       type: string
 *                     preferences:
 *                       type: object
 *                 stories:
 *                   type: array
 *                   items:
 *                     type: object
 *                 stats:
 *                   type: object
 *                   properties:
 *                     storyCount:
 *                       type: integer
 *                     totalLikes:
 *                       type: integer
 *                     totalViews:
 *                       type: integer
 *       401:
 *         description: Unauthorized — missing or invalid JWT.
 *       404:
 *         description: Profile not found.
 *       500:
 *         description: Internal server error.
 */
// GET /api/v1/users/profile - Get authenticated user's own profile
router.get('/profile', authRequired, async (req, res) => {
  try {
    const profile = await User.findById(req.user.id)
      .select('-password -refreshToken')
      .lean();
    if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' });

    const storyQuery = { author: profile._id };
    if (!req.user || req.user.id !== profile._id.toString()) {
      storyQuery.moderationStatus = 'approved';
    }

    const stories = await Story.find(storyQuery)
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: {
        ...profile,
        preferences: {
          notifications: {
            comments: profile.notificationSettings?.email?.comments ?? true,
            likes: profile.notificationSettings?.email?.likes ?? true,
            follows: profile.notificationSettings?.email?.followers ?? true,
            email: profile.notificationSettings?.email?.platform ?? true,
            push: profile.notificationSettings?.inApp?.messages ?? false,
            sms: false,
            marketing: false,
            updates: profile.notificationSettings?.email?.platform ?? true,
          },
          privacy: {
            profileVisible: profile.privacySettings?.profilePublic ?? true,
            activityVisible: profile.privacySettings?.showActivity ?? true,
            storiesVisible: true,
            showEmail: false,
            showWallet: false,
          },
        },
      },
      stories,
      stats: {
        storyCount: stories.length,
        totalLikes: stories.reduce((sum, s) => sum + (s.stats?.likes || 0), 0),
        totalViews: stories.reduce((sum, s) => sum + (s.stats?.views || 0), 0),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});


/**
 * @swagger
 * /api/v1/users/profile/id/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user profile by MongoDB ID
 *     description: Returns a public user profile, their stories, and stats by MongoDB ObjectId.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the user.
 *         example: 65f1c9e2d3a4b567890abc12
 *     responses:
 *       200:
 *         description: Profile retrieved successfully.
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
 *                     user:
 *                       type: object
 *                     stories:
 *                       type: array
 *                       items:
 *                         type: object
 *                     stats:
 *                       type: object
 *       400:
 *         description: Invalid user ID format.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
// GET /api/v1/users/profile/id/:id - Get user profile by MongoDB ObjectId
router.get('/profile/id/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID format' });
    }

    const user = await User.findById(id)
      .select('username bio avatar badges firstName lastName wallet walletAddress email socialLinks createdAt')
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const stories = await Story.find({ author: user._id, moderationStatus: 'approved' })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: {
        user,
        stories,
        stats: {
          storyCount: stories.length,
          totalLikes: stories.reduce((sum, s) => sum + (s.stats?.likes || 0), 0),
          totalViews: stories.reduce((sum, s) => sum + (s.stats?.views || 0), 0),
        },
      },
    });
  } catch (error) {
    console.error('Profile by ID Route Error:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// GET /api/v1/users/profile/username/:username - Get user profile by username
router.get('/profile/username/:username', async (req, res) => {
  try {
    const { username } = req.params;

    // Intentionally exclude email, wallet, walletAddress for public responses
    const user = await User.findOne({ username })
      .select('username bio avatar badges firstName lastName socialLinks createdAt')
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const stories = await Story.find({ author: user._id, moderationStatus: 'approved' })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: {
        user,
        stories,
        stats: {
          storyCount: stories.length,
          totalLikes: stories.reduce((sum, s) => sum + (s.stats?.likes || 0), 0),
          totalViews: stories.reduce((sum, s) => sum + (s.stats?.views || 0), 0),
        },
      },
    });
  } catch (error) {
    console.error('Profile by Username Route Error:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /api/v1/users/profile/{walletAddress}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user profile by wallet address
 *     description: Returns a user profile by Ethereum wallet address. Creates a minimal profile if one doesn't exist (upsert).
 *     parameters:
 *       - in: path
 *         name: walletAddress
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^0x[a-fA-F0-9]{40}$'
 *         description: Ethereum wallet address (0x-prefixed, 40 hex chars).
 *         example: "0x1234567890abcdef1234567890abcdef12345678"
 *     responses:
 *       200:
 *         description: Profile retrieved or created successfully.
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
 *                     user:
 *                       type: object
 *                     stories:
 *                       type: array
 *                       items:
 *                         type: object
 *                     stats:
 *                       type: object
 *       400:
 *         description: Invalid wallet address format.
 *       500:
 *         description: Internal server error.
 */
// GET /api/v1/users/profile/:walletAddress - Get user profile by wallet address
router.get('/profile/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({ success: false, error: 'Invalid wallet address' });
    }
    const addr = walletAddress.toLowerCase();
    const user = await User.findOneAndUpdate(
      { "wallet.address": addr },
      {
        $setOnInsert: {
          wallet: { address: addr },
          username: `user_${addr.slice(-6)}`
        }
      },
      {
        upsert: true,
        new: true,
      }
    )
      .select('username bio avatar badges firstName lastName wallet createdAt')
      .lean();

    const stories = await Story.find({ author: user._id, moderationStatus: 'approved' })
      .sort({ createdAt: -1 })
      .lean();
    return res.json({
      success: true,
      data: {
        user,
        stories,
        stats: {
          storyCount: stories.length,
          totalLikes: stories.reduce((sum, s) => sum + (s.stats?.likes || 0), 0),
          totalViews: stories.reduce((sum, s) => sum + (s.stats?.views || 0), 0),
        },
      },
    });
  } catch (error) {
    console.error('Profile Route Error:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


/**
 * @swagger
 * /api/v1/users/update:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Update user profile
 *     description: Updates allowed profile fields for the authenticated user. Cannot update password or role via this endpoint.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               phone:
 *                 type: string
 *               walletAddress:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Attempted to update restricted fields (password, role).
 *       401:
 *         description: Unauthorized — missing or invalid JWT.
 *       404:
 *         description: Profile not found.
 *       500:
 *         description: Internal server error.
 */
// PATCH /api/v1/users/update - Update user profile
router.patch('/update', authRequired, async (req, res) => {
  try {
    const updates = req.body;
    if (updates.password || updates.role) {
      return res
        .status(400)
        .json({ error: 'Cannot update password or role via this endpoint' });
    }
    const allowed = [
      'firstName',
      'lastName',
      'phone',
      'walletAddress',
      'email',
    ];
    Object.keys(updates).forEach((key) => {
      if (!allowed.includes(key)) {
        delete updates[key];
      }
    });
    const updatedProfile = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { ...updates } },
      { new: true, upsert: false, runValidators: true }
    ).lean();
    if (!updatedProfile)
      return res.status(404).json({ error: 'Profile not found' });

    return res.json(updatedProfile);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
