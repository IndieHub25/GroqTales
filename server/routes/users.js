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

// GET /api/v1/users/profile/:walletAddress - Get user profile by wallet address
router.get('/profile/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const addr = req.params.walletAddress.toLowerCase();
    let user = await User.findOne(
      { walletAddress: addr },
      // { 
      //   $setOnInsert: { 
      //     walletAddress: addr, 
      //     username: `user_${addr.slice(2,14)}` 
      //   } 
      // },
      // { 
      //   upsert: true, 
      //   new: true, 
      // }
    
    );
    //.select('username bio avatar badges firstName lastName walletAddress createdAt' )
    //.lean();
    if(!user){
      return res.status(404).json({
        success: false,
        error:{message: 'User not found'},
        //username: `user_${addr.slice(2,10)}`
      });
      //return res.status(500).json({error:'User upsert failed'});
    }
    // const stories = await Story.find({ author: user._id })
    //   .sort({ createdAt: -1 })
    //   .lean();
    return res.json({
      success: true,
      data: {
        user : {
          id: user._id.toString(),
          username: user.username,
          //displayName: `${user.firstName} ${user.lastName}`,
          bio: user.bio,
          avatar: user.avatar,
          walletAddress: user.wallet?.address,
          role: user.role,
          verified: user.wallet?.verified??false,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,

          // preferences: {
          //   theme: 'dark',
          //   notifications: {
          //     comments: user.notificationSettings.email.comments,
          //     likes: user.notificationSettings.email.likes,
          //     follows: user.notificationSettings.email.followers,
          //     updates: user.notificationSettings.email.platforms,
          //     marketing: false,
          //     sms: false,
          //     push: false,
          //   },
          //   privacy: {
          //     profileVisible: user.privacySettings.profilePublic,
          //     storiesVisible: true,
          //     activityVisible: user.privacySettings.showActivity,
          //     showEmail: false,
          //     showWallet: true,
          //   },
          //   content: {
          //     explicitContent: false,
          //     contentWarnings: false,
          //     autoSave: true,
          //     autoPublish: false,
          //   },
          // },
          stats: user.stats??{},
          //  {
          //   storiesCreated: stories.length,
          //   storiesPublished: stories.length,
          //   totalViews: stories.reduce((s,x) => s+(x.stats?.views ||0),0),
          //   totalLikes:stories.reduce((s,x) => s+(x.stats?.likes ||0),0),
          //   totalComments:stories.reduce((s,x) => s+(x.stats?.comments ||0),0),
          //   nfsMinted: 0,
          //   nftsSold: 0,
          //   totalEarnings: 0,
          //   followers: 0,
          //   following: 0,
          // },
          // verification: {
          //   email: !!user.email,
          //   phone: false,
          //   identity: false,
          //   twitter: false,
          //   discord: false,
          //   github: false,
          // },
        },
        stories: [],
      },
    });
  } catch (error) {
    console.error('Profile Route Error:', error);
    return res.status(500).json({ 
      success: false,
      error: {message : 'Failed to load profile' },
  });
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
