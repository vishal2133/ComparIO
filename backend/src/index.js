const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/scraper', require('./routes/scraper'));
app.use('/api/recommend', require('./routes/recommend'));
app.use('/api/scoring', require('./routes/scoring'));
app.use('/api/history', require('./routes/history'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/summary', require('./routes/summary'));
app.use('/api/user', require('./routes/user'));
app.use('/api/chat', require('./routes/chat'));

app.get('/', (req, res) => {
  res.json({ status: 'ComparIO API running ✅' });
});

app.listen(process.env.PORT || 5000, () => {
  console.log('Server running on port 5000 ✅');
});
