const { default: mongoose } = require("mongoose");

const {
  OrderDetailsSchema,
  orderdeliverytimelineSchema,
  ProductSchema,
  AdminUsersSchema
} = require("./models_import");



const _ = require("lodash");
const moment = require("moment");
const { order_delivery_timeline } = require("../modals/orderdetails.modals");
const users =AdminUsersSchema;
const Order = OrderDetailsSchema;


const GetTeam = async (req, res) => {
  const { role } = req.query;
  
  // Validate role parameter
  if (!role) {
    return res.status(400).json({
      success: false,
      message: "Role parameter is required"
    });
  }

  try {
    // Fetch users with the specified role
    const teamMembers = await users.find({ role })
      .select('-password') // Exclude sensitive information
      .lean(); // Convert to plain JavaScript objects

    if (!teamMembers.length) {
      return res.status(404).json({
        success: false,
        message: "No team members found for the specified role"
      });
    }

    res.status(200).json({
      success: true,
      count: teamMembers.length,
      data: teamMembers
    });
  } catch (err) {
    console.error("GetTeam Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching team members",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};




const GetTeamById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user_id", "name email")
      .populate("designerId", "name");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    console.error("GetTeamById Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order details"
    });
  }
};

const AssignTeam = async (req, res) => {
  try {
    const { order_id, team_status, user_id } = req.body;
    
    // Validate input
    if (!order_id || !team_status || !user_id) {
      return res.status(400).json({
        success: false,
        message: "order_id, team_status and user_id are required"
      });
    }

    // Get user details
    const user = await users.findById(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Update order with team status and track the responsible team
    const updateData = {
      team_status,
      $set: {}
    };

    // Track which team worked on the order
    switch(team_status) {
      case 'accounting team':
        updateData.$set.account_id = user_id;
        break;
      case 'designing team':
        updateData.$set.designerId = user_id;
        break;
      case 'quality check':
        updateData.$set.package_team_id = user_id;
        break;
      case 'packing team':
        updateData.$set.Quality_check_id = user_id;
        break;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      order_id,
      updateData,
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Create detailed timeline entry
    await order_delivery_timeline.create({
      order_id,
      team_status,
      order_status: updatedOrder.order_status,
      changed_by: user_id,
      changed_by_name: user.name,
      changed_by_role: user.role,
      notes: `Order moved to ${team_status} by ${user.name} (${user.role})`,
      team_participation: {
        [team_status]: {
          user_id,
          name: user.name,
          role: user.role,
          action: 'processed'
        }
      }
    });

    // Send notification email
    try {
      await orderStatusMail({ 
        ...updatedOrder._doc,
        changed_by: user.name,
        new_status: team_status 
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: updatedOrder
    });
  } catch (err) {
    console.error("Error updating order status:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};


const getAssignedTasks = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await users.findById(id).select('name role');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Common filter for assigned tasks
    const userFilter = { 
      $or: [
        { account_id: id },
        { designerId: id },
        { package_team_id: id },
        { Quality_check_id: id }
      ]
    };

    // Parallel fetching
    const [assignedOrders, timelineEntries] = await Promise.all([
      Order.find(userFilter)
        .populate([
          { path: 'user_id', select: 'name email', model: 'admin_users' },
          { path: 'account_id', select: 'name role', model: 'admin_users' },
          { path: 'designerId', select: 'name role', model: 'admin_users' },
          { path: 'package_team_id', select: 'name role', model: 'admin_users' },
          { path: 'Quality_check_id', select: 'name role', model: 'admin_users' }
        ])
        .sort({ updatedAt: -1 })
        .limit(100),
        
      order_delivery_timeline.find(userFilter)
        .sort({ createdAt: -1 })
        .limit(100)
    ]);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          role: user.role
        },
        order_count: assignedOrders.length,
        assigned_orders: assignedOrders,
        activity_log: timelineEntries
      }
    });
  } catch (err) {
    console.error("getAssignedTasks Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assigned tasks",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};



module.exports={
    GetTeam,
    GetTeamById,
    AssignTeam,
    getAssignedTasks
}

