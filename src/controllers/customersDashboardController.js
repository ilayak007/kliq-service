const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getCustomersDashboard = async (req, res) => {
  try {
    const customers = await prisma.customerPrediction.groupBy({
      by: ["customerId"],
      _sum: {
        pointsEarned: true,
      },
    });

    const customerData = await Promise.all(customers.map(async (customer) => {
      const totalLost = await prisma.customerPrediction.count({
        where: {
          customerId: customer.customerId,
          result: "LOST",
        },
      });

      const totalWon = await prisma.customerPrediction.count({
        where: {
          customerId: customer.customerId,
          result: "WON",
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
        },
      });

      return {
        customerId: customer.customerId,
        customerName: customerDetails?.customerName || "Unknown",
        title: "Go go Go",
        profileImage: customerDetails?.profileImage || null,
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
