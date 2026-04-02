const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  phone: { type: String, default: '' },
  bio: { type: String, default: '' },
  winnerCoins: { type: Number, default: 50 }, // 50 welcome coins
  level: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Platinum'], default: 'Bronze' },
  totalSpent: { type: Number, default: 0 },
  referralCode: { type: String, default: '' },
  preferences: {
    emailAlerts: { type: Boolean, default: true },
    pushAlerts: { type: Boolean, default: false },
    currency: { type: String, default: 'INR' },
    theme: { type: String, default: 'dark' },
  },
  alerts: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    slug: String,
    productName: String,
    productImage: String,
    targetPrice: Number,
    currentPrice: Number,
    platform: { type: String, default: 'any' },
    isTriggered: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
    // Generate referral code
  if (!this.referralCode) {
    this.referralCode = 'CMP' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
});

// Compare password
userSchema.methods.comparePassword = function (candidate) {
  return Promise.resolve(bcrypt.compareSync(candidate, this.password));
};

module.exports = mongoose.model('User', userSchema);