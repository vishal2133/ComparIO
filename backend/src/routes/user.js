const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');
const WarrantyItem = require('../models/WarrantyItem');

// ── PROFILE ───────────────────────────────────────────────────────────────────

// GET /api/user/profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/user/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, bio, preferences } = req.body;
    const user = await User.findById(req.user.id);
    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    await user.save();
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, bio: user.bio, preferences: user.preferences, winnerCoins: user.winnerCoins, level: user.level, referralCode: user.referralCode } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/user/change-password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: 'Both passwords required' });
    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'New password must be 6+ characters' });
    const user = await User.findById(req.user.id);
    const match = await user.comparePassword(currentPassword);
    if (!match)
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/user/account
router.delete('/account', protect, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    await WarrantyItem.deleteMany({ userId: req.user.id });
    res.json({ success: true, message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── ALERTS ────────────────────────────────────────────────────────────────────

// GET /api/user/alerts
router.get('/alerts', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('alerts');
    res.json({ success: true, data: user.alerts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/user/alerts
router.post('/alerts', protect, async (req, res) => {
  try {
    const { slug, targetPrice, platform } = req.body;
    const product = await Product.findOne({ slug });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    const currentPrice = Math.min(...product.prices.map(p => p.price));
    const user = await User.findById(req.user.id);
    const exists = user.alerts.find(a => a.slug === slug && a.platform === platform);
    if (exists) return res.status(400).json({ success: false, message: 'Alert already exists for this product' });
    user.alerts.push({
      productId: product._id, slug, platform: platform || 'any',
      productName: product.name, productImage: product.image,
      targetPrice: parseInt(targetPrice), currentPrice,
    });
    await user.save();
    // Award 5 coins for setting an alert
    user.winnerCoins += 5;
    await user.save();
    res.json({ success: true, message: 'Alert set! +5 Winner Coins earned 🎉', data: user.alerts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/user/alerts/:alertId
router.delete('/alerts/:alertId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.alerts = user.alerts.filter(a => a._id.toString() !== req.params.alertId);
    await user.save();
    res.json({ success: true, message: 'Alert removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── WARRANTY ──────────────────────────────────────────────────────────────────

// GET /api/user/warranty
router.get('/warranty', protect, async (req, res) => {
  try {
    const items = await WarrantyItem.find({ userId: req.user.id }).sort({ expiryDate: 1 });
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/user/warranty
router.post('/warranty', protect, async (req, res) => {
  try {
    const { productName, productImage, brand, purchaseDate, warrantyMonths, purchasePrice, platform, orderNumber, supportUrl, productId } = req.body;
    const purchase = new Date(purchaseDate);
    const expiry = new Date(purchase);
    expiry.setMonth(expiry.getMonth() + parseInt(warrantyMonths));
    const item = await WarrantyItem.create({
      userId: req.user.id, productId: productId || null,
      productName, productImage: productImage || '', brand: brand || '',
      purchaseDate: purchase, warrantyMonths: parseInt(warrantyMonths),
      expiryDate: expiry, purchasePrice: purchasePrice || 0,
      platform: platform || '', orderNumber: orderNumber || '',
      supportUrl: supportUrl || '',
    });
    // Award 10 coins for adding warranty
    await User.findByIdAndUpdate(req.user.id, { $inc: { winnerCoins: 10 } });
    res.status(201).json({ success: true, data: item, message: '+10 Winner Coins for tracking your warranty! 🛡️' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/user/warranty/:id
router.delete('/warranty/:id', protect, async (req, res) => {
  try {
    await WarrantyItem.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ success: true, message: 'Warranty item removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── COINS ─────────────────────────────────────────────────────────────────────

// GET /api/user/coins
router.get('/coins', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('winnerCoins level totalSpent referralCode');
    const nextLevel = { Bronze: { name: 'Silver', threshold: 500 }, Silver: { name: 'Gold', threshold: 2000 }, Gold: { name: 'Platinum', threshold: 5000 }, Platinum: { name: 'Platinum', threshold: 5000 } };
    res.json({ success: true, data: { coins: user.winnerCoins, level: user.level, totalSpent: user.totalSpent, referralCode: user.referralCode, nextLevel: nextLevel[user.level] } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;