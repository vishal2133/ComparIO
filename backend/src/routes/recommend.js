const express = require('express');
const router = express.Router();
const { getRecommendations, getSmartRecommendations } = require('../controllers/recommendController');

router.post('/', getRecommendations);
router.post('/smart', getSmartRecommendations);

module.exports = router;
