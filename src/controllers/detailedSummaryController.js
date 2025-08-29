const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDetailedSummary = async (req, res) => {
  const { customerId } = req.params;
  console.log("Customer ID:", customerId);

  if (isNaN(customerId)) {
    return res.status(400).json({ message: 'Invalid customerId' });
  }

  // Helper function to format the date
  const formatDate = (date) => {
    const day = new Date(date).getDate();
    const month = new Date(date).toLocaleString('default', { month: 'short' }); // Get the full month name
    return `${day}-${month}`;
  };

  // Helper function to calculate longest correct streak
  const calculateLongestStreak = (predictions) => {
    let currentStreak = 0;
    let longestStreak = 0;
    
    for (const prediction of predictions) {
      // Only consider predictions where match result is not null
      if (prediction.match.result !== null) {
        // Check if prediction was correct (customerSelected matches match.result)
        if (prediction.customerSelected === prediction.match.result) {
          currentStreak++;
          longestStreak = Math.max(longestStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      }
    }
    
    return longestStreak;
  };

  try {
    // Fetch predictions for the customer with joined Matches data and sort by updatedAt ascending for streak calculation
    const summary = await prisma.customerPrediction.findMany({
      where: {
        customerId: parseInt(customerId),
      },
      include: {
        match: {
          select: {
            matchStartDateTime: true,
            teamA: true,
            teamB: true,
            result: true, // Pull result from Matches table
          },
        },
      },
      orderBy: {
        updatedAt: 'asc', // Sort by updatedAt ascending for chronological order
      },
    });

    if (summary.length === 0) {
      return res.status(404).json({ message: 'No predictions found for this customer.' });
    }

    // Calculate longest correct streak
    const longestStreak = calculateLongestStreak(summary);

    // Sort by matchStartDateTime descending for display
    const sortedSummary = summary.sort((a, b) => 
      new Date(b.match.matchStartDateTime) - new Date(a.match.matchStartDateTime)
    );

    // Map the response to pick 'match.result' and format other fields
    const detailedSummary = sortedSummary.map((prediction) => ({
      matchDate: formatDate(prediction.match.matchStartDateTime),
      teamA: prediction.match.teamA,
      teamB: prediction.match.teamB,
      customerSelected: prediction.customerSelected,
      result: prediction.match.result || '?', // In case result is null
      pointsEarned: prediction.match.result === null
      ? 'Result not updated'
      : (prediction.pointsEarned > 0 
          ? `${prediction.pointsEarned} points earned` 
          : `${prediction.pointsEarned} points lost`)
    }));

    res.status(200).json({
      detailedSummary,
      longestCorrectStreak: longestStreak
    });
  } catch (error) {
    console.error('Error fetching detailed summary:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { getDetailedSummary };
