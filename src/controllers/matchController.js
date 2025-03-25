const moment = require('moment-timezone');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getTodaysMatches = async (req, res) => {
  try {
    const { customerId } = req.query;
    const parsedCustomerId = parseInt(customerId, 10);

    if (isNaN(parsedCustomerId)) {
      return res.status(400).json({ message: 'Invalid customer ID' });
    }

    const currentIST = moment().tz('Asia/Kolkata');
    const todayISTDate = currentIST.format('YYYY-MM-DD');

    const matches = await prisma.matches.findMany({
      where: { isActive: true },
    });

    const customerPredictions = await prisma.customerPrediction.findMany({
      where: { customerId: parsedCustomerId },
      select: { matchId: true },
    });

    const submittedMatchIds = customerPredictions.map((prediction) => prediction.matchId);

    const filteredMatches = matches.filter((match) => {
      const matchIST = moment.utc(match.matchStartDateTime).tz('Asia/Kolkata');
      const matchDate = matchIST.format('YYYY-MM-DD');
      const diffInMinutes = matchIST.diff(currentIST, 'minutes');

      if (matchDate !== todayISTDate) return false;
      if (diffInMinutes < 60) return false;
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

module.exports = { getTodaysMatches };
