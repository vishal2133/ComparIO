const puppeteer = require('puppeteer');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const scrapeAmazonPrice = async (url) => {
  let browser = null;

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--window-size=1920,1080',
      ],
    });

   const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-IN,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    });

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    await page.setViewport({ width: 1920, height: 1080 });

    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    console.log(`🌐 Opening Amazon: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    await delay(2000);

    const priceSelectors = [
      '.a-price .a-offscreen',
      '#priceblock_ourprice',
      '#priceblock_dealprice',
      '.apexPriceToPay .a-offscreen',
      '#corePrice_feature_div .a-offscreen',
      '.a-price-whole',
    ];

    let price = null;

    for (const selector of priceSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await page.evaluate((el) => el.textContent, element);
          const cleaned = parseInt(text.replace(/[₹,\s]/g, '').trim());
          if (!isNaN(cleaned) && cleaned > 0) {
            price = cleaned;
            console.log(`✅ Amazon scraped: ₹${price.toLocaleString('en-IN')}`);
            break;
          }
        }
      } catch (e) {
        continue;
      }
    }

    if (!price) {
      price = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        for (const el of elements) {
          const text = el.textContent.trim();
          if (text.match(/^₹[\d,]+$/) && el.children.length === 0) {
            const num = parseInt(text.replace(/[₹,]/g, ''));
            if (num > 1000 && num < 500000) return num;
          }
        }
        return null;
      });

      if (price) {
        console.log(`✅ Amazon scraped (fallback): ₹${price.toLocaleString('en-IN')}`);
      } else {
        console.log(`⚠️ Amazon: Could not find price for ${url}`);
      }
    }

    return price;

  } catch (err) {
    console.log(`❌ Amazon scrape error: ${err.message}`);
    return null;
  } finally {
    if (browser) await browser.close();
  }
};

module.exports = { scrapeAmazonPrice };