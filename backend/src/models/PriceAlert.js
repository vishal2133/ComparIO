const mongoose = require('mongoose');

const priceAlertSchema = new mongoose.Schema({
  email: { type: String, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  platform: { type: String, required: true }, // 'amazon' | 'flipkart' | 'any'
  targetPrice: { type: Number, required: true }, // alert when price drops below this
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PriceAlert', priceAlertSchema);