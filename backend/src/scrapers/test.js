const { scrapeFlipkartPrice } = require('./flipkart');
const { scrapeAmazonPrice } = require('./amazon');
require('dotenv').config();

const test = async () => {
  // Replace these with your real URLs from seed.js
  const amazonUrl  = 'https://www.amazon.in/iPhone-Pro-Max-256-Promotion/dp/B0FQFNQ5LX/ref=sr_1_1_sspa?sr=8-1-spons&aref=XVOmLfK8nn&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY'; 
  const flipkartUrl = 'https://www.flipkart.com/apple-iphone-17-pro-max-silver-256-gb/p/itmd38e30731883a?pid=MOBHFN6YCXHMND9W&lid=LSTMOBHFN6YCXHMND9WWWSOXI&marketplace=FLIPKART&q=iphone+17+pro+max&store=tyy%2F4io&srno=s_1_1&otracker=search&otracker1=search&fm=organic&iid=49869ac5-4f84-42be-8f77-0b5d5b507963.MOBHFN6YCXHMND9W.SEARCH&ppt=hp&ppn=homepage&ssid=5z8ujj6jrk0000001774522959847&qH=74a241fa969068a9&ov_redirect=true';

  console.log('Testing Amazon...');
  const amazonPrice = await scrapeAmazonPrice(amazonUrl);
  console.log('Amazon result:', amazonPrice);

  console.log('\nTesting Flipkart...');
  const flipkartPrice = await scrapeFlipkartPrice(flipkartUrl);
  console.log('Flipkart result:', flipkartPrice);
};

test();

