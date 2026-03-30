const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  const url = 'https://www.flipkart.com/apple-iphone-17-sage-256-gb/p/itmcfa57eff7729c?pid=MOBHFN6YNAG4ZTHS&lid=LSTMOBHFN6YNAG4ZTHSWUQQUI&marketplace=FLIPKART&q=iphone+17+&store=tyy%2F4io&srno=s_1_1&otracker=search&otracker1=search&fm=organic&iid=0e811c73-0882-44ec-98fe-f50742f2a86c.MOBHFN6YNAG4ZTHS.SEARCH&ppt=None&ppn=None&ssid=v614492ngw0000001774522992735&qH=714a282fe4008576&ov_redirect=true';
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'max-age=0',
        'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1'
      }
    });
    console.log("Status:", response.status);
    const $ = cheerio.load(response.data);
    
    // Check application/ld+json
    const scripts = $('script[type="application/ld+json"]');
    console.log("Found JSON-LD scripts:", scripts.length);
    let foundPrice = null;

    scripts.each((i, el) => {
        try {
            const data = JSON.parse($(el).html());
            const items = Array.isArray(data) ? data : [data];
            for (const item of items) {
                if (item['@type'] === 'Product' || (Array.isArray(item['@type']) && item['@type'].includes('Product'))) {
                    console.log("Found Product JSON-LD!");
                    if (item.offers && item.offers.price) {
                        foundPrice = item.offers.price;
                        break;
                    }
                }
            }
        } catch(e) {}
    });

    console.log("Price from JSON-LD:", foundPrice);
    
    // Fallback: search for window.__INITIAL_STATE__ or similar JSON in scripts
    if(!foundPrice) {
        let priceRegex = /"price":\s*(\d+)/g;
        let match;
        // Check scripts
        $('script').each((i, el) => {
            const html = $(el).html();
            if(html && html.includes('₹') && html.includes('price')) {
               console.log("Found script with ₹ and price");
            }
        });
    }

  } catch (err) {
    console.log("Failed:", err.message);
  }
}

test();
