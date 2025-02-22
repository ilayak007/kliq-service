/**
 * Invited Creator Routes
 * Handles inviting and removing creators from campaigns.
 *   
 * Author: Ilayaraja Kasirajan
 * Created On: 18-Feb-2025
 * Last Updated: 23-Feb-2025
 */

const express = require("express");
const { inviteCreatorToCampaign, removeCreatorFromCampaign } = require("../controllers/invitedCreatorController");

const router = express.Router();

/**
 * @route POST /invited-creators
 * @desc Invite a creator to a campaign
 * @body campaignId (string) - ID of the campaign
 * @body creatorId (string) - ID of the creator
 * @access Protected
 */
router.post("/", inviteCreatorToCampaign);

/**
 * @route DELETE /invited-creators/:campaignId/:creatorId
 * @desc Remove a creator from a campaign
 * @param campaignId (string) - ID of the campaign
 * @param creatorId (string) - ID of the creator
 * @access Protected
 */
router.delete("/", removeCreatorFromCampaign);

module.exports = router;
