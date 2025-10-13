const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  tags: { type: [String], default: [] },
  contentType: { type: String, enum: ['file', 'url', 'youtube', 'twitter', 'instagram', 'unknown'], default: 'unknown' },
  source: { type: String, required: true },
  s3Path: { type: String },
  isPublic: { type: Boolean, default: false },
  isFavorite: { type: Boolean, default: false },
  sharedWith: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Content', ContentSchema);