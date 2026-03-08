const mongoose = require('mongoose');

const StoryEmbeddingSchema = new mongoose.Schema({
    storyline: {
        type: String,
        required: true,
    },
    embedding: {
        type: [Number],
        required: true,
    },
    genre: {
        type: String,
    },
    themes: {
        type: [String],
        default: [],
    },
    title: {
        type: String,
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StoryEmbedding', StoryEmbeddingSchema);
