const express = require('express');
const {
  startPhoneScrape,
  startLaptopScrape,
  getScraperStatus,
  getScrapeHistory,
  updateProducts,
  scoreProducts,
} = require('../controllers/scraperController');

const router = express.Router();

router.post('/phones', startPhoneScrape);
router.post('/laptops', startLaptopScrape);
router.get('/status', getScraperStatus);
router.get('/history', getScrapeHistory);
router.post('/update', updateProducts);
router.post('/score', scoreProducts);

module.exports = router;
