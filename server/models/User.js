const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },
    password: { type: String, required: true, select: false },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, default: null },
    walletAddress: { type: String, default: null },
    username: { type: String, unique: true, sparse: true, trim: true },
    bio: { type: String, maxlength: 500, default: "" },
    //avatar: { type: String, default: "/images/default-avatar.png" },
    //badges: [{ type: String }], // Array to store earned badges like 'Alpha Tester'
    socialLinks: {
      twitter: String,
      website: String
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'moderator'],
      default: 'user',
    },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10); // bcrypt rounds = 10
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

const User = mongoose.model('User', UserSchema);
module.exports = User;
