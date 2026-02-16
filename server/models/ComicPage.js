const mongoose = require('mongoose');

const ImageAssetSchema = new mongoose.Schema(
  {
    originalCID: {
      type: String,
      required: true,
      trim: true,
    },
    thumbCID: {
      type: String,
      trim: true,
    },
    webCID: {
      type: String,
      trim: true,
    },
    hdCID: {
      type: String,
      trim: true,
    },
    gatewayURLs: {
      original: String,
      thumb: String,
      web: String,
      hd: String,
    },
    dimensions: {
      width: Number,
      height: Number,
    },
    fileSize: {
      type: Number,
      min: 0,
    },
    mimeType: {
      type: String,
      enum: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      required: true,
    },
  },
  { _id: false }
);

const PanelDescriptorSchema = new mongoose.Schema(
  {
    order: {
      type: Number,
      required: true,
      min: 1,
    },
    boundingBox: {
      x: { type: Number, min: 0 },
      y: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Panel description cannot exceed 1000 characters'],
    },
    characters: {
      type: [String],
      default: [],
    },
    dialogues: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const ComicPageSchema = new mongoose.Schema(
  {
    comicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comic',
      required: [true, 'Please provide comic ID'],
      index: true,
    },
    pageNumber: {
      type: Number,
      required: [true, 'Please provide page number'],
      min: [1, 'Page number must be at least 1'],
    },
    imageAsset: {
      type: ImageAssetSchema,
      required: [true, 'Please provide image asset'],
    },
    altText: {
      type: String,
      required: [true, 'Alt text is required for accessibility'],
      trim: true,
      maxlength: [500, 'Alt text cannot exceed 500 characters'],
    },
    transcript: {
      type: String,
      trim: true,
      maxlength: [5000, 'Transcript cannot exceed 5000 characters'],
    },
    captions: {
      type: [String],
      default: [],
    },
    panelDescriptors: {
      type: [PanelDescriptorSchema],
      default: [],
      validate: {
        validator: function (v) {
          // Check unique panel orders
          const orders = v.map((p) => p.order);
          return orders.length === new Set(orders).size;
        },
        message: 'Panel orders must be unique',
      },
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    pinnedAt: {
      type: Date,
      default: null,
    },
    version: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: one pageNumber per comic
ComicPageSchema.index({ comicId: 1, pageNumber: 1 }, { unique: true });

// Index for checking pinned status
ComicPageSchema.index({ isPinned: 1 });

// Post-save middleware to update comic's totalPages
// Note: For bulk operations (e.g., deleteMany), use ComicPage.recalculateTotalPages(comicId) manually.
ComicPageSchema.post('save', async function () {
  const Comic = mongoose.model('Comic');
  const count = await mongoose.model('ComicPage').countDocuments({
    comicId: this.comicId,
  });
  await Comic.findByIdAndUpdate(this.comicId, { totalPages: count });
});


// Static utility to recalculate totalPages after bulk ops
/**
 * Recalculate and update the totalPages field on the Comic document after bulk page operations.
 * Must be called manually after bulk deletes/inserts.
 * @param {ObjectId} comicId
 */
ComicPageSchema.statics.recalculateTotalPages = async function (comicId) {
  const Comic = mongoose.model('Comic');
  const count = await this.countDocuments({ comicId });
  await Comic.findByIdAndUpdate(comicId, { totalPages: count });
};

// Post-remove middleware to update comic's totalPages
ComicPageSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    const Comic = mongoose.model('Comic');
    const count = await mongoose.model('ComicPage').countDocuments({
      comicId: doc.comicId,
    });
    await Comic.findByIdAndUpdate(doc.comicId, { totalPages: count });
  }
});

module.exports = mongoose.model('ComicPage', ComicPageSchema);
