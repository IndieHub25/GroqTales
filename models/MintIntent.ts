import mongoose, { Schema, Document } from 'mongoose';

export interface IMintIntent extends Document {
  intentId: string;
  storyId: string;
  status: 'pending' | 'submitted' | 'confirmed' | 'failed';
  txHash?: string;
  tokenId?: string;
  retries: number;
  lastError?: string;
}

const MintIntentSchema = new Schema<IMintIntent>({
  intentId: { type: String, required: true, unique: true },
  storyId: { type: String, required: true, index: true },
  status: {
    type: String,
    enum: ['pending', 'submitted', 'confirmed', 'failed'],
    default: 'pending'
  },
  txHash: { type: String },
  tokenId: { type: String },
  retries: { type: Number, default: 0 },
  lastError: { type: String },
}, { timestamps: true });

// export default mongoose.models.MintIntent || mongoose.model<IMintIntent>('MintIntent', MintIntentSchema);
export default null as any;