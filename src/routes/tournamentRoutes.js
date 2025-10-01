const express = require('express');
const tournamentController = require('../controllers/tournamentController');
const router = express.Router();

// GET /api/tournaments - Get all tournaments
router.get('/', tournamentController.getAllTournaments);

// GET /api/tournaments/active - Get currently active tournament
router.get('/active', tournamentController.getActiveTournament);

// GET /api/tournaments/:tournamentId - Get specific tournament
router.get('/:tournamentId', tournamentController.getTournamentById);

// POST /api/tournaments - Create new tournament
router.post('/', tournamentController.createTournament);

// PUT /api/tournaments/:tournamentId - Update tournament
router.put('/:tournamentId', tournamentController.updateTournament);

// DELETE /api/tournaments/:tournamentId - Delete tournament
router.delete('/:tournamentId', tournamentController.deleteTournament);

module.exports = router;
