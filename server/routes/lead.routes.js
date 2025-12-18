// routes/lead.routes.js
const express = require("express");
const router = express.Router();
const leadController = require("../controller/lead.controller");
const leadStatusController = require("../controller/leadStatus.controller");

// Authentication middleware (add your own)
const {authenticate} = require("../helper/shared.helper")

// dashboard
 router.get("/dashboard", authenticate, leadStatusController.getDashboardStats);
  router.get("/dashboard/:memberId", authenticate, leadStatusController.getDashboardStats);


// Create a new lead
router.post("/", leadController.createLead);

// Get all leads
router.get("/", leadController.getAllLeads);

// Get unassigned leads
router.get("/unassigned", leadController.getUnassignedLeads);

// Get lead by ID
router.get("/:id", leadController.getLeadById);

// Get lead by Lead_Id
router.get("/lead-id/:leadId", leadController.getLeadByLeadId);

// Update lead
router.put("/:id", leadController.updateLead);

// Assign member to single lead
router.patch("/:id/assign", leadController.assignMember);

// Assign member to multiple leads
router.post("/assign-multiple", leadController.assignMemberToMultipleLeads);

// Get leads by member
router.get("/member/:memberId", leadController.getLeadsByMember);

// Delete lead
router.delete("/:id", leadController.deleteLead);

// ===== CUSTOMER CARE SPECIFIC ROUTES =====

// Update lead status (for customer care members)
router.patch("/:id/status",  leadStatusController.updateLeadStatus);

// Get callbacks (today, upcoming, overdue)
router.get("/callbacks/:memberId", authenticate, leadStatusController.getCallbacks);
router.get("/callbacks", authenticate, (req, res) => {
  leadStatusController.getCallbacks(req, res);
});

// Get lead call history
router.get("/:id/call-history", authenticate, leadStatusController.getLeadCallHistory);

// Reschedule callback
router.patch("/:id/reschedule", authenticate, leadStatusController.rescheduleCallback);

// Get leads by status for a member
router.get("/status/:memberId", authenticate, leadStatusController.getLeadsByStatus);

module.exports = router;