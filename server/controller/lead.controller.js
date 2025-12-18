const Lead = require("../modals/lead.modals");
const CustomerCare = require("../modals/Customercaremodal");
const { generateLeadId } = require("../helper/LeadGeneartor");
const { errorResponse, successResponse } = require("../helper/response.helper");



// Create a new lead
exports.createLead = async (req, res) => {
  try {
    const { name, email, phone, Place, Assign_member, source = "Social Media" } = req.body;

    // Validate required fields
    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    // Generate unique Lead_Id
    const leadId = await generateLeadId(source);

    // Create lead
    const lead = new Lead({
      Lead_Id: leadId,
      name,
      email,
      phone,
      Place,
      source,
      Assign_member: Assign_member || null,
    });

    await lead.save();

    // Populate assign member details if exists
    const populatedLead = await Lead.findById(lead._id)
      .populate("Assign_member", "name email phone")
      .exec();

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: populatedLead
    });
  } catch (error) {
    console.error("Error creating lead:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to create lead" 
    });
  }
};

// Get all leads with optional filters
exports.getAllLeads = async (req, res) => {
  try {
    const { 
      assignedTo, 
      place, 
      startDate, 
      endDate,
      source,
      search,
      page = 1,
      limit = 10 
    } = req.query;

    let filter = {};

    // Apply filters
    if (assignedTo) {
      filter.Assign_member = assignedTo;
    }

    if (place) {
      filter.Place = { $regex: place, $options: "i" };
    }

    if (source) {
      filter.source = source;
    }

    // Search across multiple fields
    if (search) {
      filter.$or = [
        { Lead_Id: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search.toString(), $options: "i" } },
        { Place: { $regex: search, $options: "i" } }
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const leads = await Lead.find(filter)
      .populate("Assign_member", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .exec();

    const total = await Lead.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: leads.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: leads
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to fetch leads" 
    });
  }
};

// Get single lead by ID
exports.getLeadById = async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findById(id)
      .populate("Assign_member", "name email phone")
      .exec();

    if (!lead) {
      return res.status(404).json({ 
        success: false, 
        error: "Lead not found" 
      });
    }

    res.status(200).json({
      success: true,
      data: lead
    });
  } catch (error) {
    console.error("Error fetching lead:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to fetch lead" 
    });
  }
};

// Get lead by Lead_Id
exports.getLeadByLeadId = async (req, res) => {
  try {
    const { leadId } = req.params;

    const lead = await Lead.findOne({ Lead_Id: leadId })
      .populate("Assign_member", "name email phone")
      .exec();

    if (!lead) {
      return res.status(404).json({ 
        success: false, 
        error: "Lead not found" 
      });
    }

    res.status(200).json({
      success: true,
      data: lead
    });
  } catch (error) {
    console.error("Error fetching lead:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to fetch lead" 
    });
  }
};

// Update lead
exports.updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const lead = await Lead.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("Assign_member", "name email phone");

    if (!lead) {
      return res.status(404).json({ 
        success: false, 
        error: "Lead not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      data: lead
    });
  } catch (error) {
    console.error("Error updating lead:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to update lead" 
    });
  }
};

// Assign/Reassign member to lead
exports.assignMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { Assign_member } = req.body;

    if (!Assign_member) {
      return res.status(400).json({ 
        success: false, 
        error: "Assign_member is required" 
      });
    }

    // Check if customer care member exists
    const member = await CustomerCare.findById(Assign_member);
    if (!member) {
      return res.status(404).json({ 
        success: false, 
        error: "Customer care member not found" 
      });
    }

    const lead = await Lead.findByIdAndUpdate(
      id,
      { Assign_member },
      { new: true, runValidators: true }
    ).populate("Assign_member", "name email phone");

    if (!lead) {
      return res.status(404).json({ 
        success: false, 
        error: "Lead not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Member assigned successfully",
      data: lead
    });
  } catch (error) {
    console.error("Error assigning member:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to assign member" 
    });
  }
};

// Assign member to multiple leads (Bulk assignment)
exports.assignMemberToMultipleLeads = async (req, res) => {
  try {
    const { leadIds, Assign_member } = req.body;

    if (!Assign_member || !leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: "Assign_member and leadIds array are required" 
      });
    }

    // Check if customer care member exists
    const member = await CustomerCare.findById(Assign_member);
    if (!member) {
      return res.status(404).json({ 
        success: false, 
        error: "Customer care member not found" 
      });
    }

    // Update all leads
    const result = await Lead.updateMany(
      { _id: { $in: leadIds } },
      { $set: { Assign_member } },
      { multi: true }
    );

    // Get updated leads
    const updatedLeads = await Lead.find({ _id: { $in: leadIds } })
      .populate("Assign_member", "name email phone")
      .exec();

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} leads assigned successfully`,
      modifiedCount: result.modifiedCount,
      data: updatedLeads
    });
  } catch (error) {
    console.error("Error assigning member to multiple leads:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to assign member to leads" 
    });
  }
};

// Delete lead
exports.deleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findByIdAndDelete(id);

    if (!lead) {
      return res.status(404).json({ 
        success: false, 
        error: "Lead not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Lead deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting lead:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to delete lead" 
    });
  }
};

// Get leads by assigned member
exports.getLeadsByMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const leads = await Lead.find({ Assign_member: memberId })
      .populate("Assign_member", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .exec();

    const total = await Lead.countDocuments({ Assign_member: memberId });

    res.status(200).json({
      success: true,
      count: leads.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: leads
    });
  } catch (error) {
    console.error("Error fetching leads by member:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to fetch leads" 
    });
  }
};

// Get unassigned leads
exports.getUnassignedLeads = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const leads = await Lead.find({ Assign_member: null })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .exec();

    const total = await Lead.countDocuments({ Assign_member: null });

    res.status(200).json({
      success: true,
      count: leads.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: leads
    });
  } catch (error) {
    console.error("Error fetching unassigned leads:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to fetch unassigned leads" 
    });
  }
};

exports.updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, callback_time, next_followup } = req.body;
    const called_by = req.user.id; // Assuming you have authentication middleware

    // Validate status
    const validStatuses = [
      "New", 
      "Contacted", 
      "Interested", 
      "Not Interested", 
      "Call Back", 
      "Customer Login", 
      "Dealer Login", 
      "Follow-up", 
      "Closed"
    ];

    if (!validStatuses.includes(status)) {
      return errorResponse(res, "Invalid status");
    }

    // Find lead
    const lead = await Lead.findById(id);
    if (!lead) {
      return errorResponse(res, "Lead not found");
    }

    // Add to call history
    lead.call_history.push({
      status,
      notes: notes || "",
      called_by,
      next_followup: next_followup || null,
    });

    // Update lead status
    lead.status = status;
    lead.last_called = new Date();

    // If status is "Call Back", set callback time
    if (status === "Call Back" && callback_time) {
      lead.callback_time = callback_time;
      lead.next_followup = callback_time;
    }

    // If next_followup is provided, set it
    if (next_followup) {
      lead.next_followup = next_followup;
    }

    // If status is "Customer Login" or "Dealer Login", no followup needed
    if (status === "Customer Login" || status === "Dealer Login") {
      lead.next_followup = null;
    }

    await lead.save();

    // Get updated lead with populated data
    const updatedLead = await Lead.findById(id)
      .populate("Assign_member", "name email phone")
      .populate("call_history.called_by", "name email phone");

    return successResponse(res, "Lead status updated successfully", updatedLead);
  } catch (error) {
    console.error("Error updating lead status:", error);
    return errorResponse(res, "Failed to update lead status");
  }
};

// Get callbacks scheduled for today and upcoming
exports.getCallbacks = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { type = "today" } = req.query; // today, upcoming, overdue
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let query = { 
      status: "Call Back",
      next_followup: { $ne: null }
    };

    // If memberId is provided, get only their assigned leads
    if (memberId && memberId !== "all") {
      query.Assign_member = memberId;
    }

    // Filter by date range based on type
    switch (type) {
      case "today":
        query.next_followup = {
          $gte: today,
          $lt: tomorrow,
        };
        break;
      case "upcoming":
        query.next_followup = { $gte: tomorrow };
        break;
      case "overdue":
        query.next_followup = { $lt: today };
        break;
      case "all":
        // No date filter
        break;
    }

    const callbacks = await Lead.find(query)
      .populate("Assign_member", "name email phone")
      .sort({ next_followup: 1 })
      .exec();

    return successResponse(res, "Callbacks fetched successfully", callbacks);
  } catch (error) {
    console.error("Error fetching callbacks:", error);
    return errorResponse(res, "Failed to fetch callbacks");
  }
};

// Get lead call history
exports.getLeadCallHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findById(id)
      .populate("call_history.called_by", "name email phone")
      .select("call_history name phone email Lead_Id")
      .exec();

    if (!lead) {
      return errorResponse(res, "Lead not found");
    }

    return successResponse(res, "Call history fetched successfully", {
      lead_info: {
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        Lead_Id: lead.Lead_Id,
      },
      call_history: lead.call_history.sort((a, b) => b.called_at - a.called_at),
    });
  } catch (error) {
    console.error("Error fetching call history:", error);
    return errorResponse(res, "Failed to fetch call history");
  }
};

// Reschedule callback
exports.rescheduleCallback = async (req, res) => {
  try {
    const { id } = req.params;
    const { callback_time, notes } = req.body;
    const called_by = req.user.id;

    if (!callback_time) {
      return errorResponse(res, "Callback time is required");
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      return errorResponse(res, "Lead not found");
    }

    // Add to call history
    lead.call_history.push({
      status: "Call Back",
      notes: notes || "Callback rescheduled",
      called_by,
      next_followup: callback_time,
    });

    // Update lead
    lead.status = "Call Back";
    lead.callback_time = callback_time;
    lead.next_followup = callback_time;
    lead.last_called = new Date();

    await lead.save();

    const updatedLead = await Lead.findById(id)
      .populate("Assign_member", "name email phone")
      .populate("call_history.called_by", "name email phone");

    return successResponse(res, "Callback rescheduled successfully", updatedLead);
  } catch (error) {
    console.error("Error rescheduling callback:", error);
    return errorResponse(res, "Failed to reschedule callback");
  }
};

// Get leads by status for a member
exports.getLeadsByStatus = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { status } = req.query;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = { Assign_member: memberId };
    
    if (status && status !== "all") {
      query.status = status;
    }

    const leads = await Lead.find(query)
      .populate("Assign_member", "name email phone")
      .sort({ next_followup: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .exec();

    const total = await Lead.countDocuments(query);

    return successResponse(res, "Leads fetched successfully", {
      count: leads.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: leads,
    });
  } catch (error) {
    console.error("Error fetching leads by status:", error);
    return errorResponse(res, "Failed to fetch leads");
  }
};