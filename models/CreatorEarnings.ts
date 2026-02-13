import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICreatorEarnings extends Document {
  creatorWallet: string;
  totalEarned: number;
  pendingPayout: number;
  paidOut: number;
  totalSales: number;
  lastUpdated: Date;
}

const CreatorEarningsSchema = new Schema<ICreatorEarnings>({
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

export const CreatorEarnings: Model<ICreatorEarnings> =
  mongoose.models.CreatorEarnings ||
  mongoose.model<ICreatorEarnings>('CreatorEarnings', CreatorEarningsSchema);

export default CreatorEarnings;
