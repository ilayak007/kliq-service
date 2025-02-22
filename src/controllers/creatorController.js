/**
 * Creator Controller
 * 
 * Handles:
 * - Fetching creators (all, top creators)
 * - Adding new creators
 * - Formatting creator data consistently
 * 
 * Author: Ilayaraja Kasirajan
 * Created On: 19-Feb-2025
 * Last Updated: 23-Feb-2025
 */

const { prisma } = require("../prismaClient");
const { formatFollowers } = require('../utils/format');

// Construct the base URL for S3 images
const s3BaseUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;

/** Helper: Format creator object */
const formatCreator = (creator) => ({
  id: creator.id,
  name: creator.name,
  city: creator.city,
  country: creator.country,
  followers: formatFollowers(creator.followers),
  platforms: creator.platforms,
  imageUrl: creator.imageKey ? `${s3BaseUrl}${creator.imageKey}` : null,
});

/** Helper: Send error responses */
const sendErrorResponse = (res, message, error = null) => {
  if (error) console.error(message, error);
  res.status(500).json({ error: message });
};

/**
 * GET /creators
 * Fetches all creators with their invited campaigns.
 */
const getAllCreators = async (req, res) => {
  try {
    const creators = await prisma.creator.findMany({
      include: { invitedCampaigns: { include: { campaign: true } } },
    });

    const formattedCreators = creators.map(formatCreator);
    res.json(formattedCreators);
  } catch (error) {
    sendErrorResponse(res, "Error fetching creators", error);
  }
};

/**
 * GET /creators/top?excludeCampaignId=xyz
 * Fetches top 10 creators not already invited to a specific campaign.
 */
const getTopCreators = async (req, res) => {
  try {
    const { excludeCampaignId } = req.query;

    if (!excludeCampaignId) {
      return res.status(400).json({ error: "Missing excludeCampaignId in query params" });
    }

    // Fetch top creators not already invited
    const topCreators = await prisma.creator.findMany({
      where: {
        invitedCampaigns: {
          none: { campaignId: excludeCampaignId }, // Exclude already invited creators
        },
      },
      orderBy: { followers: 'desc' },
      take: 10,
    });

    const formattedCreators = topCreators.map(formatCreator);
    res.json(formattedCreators);
  } catch (error) {
    sendErrorResponse(res, "Error fetching top creators", error);
  }
};

/**
 * POST /creators
 * Adds a new creator.
 */
const addCreator = async (req, res) => {
  try {
    const { name, city, country, followers, platforms, imageKey } = req.body;

    // Basic validation
    if (!name || !city || !country || typeof followers !== 'number') {
      return res.status(400).json({ error: "Missing or invalid required fields" });
    }

    const creator = await prisma.creator.create({
      data: { name, city, country, followers, platforms, imageKey },
    });

    res.status(201).json(formatCreator(creator));
  } catch (error) {
    sendErrorResponse(res, "Error adding creator", error);
  }
};

module.exports = { getAllCreators, getTopCreators, addCreator };
