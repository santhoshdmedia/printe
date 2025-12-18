// controller/leadStatus.controller.js
const Lead = require("../modals/lead.modals");
const CustomerCare = require("../modals/Customercaremodal");

const { errorResponse, successResponse } = require("../helper/response.helper");


// dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const { memberId } = req.params;

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get member info
    const member = await CustomerCare.findById(memberId).select("-password");
    if (!member) {
      return errorResponse(res, "Member not found");
    }

    // Get total leads assigned
    const totalLeads = await Lead.countDocuments({ Assign_member: memberId });

    // Get leads by status
    const leadsByStatus = await Lead.aggregate([
      { $match: { Assign_member: memberId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Get today's callbacks
    const todaysCallbacks = await Lead.countDocuments({
      Assign_member: memberId,
      status: "Call Back",
      next_followup: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    // Get overdue callbacks
    const overdueCallbacks = await Lead.countDocuments({
      Assign_member: memberId,
      status: "Call Back",
      next_followup: { $lt: today },
    });

    // Get today's completed calls
    const todaysCalls = await Lead.countDocuments({
      Assign_member: memberId,
      last_called: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    // Get conversion rate (Interested + Customer Login + Dealer Login / Total)
    const interestedLeads = await Lead.countDocuments({
      Assign_member: memberId,
      status: { $in: ["Interested", "Customer Login", "Dealer Login", "Closed"] },
    });

    const conversionRate = totalLeads > 0 ? (interestedLeads / totalLeads) * 100 : 0;

    // Format status data
    const statusData = {};
    leadsByStatus.forEach((item) => {
      statusData[item._id] = item.count;
    });

    return successResponse(res, "Dashboard stats fetched successfully", {
      member_info: member,
      stats: {
        total_leads: totalLeads,
        todays_callbacks: todaysCallbacks,
        overdue_callbacks: overdueCallbacks,
        todays_calls: todaysCalls,
        conversion_rate: conversionRate.toFixed(2),
        leads_by_status: statusData,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return errorResponse(res, "Failed to fetch dashboard stats");
  }
};

// Get prioritized leads for customer care (callbacks first, then new leads)
exports.getPrioritizedLeads = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { limit = 10 } = req.query;

    const today = new Date();
    
    // Get overdue and today's callbacks first
    const callbacks = await Lead.find({
      Assign_member: memberId,
      status: "Call Back",
      next_followup: { $lte: today }, // Overdue and today's
    })
      .sort({ next_followup: 1 })
      .limit(parseInt(limit))
      .populate("Assign_member", "name email phone")
      .exec();

    // If we need more leads, get new/uncontacted leads
    if (callbacks.length < limit) {
      const remainingLimit = limit - callbacks.length;
      const newLeads = await Lead.find({
        Assign_member: memberId,
        status: { $in: ["New", "Contacted"] },
        _id: { $nin: callbacks.map(lead => lead._id) },
      })
        .sort({ createdAt: 1 })
        .limit(remainingLimit)
        .populate("Assign_member", "name email phone")
        .exec();

      return successResponse(res, "Prioritized leads fetched", {
        data: [...callbacks, ...newLeads],
        priority: "Callbacks first, then new leads",
      });
    }

    return successResponse(res, "Prioritized leads fetched", {
      data: callbacks,
      priority: "Callbacks only",
    });
  } catch (error) {
    console.error("Error fetching prioritized leads:", error);
    return errorResponse(res, "Failed to fetch prioritized leads");
  }
};

// Update lead status (for customer care members)
exports.updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const {called_by, status, notes, callback_time, next_followup } = req.body;

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