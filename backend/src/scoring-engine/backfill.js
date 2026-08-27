require('dotenv').config();
const connectDB = require('../config/db');
const Product = require('../models/Product');
const { computeCategoryScores } = require('./index');

(async () => {
  await connectDB();
  const products = await Product.find({ category: 'phone' });
  for (const product of products) await Product.updateOne({ _id: product._id }, { $set: { categoryScores: computeCategoryScores(product) } });
  console.log(`Backfilled category scores for ${products.length} phones.`);
  process.exit(0);
})().catch(error => { console.error(error); process.exit(1); });
