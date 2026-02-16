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
router.get('/profile', authRequired, async (req, res) => {
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

<<<<<<< HEAD
=======

>>>>>>> c5e035fd8c574bf110626ad9d85b39c59dd7f2d9
// GET /api/v1/users/profile/:walletAddress - Get user profile by wallet address
router.get('/profile/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
<<<<<<< HEAD
    const addr = walletAddress.toLowerCase();
    const user = await User.findOneAndUpdate(
      { walletAddress: addr },
      { 
        $setOnInsert: { 
          walletAddress: addr, 
          username: `user_${addr.slice(-8)}` 
        } 
=======

    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)){
      return res.status(400).json({error: "Invalid wallet address"});
    }
    const addr = walletAddress.toLowerCase();
    const user = await User.findOneAndUpdate(
      { "wallet.address": addr },
       {
        $setOnInsert: { 
          wallet: {address: addr}, 
          username: `user_${addr.slice(-6)}` 
        } 
      
>>>>>>> c5e035fd8c574bf110626ad9d85b39c59dd7f2d9
      },
      { 
        upsert: true, 
        new: true, 
<<<<<<< HEAD
        projection: 'username bio avatar badges firstName lastName walletAddress createdAt' 
      }
    ).lean();
=======
        //projection: 'username bio avatar badges firstName lastName walletAddress createdAt' 
      }
    )
    .select('username bio avatar badges firstName lastName wallet createdAt')
    .lean();

    // if(!user){
    //   return res.status(404).json({error: "User not found"});
    // }
>>>>>>> c5e035fd8c574bf110626ad9d85b39c59dd7f2d9
    const stories = await Story.find({ author: user._id })
      .sort({ createdAt: -1 })
      .lean();
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
    console.error('Profile Route Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

<<<<<<< HEAD
=======

>>>>>>> c5e035fd8c574bf110626ad9d85b39c59dd7f2d9
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
