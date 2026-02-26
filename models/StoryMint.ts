import mongoose, { Schema, Document } from 'mongoose';

export interface IStoryMint extends Document {
  storyHash: string;
  status: 'PENDING' | 'MINTED' | 'FAILED';
  authorAddress: string;
  title: string;
  txHash?: string;
  tokenId?: string;
  mintedAt?: Date;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StoryMintSchema = new Schema<IStoryMint>(
  {
    storyHash: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'MINTED', 'FAILED'],
      default: 'PENDING',
      required: true,
    },
    authorAddress: {
      type: String,
      required: true,
      lowercase: true,
    },
    title: {
      type: String,
      required: true,
    },
    txHash: {
      type: String,
    },
    tokenId: {
      type: String,
    },
    mintedAt: {
      type: Date,
    },
    error: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
StoryMintSchema.index({ status: 1, createdAt: -1 });
StoryMintSchema.index({ authorAddress: 1, status: 1 });

// Ensure authorAddress is normalized to lowercase on save
StoryMintSchema.pre('save', function() {
  if (this.authorAddress && typeof this.authorAddress === 'string') {
    this.authorAddress = this.authorAddress.toLowerCase();
  }
});

function normalizeUpdate(this: any) {
  const update = this.getUpdate && this.getUpdate();
  if (!update) return;

  // Handle $set payloads
  if (update.$set && update.$set.authorAddress && typeof update.$set.authorAddress === 'string') {
    update.$set.authorAddress = update.$set.authorAddress.toLowerCase();
  }

  // Handle $setOnInsert payloads (upsert paths)
  if (update.$setOnInsert?.authorAddress && typeof update.$setOnInsert.authorAddress === 'string') {
    update.$setOnInsert.authorAddress = update.$setOnInsert.authorAddress.toLowerCase();
  }

  // Handle top-level authorAddress in update doc
  if (update.authorAddress && typeof update.authorAddress === 'string') {
    update.authorAddress = update.authorAddress.toLowerCase();
  }

  // Re-assign sanitized update
  this.setUpdate && this.setUpdate(update);
}
StoryMintSchema.pre('findOneAndUpdate', normalizeUpdate);
StoryMintSchema.pre('updateOne', normalizeUpdate);
StoryMintSchema.pre('updateMany', normalizeUpdate);
StoryMintSchema.pre('replaceOne', normalizeUpdate);const StoryMintModel: mongoose.Model<IStoryMint> =
  (mongoose.models.StoryMint as mongoose.Model<IStoryMint>) ||
  mongoose.model<IStoryMint>('StoryMint', StoryMintSchema);

export default StoryMintModel;
