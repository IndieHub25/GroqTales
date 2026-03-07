/**
 * Users API Routes — Supabase
 * Handles user profiles and account management via Supabase PostgreSQL
 */

const express = require('express');
const axios = require('axios');
const logger = require('../utils/logger');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const { authRequired } = require('../middleware/auth');

/**
 * @swagger
 * /api/v1/users/profile:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get authenticated user profile
 *     description: |
 *       Returns the authenticated user's profile, their stories, and aggregate stats.
 *       Requires a valid Supabase JWT in the Authorization header.
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
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     display_name:
 *                       type: string
 *                     bio:
 *                       type: string
 *                     avatar_url:
 *                       type: string
 *                     wallet_address:
 *                       type: string
 *                     role:
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
router.get('/profile', authRequired, async (req, res) => {
  try {
    // Get profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (profileError || !profile) {
      // Auto-create profile if it doesn't exist
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: req.user.id,
          email: req.user.email,
          username: req.user.email?.split('@')[0] || `user_${req.user.id.slice(0, 8)}`,
          first_name: req.user.raw?.user_metadata?.firstName || 'Anonymous',
          last_name: req.user.raw?.user_metadata?.lastName || 'Creator',
          display_name: req.user.raw?.user_metadata?.name || 'Anonymous Creator',
        })
        .select()
        .single();

      if (createError) {
        return res.status(500).json({ success: false, error: createError.message });
      }

      return res.json({
        success: true,
        data: { ...newProfile, preferences: getDefaultPreferences() },
        stories: [],
        stats: { storyCount: 0, totalLikes: 0, totalViews: 0 },
      });
    }

    // Get user's stories
    const { data: stories } = await supabaseAdmin
      .from('stories')
      .select('*')
      .eq('author_id', req.user.id)
      .order('created_at', { ascending: false });

    const storyList = stories || [];

    // Get user settings for preferences
    const { data: settings } = await supabaseAdmin
      .from('user_settings')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    return res.json({
      success: true,
      data: {
        ...profile,
        preferences: settings ? formatPreferences(settings) : getDefaultPreferences(),
      },
      stories: storyList,
      stats: {
        storyCount: storyList.length,
        totalLikes: storyList.reduce((sum, s) => sum + (s.likes || 0), 0),
        totalViews: storyList.reduce((sum, s) => sum + (s.views || 0), 0),
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
 *     summary: Get user profile by UUID
 *     description: Returns a public user profile with their stories and stats.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the user.
 *         example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *     responses:
 *       200:
 *         description: Profile retrieved successfully.
 *       400:
 *         description: Invalid user ID format.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
router.get('/profile/id/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID format (must be UUID)' });
    }

    const { data: user, error } = await supabaseAdmin
      .from('profiles')
      .select('id, username, first_name, last_name, display_name, bio, avatar_url, wallet_address, badges, social_twitter, social_website, created_at')
      .eq('id', id)
      .single();

    if (error || !user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const { data: stories } = await supabaseAdmin
      .from('stories')
      .select('*')
      .eq('author_id', id)
      .order('created_at', { ascending: false });

    const storyList = stories || [];

    return res.json({
      success: true,
      data: {
        user,
        stories: storyList,
        stats: {
          storyCount: storyList.length,
          totalLikes: storyList.reduce((sum, s) => sum + (s.likes || 0), 0),
          totalViews: storyList.reduce((sum, s) => sum + (s.views || 0), 0),
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
 * /api/v1/users/top-creators:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get top creators aggregate
 *     description: Returns top creators based on stories count, followers, etc.
 *     responses:
 *       200:
 *         description: Successfully retrieved top creators.
 */
router.get('/top-creators', async (req, res) => {
  try {
    // We fetch profiles
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, username, first_name, last_name, display_name, bio, avatar_url, verified, badges, created_at')
      .limit(50);

    if (profileError) throw profileError;

    // We fetch stories for agg stats
    const { data: stories, error: storiesError } = await supabaseAdmin
      .from('stories')
      .select('author_id, likes, views');

    if (storiesError) throw storiesError;

    // Calculate aggregated stats per user
    const statsMap = {};
    if (stories) {
      stories.forEach(story => {
        if (!statsMap[story.author_id]) {
          statsMap[story.author_id] = { stories: 0, likes: 0, views: 0 };
        }
        statsMap[story.author_id].stories += 1;
        statsMap[story.author_id].likes += (story.likes || 0);
        statsMap[story.author_id].views += (story.views || 0);
      });
    }

    const formattedCreators = profiles.map(profile => {
      const stats = statsMap[profile.id] || { stories: 0, likes: 0, views: 0 };
      return {
        id: profile.id,
        name: profile.display_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username || 'Anonymous',
        username: `@${profile.username}`,
        avatar: profile.avatar_url || `https://api.dicebear.com/7.x/personas/svg?seed=${profile.username}`,
        bio: profile.bio || 'Storyteller at GroqTales',
        followers: Math.floor(Math.random() * 5000) + stats.likes, // Mocking followers partially as schema lacks it for now
        stories: stats.stories,
        featured: (stats.likes > 100), // simplistic condition
        rating: Math.min(5.0, (4.0 + (stats.likes / 200))).toFixed(1),
        tags: ['Fiction', 'Adventure'], // mocked for now until genres array on profile
        badge: profile.badges && profile.badges.length > 0 ? profile.badges[0] : (stats.stories > 5 ? 'Pro' : 'Creator'),
        nfts: Math.floor(stats.stories / 2),
        joined: profile.created_at,
        achievements: stats.stories > 10 ? ['Rising Star', 'Volume Writer'] : (stats.stories > 0 ? ['New Voice'] : []),
        totalLikes: stats.likes,
        verified: profile.verified || false,
      };
    });

    return res.json({ success: true, data: formattedCreators });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/users/profile/{walletAddress}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user profile by wallet address
 *     description: Returns a user profile by Ethereum wallet address. Creates a minimal profile if one doesn't exist.
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
 *       400:
 *         description: Invalid wallet address format.
 *       500:
 *         description: Internal server error.
 */
router.get('/profile/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({ success: false, error: 'Invalid wallet address' });
    }

    const addr = walletAddress.toLowerCase();

    const { data: user, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('wallet_address', addr)
      .single();

    if (error || !user) {
      // No profile with this wallet — return empty result (can't upsert without auth.users)
      return res.json({
        success: true,
        data: {
          user: {
            wallet_address: addr,
            username: `user_${addr.slice(-6)}`,
            first_name: 'Anonymous',
            last_name: 'Creator',
          },
          stories: [],
          stats: { storyCount: 0, totalLikes: 0, totalViews: 0 },
        },
      });
    }

    const { data: stories } = await supabaseAdmin
      .from('stories')
      .select('*')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false });

    const storyList = stories || [];
    return res.json({
      success: true,
      data: {
        user,
        stories: storyList,
        stats: {
          storyCount: storyList.length,
          totalLikes: storyList.reduce((sum, s) => sum + (s.likes || 0), 0),
          totalViews: storyList.reduce((sum, s) => sum + (s.views || 0), 0),
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
 *     description: Updates allowed profile fields for the authenticated user.
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
 *               bio:
 *                 type: string
 *               username:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *       400:
 *         description: Attempted to update restricted fields.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
router.patch('/update', authRequired, async (req, res) => {
  try {
    const updates = req.body;


    if (updates.password || updates.role) {
      return res.status(400).json({ error: 'Cannot update password or role via this endpoint' });
    }

    // Map request fields to database columns
    const dbUpdates = {};
    if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName;
    if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.walletAddress !== undefined) dbUpdates.wallet_address = updates.walletAddress;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.username !== undefined) dbUpdates.username = updates.username;

    if (Object.keys(dbUpdates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const { data: updatedProfile, error } = await supabaseAdmin
      .from('profiles')
      .update(dbUpdates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!updatedProfile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Attempt to sync to Cloudflare D1
    const workerUrl = process.env.CF_WORKER_URL || 'https://groqtales-backend-workers.mantejsingh.workers.dev';
    const CF_SYNC_ENDPOINT = `${workerUrl}/api/profiles/${req.user.id}`;
    const token = req.headers.authorization?.split(' ')[1];

    try {
      await axios.put(CF_SYNC_ENDPOINT, {
        username: updatedProfile.username,
        bio: updatedProfile.bio,
        avatar_url: updatedProfile.avatar_url || null
      }, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
    } catch (cfError) {
      logger.error('Failed to sync profile to Cloudflare worker:', cfError.message);
      // Non-blocking error
    }

    return res.json({ success: true, data: updatedProfile });
  } catch (error) {
    logger.error('Profile update failed:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// Helper: format settings into preferences shape expected by frontend
function formatPreferences(settings) {
  return {
    notifications: {
      comments: settings.notif_email_comments ?? true,
      likes: settings.notif_email_likes ?? true,
      follows: settings.notif_email_followers ?? true,
      email: settings.notif_email_platform ?? false,
      push: settings.notif_inapp_messages ?? false,
      sms: false,
      marketing: false,
      updates: settings.notif_email_platform ?? false,
    },
    privacy: {
      profileVisible: settings.privacy_profile_public ?? true,
      activityVisible: settings.privacy_show_activity ?? true,
      storiesVisible: true,
      showEmail: false,
      showWallet: false,
    },
  };
}

function getDefaultPreferences() {
  return {
    notifications: {
      comments: true, likes: true, follows: true,
      email: false, push: false, sms: false, marketing: false, updates: false,
    },
    privacy: {
      profileVisible: true, activityVisible: true, storiesVisible: true,
      showEmail: false, showWallet: false,
    },
  };
}

module.exports = router;
