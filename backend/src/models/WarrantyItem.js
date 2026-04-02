const mongoose = require('mongoose');

const warrantySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
  productName: { type: String, required: true },
  productImage: { type: String, default: '' },
  brand: { type: String, default: '' },
  purchaseDate: { type: Date, required: true },
  warrantyMonths: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  purchasePrice: { type: Number, default: 0 },
  platform: { type: String, default: '' },
  orderNumber: { type: String, default: '' },
  reminderDays: { type: Number, default: 30 },
  status: { type: String, enum: ['active', 'expiring', 'expired'], default: 'active' },
  supportUrl: { type: String, default: '' },
}, { timestamps: true });

// Auto-calculate status
warrantySchema.pre('save', function (next) {
  const now = new Date();
  const daysLeft = Math.floor((this.expiryDate - now) / (1000 * 60 * 60 * 24));
  if (daysLeft <= 0) this.status = 'expired';
  else if (daysLeft <= 30) this.status = 'expiring';
  else this.status = 'active';
  next();
});

module.exports = mongoose.model('WarrantyItem', warrantySchema);