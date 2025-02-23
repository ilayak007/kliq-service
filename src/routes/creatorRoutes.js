/**
 * Creator Routes
 * Handles all routes related to creators.
 * 
 * Author: Ilayaraja Kasirajan
 * Created On: 18-Feb-2025
 * Last Updated: 23-Feb-2025
 */

const express = require("express");
const { getAllCreators, getTopCreators, addCreator } = require("../controllers/creatorController");

const router = express.Router();

/**
 * @route GET /creators
 * @desc Fetch all creators
 * @access Public
 */
router.get("/", getAllCreators);

/**
 * @route POST /creators
 * @desc Add a new creator
 * @access Protected
 */
router.post("/", addCreator);

/**
 * @route GET /creators/top
 * @desc Fetch top creators (optionally exclude those invited to a specific campaign)
 * @query excludeCampaignId (optional) - Exclude creators invited to this campaign
 * @query limit (optional) - Limit number of top creators returned (default: 10)
 * @access Public
 */
router.get('/top', getTopCreators);

module.exports = router;
