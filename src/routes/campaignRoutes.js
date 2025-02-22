/**
 * Campaign Routes
 * Handles all routes related to campaign management.
 * 
 * Author: Ilayaraja Kasirajan
 * Created On: 18-Feb-2025
 * Last Updated: 23-Feb-2025
 */
const express = require("express");
const { getAllCampaigns, getCampaignById, createCampaign, updateCampaign, deleteCampaign } = require("../controllers/campaignController");

const router = express.Router();

/**
 * @route GET /campaigns
 * @desc Fetch all campaigns
 * @access Public
 */
router.get("/", getAllCampaigns);

/**
 * @route GET /campaigns/:id
 * @desc Fetch a campaign by ID
 * @access Public
 */
router.get("/:id", getCampaignById);

/**
 * @route POST /campaigns
 * @desc Create a new campaign
 * @access Protected
 */
router.post("/", createCampaign);


/**
 * @route PUT /campaigns/:id
 * @desc Update a campaign by ID
 * @access Protected
 */
router.put("/:id", updateCampaign);

/**
 * @route DELETE /campaigns/:id
 * @desc Delete a campaign by ID
 * @access Protected
 */
router.delete("/:id", deleteCampaign);

module.exports = router;
