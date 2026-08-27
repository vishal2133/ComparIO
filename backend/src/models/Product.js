const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
  platform: { type: String, required: true },
  price: { type: Number, required: true },
  affiliateUrl: { type: String, default: '' },
  inStock: { type: Boolean, default: true },
  lastUpdated: { type: Date, default: Date.now },
});

const Mixed = mongoose.Schema.Types.Mixed;

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    brand: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, default: 'phone' },
    image: { type: String },

    // ── Shared structured fields (phones + laptops) ──────────────────────────
    display:      { type: Mixed, default: null },
    memory:       { type: Mixed, default: null },
    battery:      { type: Mixed, default: null },
    connectivity: { type: Mixed, default: null },
    design:       { type: Mixed, default: null },
    technical:    { type: Mixed, default: null },
    extra:        { type: Mixed, default: null },

    // ── Phone-specific top-level fields ──────────────────────────────────────
    storage:     [String],
    ram:         String,
    camera:      { type: Mixed, default: null },
    performance: { type: Mixed, default: null },

    // ── Laptop-specific top-level fields ─────────────────────────────────────
    general:   { type: Mixed, default: null },   // Series, model, utility, warranty
    processor: { type: Mixed, default: null },   // CPU name, speed, cores, cache, brand, gen
    gpu:       { type: Mixed, default: null },   // GPU name, brand, VRAM
    input:     { type: Mixed, default: null },   // Camera, keyboard, touchpad, speakers
    audio:     { type: Mixed, default: null },   // Speaker system, Dolby, Harman
    security:  { type: Mixed, default: null },   // Fingerprint, face unlock, TPM

    // ── Common meta ───────────────────────────────────────────────────────────
    os:     String,
    weight: String,
    prices: [priceSchema],
    featured:       { type: Boolean, default: false },
    priceUpdatedAt: { type: Date, default: Date.now },

    // ── Full parsed specs blob ── used by the product detail page ─────────────
    // Stored as Mixed so ALL sub-paths (both phone and laptop sections) are
    // persisted and returned without schema restrictions.
    parsedSpecs: { type: Mixed, default: null },

    fullSpecs: { type: Mixed, default: null },
    rawSpecs:  { type: Mixed, default: null },
    sourceUrl:     String,
    scrapedAt:     Date,
    specsComplete: { type: Boolean, default: false },

    // Pre-computed phone recommendation dimensions. Kept separate from the
    // existing editorial/review `scores` object so legacy recommendations and
    // review analysis continue to work unchanged.
    categoryScores: { type: Mixed, default: null },

    // ── Phone-specific review scores ─────────────────────────────────────────
    cameraSubScores: {
      nightPhotography: { type: Number, default: 5 },
      selfiePortrait:   { type: Number, default: 5 },
      opticalZoom:      { type: Number, default: 5 },
      videography:      { type: Number, default: 5 },
      everydayShots:    { type: Number, default: 5 },
    },

    scores: {
      camera:      { type: Number, default: 5 },
      battery:     { type: Number, default: 5 },
      performance: { type: Number, default: 5 },
      display:     { type: Number, default: 5 },
      value:       { type: Number, default: 5 },
      build:       { type: Number, default: 5 },
      portability: { type: Number, default: 5 },

      reviewAnalysis: {
        platform:        String,
        trustScore:      Number,
        verdict:         String,
        verdictColor:    String,
        stats:           Mixed,
        redFlags:        [Mixed],
        repeatedPhrases: [Mixed],
        aiVerdict:       String,
        sampleReviews:   [Mixed],
        analyzedAt:      Date,
      },
    },

    tags:     [String],
    features: [String],
  },
  { timestamps: true },
);

// Keep recommendation dimensions current for normal document saves. Bulk
// updates and existing records are covered by scoring-engine/backfill.js.
productSchema.post('save', async function updateCategoryScores(doc) {
  if (doc.category !== 'phone') return;
  try {
    const { computeCategoryScores } = require('../scoring-engine');
    const categoryScores = computeCategoryScores(doc);
    await doc.constructor.updateOne({ _id: doc._id }, { $set: { categoryScores } });
  } catch (error) {
    console.warn(`Could not update category scores for ${doc.slug}: ${error.message}`);
  }
});

module.exports = mongoose.model('Product', productSchema);
