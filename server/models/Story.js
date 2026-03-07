const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters'],
    default: '',
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
  twists: {
    type: [String],
    default: [],
  },
  tags: {
    type: [String],
    default: [],
  },
  source: {
    type: String,
    enum: ['ai-generated', 'uploaded'],
    default: 'ai-generated',
  },
  coverImageUrl: {
    type: String,
    default: null,
  },
  imageUrls: {
    type: [String],
    default: [],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  stats: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
  },
  isMinted: { type: Boolean, default: false },
  nftTokenId: { type: String, default: null },
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true,
  },
  moderatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  moderationNotes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true }); // Automatically adds updatedAt

StorySchema.pre('save', function (next) {
  if (['approved', 'rejected'].includes(this.moderationStatus) && !this.moderatorId) {
    return next(new Error('moderatorId is required when moderationStatus is approved or rejected'));
  }
  next();
});

module.exports = mongoose.model('Story', StorySchema);