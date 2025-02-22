/**
 * Invited Creator Controller
 * 
 * Handles inviting and removing creators from campaigns.
 * 
 * Author: Ilayaraja Kasirajan
 * Created On: 19-Feb-2025
 * Last Updated: 23-Feb-2025
 */

const { prisma } = require("../prismaClient");

/** Helper: Send error responses consistently */
const sendErrorResponse = (res, message, error = null, statusCode = 500) => {
  if (error) console.error(message, error);
  res.status(statusCode).json({ error: message });
};

/**
 * POST /invite
 * Invites a creator to a campaign.
 * 
 * Body:
 * - campaignId (string, required)
 * - creatorId (string, required)
 */
const inviteCreatorToCampaign = async (req, res) => {
  try {
    const { campaignId, creatorId } = req.body;

    // Validate input
    if (!campaignId || !creatorId) {
      return sendErrorResponse(res, "campaignId and creatorId are required", null, 400);
    }

    // Invite creator
    const invitedCreator = await prisma.invitedCreator.create({
      data: { campaignId, creatorId },
    });

    res.status(201).json(invitedCreator); // 201 Created
  } catch (error) {
    sendErrorResponse(res, "Error inviting creator", error);
  }
};

/**
 * DELETE /remove
 * Removes a creator from a campaign.
 * 
 * Body:
 * - campaignId (string, required)
 * - creatorId (string, required)
 */
const removeCreatorFromCampaign = async (req, res) => {
  try {
    const { campaignId, creatorId } = req.body;

    // Validate input
    if (!campaignId || !creatorId) {
      return sendErrorResponse(res, "campaignId and creatorId are required", null, 400);
    }

    // Delete the invite
    const deletedRecords = await prisma.invitedCreator.deleteMany({
      where: { campaignId, creatorId },
    });

    if (deletedRecords.count === 0) {
      return sendErrorResponse(res, "No matching invite found", null, 404);
    }

    res.status(200).json({ message: "Creator removed from campaign" });
  } catch (error) {
    sendErrorResponse(res, "Error removing creator from campaign", error);
  }
};

module.exports = { inviteCreatorToCampaign, removeCreatorFromCampaign };
