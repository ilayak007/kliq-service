/**
 * Campaign Controller
 * 
 * This file handles all campaign-related operations:
 * - Fetching all campaigns
 * - Fetching a campaign by ID
 * - Creating, updating, and deleting campaigns
 * - Formatting campaigns and creators for consistent API responses
 * 
 * Author: ILayaraja Kasirajan
 * Created On: 18-Feb-2025
 * Last Updated: 23-Feb-2025
 */

const { formatFollowers } = require('../utils/format');
const { prisma } = require("../prismaClient");
const { format } = require("date-fns");
const { v4: uuidv4 } = require('uuid');

// Construct the base URL for S3 images using environment variables
const s3BaseUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;

/**
 * Fetches all campaigns from the database, formats them, and returns the list.
 * 
 * @route GET /campaigns
 * @returns {Array} List of formatted campaigns
 */
const getAllCampaigns = async (req, res) => {
  try {
    // Fetch all campaigns with invited creators and their associated creator details
    const campaigns = await prisma.campaign.findMany({
      include: { invitedCreators: { include: { creator: true } } },
      orderBy: { id: 'asc' }, // Order campaigns by ID in ascending order
    });

    // Format each campaign using the helper function
    const formattedCampaigns = campaigns.map(formatCampaign);

    // Return the formatted list of campaigns
    res.json(formattedCampaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ error: "Error fetching campaigns" });
  }
};

/**
 * Fetches a single campaign by ID, formats it, and returns the result.
 * 
 * @route GET /campaigns/:id
 * @param {String} req.params.id - Campaign ID
 * @returns {Object} Formatted campaign object
 */
const getCampaignById = async (req, res) => {
  try {
    // Fetch the campaign by ID with invited creators and their associated creator details
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: { invitedCreators: { include: { creator: true } } },
    });

    // Handle case where campaign is not found
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    // Format the campaign using the helper function
    const formattedCampaign = formatCampaign(campaign);

    // Return the formatted campaign
    res.json({ campaign: formattedCampaign });
  } catch (error) {
    console.error("Error fetching campaign:", error);
    res.status(500).json({ error: "Error fetching campaign" });
  }
};

/**
 * Creates a new campaign with the provided details.
 * 
 * @route POST /campaigns
 * @body {String} name - Campaign name
 * @body {String} description - Campaign description
 * @body {Number} budget - Campaign budget
 * @body {Date} launchDate - Campaign launch date
 * @body {String} assignedBy - User who created the campaign
 * @body {Array} assignedChannels - List of assigned channels
 * @body {String} imageKey -  image key for the campaign
 * @body {String} assignedImageKey -  image key for the assigned user
 * @returns {Object} Newly created campaign
 */
const createCampaign = async (req, res) => {
  try {
    const { name, description, budget, launchDate, assignedBy, assignedChannels, imageKey, assignedImageKey } = req.body;

    // Validate required fields
    if (!name || !description || !budget || !launchDate) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Generate a custom UUID with prefix 'z'
    const customId = `z${uuidv4()}`;

    // Create the campaign in the database
    const campaign = await prisma.campaign.create({
      data: {
        id: customId,
        name,
        description,
        budget,
        launchDate: new Date(launchDate),
        assignedBy,
        assignedChannels,
        imageKey,
        assignedImageKey
      },
    });

    // Return the newly created campaign
    res.json(campaign);
  } catch (error) {
    console.error("Error creating campaign:", error);
    res.status(500).json({ error: "Error creating campaign" });
  }
};

/**
 * Updates an existing campaign by ID.
 * 
 * @route PUT /campaigns/:id
 * @param {String} req.params.id - Campaign ID
 * @body {Object} req.body - Fields to update
 * @returns {Object} Updated campaign
 */
const updateCampaign = async (req, res) => {
  try {
    // Update the campaign with the provided data
    const updatedCampaign = await prisma.campaign.update({
      where: { id: req.params.id },
      data: req.body,
    });

    // Return the updated campaign
    res.json(updatedCampaign);
  } catch (error) {
    console.error("Error updating campaign:", error);
    res.status(500).json({ error: "Error updating campaign" });
  }
};

/**
 * Deletes a campaign by ID.
 * 
 * @route DELETE /campaigns/:id
 * @param {String} req.params.id - Campaign ID
 * @returns {Object} Success message
 */
const deleteCampaign = async (req, res) => {
  try {
    // Delete the campaign from the database
    await prisma.campaign.delete({ where: { id: req.params.id } });

    // Return a success message
    res.json({ message: "Campaign deleted" });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    res.status(500).json({ error: "Error deleting campaign" });
  }
};

/**
 * Formats a creator object by adding formatted followers count and image URL.
 * 
 * @param {Object} creator - The creator object to format
 * @returns {Object} Formatted creator object
 */
const formatCreator = (creator) => ({
  ...creator,
  followers: formatFollowers(creator.followers), // Format followers (e.g., 1.5K, 2M)
  imageUrl: creator.imageKey ? `${s3BaseUrl}${creator.imageKey}` : null, // Add image URL if available
});

/**
 * Formats a campaign object by adding image URLs, formatted dates, and nested creator data.
 * 
 * @param {Object} campaign - The campaign object to format
 * @returns {Object} Formatted campaign object
 */
const formatCampaign = (campaign) => ({
  ...campaign,
  imageUrl: campaign.imageKey ? `${s3BaseUrl}${campaign.imageKey}` : null, // Main campaign image
  assignedImageUrl: campaign.assignedImageKey ? `${s3BaseUrl}${campaign.assignedImageKey}` : null, // Assigned image

  // Format dates using date-fns
  launchDate: campaign.launchDate ? format(new Date(campaign.launchDate), "MMMM d, yyyy") : null,
  campaignCreatedDate: campaign.campaignCreatedDate ? format(new Date(campaign.campaignCreatedDate), "MMMM d, yyyy") : null,

  // Determine if campaign is active based on launch date
  isActive: campaign.launchDate ? new Date(campaign.launchDate) <= new Date() : false,

  // Format invited creators and their associated creator data
  invitedCreators: campaign.invitedCreators.map(invited => ({
    ...invited,
    creator: formatCreator(invited.creator),
  })),
});

// Export controller functions and helpers
module.exports = {
  getAllCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  formatCampaign,
  formatCreator
};
