const { prisma } = require("../prismaClient");

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

    const deletedRecords = await prisma.invitedCreator.deleteMany({
      where: { campaignId, creatorId },
    });

    if (deletedRecords.count === 0) {
      return res.status(404).json({ error: "No matching record found" });
    }

    res.status(200).json({ message: "Creator removed from campaign" });
  } catch (error) {
    res.status(500).json({ error: "Error removing creator from campaign" });
  }
};


module.exports = { inviteCreatorToCampaign, removeCreatorFromCampaign };
