const mongoose = require('mongoose');

const RoyaltyConfigSchema = new mongoose.Schema(
  {
    nftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Nft', index: true },
    storyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Story', index: true },
    creatorWallet: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    royaltyPercentage: {
      type: Number,
      default: 5,
      min: 0,
      max: 50,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

RoyaltyConfigSchema.index({ creatorWallet: 1, storyId: 1 });

const RoyaltyConfig =
  mongoose.models.RoyaltyConfig ||
  mongoose.model('RoyaltyConfig', RoyaltyConfigSchema);

module.exports = RoyaltyConfig;
