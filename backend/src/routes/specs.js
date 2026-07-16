const express = require('express');
const router = express.Router();
const {
  scrapeAndStoreSpecs,
  scrapeAllMissingSpecs,
  getSpecs,
  compareProducts,
  rescoreAll,
} = require('../controllers/specsController');

router.post('/scrape',     scrapeAndStoreSpecs);   // Single product
router.post('/scrape-all', scrapeAllMissingSpecs); // All missing
router.post('/rescore',    rescoreAll);             // Re-score from stored specs — FREE
router.get('/compare/two', compareProducts);        // Side by side
router.get('/:slug',       getSpecs);              // Get one product specs

module.exports = router;
