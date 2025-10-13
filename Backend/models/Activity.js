const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  action: {
    type: String,
    enum: ['add_content', 'edit_content', 'delete_content', 'share_content', 'favorite_content'],
    required: true,
  },
  content: { type: mongoose.Schema.ObjectId, ref: 'Content' },
}, { timestamps: true });

module.exports = mongoose.model('Activity', ActivitySchema);