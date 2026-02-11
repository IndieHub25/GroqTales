const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    walletAddress: { 
      type: String, 
      default: null,
      lowercase: true, 
      trim: true 
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      sparse: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },
    password: { type: String, required: false,select: false},
    username: { type: String, unique: true, sparse: true },
    firstName: { type: String, default: "Anonymous" },
    lastName: { type: String, default: "Creator" },
    phone: { type: String, default: null },
    bio: { type: String, maxlength: 500, default: "" },
    avatar: { type: String},
    badges: [{ type: String }], // Array to store earned badges like 'Alpha Tester'
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
