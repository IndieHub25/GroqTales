const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
  {
    storyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Story',
      required: [true, 'Story ID is required'],
      index: true,
    },
    authorId: {
      type: String,
      required: [true, 'Author ID is required'],
    },
    author: {
      name: {
        type: String,
        required: true,
      },
      username: {
        type: String,
        required: true,
      },
      avatar: {
        type: String,
        default: '',
      },
      walletAddress: {
        type: String,
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
      trim: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'deleted', 'moderated'],
      default: 'active',
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
CommentSchema.index({ storyId: 1, createdAt: -1 });
CommentSchema.index({ parentId: 1 });
CommentSchema.index({ status: 1 });

module.exports = mongoose.model('Comment', CommentSchema);
