const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/products', require('./routes/products'));

app.get('/', (req, res) => {
  res.json({ status: 'ComparIO API running ✅' });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected ✅');
    app.listen(process.env.PORT || 5000, () =>
      console.log('Server running on port 5000')
    );
  })
  .catch((err) => console.error('DB connection error:', err));