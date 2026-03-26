const Product = require('../models/Product');

// GET /api/products
const getAllProducts = async (req, res) => {
  try {
    const { brand, featured } = req.query;
    const filter = {};
    if (brand) filter.brand = new RegExp(brand, 'i');
    if (featured) filter.featured = true;

    const products = await Product.find(filter).select('-__v');
    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/search?q=iphone
const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, data: [] });

    const products = await Product.find({
      $or: [
        { name: new RegExp(q, 'i') },
        { brand: new RegExp(q, 'i') },
      ],
    }).select('name brand slug image prices storage');

    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/:slug
const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product)
      return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllProducts, searchProducts, getProductBySlug };