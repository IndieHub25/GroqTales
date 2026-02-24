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
    //Notifications
    notificationSettings: {
      email: {
        comments: {type: Boolean, default: true},
        likes: {type: Boolean, default: true},
        followers: {type: Boolean, default: true} ,
        nftSales: {type: Boolean, default: true} ,
        platform: {type: Boolean, default: false} ,
      },
      inApp: {
        comments: {type: Boolean, default: true},
        likes: {type: Boolean, default: true},
        followers: {type: Boolean, default: true} ,
        messages: {type: Boolean, default: true} ,
      },
    },
    // Wallet
    wallet: {
      address:{type: String},
      network: {type: String},
      provider: {type: String},
      verified: {type: Boolean, default: false},
      lastConnectedAt: {type: Date},
    },
    //privacy settings
    privacySettings: {
      profilePublic: {type: Boolean, default: true},
      allowComments: {type: Boolean, default: true},
      showActivity: {type: Boolean, default: true},
      showReadingHistory: {type: Boolean, default: false},
      dataCollection: {type: Boolean, default: true},
      personalization: {type: Boolean, default: true},
    },
    role : {
      type: String,
      enum: ['user', 'admin', 'moderator'],
      default: 'user',
    }
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) {
    return next();
  }
  if(!this.password){
    return next();
  }
  
  const salt = await bcrypt.genSalt(10); // bcrypt rounds = 10
  this.password = await bcrypt.hash(this.password, salt);
  next();
}catch(err){
  next(err);
}
});

UserSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

const User = mongoose.model('User', UserSchema);
module.exports = User;
