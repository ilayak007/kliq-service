const express = require('express');
const router = express.Router();
const { loginCustomer } = require('../controllers/loginController');

// POST /api/customers/login
router.post('/login', loginCustomer);

module.exports = router;
