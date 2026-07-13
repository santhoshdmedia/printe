// modals/campaign.modals.js
const { Schema, model } = require("mongoose");

// One entry per interested person captured for a campaign
const interestedPersonSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    place: {
      type: String,
      trim: true,
      default: "",
    },
    interest_scale: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
  },
  {
    timestamps: true, // createdAt/updatedAt per person entry
  }
);

const campaignSchema = new Schema(
  {
    // e.g. "whatsapp", "instagram", "email-blast"
    campaign_name: {
      type: String,
      required: true,
      trim: true,
    },
    // Optional link back to the product this campaign is promoting
    product: {
      type: String,
        default: null,
    },
    interested_people: [interestedPersonSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = model("Campaign", campaignSchema);
