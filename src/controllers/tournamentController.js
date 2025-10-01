const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllTournaments = async (req, res) => {
  try {
    const tournaments = await prisma.tournament.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ data: tournaments });
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
};

const getTournamentById = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    
    const tournament = await prisma.tournament.findUnique({
      where: { tournamentId },
      include: {
        matches: {
          orderBy: { matchStartDateTime: 'asc' }
        }
      }
    });

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    res.status(200).json({ data: tournament });
  } catch (error) {
    console.error('Error fetching tournament:', error);
    res.status(500).json({ error: 'Failed to fetch tournament' });
  }
};

const getActiveTournament = async (req, res) => {
  try {
    const activeTournament = await prisma.tournament.findFirst({
      where: { isActive: true },
      include: {
        matches: {
          where: { isActive: true },
          orderBy: { matchStartDateTime: 'asc' }
        }
      }
    });

    if (!activeTournament) {
      return res.status(404).json({ error: 'No active tournament found' });
    }

    res.status(200).json({ data: activeTournament });
  } catch (error) {
    console.error('Error fetching active tournament:', error);
    res.status(500).json({ error: 'Failed to fetch active tournament' });
  }
};

const createTournament = async (req, res) => {
  try {
    const { tournamentName, sport, startDate, endDate, description, imageKey } = req.body;

    // Validate required fields
    if (!tournamentName || !sport || !startDate) {
      return res.status(400).json({ error: 'Tournament name, sport, and start date are required' });
    }

    // If this is the first tournament or we want to make it active, deactivate others
    const existingTournaments = await prisma.tournament.count();
    const isActive = existingTournaments === 0 || req.body.isActive === true;

    if (isActive) {
      // Deactivate all other tournaments
      await prisma.tournament.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }

    const tournament = await prisma.tournament.create({
      data: {
        tournamentName,
        sport,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        description,
        imageKey,
        isActive
      }
    });

    res.status(201).json({ data: tournament });
  } catch (error) {
    console.error('Error creating tournament:', error);
    res.status(500).json({ error: 'Failed to create tournament' });
  }
};

const updateTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { tournamentName, sport, startDate, endDate, description, imageKey, isActive } = req.body;

    // If making this tournament active, deactivate others
    if (isActive === true) {
      await prisma.tournament.updateMany({
        where: { 
          isActive: true,
          tournamentId: { not: tournamentId }
        },
        data: { isActive: false }
      });
    }

    const tournament = await prisma.tournament.update({
      where: { tournamentId },
      data: {
        tournamentName,
        sport,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        description,
        imageKey,
        isActive
      }
    });

    res.status(200).json({ data: tournament });
  } catch (error) {
    console.error('Error updating tournament:', error);
    res.status(500).json({ error: 'Failed to update tournament' });
  }
};

const deleteTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    // Check if tournament has matches
    const matchCount = await prisma.matches.count({
      where: { tournamentId }
    });

    if (matchCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete tournament with existing matches. Please delete matches first.' 
      });
    }

    await prisma.tournament.delete({
      where: { tournamentId }
    });

    res.status(200).json({ message: 'Tournament deleted successfully' });
  } catch (error) {
    console.error('Error deleting tournament:', error);
    res.status(500).json({ error: 'Failed to delete tournament' });
  }
};

module.exports = {
  getAllTournaments,
  getTournamentById,
  getActiveTournament,
  createTournament,
  updateTournament,
  deleteTournament
};
