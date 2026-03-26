const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
  platform: { type: String, required: true }, // "amazon" or "flipkart"
  price: { type: Number, required: true },
  affiliateUrl: { type: String, required: true },
  inStock: { type: Boolean, default: true },
  lastUpdated: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    brand: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String },
    storage: [String],
    ram: String,
    display: String,
    camera: String,
    battery: String,
    prices: [priceSchema],
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);