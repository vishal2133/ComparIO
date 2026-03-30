const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const connectDB = require('./config/db');
const { scrapeAllPrices } = require('./scrapers/index');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/products', require('./routes/products'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/history', require('./routes/history'));
app.use('/api/recommend', require('./routes/recommend'));
app.use('/api/auth', require('./routes/auth'));

app.get('/', (req, res) => {
  res.json({ status: 'ComparIO API running ✅' });
});

// Manual trigger endpoint — hit this URL to force a price update
app.get('/api/scrape', async (req, res) => {
  res.json({ message: 'Price update started ⏳' });
  await scrapeAllPrices();
});

app.listen(process.env.PORT || 5000, () => {
  console.log('Server running on port 5000');
});

// Auto scrape every 6 hours
// Runs at 00:00, 06:00, 12:00, 18:00 every day
cron.schedule('0 */6 * * *', async () => {
  console.log('⏰ Scheduled price update triggered');
  await scrapeAllPrices();
});

console.log('⏰ Price scraper scheduled — runs every 6 hours');
// Scrape all prices
app.get('/api/scrape', async (req, res) => {
  res.json({ message: '🚀 Turbo price update started!' });
  const { scrapeAllPrices } = require('./scrapers/index');
  scrapeAllPrices();
});

// Scrape single product
app.get('/api/scrape/:slug', async (req, res) => {
  const { scrapeProductBySlug } = require('./scrapers/index');
  const result = await scrapeProductBySlug(req.params.slug);
  res.json(result);
});
