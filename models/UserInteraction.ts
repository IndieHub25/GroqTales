import { Schema, model, models } from 'mongoose';

const UserInteractionSchema = new Schema({
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

export const UserInteraction = models.UserInteraction || model('UserInteraction', UserInteractionSchema);