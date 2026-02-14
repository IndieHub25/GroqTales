const mongoose = require('mongoose');

const CreatorEarningsSchema = new mongoose.Schema({
  creatorWallet: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  totalEarned: { type: Number, default: 0, min: 0 },
  pendingPayout: { type: Number, default: 0, min: 0 },
  paidOut: { type: Number, default: 0, min: 0 },
  totalSales: { type: Number, default: 0, min: 0 },
  lastUpdated: { type: Date, default: Date.now },
});

const CreatorEarnings =
  mongoose.models.CreatorEarnings ||
  mongoose.model('CreatorEarnings', CreatorEarningsSchema);

module.exports = CreatorEarnings;
