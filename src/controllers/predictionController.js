const moment = require('moment-timezone');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createPrediction = async (req, res) => {
  const { matchId, customerId, customerName, customerSelected, result, pointsEarned, isPointsUpdated } = req.body;

  try {

    // START 
    const currentIST = moment().tz('Asia/Kolkata');
    const todayISTDate = currentIST.format('YYYY-MM-DD');

    const match = await prisma.matches.findFirst({
      where: { matchId: matchId },
      include: {
        tournament: {
          select: {
            tournamentId: true,
            tournamentName: true,
            isActive: true
          }
        }
      }
    });

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    // Check if tournament is active
    if (!match.tournament.isActive) {
      return res.status(400).json({ 
        error: "Predictions are not allowed for inactive tournaments" 
      });
    }

    const matchIST = moment.utc(match.matchStartDateTime).tz('Asia/Kolkata');
    const matchDate = matchIST.format('YYYY-MM-DD');
    const diffInMinutes = matchIST.diff(currentIST, 'minutes');

        // if either condition fails → return 400
        if (matchDate !== todayISTDate || diffInMinutes < 60) {
          return res.status(400).json({
            error: "Your prediction could not be submitted because the cutoff time has passed."
          });
        }
    // FINISH

    const prediction = await prisma.customerPrediction.create({
      data: {
        matchId,
        customerId,
        customerName,
        customerSelected,
        result,
        pointsEarned,
        isPointsUpdated,
      },
    });

    res.status(201).json(prediction);
  } catch (error) {
    console.error("Error creating prediction:", error);
    res.status(500).json({ error: "Failed to create prediction" });
  }
};

module.exports = {
  createPrediction,
};
