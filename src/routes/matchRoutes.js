const express = require('express');
const { getTodaysMatches } = require('../controllers/matchController');
const router = express.Router();

router.get('/todays-matches', getTodaysMatches);

module.exports = router;
