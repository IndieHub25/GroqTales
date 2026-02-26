import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IRoyaltyConfig extends Document {
  nftId?: Types.ObjectId;
  storyId?: Types.ObjectId;
  creatorWallet: string;
  royaltyPercentage: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoyaltyConfigSchema = new Schema<IRoyaltyConfig>({
  nftId: { type: Schema.Types.ObjectId, ref: 'Nft', index: true },
  storyId: { type: Schema.Types.ObjectId, ref: 'Story', index: true },
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
}, { timestamps: true });

RoyaltyConfigSchema.index({ creatorWallet: 1, storyId: 1 });

// export const RoyaltyConfig: Model<IRoyaltyConfig> =
//   mongoose.models.RoyaltyConfig ||
//   mongoose.model<IRoyaltyConfig>('RoyaltyConfig', RoyaltyConfigSchema);

export const RoyaltyConfig = null as any;
export default RoyaltyConfig;
