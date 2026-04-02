const Product = require('../models/Product');
const PriceHistory = require('../models/PriceHistory');
const { scrapeAmazonPrice } = require('./amazon');
const { scrapeFlipkartPrice } = require('./flipkart');

// Scrape a single price entry
const scrapeSinglePrice = async (platform, url) => {
  try {
    if (platform === 'amazon') return await scrapeAmazonPrice(url);
    if (platform === 'flipkart') return await scrapeFlipkartPrice(url);
    return null;
  } catch {
    return null;
  }
};

// Scrape all platforms for one product — both in parallel
const scrapeProduct = async (product) => {
  console.log(`\n📱 ${product.name}`);

  const scrapePromises = product.prices.map(async (entry, i) => {
    const newPrice = await scrapeSinglePrice(entry.platform, entry.affiliateUrl);
    return { index: i, newPrice, platform: entry.platform, oldPrice: entry.price };
  });

  // Scrape Amazon + Flipkart simultaneously for this product
  const results = await Promise.allSettled(scrapePromises);
  let changed = false;

  for (const result of results) {
    if (result.status !== 'fulfilled') continue;
    const { index, newPrice, platform, oldPrice } = result.value;

    if (newPrice && newPrice > 0) {
      if (newPrice !== oldPrice) {
        // Save price history
        PriceHistory.create({
          productId: product._id,
          platform,
          price: newPrice,
        }).catch(() => {});

        console.log(`   💰 ${platform}: ₹${oldPrice.toLocaleString('en-IN')} → ₹${newPrice.toLocaleString('en-IN')}`);
        product.prices[index].price = newPrice;
        product.prices[index].lastUpdated = new Date();
        changed = true;
      } else {
        console.log(`   ✅ ${platform}: ₹${newPrice.toLocaleString('en-IN')} (unchanged)`);
      }
    } else {
      console.log(`   ⚠️  ${platform}: Failed — keeping ₹${oldPrice.toLocaleString('en-IN')}`);
    }
  }

  if (changed) await product.save();
  return changed;
};

const scrapeAllPrices = async () => {
  const startTime = Date.now();
  console.log('\n🚀 DAILY PRICE UPDATE STARTED');
  console.log(`🕐 ${new Date().toLocaleString('en-IN')}`);
  console.log('━'.repeat(50));

  try {
    const products = await Product.find({});
    console.log(`📦 Scraping all ${products.length} products\n`);

    let updated = 0;
    let failed = 0;
    let unchanged = 0;
    const BATCH_SIZE = 3;

    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(products.length / BATCH_SIZE);

      console.log(`\n⚡ Batch ${batchNum}/${totalBatches}`);

      const batchResults = await Promise.allSettled(
        batch.map(async (product) => {
          const changed = await scrapeProduct(product);
          return changed;
        })
      );

      batchResults.forEach(r => {
        if (r.status === 'fulfilled') {
          if (r.value === true) updated++;
          else unchanged++;
        } else {
          failed++;
        }
      });

      // 5 second pause between batches
      if (i + BATCH_SIZE < products.length) {
        console.log('\n   ⏳ Pausing 5s...');
        await new Promise(r => setTimeout(r, 5000));
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const requestsUsed = products.length * 2;

    console.log('\n' + '━'.repeat(50));
    console.log(`✅ DAILY UPDATE COMPLETE in ${elapsed}s`);
    console.log(`   💰 Prices changed:  ${updated} products`);
    console.log(`   ✅ No change:       ${unchanged} products`);
    console.log(`   ⚠️  Failed:         ${failed} products`);
    console.log(`   📊 API requests used today: ${requestsUsed}/5000 monthly quota`);
    console.log(`   📅 Next run: tomorrow at 8:00 AM IST`);
    console.log(`🕐 ${new Date().toLocaleString('en-IN')}\n`);

  } catch (err) {
    console.error('❌ Scraper crashed:', err.message);
  }
};

// Scrape single product by slug (for manual trigger)
const scrapeBySlug = async (slug) => {
  const product = await Product.findOne({ slug });
  if (!product) return { success: false, message: 'Not found' };
  const changed = await scrapeProduct(product);
  return { success: true, changed, data: product };
};

module.exports = { scrapeAllPrices, scrapeBySlug };