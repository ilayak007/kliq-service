const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getPointsSummary = async (req, res) => {
  try {
    const { customerId, tournamentId } = req.query;
    const parsedCustomerId = parseInt(customerId, 10);

    if (isNaN(parsedCustomerId)) {
      return res.status(400).json({ message: 'Invalid customer ID' });
    }

    // Build where clause for tournament filtering
    const whereClause = { customerId: parsedCustomerId };
    if (tournamentId) {
      whereClause.match = {
        tournamentId: tournamentId
      };
    }

    // Fetch all predictions for the customer
    const predictions = await prisma.customerPrediction.findMany({
      where: whereClause,
      include: {
        match: {
          select: {
            tournamentId: true,
            tournament: {
              select: {
                tournamentName: true
              }
            }
          }
        }
      }
    });

    // Calculate the summary
    const totalPredicted = predictions.length;
    let totalWon = 0;
    let totalLost = 0;
    let totalPointsEarned = 0;

    predictions.forEach(prediction => {
      if (prediction.result === 'WON') totalWon++;
      if (prediction.result === 'LOST') totalLost++;
      totalPointsEarned += prediction.pointsEarned || 0; // Fallback if null
    });

    // Fetch total points earned by all customers for the same tournament
    const allCustomersWhereClause = {};
    if (tournamentId) {
      allCustomersWhereClause.match = {
        tournamentId: tournamentId
      };
    }

    const allCustomersPoints = await prisma.customerPrediction.groupBy({
      by: ['customerId'],
      where: allCustomersWhereClause,
      _sum: {
        pointsEarned: true,
      },
    });

    // Sort customers by total points earned in descending order
    const sortedCustomers = allCustomersPoints
      .map(c => ({
        customerId: c.customerId,
        totalPoints: c._sum.pointsEarned || 0,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints);

    // Determine the position of the requested customer
    const position = sortedCustomers.findIndex(c => c.customerId === parsedCustomerId) + 1;

    return res.status(200).json({
      data: {
        totalPredicted,
        totalWon,
        totalLost,
        totalPointsEarned,
        position,  // Added position
      },
    });
  } catch (error) {
    console.error('Error fetching points summary:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { getPointsSummary };
