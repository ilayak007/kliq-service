const express = require('express');
const { getTodaysMatches, getTournamentMatches } = require('../controllers/matchController');
const router = express.Router();

router.get('/todays-matches', getTodaysMatches);
router.get('/tournament/:tournamentId', getTournamentMatches);

module.exports = router;
