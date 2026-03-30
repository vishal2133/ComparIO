const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
  platform: { type: String, required: true },
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
    category: { type: String, default: 'phone' }, // 'phone' | 'laptop'
    image: { type: String },
    storage: [String],
    ram: String,
    display: String,
    camera: String,
    battery: String,
    processor: String,       // For laptops
    os: String,              // Windows / macOS / Android
    weight: String,          // For laptops
    prices: [priceSchema],
    featured: { type: Boolean, default: false },

    // SCORING FIELDS — used by recommender
    scores: {
      camera: { type: Number, default: 5 },      // 1-10
      battery: { type: Number, default: 5 },     // 1-10
      performance: { type: Number, default: 5 }, // 1-10
      display: { type: Number, default: 5 },     // 1-10
      value: { type: Number, default: 5 },       // 1-10
      build: { type: Number, default: 5 },       // 1-10
      portability: { type: Number, default: 5 }, // 1-10 (laptops)
    },

    // Tags for recommender matching
    tags: [String], // ['gaming', 'student', 'photography', 'business', 'budget']
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);