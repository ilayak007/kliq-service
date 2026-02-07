const moment = require('moment-timezone');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createPrediction = async (req, res) => {
  const {
    matchId,
    customerId,
    customerName,
    customerSelected,
    result,
    pointsEarned,
    isPointsUpdated,
  } = req.body;

  try {
    const currentIST = moment().tz('Asia/Kolkata');

    const match = await prisma.matches.findFirst({
      where: { matchId },
      include: {
        tournament: {
          select: {
            tournamentId: true,
            tournamentName: true,
            isActive: true,
          },
        },
      },
    });

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    // ✅ Tournament must be active
    if (!match.tournament.isActive) {
      return res.status(400).json({
        error: "Predictions are not allowed for inactive tournaments",
      });
    }

    // ✅ Prevent duplicate prediction
    const existingPrediction = await prisma.customerPrediction.findFirst({
      where: {
        matchId,
        customerId,
      },
      select: { matchId: true },
    });

    if (existingPrediction) {
      return res.status(400).json({
        error: "You have already submitted a prediction for this match.",
      });
    }

    const matchIST = moment.utc(match.matchStartDateTime).tz('Asia/Kolkata');
    const diffInMinutes = matchIST.diff(currentIST, 'minutes');

    // ✅ ONLY RULE: must be at least 30 minutes before match start
    if (diffInMinutes < 30) {
      return res.status(400).json({
        error: "Your prediction could not be submitted because the cutoff time has passed.",
      });
    }

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
