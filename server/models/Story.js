const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  content: {
    type: String,
    required: [true, 'Please add content'],
  },
  genre: {
    type: String,
    lowercase: true,
    required: true,
    enum: [
      'fantasy',
      'sci-fi',
      'mystery',
      'adventure',
      'horror',
      'romance',
      'other',
    ],
  },
  author: {
    type: String, // Wallet address or user ID
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Story', StorySchema);
