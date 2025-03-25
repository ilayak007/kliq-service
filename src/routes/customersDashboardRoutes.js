const express = require('express');
const router = express.Router();
const { getCustomersDashboard } = require('../controllers/customersDashboardController');

const authenticateToken = require('../middleware/authMiddleware');

//router.get('/dashboard', authenticateToken, getCustomersDashboard);
router.get('/dashboard', getCustomersDashboard);

module.exports = router;
