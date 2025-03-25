const express = require('express');
const router = express.Router();
const { getDetailedSummary } = require('../controllers/detailedSummaryController');

// Define the route for fetching detailed summary for a customer
router.get('/customers/:customerId/detailed-summary', getDetailedSummary);

module.exports = router;
