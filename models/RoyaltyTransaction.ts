import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IRoyaltyTransaction extends Document {
  nftId: Types.ObjectId;
  salePrice: number;
  royaltyAmount: number;
  royaltyPercentage: number;
  sellerWallet: string;
  buyerWallet: string;
  creatorWallet: string;
  txHash?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

const RoyaltyTransactionSchema = new Schema<IRoyaltyTransaction>({
  nftId: {
    type: Schema.Types.ObjectId,
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
}, { timestamps: { createdAt: true, updatedAt: false } });

RoyaltyTransactionSchema.index({ creatorWallet: 1, createdAt: -1 });
RoyaltyTransactionSchema.index({ nftId: 1, createdAt: -1 });

export const RoyaltyTransaction: Model<IRoyaltyTransaction> =
  mongoose.models.RoyaltyTransaction ||
  mongoose.model<IRoyaltyTransaction>('RoyaltyTransaction', RoyaltyTransactionSchema);

export default RoyaltyTransaction;
