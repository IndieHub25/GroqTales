const mongoose = require('mongoose');

const CollaboratorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['co-author', 'editor', 'artist', 'viewer'],
      default: 'viewer',
    },
  },
  { _id: false }
);

const OnChainDataSchema = new mongoose.Schema(
  {
    network: {
      type: String,
      enum: ['ethereum', 'polygon', 'base', 'arbitrum', 'optimism'],
      default: 'polygon',
    },
    contractAddress: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return !v || /^0x[a-fA-F0-9]{40}$/.test(v);
        },
        message: 'Invalid contract address format',
      },
    },
    tokenId: {
      type: String,
      trim: true,
    },
    mintTxHash: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return !v || /^0x([A-Fa-f0-9]{64})$/.test(v);
        },
        message: 'Invalid transaction hash format',
      },
    },
    ipfsMetadataCID: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const ComicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);
        },
        message:
          'Slug can only contain lowercase letters, numbers, and hyphens',
      },
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      trim: true,
      maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    genres: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return v && v.length > 0 && v.length <= 5;
        },
        message: 'Please select 1-5 genres',
      },
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
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (v) {
          return v.length <= 20;
        },
        message: 'Cannot have more than 20 tags',
      },
    },
    language: {
      type: String,
      required: true,
      default: 'en',
      lowercase: true,
      minlength: 2,
      maxlength: 5,
    },
    coverImage: {
      cid: {
        type: String,
        trim: true,
      },
      gatewayURL: {
        type: String,
        trim: true,
      },
    },
    status: {
      type: String,
      enum: ['draft', 'review', 'published'],
      default: 'draft',
      required: true,
    },
    visibility: {
      type: String,
      enum: ['private', 'unlisted', 'public'],
      default: 'private',
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide creator'],
    },
    collaborators: {
      type: [CollaboratorSchema],
      default: [],
    },
    onChainData: {
      type: OnChainDataSchema,
      default: null,
    },
    version: {
      type: Number,
      default: 1,
      min: 1,
    },
    totalPages: {
      type: Number,
      default: 0,
      min: 0,
    },
    nextPageNumber: {
      type: Number,
      default: 1,
      min: 1,
    },
    readingDirection: {
      type: String,
      enum: ['ltr', 'rtl', 'ttb'],
      default: 'ltr',
    },
    ageRating: {
      type: String,
      enum: ['everyone', 'teen', 'mature', 'explicit'],
      default: 'everyone',
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
  }
);
// Pre-validate middleware to generate slug if not provided
ComicSchema.pre('validate', function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});
ComicSchema.index({ creator: 1, status: 1 });
ComicSchema.index({ status: 1, visibility: 1 });
ComicSchema.index({ genres: 1 });
ComicSchema.index({ tags: 1 });
ComicSchema.index({ createdAt: -1 });
ComicSchema.index({ publishedAt: -1 });
// Text search index
ComicSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
});
// Virtual for pages
ComicSchema.virtual('pages', {
  ref: 'ComicPage',
  localField: '_id',
  foreignField: 'comicId',
});

// Slug is generated in the pre-validate hook (see ComicSchema.pre('validate')), so no pre-save hook is needed.

module.exports = mongoose.model('Comic', ComicSchema);
