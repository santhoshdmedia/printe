// routes/campaign.routes.js
const express = require("express");
const router = express.Router();
const campaignController = require("../controller/campaign.controller");

// ===== Campaign CRUD =====
router.post("/", campaignController.createCampaign);
router.get("/", campaignController.getAllCampaigns);
router.get("/:id", campaignController.getCampaignById);
router.put("/:id", campaignController.updateCampaign);
router.delete("/:id", campaignController.deleteCampaign);

// ===== Interested people (nested) CRUD =====
router.post("/:id/people", campaignController.addInterestedPerson);
router.put("/:id/people/:personId", campaignController.updateInterestedPerson);
router.delete("/:id/people/:personId", campaignController.deleteInterestedPerson);

module.exports = router;
