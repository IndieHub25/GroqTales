/**
 * Users API Routes
 * Handles user authentication, profiles, and preferences
 */

const express = require('express');
const User = require('../models/User');
const Story = require('../models/Story');
const router = express.Router();
const { authRequired } = require('../middleware/auth');

// GET /api/v1/users/profile - Get user profile
router.get('/profile', authRequired , async (req, res) => {
  try {
    const profile = await User.findById(req.user.id)
      .select('-password -refreshToken')
      .lean();
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    return res.json(profile);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/users/me - Get logged-in user's full profile
router.get('/me', authRequired , async (req, res) => {
  try {
    // 1. Fetch user
    const user = await User.findById(req.user.id)
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 2. Fetch authored stories
    const stories = await Story.find({ author: user._id })
      .sort({ createdAt: -1 })
      .lean();

    // 3. Aggregate stats
    const stats = {
      storyCount: stories.length,
      totalLikes: stories.reduce((sum, s) => sum + (s.stats?.likes || 0), 0),
      totalViews: stories.reduce((sum, s) => sum + (s.stats?.views || 0), 0),
      //followerCount: user.followers?.length || 0
    };

    return res.json({
      user,
      stats,
      stories
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});


// PATCH /api/v1/users/update - Update user profile
router.patch('/update', authRequired, async (req, res) => {
  try {
    const updates = req.body;
    if(updates.password || updates.role) {
      return res.status(400).json({ error: 'Cannot update password or role via this endpoint' });
    }
    const allowed = ['firstName', 'lastName', 'phone', 'walletAddress', 'email'];
    Object.keys(updates).forEach(key => {
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

// GET /api/v1/users/public/:walletAddress - Fetch public profile and stories
router.get('/public/:walletAddress',async (req, res) => {
  try {
    const { walletAddress } = req.params;

    // 1. Find user by wallet
    const user = await User.findOne({ walletAddress })
      .select('username bio avatar badges firstName lastName createdAt')
      .lean();

    if (!user) {
      return res.status(404).json({ error: 'Creator not found' });
    }

    // 2. Find their stories
    const stories = await Story.find({ author: user._id })
      .sort({ createdAt: -1 })
      .lean();

    // 3. Return combined payload
    return res.json({
      user,
      stories,
      stats: {
        storyCount: stories.length,
        totalLikes: stories.reduce((acc, s) => acc + (s.stats?.likes || 0), 0)
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
