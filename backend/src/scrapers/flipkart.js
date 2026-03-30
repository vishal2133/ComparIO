const puppeteer = require('puppeteer');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const scrapeFlipkartPrice = async (url) => {
  let browser = null;

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-infobars',
        '--window-size=1920,1080',
      ],
    });

    const page = await browser.newPage();

    // Make Puppeteer look like a real browser
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    await page.setViewport({ width: 1920, height: 1080 });

    // Hide that we're using automation
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    console.log(`🌐 Opening Flipkart: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Wait for page to load
    await delay(2000);

    // Try multiple price selectors
    const priceSelectors = [
      '._30jeq3._16Jk6d',
      '._30jeq3',
      '.Nx9bqj.CxhGGd',
      '.Nx9bqj',
      'div[class*="price"] div[class*="Nx9bqj"]',
      '._16Jk6d',
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
            console.log(`✅ Flipkart scraped: ₹${price.toLocaleString('en-IN')}`);
            break;
          }
        }
      } catch (e) {
        continue;
      }
    }

    if (!price) {
      // Last resort — search entire page for price pattern
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
        console.log(`✅ Flipkart scraped (fallback): ₹${price.toLocaleString('en-IN')}`);
      } else {
        console.log(`⚠️ Flipkart: Could not find price for ${url}`);
      }
    }

    return price;

  } catch (err) {
    console.log(`❌ Flipkart scrape error: ${err.message}`);
    return null;
  } finally {
    if (browser) await browser.close();
  }
};

module.exports = { scrapeFlipkartPrice };