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
    enum: ['fantasy', 'sci-fi', 'mystery', 'adventure', 'horror', 'romance', 'other'],
  },
  // REVISED: Link to your User model for dynamic profiles
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // NEW: Track metrics for the profile page
  stats: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
  },
  // NEW: Web3/NFT tracking
  isMinted: { type: Boolean, default: false },
  nftTokenId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true }); // Automatically adds updatedAt

module.exports = mongoose.model('Story', StorySchema);