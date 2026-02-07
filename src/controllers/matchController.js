const moment = require('moment-timezone');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getTodaysMatches = async (req, res) => {
  try {
    const { customerId, tournamentId, cutoffTime } = req.query;
    const parsedCustomerId = parseInt(customerId, 10);

    if (isNaN(parsedCustomerId)) {
      return res.status(400).json({ message: 'Invalid customer ID' });
    }

    // Current time in IST
    const currentIST = moment().tz('Asia/Kolkata');
    const todayISTDate = currentIST.format('YYYY-MM-DD');
    const tomorrowISTDate = currentIST.clone().add(1, 'day').format('YYYY-MM-DD');

    // Cutoff time (default 4 PM IST)
    const cutoff = cutoffTime || '11:00';

    const cutoffMoment = moment.tz(
      `${todayISTDate} ${cutoff}`,
      'YYYY-MM-DD HH:mm',
      'Asia/Kolkata'
    );

    const includeTomorrow = currentIST.isSameOrAfter(cutoffMoment);

    // Build where clause
    const whereClause = { isActive: true };
    if (tournamentId) {
      whereClause.tournamentId = tournamentId;
    }

    // Fetch active matches
    const matches = await prisma.matches.findMany({
      where: whereClause,
      include: {
        tournament: {
          select: {
            tournamentName: true,
            sport: true,
          },
        },
      },
    });

    // Fetch customer predictions
    const customerPredictions = await prisma.customerPrediction.findMany({
      where: {
        customerId: parsedCustomerId,
        ...(tournamentId && {
          match: { tournamentId },
        }),
      },
      select: { matchId: true },
    });

    const submittedMatchIds = customerPredictions.map(p => p.matchId);

    // Filter matches
    const filteredMatches = matches.filter(match => {
      const matchIST = moment.utc(match.matchStartDateTime).tz('Asia/Kolkata');
      const matchDate = matchIST.format('YYYY-MM-DD');

      // Must start at least 30 mins from now
      if (matchIST.diff(currentIST, 'minutes') < 30) return false;

      // Already predicted
      if (submittedMatchIds.includes(match.matchId)) return false;

      // Today
      if (matchDate === todayISTDate) return true;

      // Tomorrow (after cutoff)
      if (includeTomorrow && matchDate === tomorrowISTDate) return true;

      return false;
    });

    const filteredMatchIds = filteredMatches.map(m => m.matchId);

    // Get prediction counts
    const predictionCounts = await prisma.customerPrediction.groupBy({
      by: ['matchId'],
      where: { matchId: { in: filteredMatchIds } },
      _count: { matchId: true },
    });

    const countsMap = {};
    predictionCounts.forEach(entry => {
      countsMap[entry.matchId] = entry._count.matchId;
    });

    // Add totalVoteCount
    const finalMatches = filteredMatches.map(match => ({
      ...match,
      totalVoteCount: countsMap[match.matchId] || 0,
    }));

    // ✅ SORT BY MATCH START TIME (ASCENDING)
    finalMatches.sort((a, b) => {
      return new Date(a.matchStartDateTime) - new Date(b.matchStartDateTime);
    });

    res.status(200).json({
      data: finalMatches,
      meta: {
        today: todayISTDate,
        tomorrow: tomorrowISTDate,
        cutoffTime: cutoff,
        includeTomorrow,
        timezone: 'Asia/Kolkata',
      },
    });
  } catch (error) {
    console.error("Error fetching today's matches:", error);
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
            endDate: true,
          },
        },
        customerPredictions: {
          select: {
            customerId: true,
            customerSelected: true,
            result: true,
            pointsEarned: true,
          },
        },
      },
      orderBy: { matchStartDateTime: 'asc' },
    });

    const matchesWithCounts = matches.map(match => ({
      ...match,
      totalPredictions: match.customerPredictions.length,
      customerPredictions: undefined,
    }));

    res.status(200).json({ data: matchesWithCounts });
  } catch (error) {
    console.error('Error fetching tournament matches:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { getTodaysMatches, getTournamentMatches };
