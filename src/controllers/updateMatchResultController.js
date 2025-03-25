const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Environment variables for points
const WIN_POINTS = parseInt(process.env.WIN_POINTS || '50');
const LOSS_POINTS = parseInt(process.env.LOSS_POINTS || '-20');

// API endpoint to update match result and customer points
const updateMatchResult = async (req, res) => {
  const { matchId, winningTeam } = req.body;

  try {
    // Step 1: Check if the match exists in the Matches table
    const match = await prisma.matches.findUnique({
      where: { matchId: matchId },
    });

    if (!match) {
      return res.status(404).json({ message: 'MatchId not found' });
    }

    // Step 2: Update the match result in the Matches table
    await prisma.matches.update({
      where: { matchId: matchId },
      data: { 
        result: winningTeam,
        isActive: false,  // Mark the match as inactive
      },
    });

    // Step 3: Fetch all CustomerPredictions for the given matchId
    const customerPredictions = await prisma.customerPrediction.findMany({
      where: { matchId },
    });

    // Step 4: Update each customer's points and result
    for (const prediction of customerPredictions) {
      const points = prediction.customerSelected === winningTeam ? WIN_POINTS : LOSS_POINTS;
      const result = points === WIN_POINTS ? 'WON' : 'LOST';

      // Update the CustomerPrediction table with points and result
      await prisma.customerPrediction.update({
        where: { predictionId: prediction.predictionId },
        data: {
          pointsEarned: points,
          result, // Set the result to 'WON' or 'LOST'
          isPointsUpdated: true, // Mark points as updated
        },
      });
    }

    // Step 5: Return success response
    return res.status(200).json({ message: 'Match result and points updated successfully' });
  } catch (error) {
    console.error('Error updating match result:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { updateMatchResult };
