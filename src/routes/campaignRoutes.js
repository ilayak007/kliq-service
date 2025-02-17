const express = require("express");
const { getAllCampaigns, getCampaignById, createCampaign, updateCampaign, deleteCampaign } = require("../controllers/campaignController");

const router = express.Router();

router.get("/", getAllCampaigns);
router.get("/:id", getCampaignById);
router.post("/", createCampaign);
router.put("/:id", updateCampaign);
router.delete("/:id", deleteCampaign);

module.exports = router;
