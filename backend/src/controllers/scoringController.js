const Product = require('../models/Product');
const { computeCategoryScores } = require('../scoring-engine');

const getStoredProducts = async (req, res) => {
  try {
    const products = await Product.find({ category: 'phone' })
      .select('name brand slug image prices categoryScores scrapedAt updatedAt')
      .sort({ updatedAt: -1 })
      .limit(200)
      .lean();
    return res.json({ success: true, data: products });
  } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

const scoreStoredProducts = async (req, res) => {
  try {
    const { slugs = [] } = req.body || {};
    if (!Array.isArray(slugs)) return res.status(400).json({ success: false, message: 'slugs must be an array.' });
    const products = await Product.find({ category: 'phone', ...(slugs.length ? { slug: { $in: slugs } } : {}) });
    await Promise.all(products.map(product => Product.updateOne({ _id: product._id }, { $set: { categoryScores: computeCategoryScores(product) } })));
    return res.json({ success: true, data: { scored: products.length } });
  } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

module.exports = { getStoredProducts, scoreStoredProducts };
