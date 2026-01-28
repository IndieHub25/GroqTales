const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Add story to user's library
router.post('/:id/library', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { storyId } = req.body;
        if (!storyId) return res.status(400).json({ message: 'Story ID is required' });

        user.library.push(storyId);
        await user.save();

        res.status(200).json({ message: 'Story added to library', library: user.library });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user's library
router.get('/:id/library', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('library');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(user.library);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;