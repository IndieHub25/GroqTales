const express = require('express');
const router = express.Router();
const vectorService = require('../services/vectorService');

// POST /api/vector/check
router.post('/check', async (req, res) => {
    try {
        const { storyline } = req.body;
        if (!storyline) {
            return res.status(400).json({ error: 'Storyline is required' });
        }
        const result = await vectorService.checkStorylineExists(storyline);
        return res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/vector/store
router.post('/store', async (req, res) => {
    try {
        const { storyline, genre, themes } = req.body;
        if (!storyline) return res.status(400).json({ error: 'Storyline is required' });

        const doc = await vectorService.storeStoryEmbedding(storyline, genre, themes || []);
        return res.json({ success: true, id: doc._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
