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

  try {
    // Fetch predictions for the customer with joined Matches data and sort by matchStartDateTime descending
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
        match: {
          matchStartDateTime: 'desc', // Sort by matchStartDateTime descending
        },
      },
    });

    if (summary.length === 0) {
      return res.status(404).json({ message: 'No predictions found for this customer.' });
    }

    // Map the response to pick 'match.result' and format other fields
    const detailedSummary = summary.map((prediction) => ({
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

    res.status(200).json(detailedSummary);
  } catch (error) {
    console.error('Error fetching detailed summary:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { getDetailedSummary };
