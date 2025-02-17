const express = require("express");
const { inviteCreatorToCampaign, removeCreatorFromCampaign } = require("../controllers/invitedCreatorController");

const router = express.Router();

router.post("/", inviteCreatorToCampaign);
router.delete("/", removeCreatorFromCampaign);

module.exports = router;
