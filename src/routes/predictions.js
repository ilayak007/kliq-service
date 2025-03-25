const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');

// POST route to create a new prediction
router.post('/', predictionController.createPrediction);

module.exports = router;
