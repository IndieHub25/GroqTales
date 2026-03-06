import mongoose, { Schema, Document } from 'mongoose';

export interface IGenerationLog extends Document {
  prompt: string;
  genre: string;
  modelUsed: string;         
  fallbackTriggered: boolean; 
  variantId: string;        
  latencyMs: number;     
  status: 'success' | 'error' | 'security_blocked';
  timestamp: Date;
}

const GenerationLogSchema: Schema = new Schema({
  prompt: { type: String, required: true },
  genre: { type: String },
  modelUsed: { type: String, required: true },
  fallbackTriggered: { type: Boolean, default: false },
  variantId: { type: String, required: true },
  latencyMs: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['success', 'error', 'security_blocked'], 
    required: true 
  },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.GenerationLog ||
  mongoose.model<IGenerationLog>(
    'GenerationLog',
    GenerationLogSchema,
    'generationlogs'
  );