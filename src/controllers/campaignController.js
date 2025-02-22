const { formatFollowers } = require('../utils/format');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { format } = require("date-fns");
const { v4: uuidv4 } = require('uuid');

const getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: { invitedCreators: { include: { creator: true } } },
      orderBy: { id: 'asc' },
    });

    const s3BaseUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;

    const formattedCampaigns = campaigns.map(campaign => ({
      ...campaign,
      imageUrl: campaign.imageKey ? `${s3BaseUrl}${campaign.imageKey}` : null,
      assignedImageUrl: campaign.assignedImageKey
        ? `${s3BaseUrl}${campaign.assignedImageKey}`
        : null,
        launchDate: campaign.launchDate 
        ? format(new Date(campaign.launchDate), "MMMM d, yyyy") 
        : null,
        campaignCreatedDate: campaign.campaignCreatedDate 
        ? format(new Date(campaign.campaignCreatedDate), "MMMM d, yyyy") 
        : null,
        isActive: campaign.launchDate
        ? new Date(campaign.launchDate) <= new Date() // Compare dates
        : false,     
      invitedCreators: campaign.invitedCreators.map(invited => ({
        ...invited,
        creator: {
          ...invited.creator,
          followers: formatFollowers(invited.creator.followers),
          imageUrl: invited.creator.imageKey
            ? `${s3BaseUrl}${invited.creator.imageKey}`
            : null,
        },
      })),
    }));

    res.json(formattedCampaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ error: "Error fetching campaigns" });
  }
};


const getCampaignById = async (req, res) => {
  try {
    const s3BaseUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;

    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: { invitedCreators: { include: { creator: true } } },
    });

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    console.log("Campaign Data:", campaign);
    console.log("Campaign imageKey:", campaign.imageKey);

    // Ensure campaign.imageKey is properly formatted
    const formattedCampaign = {
      ...campaign,
      imageUrl: campaign.imageKey ? `${s3BaseUrl}${campaign.imageKey}` : null,
      assignedImageUrl: campaign.assignedImageKey
        ? `${s3BaseUrl}${campaign.assignedImageKey}`
        : null,
      campaignCreatedDate: campaign.campaignCreatedDate 
      ? format(new Date(campaign.campaignCreatedDate), "MMMM d, yyyy") 
      : null,
      launchDate: campaign.launchDate 
      ? format(new Date(campaign.launchDate), "MMMM d, yyyy") 
      : null,
      isActive: campaign.launchDate
        ? new Date(campaign.launchDate) <= new Date() // Compare dates
        : false,  
      invitedCreators: campaign.invitedCreators.map((invited) => ({
        ...invited,
        creator: {
          ...invited.creator,
          followers: formatFollowers(invited.creator.followers),
          imageUrl: invited.creator.imageKey
            ? `${s3BaseUrl}${invited.creator.imageKey}`
            : null,
        },
      })),
    };

    console.log("Formatted Campaign Data:", formattedCampaign);

    res.json({ campaign: formattedCampaign });
  } catch (error) {
    console.error("Error fetching campaign:", error);
    res.status(500).json({ error: "Error fetching campaign" });
  }
};


const createCampaign = async (req, res) => {
  try {
    const customId = `z${uuidv4()}`;
    const { name, description, budget, launchDate, assignedBy, assignedChannels, imageKey, assignedImageKey } = req.body;
    const campaign = await prisma.campaign.create({
      data: { id: customId, name, description, budget, launchDate: new Date(launchDate), assignedBy, assignedChannels, imageKey, assignedImageKey},
    });
    res.json(campaign);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error creating campaign" });
  }
};

const updateCampaign = async (req, res) => {
  try {
    const updatedCampaign = await prisma.campaign.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updatedCampaign);
  } catch (error) {
    res.status(500).json({ error: "Error updating campaign" });
  }
};

const deleteCampaign = async (req, res) => {
  try {
    await prisma.campaign.delete({ where: { id: req.params.id } });
    res.json({ message: "Campaign deleted" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting campaign" });
  }
};

module.exports = { getAllCampaigns, getCampaignById, createCampaign, updateCampaign, deleteCampaign };
