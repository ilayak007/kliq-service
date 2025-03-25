const express = require('express');
const {updateCustomer}  = require( '../controllers/updateCustomerController');
const router = express.Router();

// PUT /api/update-customers
router.put('/update-customers', updateCustomer);

module.exports = router;
