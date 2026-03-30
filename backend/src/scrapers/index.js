const Product = require('../models/Product');
const PriceHistory = require('../models/PriceHistory');
const { scrapeAmazonPrice } = require('./amazon');
const { scrapeFlipkartPrice } = require('./flipkart');

// Scrape one price entry
const scrapeSinglePrice = async (priceEntry) => {
  try {
    if (priceEntry.platform === 'amazon') {
      return await scrapeAmazonPrice(priceEntry.affiliateUrl);
    } else if (priceEntry.platform === 'flipkart') {
      return await scrapeFlipkartPrice(priceEntry.affiliateUrl);
    }
    return null;
  } catch {
    return null;
  }
};

// Scrape all platforms for ONE product in parallel
const scrapeProduct = async (product) => {
  const results = await Promise.allSettled(
    product.prices.map(entry => scrapeSinglePrice(entry))
  );

  let changed = false;

  results.forEach((result, i) => {
    const newPrice = result.status === 'fulfilled' ? result.value : null;
    const entry = product.prices[i];

    if (newPrice && newPrice > 0) {
      // Save to price history if changed
      if (newPrice !== entry.price) {
        PriceHistory.create({
          productId: product._id,
          platform: entry.platform,
          price: newPrice,
        }).catch(() => {});

        console.log(`   💰 ${entry.platform}: ₹${entry.price.toLocaleString()} → ₹${newPrice.toLocaleString()}`);
        product.prices[i].price = newPrice;
        product.prices[i].lastUpdated = new Date();
        changed = true;
      } else {
        console.log(`   ✅ ${entry.platform}: ₹${newPrice.toLocaleString()} (no change)`);
      }
    } else {
      console.log(`   ⚠️  ${entry.platform}: scrape failed — kept ₹${entry.price.toLocaleString()}`);
    }
  });

  if (changed) await product.save();
  return changed;
};

// Run ALL products in parallel batches
const scrapeAllPrices = async () => {
  const startTime = Date.now();
  console.log('\n🚀 Starting TURBO price update...');
  console.log(`🕐 ${new Date().toLocaleString('en-IN')}\n`);

  try {
    const products = await Product.find({});
    console.log(`📦 ${products.length} products to update\n`);

    const BATCH_SIZE = 4; // 4 products at a time
    let totalUpdated = 0;
    let totalFailed = 0;

    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(products.length / BATCH_SIZE);

      console.log(`⚡ Batch ${batchNum}/${totalBatches} — scraping ${batch.map(p => p.name).join(', ')}`);

      // All products in the batch scrape simultaneously
      const batchResults = await Promise.allSettled(
        batch.map(async (product) => {
          console.log(`\n📱 ${product.name}`);
          const changed = await scrapeProduct(product);
          return changed;
        })
      );

      batchResults.forEach(r => {
        if (r.status === 'fulfilled' && r.value) totalUpdated++;
        if (r.status === 'rejected') totalFailed++;
      });

      // Small pause between batches to be respectful
      if (i + BATCH_SIZE < products.length) {
        console.log('\n⏱️  Cooling down 3s before next batch...');
        await new Promise(r => setTimeout(r, 3000));
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✅ Done in ${elapsed}s`);
    console.log(`   Updated: ${totalUpdated} products`);
    console.log(`   Issues:  ${totalFailed} products\n`);

  } catch (err) {
    console.error('❌ Scraper error:', err.message);
  }
};

// Scrape a single product by slug (for manual trigger)
const scrapeProductBySlug = async (slug) => {
  const product = await Product.findOne({ slug });
  if (!product) return { success: false, message: 'Product not found' };
  await scrapeProduct(product);
  return { success: true, data: product };
};

module.exports = { scrapeAllPrices, scrapeProductBySlug };