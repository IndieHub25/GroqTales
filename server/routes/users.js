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

// GET /api/v1/users//profile/:walletAddress - Get logged-in user's full profile
router.get('/profile/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const addr = walletAddress.toLowerCase();

    // 1. Find the user. If they don't exist, CREATE them.
    let user = await User.findOne({ walletAddress: addr }).lean();
    if (!user) {
      user = await User.create({
        walletAddress: addr,
        username: `user_${addr.slice(-4)}`
      });
    }

    // 2. Fetch their stories (linking by user._id)
    const stories = await Story.find({ author: user._id })
      .sort({ createdAt: -1 })
      .lean();

    // 3. Return the dynamic data
    return res.json({
      user,
      stories,
      stats: {
        storyCount: stories.length,
        totalLikes: stories.reduce((sum, s) => sum + (s.stats?.likes || 0), 0),
        totalViews: stories.reduce((sum, s) => sum + (s.stats?.views || 0), 0)
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
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
