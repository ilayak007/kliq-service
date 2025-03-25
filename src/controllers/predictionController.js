const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createPrediction = async (req, res) => {
  const { matchId, customerId, customerName, customerSelected, result, pointsEarned, isPointsUpdated } = req.body;

  try {
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
