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

    parsedSpecs: { type: mongoose.Schema.Types.Mixed, default: null },
    fullSpecs: { type: mongoose.Schema.Types.Mixed, default: null },
    specsComplete: { type: Boolean, default: false },

    cameraSubScores: {
      nightPhotography: { type: Number, default: 5 },
      selfiePortrait:   { type: Number, default: 5 },
      opticalZoom:      { type: Number, default: 5 },
      videography:      { type: Number, default: 5 },
      everydayShots:    { type: Number, default: 5 },
    },

    // SCORING FIELDS — used by recommender
    scores: {
      camera: { type: Number, default: 5 },      // 1-10
      battery: { type: Number, default: 5 },     // 1-10
      performance: { type: Number, default: 5 }, // 1-10
      display: { type: Number, default: 5 },     // 1-10
      value: { type: Number, default: 5 },       // 1-10
      build: { type: Number, default: 5 },       // 1-10
      portability: { type: Number, default: 5 }, // 1-10 (laptops)

      reviewAnalysis: {
        platform: String,
        trustScore: Number,
        verdict: String,
        verdictColor: String,
        stats: mongoose.Schema.Types.Mixed,
        redFlags: [mongoose.Schema.Types.Mixed],
        repeatedPhrases: [mongoose.Schema.Types.Mixed],
        aiVerdict: String,
        sampleReviews: [mongoose.Schema.Types.Mixed],
        analyzedAt: Date,
},
    },

    // Tags for recommender matching
    tags: [String], // ['gaming', 'student', 'photography', 'business', 'budget']
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);