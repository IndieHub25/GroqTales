import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDraftSnapshot {
  title: string;
  description: string;
  genre: string;
  content: string;
  coverImageName?: string;
  updatedAt: Date;
  version: number;
}

export interface IDraftVersion extends IDraftSnapshot {
  reason: 'autosave' | 'blur' | 'manual' | 'restore';
}

export interface IDraftAiMetadata {
  pipelineState: 'idle' | 'ready' | 'processing';
  suggestedEdits: string[];
  lastEditedByAIAt?: Date | null;
}

export interface IDraft extends Document {
  draftKey: string;
  storyType: string;
  storyFormat: string;
  ownerWallet?: string | null;
  ownerRole: 'wallet' | 'admin' | 'guest';
  current: IDraftSnapshot;
  versions: IDraftVersion[];
  aiMetadata: IDraftAiMetadata;
  createdAt: Date;
  updatedAt: Date;
}

const DraftSnapshotSchema = new Schema<IDraftSnapshot>(
  {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    genre: { type: String, default: '' },
    content: { type: String, default: '' },
    coverImageName: { type: String, default: '' },
    updatedAt: { type: Date, default: Date.now },
    version: { type: Number, default: 1 },
  },
  { _id: false }
);

const DraftVersionSchema = new Schema<IDraftVersion>(
  {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    genre: { type: String, default: '' },
    content: { type: String, default: '' },
    coverImageName: { type: String, default: '' },
    updatedAt: { type: Date, default: Date.now },
    version: { type: Number, default: 1 },
    reason: {
      type: String,
      enum: ['autosave', 'blur', 'manual', 'restore'],
      default: 'autosave',
    },
  },
  { _id: true }
);

const DraftSchema = new Schema<IDraft>(
  {
    draftKey: { type: String, required: true, unique: true, trim: true, index: true },
    storyType: { type: String, default: 'text' },
    storyFormat: { type: String, default: 'free' },
    ownerWallet: { type: String, default: null, lowercase: true, trim: true, index: true },
    ownerRole: { type: String, enum: ['wallet', 'admin', 'guest'], default: 'wallet' },
    current: { type: DraftSnapshotSchema, required: true, default: () => ({}) },
    versions: { type: [DraftVersionSchema], default: [] },
    aiMetadata: {
      pipelineState: { type: String, enum: ['idle', 'ready', 'processing'], default: 'idle' },
      suggestedEdits: { type: [String], default: [] },
      lastEditedByAIAt: { type: Date, default: null },
    },
  },
  { timestamps: true, strict: false }
);

DraftSchema.index({ ownerWallet: 1, updatedAt: -1 });

export const Draft: Model<IDraft> = mongoose.models.Draft || mongoose.model<IDraft>('Draft', DraftSchema);
export default Draft;

