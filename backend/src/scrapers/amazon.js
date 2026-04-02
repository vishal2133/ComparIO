const axios = require('axios');
const cheerio = require('cheerio');

const SCRAPERAPI_KEY = process.env.SCRAPERAPI_KEY;

const scrapeAmazonPrice = async (url) => {
  try {
    console.log(`   🔍 Amazon: ${url.substring(0, 60)}...`);

    // Clean URL — keep only the /dp/ASIN part
    const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/);
    const cleanUrl = asinMatch
      ? `https://www.amazon.in/dp/${asinMatch[1]}`
      : url;

    // Use ScraperAPI to bypass anti-bot
    const scraperUrl = `http://api.scraperapi.com?api_key=${SCRAPERAPI_KEY}&url=${encodeURIComponent(cleanUrl)}&country_code=in`;

    const response = await axios.get(scraperUrl, { timeout: 60000 });
    const $ = cheerio.load(response.data);

    // Try multiple price selectors (Amazon changes these occasionally)
    const priceSelectors = [
      '.a-price .a-offscreen',
      '#priceblock_ourprice',
      '#priceblock_dealprice',
      '.apexPriceToPay .a-offscreen',
      '#corePrice_feature_div .a-offscreen',
      '.a-price-whole',
      '#tp_price_block_total_price_ww .a-offscreen',
      '.reinventPricePriceToPayMargin .a-offscreen',
    ];

    let priceText = null;

    for (const selector of priceSelectors) {
      const text = $(selector).first().text().trim();
      if (text && text.includes('₹')) {
        priceText = text;
        break;
      }
    }

    if (!priceText) {
      // Last resort — search for any ₹ price in the page
      $('*').each((_, el) => {
        const text = $(el).text().trim();
        if (text.match(/^₹[\d,]+$/) && text.length < 12) {
          priceText = text;
          return false;
        }
      });
    }

    if (!priceText) {
      console.log(`   ⚠️  Amazon: Price not found`);
      return null;
    }

    const price = parseInt(priceText.replace(/[₹,\s]/g, ''));

    if (isNaN(price) || price < 1000 || price > 1000000) {
      console.log(`   ⚠️  Amazon: Invalid price ${priceText}`);
      return null;
    }

    console.log(`   ✅ Amazon: ₹${price.toLocaleString('en-IN')}`);
    return price;

  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      console.log(`   ⏱️  Amazon: Timeout`);
    } else {
      console.log(`   ❌ Amazon: ${err.message}`);
    }
    return null;
  }
};

module.exports = { scrapeAmazonPrice };