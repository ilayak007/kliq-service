const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const inviteCreatorToCampaign = async (req, res) => {
  try {
    const { campaignId, creatorId } = req.body;
    const invitedCreator = await prisma.invitedCreator.create({ data: { campaignId, creatorId } });
    res.json(invitedCreator);
  } catch (error) {
    res.status(500).json({ error: "Error inviting creator" });
  }
};

const removeCreatorFromCampaign = async (req, res) => {
  try {
    const { campaignId, creatorId } = req.body;
    await prisma.invitedCreator.deleteMany({ where: { campaignId, creatorId } });
    res.json({ message: "Creator removed from campaign" });
  } catch (error) {
    res.status(500).json({ error: "Error removing creator from campaign" });
  }
};

module.exports = { inviteCreatorToCampaign, removeCreatorFromCampaign };
