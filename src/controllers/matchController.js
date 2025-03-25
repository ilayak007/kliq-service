const moment = require('moment-timezone');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getTodaysMatches = async (req, res) => {
  try {
    // Get customerId from request body or query parameters (assuming it's passed in)
    const { customerId } = req.query; // Assuming customerId is passed in the request body or query

    // Convert customerId to an integer
    const parsedCustomerId = parseInt(customerId, 10);

    // If customerId is not a valid number, return an error
    if (isNaN(parsedCustomerId)) {
      return res.status(400).json({ message: 'Invalid customer ID' });
    }

    // Get current time in IST
    const currentIST = moment().tz('Asia/Kolkata'); // Current IST time
    const todayISTDate = currentIST.format('YYYY-MM-DD'); // Get today's date in IST

    // Fetch all active matches from the database
    const matches = await prisma.matches.findMany({
      where: { isActive: true },
    });

    // Fetch already submitted predictions by the customer
    const customerPredictions = await prisma.customerPrediction.findMany({
      where: { customerId:parsedCustomerId },
      select: { matchId: true },
    });

    const submittedMatchIds = customerPredictions.map((prediction) => prediction.matchId);

    // Filter the matches
    const filteredMatches = matches.filter((match) => {
      // Convert the match start time (stored in UTC) to IST
      const matchIST = moment.utc(match.matchStartDateTime).tz('Asia/Kolkata');
      const matchDate = matchIST.format('YYYY-MM-DD'); // Get the match date in IST
      const diffInMinutes = matchIST.diff(currentIST, 'minutes'); // Calculate the time difference in minutes

      console.log(`Match: ${match.teamA} vs ${match.teamB}`);
      console.log(`Match Time (IST): ${matchIST.format()}`);
      console.log(`Current IST: ${currentIST.format()}`);
      console.log(`Match Date: ${matchDate}, Today IST Date: ${todayISTDate}`);
      console.log(`Time Difference in minutes: ${diffInMinutes}`);

      // ✅ Condition 1: Match is on the same IST date
      if (matchDate !== todayISTDate) return false; // Exclude matches not on today's date in IST

      // ✅ Condition 2: Time difference is at least 60 minutes
      if (diffInMinutes < 60) return false; // Exclude matches that are less than 60 minutes away

      // ✅ Condition 3: Exclude matches that the customer has already submitted a prediction for
      if (submittedMatchIds.includes(match.matchId)) return false; // Exclude already predicted matches

      return true; // Include matches that pass all conditions
    });

    // Return the filtered matches
    res.status(200).json({ data: filteredMatches });
  } catch (error) {
    console.error('Error fetching today\'s matches:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { getTodaysMatches };
