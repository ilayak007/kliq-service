const express = require('express');
const router = express.Router();
const { getDetailedSummary } = require('../controllers/detailedSummaryController');

// Define the route for fetching detailed summary for a customer
router.get('/customers/:customerId/detailed-summary/:tournamentId?', getDetailedSummary);

module.exports = router;
