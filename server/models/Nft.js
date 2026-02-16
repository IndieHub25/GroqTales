const mongoose = require('mongoose');

const MetadataSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    attributes: {
      type: Array,
      default: [],
    },
  },
  { _id: false }
);

const NftSchema = new mongoose.Schema(
  {
    tokenId: {
      type: String,
      unique: true,
      required: [true, 'Please provide unique token ID'],
      trim: true,
      minlength: [3, 'Token ID must be at least 3 characters long'],
      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9-_]+$/.test(v);
        },
        message:
          'Token ID can only contain alphanumeric characters, hyphens, and underscores',
      },
    },
    storyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Story',
      required: [true, 'Please provide associated story ID'],
    },
    storyHash: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^0x([A-Fa-f0-9]{64})$/.test(v);
        },
        message: 'Invalid Keccak256 hash format',
      },
    },
    embeddedMetadata: {
      type: MetadataSchema,
      required: [true, 'Please provide embedded metadata'],
    },
    metadata: {
      type: Object,
      default: null, // Optional: stores raw metadata JSON for IPFS/external use. embeddedMetadata is the validated subset.
    },
    mintedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    mintedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide current owner'],
    },
    price: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative'],
    },
    isListed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Nft = mongoose.model('Nft', NftSchema);

module.exports = Nft;
