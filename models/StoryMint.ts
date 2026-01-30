import mongoose, { Schema, Document } from 'mongoose';

export interface IStoryMint extends Document {
  storyHash: string;
  status: 'PENDING' | 'MINTED' | 'FAILED';
  authorAddress: string;
  title: string;
  txHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StoryMintSchema = new Schema<IStoryMint>({
  storyHash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'MINTED', 'FAILED'],
    required: true,
    default: 'PENDING'
  },
  authorAddress: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  txHash: {
    type: String
  }
}, {
  timestamps: true
});

StoryMintSchema.index({ storyHash: 1, status: 1 });
StoryMintSchema.index({ authorAddress: 1 });

export default mongoose.models.StoryMint || mongoose.model<IStoryMint>('StoryMint', StoryMintSchema);
