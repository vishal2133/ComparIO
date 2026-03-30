const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  platform: { type: String, required: true },
  price: { type: Number, required: true },
  recordedAt: { type: Date, default: Date.now },
});

// Index for fast queries
priceHistorySchema.index({ productId: 1, platform: 1, recordedAt: -1 });

module.exports = mongoose.model('PriceHistory', priceHistorySchema);