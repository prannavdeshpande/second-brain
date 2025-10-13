const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'New User',
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    select: false, // Don't return password by default
  },
  avatar: {
    type: String,
  },
  authProvider: {
    type: String,
    enum: ['email', 'google', 'github'],
    default: 'email',
  },
  providerId: {
    type: String,
  },
  subscription: {
    type: mongoose.Schema.ObjectId,
    ref: 'Subscription',
  },
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.authProvider !== 'email') {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);