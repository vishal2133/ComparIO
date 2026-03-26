const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  searchProducts,
  getProductBySlug,
} = require('../controllers/productController');

router.get('/', getAllProducts);
router.get('/search', searchProducts);
router.get('/:slug', getProductBySlug);

module.exports = router;