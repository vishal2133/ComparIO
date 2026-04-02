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