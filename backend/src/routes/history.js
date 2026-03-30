const express = require('express');
const router = express.Router();
const PriceHistory = require('../models/PriceHistory');
const Product = require('../models/Product');

// GET /api/history/:slug — get price history for a product
router.get('/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const history = await PriceHistory.find({ productId: product._id })
      .sort({ recordedAt: 1 })
      .limit(60);

    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/history/alert — save price alert
router.post('/alert', async (req, res) => {
  try {
    const { email, slug, targetPrice, platform } = req.body;
    // For now just log it — we'll add email sending in v2
    console.log(`🔔 Alert: ${email} wants ${slug} at ₹${targetPrice} on ${platform}`);
    res.json({ success: true, message: 'Alert saved! We will notify you when price drops.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;