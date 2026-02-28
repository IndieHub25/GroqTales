import mongoose, { Schema, Document } from 'mongoose';

export interface IOutbox extends Document {
  eventType: string;
  aggregateId: string;
  payload: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  processedAt?: Date;
  attempts: number;
  lastError?: string;
}

const OutboxSchema = new Schema<IOutbox>({
  eventType: { type: String, required: true, index: true },
  aggregateId: { type: String, required: true },
  payload: { type: Schema.Types.Mixed, required: true },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  attempts: { type: Number, default: 0 },
  lastError: { type: String },
  processedAt: { type: Date }
}, { timestamps: true });

OutboxSchema.index({ processedAt: 1 }, { expireAfterSeconds: 604800, partialFilterExpression: { status: 'completed' } });

// export default mongoose.models.Outbox || mongoose.model<IOutbox>('Outbox', OutboxSchema);
export default null as any;