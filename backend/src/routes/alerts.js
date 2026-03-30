const express = require('express');
const router = express.Router();
const PriceAlert = require('../models/PriceAlert');
const Product = require('../models/Product');

// POST /api/alerts — create alert
router.post('/', async (req, res) => {
  try {
    const { email, productId, platform, targetPrice } = req.body;
    if (!email || !productId || !targetPrice) {
      return res.status(400).json({ success: false, message: 'email, productId and targetPrice are required' });
    }
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const alert = await PriceAlert.create({
      email, productId,
      platform: platform || 'any',
      targetPrice,
    });
    res.json({ success: true, message: `Alert set! We'll email you when price drops below ₹${targetPrice.toLocaleString('en-IN')}`, data: alert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/alerts/:id — cancel alert
router.delete('/:id', async (req, res) => {
  try {
    await PriceAlert.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Alert cancelled' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;