const { PrismaClient } = require("@prisma/client");
const { formatFollowers } = require('../utils/format');
const prisma = new PrismaClient();

const getAllCreators = async (req, res) => {
  try {
    const creators = await prisma.creator.findMany({
      include: { invitedCampaigns: { include: { campaign: true } } },
    });

    const s3BaseUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;

    const formattedCreators = creators.map(creator => ({
      ...creator,
      imageUrl: creator.imageKey ? `${s3BaseUrl}${creator.imageKey}` : null
    }));

    res.json(formattedCreators);
  } catch (error) {
    res.status(500).json({ error: "Error fetching creators" });
  }
};

const getTopCreators = async (req, res) => {
  try {
    const { excludeCampaignId } = req.query;

    // Fetch creator IDs that are already associated with the given campaign
    const invitedCreators = await prisma.invitedCreator.findMany({
      where: { campaignId: excludeCampaignId },
      select: { creatorId: true },
    });

    const invitedCreatorIds = invitedCreators.map(ic => ic.creatorId);

    // Fetch top 3 creators NOT associated with the campaign
    const topCreators = await prisma.creator.findMany({
      where: {
        id: { notIn: invitedCreatorIds }, // Exclude already invited creators
      },
      orderBy: {
        followers: 'desc', // Sort by followers (assuming more followers = top creator)
      },
      take: 4, // Limit to top 3
    });

    const s3BaseUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
    const formattedCreators = topCreators.map(creator => ({
      ...creator,
      imageUrl: creator.imageKey ? `${s3BaseUrl}${creator.imageKey}` : null,
      followers: formatFollowers(creator.followers),
    }));

    res.json(formattedCreators);
  } catch (error) {
    console.error("Error fetching top creators:", error);
    res.status(500).json({ error: "Error fetching top creators" });
  }
};

const addCreator = async (req, res) => {
  try {
    const { name, city, country, followers, platforms } = req.body;
    const creator = await prisma.creator.create({ data: { name, city, country, followers, platforms } });
    res.json(creator);
  } catch (error) {
    res.status(500).json({ error: "Error adding creator" });
  }
};

module.exports = { getAllCreators, getTopCreators, addCreator };
