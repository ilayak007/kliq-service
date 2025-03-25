const express = require('express');
const router = express.Router();
const { getPointsSummary } = require('../controllers/customerSummaryController');



router.get('/points-summary', getPointsSummary);

module.exports = router;
