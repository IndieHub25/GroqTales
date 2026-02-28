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

// GET /api/v1/users/profile - Get authenticated user's own profile
router.get('/profile', authRequired, async (req, res) => {
  try {
    const profile = await User.findById(req.user.id)
      .select('-password -refreshToken')
      .lean();
    if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' });

    const stories = await Story.find({ author: profile._id })
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

    const stories = await Story.find({ author: user._id })
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

    const stories = await Story.find({ author: user._id })
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
