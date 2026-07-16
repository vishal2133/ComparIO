const express = require('express');
const router = express.Router();
const { analyseReviews } = require('../controllers/reviewController');

router.post('/analyse', analyseReviews);

module.exports = router;