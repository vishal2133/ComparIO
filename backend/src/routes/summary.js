const express = require('express');
const router = express.Router();
const { getPersonalizedSummary } = require('../controllers/summaryController');

router.post('/', getPersonalizedSummary);

module.exports = router;