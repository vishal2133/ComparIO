const axios = require('axios');
const cheerio = require('cheerio');

const SCRAPERAPI_KEY = process.env.SCRAPERAPI_KEY;

const scrapeFlipkartPrice = async (url) => {
  try {
    console.log(`   🔍 Flipkart: ${url.substring(0, 60)}...`);

    // ScraperAPI with JavaScript rendering for Flipkart
    const scraperUrl = `http://api.scraperapi.com?api_key=${SCRAPERAPI_KEY}&url=${encodeURIComponent(url)}&render=true&country_code=in`;

    const response = await axios.get(scraperUrl, { timeout: 90000 });
    const $ = cheerio.load(response.data);

    // Flipkart price selectors
    const priceSelectors = [
      '._30jeq3._16Jk6d',
      '._30jeq3',
      '.Nx9bqj.CxhGGd',
      '.Nx9bqj',
      '._16Jk6d',
      '[class*="price"] [class*="Nx9bqj"]',
      '.CEmiEU ._30jeq3',
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
      // Search entire page
      $('*').each((_, el) => {
        const text = $(el).children().length === 0 ? $(el).text().trim() : '';
        if (text.match(/^₹[\d,]+$/) && text.length < 12) {
          priceText = text;
          return false;
        }
      });
    }

    if (!priceText) {
      console.log(`   ⚠️  Flipkart: Price not found`);
      return null;
    }

    const price = parseInt(priceText.replace(/[₹,\s]/g, ''));

    if (isNaN(price) || price < 1000 || price > 1000000) {
      console.log(`   ⚠️  Flipkart: Invalid price ${priceText}`);
      return null;
    }

    console.log(`   ✅ Flipkart: ₹${price.toLocaleString('en-IN')}`);
    return price;

  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      console.log(`   ⏱️  Flipkart: Timeout`);
    } else {
      console.log(`   ❌ Flipkart: ${err.message}`);
    }
    return null;
  }
};

module.exports = { scrapeFlipkartPrice };