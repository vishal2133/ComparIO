const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const connectDB = require('./config/db');
const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/recommend', require('./routes/recommend'));
app.use('/api/history', require('./routes/history'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/summary', require('./routes/summary'));
app.use('/api/user', require('./routes/user'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/specs', require('./routes/specs'));

app.get('/', (req, res) => {
  res.json({ status: 'ComparIO API running ✅' });
});

// ── SCRAPING ENDPOINTS ────────────────────────────────────────────────────────

// Scrape all products
app.get('/api/scrape', async (req, res) => {
  res.json({ message: '🚀 Turbo scrape started! Check server logs.' });
  const { scrapeAllPrices } = require('./scrapers/index');
  scrapeAllPrices();
});

// Scrape single product by slug
app.get('/api/scrape/:slug', async (req, res) => {
  const { scrapeBySlug } = require('./scrapers/index');
  const result = await scrapeBySlug(req.params.slug);
  res.json(result);
});

// Scrape status
app.get('/api/scrape-status', async (req, res) => {
  const Product = require('./models/Product');
  const products = await Product.find({}).select('name prices');
  const lastUpdated = products.map(p => ({
    name: p.name,
    lastUpdated: p.prices[0]?.lastUpdated,
    prices: p.prices.map(pr => ({ platform: pr.platform, price: pr.price })),
  }));
  res.json({ success: true, data: lastUpdated });
});

app.listen(process.env.PORT || 5000, () => {
  console.log('Server running on port 5000 ✅');
});

// ── SCHEDULE 1x DAILY ─────────────────────────────────────────────────────────
// Runs at 8:00 AM IST every day (02:30 UTC)
cron.schedule('30 2 * * *', async () => {
  console.log('\n⏰ Daily price update triggered — 8:00 AM IST');
  const { scrapeAllPrices } = require('./scrapers/index');
  scrapeAllPrices();
});

console.log('⏰ Price scraper scheduled — once daily at 8:00 AM IST');

// ── EXTENSION PRICE UPDATE ────────────────────────────────────────────────────
app.post('/api/prices/extension-update', async (req, res) => {
  try {
    const { asin, pid, price, name, image, platform, url } = req.body;

    if (!price || price < 1000) {
      return res.json({ success: false, message: 'Invalid price' });
    }

    const Product = require('./models/Product');
    const PriceHistory = require('./models/PriceHistory');

    // Try to find product by ASIN or name
    let product = null;

    if (asin) {
      product = await Product.findOne({
        'prices.affiliateUrl': { $regex: asin, $options: 'i' }
      });
    }

    if (!product && name) {
      // Fuzzy search by name
      product = await Product.findOne({
        name: { $regex: name.substring(0, 30), $options: 'i' }
      });
    }

    if (product) {
      // Update existing product price
      const priceEntry = product.prices.find(p => p.platform === platform);
      if (priceEntry && priceEntry.price !== price) {

        // Log to price history
        await PriceHistory.create({
          productId: product._id,
          platform,
          price,
        });

        priceEntry.price = price;
        priceEntry.lastUpdated = new Date();
        await product.save();

        console.log(`[Extension] Updated ${product.name} — ${platform}: ₹${price}`);
        return res.json({ success: true, updated: true, productSlug: product.slug });
      }
      return res.json({ success: true, updated: false, productSlug: product.slug });
    }

    // Product not in our DB yet — log it for future addition
    console.log(`[Extension] New product seen: ${name} — ₹${price} on ${platform}`);
    res.json({ success: true, updated: false, newProduct: true });

  } catch (err) {
    console.error('Extension update error:', err.message);
    res.status(500).json({ success: false });
  }
});