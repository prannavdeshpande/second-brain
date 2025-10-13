const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  plan: { type: String, enum: ['free', 'premium', 'pro'], default: 'free' },
  status: { type: String, enum: ['active', 'canceled', 'past_due', 'incomplete'], default: 'active' },
  stripeCustomerId: { type: String, unique: true, sparse: true },
  stripeSubscriptionId: { type: String, unique: true, sparse: true },
  currentPeriodEnd: { type: Date },
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);