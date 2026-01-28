import mongoose, { Schema, Document } from 'mongoose';

export interface IStory extends Document {
  title: string;
  content: string;
  authorWallet: string;
  ipfsHash?: string;
  coverImage?: string;
  
  status: 'draft' | 'publishing' | 'minted' | 'failed' | 'published';
  
  nftTxHash?: string;
  nftTokenId?: string;
  
  createdAt: Date;
  updatedAt: Date;
  
  [key: string]: any; 
}

const StorySchema = new Schema<IStory>({
  title: { type: String, required: true, maxlength: 100 },
  content: { type: String, required: true },
  authorWallet: { 
    type: String, 
    required: true, 
    lowercase: true, 
    trim: true,
    index: true 
  },
  ipfsHash: { type: String },
  coverImage: { type: String },
  
  status: { 
    type: String, 
    enum: ['draft', 'publishing', 'minted', 'failed', 'published'], 
    default: 'draft',
    index: true 
  },
  
  nftTxHash: { type: String },
  nftTokenId: { type: String },
}, { 
  timestamps: true,
  strict: false 
});

StorySchema.index({ authorWallet: 1, status: 1 });

export default mongoose.models.Story || mongoose.model<IStory>('Story', StorySchema);