import mongoose, { Schema, model, models, Document } from 'mongoose';

export interface IUserInteraction extends Document {
  userId: mongoose.Types.ObjectId;
  storyId: mongoose.Types.ObjectId;
  type: 'VIEW' | 'LIKE' | 'BOOKMARK' | 'SHARE' | 'TIME_SPENT';
  value: number;
  createdAt: Date;
}

const UserInteractionSchema = new Schema<IUserInteraction>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  storyId: { type: Schema.Types.ObjectId, ref: 'Story', required: true },
  type: {
    type: String,
    enum: ['VIEW', 'LIKE', 'BOOKMARK', 'SHARE', 'TIME_SPENT'],
    required: true
  },
  value: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

UserInteractionSchema.index({ userId: 1, createdAt: -1 });

// export const UserInteraction = models.UserInteraction || model<IUserInteraction>('UserInteraction', UserInteractionSchema);
export const UserInteraction = null as any;