const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const products = [
  {
    name: 'iPhone 17 Pro Max',
    brand: 'Apple',
    slug: 'apple-iphone-17-pro-max',
    image: 'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-17-pro-max-1.jpg',
    storage: ['256GB', '512GB', '1TB'],
    ram: '8GB',
    display: '6.9 inch Super Retina XDR OLED ProMotion',
    camera: '48MP Main + 48MP Ultra Wide + 48MP Telephoto',
    battery: '5200 mAh',
    featured: true,
    prices: [
      { platform: 'amazon', price: 159999, affiliateUrl: 'https://www.amazon.in/iPhone-Pro-Max-256-Promotion/dp/B0FQFNQ5LX/ref=sr_1_1_sspa?sr=8-1-spons&aref=XVOmLfK8nn&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY', inStock: true },
      { platform: 'flipkart', price: 161999, affiliateUrl: 'https://www.flipkart.com/apple-iphone-17-pro-max-silver-256-gb/p/itmd38e30731883a?pid=MOBHFN6YCXHMND9W&lid=LSTMOBHFN6YCXHMND9WWWSOXI&marketplace=FLIPKART&q=iphone+17+pro+max&store=tyy%2F4io&srno=s_1_1&otracker=search&otracker1=search&fm=organic&iid=49869ac5-4f84-42be-8f77-0b5d5b507963.MOBHFN6YCXHMND9W.SEARCH&ppt=hp&ppn=homepage&ssid=5z8ujj6jrk0000001774522959847&qH=74a241fa969068a9&ov_redirect=true', inStock: true },
    ],
  },
  {
    name: 'iPhone 17',
    brand: 'Apple',
    slug: 'apple-iphone-17',
    image: 'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-17-1.jpg',
    storage: ['128GB', '256GB', '512GB'],
    ram: '8GB',
    display: '6.1 inch Super Retina XDR OLED',
    camera: '48MP Main + 12MP Ultra Wide',
    battery: '3577 mAh',
    featured: true,
    prices: [
      { platform: 'amazon', price: 89999, affiliateUrl: 'https://www.amazon.in/iPhone-17e-256-GB-Starting/dp/B0GQVQY8B7/ref=sr_1_5?sr=8-5', inStock: true },
      { platform: 'flipkart', price: 91999, affiliateUrl: 'https://www.flipkart.com/apple-iphone-17-sage-256-gb/p/itmcfa57eff7729c?pid=MOBHFN6YNAG4ZTHS&lid=LSTMOBHFN6YNAG4ZTHSWUQQUI&marketplace=FLIPKART&q=iphone+17+&store=tyy%2F4io&srno=s_1_1&otracker=search&otracker1=search&fm=organic&iid=0e811c73-0882-44ec-98fe-f50742f2a86c.MOBHFN6YNAG4ZTHS.SEARCH&ppt=None&ppn=None&ssid=v614492ngw0000001774522992735&qH=714a282fe4008576&ov_redirect=true', inStock: true },
    ],
  },
  {
    name: 'Samsung Galaxy S25 Ultra',
    brand: 'Samsung',
    slug: 'samsung-galaxy-s25-ultra',
    image: 'https://m.media-amazon.com/images/I/41WyX+E04cL._SY300_SX300_QL70_FMwebp_.jpg',
    storage: ['256GB', '512GB', '1TB'],
    ram: '12GB',
    display: '6.9 inch Dynamic AMOLED 2X 120Hz',
    camera: '200MP Main + 50MP Ultra Wide + 50MP Telephoto',
    battery: '5000 mAh',
    featured: true,
    prices: [
      { platform: 'amazon', price: 134999, affiliateUrl: 'https://www.amazon.in/Samsung-Smartphone-Titanium-Snapdragon-ProVisual/dp/B0DSKMKJV5/ref=sr_1_3?sr=8-3', inStock: true },
      { platform: 'flipkart', price: 132999, affiliateUrl: 'https://www.flipkart.com/samsung-galaxy-s25-ultra-5g-titanium-whitesilver-256-gb/p/itm9beb2f2beaa5e?pid=MOBH8K8U56WRFZFR&lid=LSTMOBH8K8U56WRFZFRNVXGVH&marketplace=FLIPKART&q=samsung+s25+pro&store=tyy%2F4io&srno=s_1_2&otracker=search&otracker1=search&fm=Search&iid=3aecb356-48b8-4755-8232-2217aae6880f.MOBH8K8U56WRFZFR.SEARCH&ppt=sp&ppn=sp&ssid=ca9xfmbm400000001774523098042&qH=a7455abe06a0a28f&ov_redirect=true', inStock: true },
    ],
  },
  {
    name: 'Samsung Galaxy S25',
    brand: 'Samsung',
    slug: 'samsung-galaxy-s25',
    image: 'https://m.media-amazon.com/images/I/41p8ZRc8apL._SY300_SX300_QL70_FMwebp_.jpg',
    storage: ['128GB', '256GB'],
    ram: '12GB',
    display: '6.2 inch Dynamic AMOLED 2X 120Hz',
    camera: '50MP Main + 12MP Ultra Wide + 10MP Telephoto',
    battery: '4000 mAh',
    featured: true,
    prices: [
      { platform: 'amazon', price: 74999, affiliateUrl: 'https://www.amazon.in/Samsung-Smartphone-Icyblue-Snapdragon-ProVisual/dp/B0DSBVGKVF/ref=sr_1_4?sr=8-4', inStock: true },
      { platform: 'flipkart', price: 72999, affiliateUrl: 'https://www.flipkart.com/samsung-galaxy-s25-5g-silver-shadow-256-gb/p/itm70d1f331ebbac?pid=MOBH8K8UH9XHPVGQ&lid=LSTMOBH8K8UH9XHPVGQEUE4JY&marketplace=FLIPKART&q=samsung+s25+&store=tyy%2F4io&srno=s_1_1&otracker=search&otracker1=search&fm=organic&iid=66579bb5-476c-4089-9817-db12a1063bbe.MOBH8K8UH9XHPVGQ.SEARCH&ppt=None&ppn=None&ssid=imu1hsqqvk0000001774523128050&qH=5666188c16c3e6be&ov_redirect=true', inStock: true },
    ],
  },
  {
    name: 'OnePlus 13',
    brand: 'OnePlus',
    slug: 'oneplus-13',
    image: 'https://fdn2.gsmarena.com/vv/pics/oneplus/oneplus-13-1.jpg',
    storage: ['256GB', '512GB'],
    ram: '12GB',
    display: '6.82 inch LTPO AMOLED 120Hz',
    camera: '50MP Hasselblad Main + 50MP Ultra Wide + 50MP Periscope',
    battery: '6000 mAh',
    featured: true,
    prices: [
      { platform: 'amazon', price: 69999, affiliateUrl: 'https://www.amazon.in/OnePlus-Smarter-Lifetime-Display-Warranty/dp/B0DQ8W9CTT/ref=sr_1_2?sr=8-2', inStock: true },
      { platform: 'flipkart', price: 68999, affiliateUrl: 'https://www.flipkart.com/oneplus-13-midnight-ocean-256-gb/p/itmb4659fd2a037f?pid=MOBH8CHTJ7RGBHAF&lid=LSTMOBH8CHTJ7RGBHAFCY5NHP&marketplace=FLIPKART&q=oneplus+13&store=tyy%2F4io&srno=s_1_1&otracker=search&otracker1=search&fm=Search&iid=4d30f012-a3a4-4459-8956-302e175c7108.MOBH8CHTJ7RGBHAF.SEARCH&ppt=sp&ppn=sp&ssid=bd824hzr5s0000001774523229597&qH=76c7ec185ffef358&ov_redirect=true', inStock: true },
    ],
  },
  {
    name: 'OnePlus 15R',
    brand: 'OnePlus',
    slug: 'oneplus-15r',
    image: 'https://fdn2.gsmarena.com/vv/pics/oneplus/oneplus-15r-1.jpg',
    storage: ['128GB', '256GB'],
    ram: '8GB',
    display: '6.77 inch AMOLED 120Hz',
    camera: '50MP Main + 8MP Ultra Wide',
    battery: '6000 mAh',
    featured: false,
    prices: [
      { platform: 'amazon', price: 39999, affiliateUrl: 'https://www.amazon.in/stores/page/8E6BF28E-AE0B-4A90-93A5-1C7D07B8E896/?_encoding=UTF8&store_ref=SB_A08490631LEW6WSNIWTHE-A0268544PX8Z5LX293SF&pd_rd_plhdr=t&aaxitk=06701eb32cd1ba774ab3fff3826f03e2&hsa_cr_id=0&lp_asins=B0FZT1LXPZ%2CB0FZSXYV6K%2CB0FZT1D63F&lp_query=oneplus%2015R&lp_slot=auto-sparkle-hsa-tetris&aref=Cbm7rW3ZDT&ref_=sbx_s_sparkle_sbtcd_hlhttps://www.amazon.in/dp/oneplus-15r', inStock: true },
      { platform: 'flipkart', price: 38999, affiliateUrl: 'https://www.flipkart.com/oneplus-15r-5g-mint-breeze-256-gb/p/itmc1c624041ba6c?pid=MOBHGUTYS9R3NQRT&lid=LSTMOBHGUTYS9R3NQRTDLSEHL&marketplace=FLIPKART&q=oneplus+15R&store=tyy%2F4io&srno=s_1_1&otracker=search&otracker1=search&fm=organic&iid=2348f88c-b7f2-4959-81be-6d447a21e20f.MOBHGUTYS9R3NQRT.SEARCH&ppt=None&ppn=None&ssid=5x5qcj8mls0000001774523255844&qH=9945c409c66a7f5d&ov_redirect=true', inStock: true },
    ],
  },
  {
    name: 'Xiaomi 15 Ultra',
    brand: 'Xiaomi',
    slug: 'xiaomi-15-ultra',
    image: 'https://m.media-amazon.com/images/I/41oXBMUGETL._SY300_SX300_QL70_FMwebp_.jpg',
    storage: ['256GB', '512GB'],
    ram: '16GB',
    display: '6.73 inch LTPO AMOLED 120Hz',
    camera: '50MP Leica 1-inch Main + 50MP Ultra Wide + 200MP Periscope',
    battery: '5410 mAh',
    featured: true,
    prices: [
      { platform: 'amazon', price: 99999, affiliateUrl: 'https://www.amazon.in/XIAOMI-Snapdragon-HyperCharge-Flagship-Experience/dp/B0GMQG7QM5/ref=sr_1_3?sr=8-3', inStock: true },
      { platform: 'flipkart', price: 97999, affiliateUrl: 'https://www.flipkart.com/xiaomi-14-ultra-white-512-gb/p/itmdcba70fa59387?pid=MOBGZZBHFXB2E5KK&lid=LSTMOBGZZBHFXB2E5KKNU2ABM&marketplace=FLIPKART&q=xiaomi+17+ultra+mobile&store=tyy%2F4io&srno=s_1_1&otracker=AS_QueryStore_OrganicAutoSuggest_1_15_na_na_ps&otracker1=AS_QueryStore_OrganicAutoSuggest_1_15_na_na_ps&fm=search-autosuggest&iid=8159f47c-d4be-486a-a610-3be42e022a58.MOBGZZBHFXB2E5KK.SEARCH&ppt=sp&ppn=sp&ssid=ikim9rclg00000001774523393751&qH=3875ae1131fe9cf2&ov_redirect=true', inStock: false },
    ],
  },
  {
    name: 'iQOO 15R',
    brand: 'iQOO',
    slug: 'iqoo-15r',
    image: 'https://m.media-amazon.com/images/I/61D48zQmROL._SL1200_.jpg',
    storage: ['128GB', '256GB'],
    ram: '8GB',
    display: '6.78 inch AMOLED 144Hz',
    camera: '50MP Main + 50MP Ultra Wide',
    battery: '7000 mAh',
    featured: false,
    prices: [
      { platform: 'amazon', price: 34999, affiliateUrl: 'https://www.amazon.in/iQOO-Snapdragon%C2%AE-Processor-Slimmest-Smartphone/dp/B0GL8H6Q22/ref=sr_1_3?sr=8-3', inStock: true },
      { platform: 'flipkart', price: 33999, affiliateUrl: 'https://www.flipkart.com/iqoo-15r-5g-dark-knight-256-gb/p/itm7bc8aee18f590?pid=MOBHHY4GYEHGVW3X&lid=LSTMOBHHY4GYEHGVW3XPCRGQD&marketplace=FLIPKART&q=iqoo+15r+5g&store=tyy%2F4io&srno=s_1_1&otracker=AS_Query_OrganicAutoSuggest_5_5_na_na_ps&otracker1=AS_Query_OrganicAutoSuggest_5_5_na_na_ps&fm=organic&iid=07031d3a-e8c2-414b-a9f8-ef69205f7f78.MOBHHY4GYEHGVW3X.SEARCH&ppt=None&ppn=None&ssid=hykqih1uvk0000001774523436347&qH=7f03f12f069773f0&ov_redirect=true', inStock: true },
    ],
  },
  {
    name: 'Nothing Phone 3a',
    brand: 'Nothing',
    slug: 'nothing-phone-3a',
    image: 'https://m.media-amazon.com/images/I/41bPQMcRflL._SY300_SX300_QL70_FMwebp_.jpg',
    storage: ['128GB', '256GB'],
    ram: '8GB',
    display: '6.77 inch AMOLED 120Hz',
    camera: '50MP Main + 50MP Telephoto + 8MP Ultra Wide',
    battery: '5000 mAh',
    featured: false,
    prices: [
      { platform: 'amazon', price: 27999, affiliateUrl: 'https://www.amazon.in/Nothing-Phone-128GB-Storage-White/dp/B0DZTMFWDB/ref=sr_1_4?sr=8-4', inStock: true },
      { platform: 'flipkart', price: 28999, affiliateUrl: 'https://www.flipkart.com/nothing-phone-3a-black-256-gb/p/itm49557c5a65f9c?pid=MOBH8G3PJJMGUFGH&lid=LSTMOBH8G3PJJMGUFGHFTVDFO&marketplace=FLIPKART&q=nothing+phone+3a&store=tyy%2F4io&srno=s_1_3&otracker=search&otracker1=search&fm=search-autosuggest&iid=c9fcc665-820f-4b09-9940-ac13e342b2c2.MOBH8G3PJJMGUFGH.SEARCH&ppt=sp&ppn=sp&ssid=0imx3j0a0w0000001774523523961&qH=f5c73102c1956fde&ov_redirect=true', inStock: true },
    ],
  },
  {
    name: 'Realme 16 Pro Plus',
    brand: 'Realme',
    slug: 'realme-16-pro-plus',
    image: 'https://fdn2.gsmarena.com/vv/pics/realme/realme-16-pro-plus-1.jpg',
    storage: ['128GB', '256GB'],
    ram: '12GB',
    display: '6.7 inch AMOLED 120Hz Curved',
    camera: '50MP Sony Main + 50MP Periscope Telephoto',
    battery: '5200 mAh',
    featured: false,
    prices: [
      { platform: 'amazon', price: 32999, affiliateUrl: 'https://www.amazon.in/realme-16-Pro-Smartphone-Snapdragon/dp/B0GC5KQSTV/ref=sr_1_3?sr=8-3', inStock: true },
      { platform: 'flipkart', price: 31999, affiliateUrl: 'https://www.flipkart.com/realme-16-pro-5g-master-gold-256-gb/p/itmf8e5c193facd1?pid=MOBHGT68YJGMF89K&lid=LSTMOBHGT68YJGMF89KOENUJH&marketplace=FLIPKART&q=realme+16+pro+plus&store=tyy%2F4io&srno=s_1_1&otracker=search&otracker1=search&fm=organic&iid=d6b5ebc3-e51d-4f98-b1c9-567611616a22.MOBHGT68YJGMF89K.SEARCH&ppt=None&ppn=None&ssid=e9bm0i1xkw0000001774523558480&qH=d0a39726a2a5784e&ov_redirect=true', inStock: true },
    ],
  },
  {
    name: 'Vivo X200 FE',
    brand: 'Vivo',
    slug: 'vivo-x200-fe',
    image: 'https://m.media-amazon.com/images/I/41AQ2FayWPL._SY300_SX300_QL70_FMwebp_.jpg',
    storage: ['128GB', '256GB'],
    ram: '12GB',
    display: '6.67 inch AMOLED 120Hz',
    camera: '50MP Zeiss Main + 50MP Ultra Wide + 50MP Telephoto',
    battery: '5700 mAh',
    featured: false,
    prices: [
      { platform: 'amazon', price: 49999, affiliateUrl: 'https://www.amazon.in/vivo-X300-Storage-Additional-Exchange/dp/B0G2CB88TC/ref=sr_1_2?sr=8-2', inStock: true },
      { platform: 'flipkart', price: 48999, affiliateUrl: 'https://www.flipkart.com/vivo-x200-5g-natural-green-256-gb/p/itm8a4d46ac97f57?pid=MOBH7443UHDKDZRJ&lid=LSTMOBH7443UHDKDZRJNZWMEP&marketplace=FLIPKART&q=vivo+x200FE&store=tyy%2F4io&srno=s_1_1&otracker=search&otracker1=search&fm=organic&iid=fd51f304-dd1d-41bd-8721-55271692dd01.MOBH7443UHDKDZRJ.SEARCH&ppt=None&ppn=None&ssid=jrbukw3fzk0000001774523593640&qH=c6b9601c4ce71403&ov_redirect=true', inStock: true },
    ],
  },
  {
    name: 'Google Pixel 9a',
    brand: 'Google',
    slug: 'google-pixel-9a',
    image: 'https://fdn2.gsmarena.com/vv/pics/google/google-pixel-9a-1.jpg',
    storage: ['128GB', '256GB'],
    ram: '8GB',
    display: '6.3 inch OLED 120Hz',
    camera: '48MP Main + 13MP Ultra Wide',
    battery: '5100 mAh',
    featured: false,
    prices: [
      { platform: 'amazon', price: 49999, affiliateUrl: 'https://www.amazon.in/Google-Pixel-Obsidian-256-RAM/dp/B0F6CY1S9Z/ref=sr_1_1?sr=8-1', inStock: true },
      { platform: 'flipkart', price: 51999, affiliateUrl: 'https://www.flipkart.com/google-pixel-9a-obsidian-256-gb/p/itmf9d1fcfa566cf?pid=MOBH9YMEQUGCHPHN&lid=LSTMOBH9YMEQUGCHPHNSFHZNA&marketplace=FLIPKART&q=google+pixel+9a&store=tyy%2F4io&spotlightTagId=default_BestsellerId_tyy%2F4io&srno=s_1_1&otracker=search&otracker1=search&fm=Search&iid=4558b68f-b50f-4b08-8890-fb6b02f21e7a.MOBH9YMEQUGCHPHN.SEARCH&ppt=sp&ppn=sp&ssid=z5hbcw4tyo0000001774523621268&qH=8545b179236401ba&ov_redirect=true', inStock: true },
    ],
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected ✅');
    await Product.deleteMany({});
    console.log('Cleared old products 🗑️');
    await Product.insertMany(products);
    console.log(`Seeded ${products.length} phones ✅`);
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
};

seedDB();