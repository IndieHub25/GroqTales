const mongoose = require('mongoose');

const CurrentSnapshotSchema = new mongoose.Schema(
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

const VersionSnapshotSchema = new mongoose.Schema({
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
});

const DraftSchema = new mongoose.Schema(
  {
    draftKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    storyType: { type: String, default: 'text' },
    storyFormat: { type: String, default: 'free' },
    ownerWallet: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
      index: true,
    },
    ownerRole: {
      type: String,
      enum: ['wallet', 'admin', 'guest'],
      default: 'wallet',
    },
    current: {
      type: CurrentSnapshotSchema,
      required: true,
      default: () => ({}),
    },
    versions: {
      type: [VersionSnapshotSchema],
      default: [],
    },
    aiMetadata: {
      pipelineState: {
        type: String,
        enum: ['idle', 'ready', 'processing'],
        default: 'idle',
      },
      suggestedEdits: { type: [String], default: [] },
      lastEditedByAIAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Draft || mongoose.model('Draft', DraftSchema);
