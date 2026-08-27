const express = require('express');
const { getStoredProducts, scoreStoredProducts } = require('../controllers/scoringController');

const router = express.Router();
router.get('/products', getStoredProducts);
router.post('/score', scoreStoredProducts);

module.exports = router;
