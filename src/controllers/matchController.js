const moment = require('moment-timezone');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getTodaysMatches = async (req, res) => {
  try {
    const { customerId, tournamentId } = req.query;
    const parsedCustomerId = parseInt(customerId, 10);

    if (isNaN(parsedCustomerId)) {
      return res.status(400).json({ message: 'Invalid customer ID' });
    }

    const currentIST = moment().tz('Asia/Kolkata');
    const todayISTDate = currentIST.format('YYYY-MM-DD');

    // Build where clause for tournament filtering
    const whereClause = { isActive: true };
    if (tournamentId) {
      whereClause.tournamentId = tournamentId;
    }

    const matches = await prisma.matches.findMany({
      where: whereClause,
      include: {
        tournament: {
          select: {
            tournamentName: true,
            sport: true
          }
        }
      }
    });

    const customerPredictions = await prisma.customerPrediction.findMany({
      where: { 
        customerId: parsedCustomerId,
        ...(tournamentId && {
          match: {
            tournamentId: tournamentId
          }
        })
      },
      select: { matchId: true },
    });

    const submittedMatchIds = customerPredictions.map((prediction) => prediction.matchId);

    const filteredMatches = matches.filter((match) => {
      const matchIST = moment.utc(match.matchStartDateTime).tz('Asia/Kolkata');
      const matchDate = matchIST.format('YYYY-MM-DD');
      const diffInMinutes = matchIST.diff(currentIST, 'minutes');

      if (matchDate !== todayISTDate) return false;
      if (diffInMinutes < 30) return false;
      if (submittedMatchIds.includes(match.matchId)) return false;

      return true;
    });

    // Get matchIds of the filtered matches
    const filteredMatchIds = filteredMatches.map((match) => match.matchId);

    // Query total prediction count per matchId
    const predictionCounts = await prisma.customerPrediction.groupBy({
      by: ['matchId'],
      where: { matchId: { in: filteredMatchIds } },
      _count: { matchId: true },
    });

    // Map counts for quick lookup
    const countsMap = {};
    predictionCounts.forEach((entry) => {
      countsMap[entry.matchId] = entry._count.matchId;
    });

    // Add totalVotedCount to each match
    const finalMatches = filteredMatches.map((match) => ({
      ...match,
      totalVoteCount: countsMap[match.matchId] || 0,
    }));

    res.status(200).json({ data: finalMatches });
  } catch (error) {
    console.error('Error fetching today\'s matches:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getTournamentMatches = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const matches = await prisma.matches.findMany({
      where: { tournamentId },
      include: {
        tournament: {
          select: {
            tournamentName: true,
            sport: true,
            startDate: true,
            endDate: true
          }
        },
        customerPredictions: {
          select: {
            customerId: true,
            customerSelected: true,
            result: true,
            pointsEarned: true
          }
        }
      },
      orderBy: { matchStartDateTime: 'asc' }
    });

    // Add prediction count for each match
    const matchesWithCounts = matches.map(match => ({
      ...match,
      totalPredictions: match.customerPredictions.length,
      customerPredictions: undefined // Remove detailed predictions from response
    }));

    res.status(200).json({ data: matchesWithCounts });
  } catch (error) {
    console.error('Error fetching tournament matches:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { getTodaysMatches, getTournamentMatches };
