const Campaign = require("../modals/campaign.modal");
const { errorResponse, successResponse } = require("../helper/response.helper");

// ==================== CAMPAIGN CRUD ====================

// Create a new campaign (e.g. campaign_name: "whatsapp")
exports.createCampaign = async (req, res) => {
  try {
    const { campaign_name, product, interested_people = [] } = req.body;

    if (!campaign_name) {
      return errorResponse(res, "campaign_name is required");
    }

    const campaign = await Campaign.create({
      campaign_name,
      product: product || null,
      interested_people,
    });

    return successResponse(res, "Campaign created successfully", campaign);
  } catch (error) {
    console.error("Error creating campaign:", error);
    return errorResponse(res, error.message || "Failed to create campaign");
  }
};

// Get all campaigns (optionally filter by name search)
exports.getAllCampaigns = async (req, res) => {
  try {
    const { search } = req.query;

    let filter = {};
    if (search) {
      filter.campaign_name = { $regex: search, $options: "i" };
    }

    const campaigns = await Campaign.find(filter)
      .populate("product", "name seo_url")
      .sort({ createdAt: -1 });

    return successResponse(res, "Campaigns fetched successfully", campaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return errorResponse(res, error.message || "Failed to fetch campaigns");
  }
};

// Get single campaign by ID
exports.getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await Campaign.findById(id).populate("product", "name seo_url");

    if (!campaign) {
      return errorResponse(res, "Campaign not found");
    }

    return successResponse(res, "Campaign fetched successfully", campaign);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return errorResponse(res, error.message || "Failed to fetch campaign");
  }
};

// Update campaign (name / linked product)
exports.updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { campaign_name, product } = req.body;

    const updateData = {};
    if (campaign_name !== undefined) updateData.campaign_name = campaign_name;
    if (product !== undefined) updateData.product = product;

    const campaign = await Campaign.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("product", "name seo_url");

    if (!campaign) {
      return errorResponse(res, "Campaign not found");
    }

    return successResponse(res, "Campaign updated successfully", campaign);
  } catch (error) {
    console.error("Error updating campaign:", error);
    return errorResponse(res, error.message || "Failed to update campaign");
  }
};

// Delete campaign
exports.deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await Campaign.findByIdAndDelete(id);

    if (!campaign) {
      return errorResponse(res, "Campaign not found");
    }

    return successResponse(res, "Campaign deleted successfully", campaign);
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return errorResponse(res, error.message || "Failed to delete campaign");
  }
};

// ==================== INTERESTED PEOPLE CRUD ====================
// (nested inside a campaign's interested_people array)

// Add an interested person to a campaign
exports.addInterestedPerson = async (req, res) => {
  try {
    const { id } = req.params; // campaign id
    const { name, phone, place = "", interest_scale = "Medium" } = req.body;

    if (!name || !phone) {
      return errorResponse(res, "name and phone are required");
    }

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return errorResponse(res, "Campaign not found");
    }

    campaign.interested_people.push({ name, phone, place, interest_scale });
    await campaign.save();

    return successResponse(res, "Interested person added successfully", campaign);
  } catch (error) {
    console.error("Error adding interested person:", error);
    return errorResponse(res, error.message || "Failed to add interested person");
  }
};

// Update a single interested person within a campaign
exports.updateInterestedPerson = async (req, res) => {
  try {
    const { id, personId } = req.params;
    const { name, phone, place, interest_scale } = req.body;

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return errorResponse(res, "Campaign not found");
    }

    const person = campaign.interested_people.id(personId);
    if (!person) {
      return errorResponse(res, "Interested person not found");
    }

    if (name !== undefined) person.name = name;
    if (phone !== undefined) person.phone = phone;
    if (place !== undefined) person.place = place;
    if (interest_scale !== undefined) person.interest_scale = interest_scale;

    await campaign.save();

    return successResponse(res, "Interested person updated successfully", campaign);
  } catch (error) {
    console.error("Error updating interested person:", error);
    return errorResponse(res, error.message || "Failed to update interested person");
  }
};

// Delete a single interested person within a campaign
exports.deleteInterestedPerson = async (req, res) => {
  try {
    const { id, personId } = req.params;

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return errorResponse(res, "Campaign not found");
    }

    const person = campaign.interested_people.id(personId);
    if (!person) {
      return errorResponse(res, "Interested person not found");
    }

    person.deleteOne();
    await campaign.save();

    return successResponse(res, "Interested person deleted successfully", campaign);
  } catch (error) {
    console.error("Error deleting interested person:", error);
    return errorResponse(res, error.message || "Failed to delete interested person");
  }
};
