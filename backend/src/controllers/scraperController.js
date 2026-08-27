const axios = require('axios');
const Product = require('../models/Product');
const { computeCategoryScores } = require('../scoring-engine');

const scraperClient = () => axios.create({
  baseURL: process.env.SCRAPER_API_URL || 'http://127.0.0.1:4000',
  timeout: 15000,
});

const upstreamError = (res, error) => {
  const message = error.response?.data?.error || error.response?.data?.message
    || 'The scraper service is unavailable. Start it with npm start in the scraper project.';
  return res.status(error.response?.status || 503).json({ success: false, message });
};

// POST /api/scraper/phones
const startPhoneScrape = async (req, res) => {
  const brand = String(req.body?.brand || '').trim().toLowerCase();
  const limit = Number(req.body?.limit || 5);
  if (!/^[a-z0-9-]{2,40}$/.test(brand)) {
    return res.status(400).json({ success: false, message: 'Choose a valid phone brand.' });
  }

  try {
    const response = await scraperClient().post('/scrape/phones', null, {
      params: { brand, limit: Math.min(Math.max(limit, 1), 25) },
    });
    return res.status(202).json({ success: true, data: response.data });
  } catch (error) {
    return upstreamError(res, error);
  }
};

// POST /api/scraper/laptops
const startLaptopScrape = async (req, res) => {
  const brand = String(req.body?.brand || '').trim().toLowerCase();
  const limit = Number(req.body?.limit || 5);
  if (brand && !/^[a-z0-9-]{2,40}$/.test(brand)) {
    return res.status(400).json({ success: false, message: 'Choose a valid laptop brand.' });
  }

  try {
    const params = { limit: Math.min(Math.max(limit, 1), 25) };
    if (brand) params.brand = brand;
    const response = await scraperClient().post('/scrape/laptops', null, { params });
    return res.status(202).json({ success: true, data: response.data });
  } catch (error) {
    return upstreamError(res, error);
  }
};

// GET /api/scraper/status
const getScraperStatus = async (req, res) => {
  try {
    const [status, progress] = await Promise.all([
      scraperClient().get('/status'),
      scraperClient().get('/progress'),
    ]);
    return res.json({ success: true, data: { status: status.data, progress: progress.data } });
  } catch (error) {
    return upstreamError(res, error);
  }
};

// GET /api/scraper/history  (supports ?category=phone|laptop)
const getScrapeHistory = async (req, res) => {
  try {
    const category = req.query.category || 'phone';
    const products = await Product.find({
      category,
      sourceUrl: { $exists: true, $ne: '' },
    })
      .select('name slug scrapedAt specsComplete sourceUrl categoryScores')
      .sort({ scrapedAt: -1, updatedAt: -1 })
      .limit(100)
      .lean();
    return res.json({ success: true, data: products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/scraper/score — calculate and persist recommendation scores for
// selected, already-scraped phone products. An empty slugs array scores all.
const scoreProducts = async (req, res) => {
  try {
    const { slugs = [] } = req.body || {};
    if (!Array.isArray(slugs)) return res.status(400).json({ success: false, message: 'slugs must be an array.' });
    const filter = { category: 'phone', ...(slugs.length ? { slug: { $in: slugs } } : {}) };
    const products = await Product.find(filter);
    for (const product of products) {
      await Product.updateOne({ _id: product._id }, { $set: { categoryScores: computeCategoryScores(product) } });
    }
    return res.json({ success: true, data: { scored: products.length } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/scraper/update
const updateProducts = async (req, res) => {
  const { category, slugs } = req.body;
  if (!category || !slugs || !Array.isArray(slugs) || slugs.length === 0) {
    return res.status(400).json({ success: false, message: 'Valid category and slugs array required.' });
  }

  try {
    const response = await scraperClient().post('/scrape/update', { category, slugs });
    return res.status(202).json({ success: true, data: response.data });
  } catch (error) {
    return upstreamError(res, error);
  }
};

module.exports = { startPhoneScrape, startLaptopScrape, getScraperStatus, getScrapeHistory, updateProducts, scoreProducts };
