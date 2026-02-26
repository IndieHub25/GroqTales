const mongoose = require('mongoose');

const RoyaltyTransactionSchema = new mongoose.Schema(
  {
    nftId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Nft',
      required: true,
      index: true,
    },
    salePrice: { type: Number, required: true, min: 0 },
    royaltyAmount: { type: Number, required: true, min: 0 },
    royaltyPercentage: { type: Number, required: true, min: 0, max: 50 },
    sellerWallet: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    buyerWallet: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    creatorWallet: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    txHash: { type: String },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

RoyaltyTransactionSchema.index({ creatorWallet: 1, createdAt: -1 });
RoyaltyTransactionSchema.index({ nftId: 1, createdAt: -1 });

const RoyaltyTransaction =
  mongoose.models.RoyaltyTransaction ||
  mongoose.model('RoyaltyTransaction', RoyaltyTransactionSchema);

module.exports = RoyaltyTransaction;
