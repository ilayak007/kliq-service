const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getCustomersDashboard = async (req, res) => {
  try {
    const { tournamentId } = req.query;

    // Build where clause for tournament filtering
    const whereClause = {};
    if (tournamentId) {
      whereClause.match = {
        tournamentId: tournamentId
      };
    }

    const customers = await prisma.customerPrediction.groupBy({
      by: ["customerId"],
      where: whereClause,
      _sum: {
        pointsEarned: true,
      },
    });

    const customerData = await Promise.all(customers.map(async (customer) => {
      // Build tournament filter for win/loss counts
      const tournamentFilter = tournamentId ? {
        match: {
          tournamentId: tournamentId
        }
      } : {};

      const totalLost = await prisma.customerPrediction.count({
        where: {
          customerId: customer.customerId,
          result: "LOST",
          ...tournamentFilter
        },
      });

      const totalWon = await prisma.customerPrediction.count({
        where: {
          customerId: customer.customerId,
          result: "WON",
          ...tournamentFilter
        },
      });

      // Fetch customer details from the Customer table
      const customerDetails = await prisma.customers.findUnique({
        where: {
          customerId: customer.customerId,
        },
        select: {
          customerName: true,
          profileImage: true,
          profileMessage: true,
        },
      });

      return {
        customerId: customer.customerId,
        customerName: customerDetails?.customerName || "Unknown",
        title: "Go go Go",
        profileImage: customerDetails?.profileImage || null,
        profileMessage: customerDetails?.profileMessage || "Your message goes here!",
        totalPoints: customer._sum.pointsEarned || 0,
        totalWon,
        totalLost,
      };
    }));

    const sortedCustomers = customerData.sort((a, b) => b.totalPoints - a.totalPoints);
    res.status(200).json({ data: sortedCustomers });

  } catch (error) {
    console.error("Error fetching customer dashboard:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getCustomersDashboard };
