const { default: mongoose } = require("mongoose");
const { successResponse, errorResponse } = require("../helper/response.helper");
const {
  AdminUsersSchema,
  OrderDetailsSchema,
  orderdeliverytimelineSchema,
  ProductSchema,
  VendorSchemas
} = require("./models_import");
const { order_delivery_timeline } = require("../modals/orderdetails.modals");
const _ = require("lodash");
const moment = require("moment");
const { orderMail, orderStatusMail } = require("../mail/sendMail");
const { isValidObjectId } = require('mongoose');
const {markCouponAsUsed}=require("../controller/coupen.controller")

const users=AdminUsersSchema;

const CreateOrder = async (req, res) => {
  try {
    const { id } = req.userData;
    const { delivery_address, cart_items, payment_id, transaction_id,coupenCode } =
      req.body;

    // Validate required fields
    if (!delivery_address || !cart_items) {
      return errorResponse(res, "Delivery address and cart items are required");
    }

    const paymentDetails = {
      payment_id,
      payment_status: "completed",
      payment_date: new Date(),
      transaction_id,
    };

    const invoice_no = `PRINTE${Date.now()}`;

    // Create order for each cart item
    const orderPromises = cart_items.map(async (item) => {
      // Update product stock
      const quantity_value = Number(_.get(item, "product_quantity", ""));
      const product_code = _.get(item, "product_variants[0].product_code", "");
      const current_stock = Number(
        _.get(item, "product_variants[0].stock", "")
      );

      await ProductSchema.updateOne(
        { "variants_price.product_unique_code": product_code },
        {
          $set: {
            "variants_price.$[elem].stock": current_stock - quantity_value,
          },
        },
        { arrayFilters: [{ "elem.product_code": product_code }], new: true }
      );

      // Create order
      const orderData = {
        user_id: id,
        delivery_address,
        cart_items: item,
        total_price: req.body.total_price,
        payment_type: req.body.payment_type,
        invoice_no,
        gst_no: req.body.gst_no,
        ...paymentDetails,
      };

      const result = await OrderDetailsSchema.create(orderData);

      // Create timeline entry
      await orderdeliverytimelineSchema.create({
        order_id: result._id,
      });

      // Send email
      await orderMail({ ...result._doc, invoice_no });

      return result;
    });

    await Promise.all(orderPromises);
    successResponse(res, "Your Order Placed Successfully");
  } catch (err) {
    console.log(err);
    errorResponse(res, "Error creating order");
  }
};

const CollectAllOrder = async (req, res) => {
  try {
    let where = {};

    // Parse the request parameters
    const { id, search, limit, date_filter, order_status } = JSON.parse(
      req.params.id
    );

    if (id && id !== "null") {
      where._id = new mongoose.Types.ObjectId(id);
    }
    if (search && search !== "null") {
      where.invoice_no = { $regex: search, $options: "i" };
    }
    if (order_status && order_status !== "null") {
      where.order_status = order_status;
    }

    // Handle date_filter validation and parsing
    if (date_filter && date_filter !== "null" && Array.isArray(date_filter)) {

      const start = moment(date_filter[0]);
      const end = moment(date_filter[1]);

      // Check if dates are valid
      if (start.isValid() && end.isValid()) {
        const startOfDay = start.startOf("day").toDate();
        const endOfDay = end.endOfDay("day").toDate();
        where.createdAt = { $gte: startOfDay, $lte: endOfDay };
      } else {
        console.error("Invalid date(s) in date_filter:", date_filter);
        // Optionally skip date filtering if dates are invalid
      }
    }

    const result = await OrderDetailsSchema.aggregate([
      { $match: where },
      {
        $lookup: {
          from: "order_delivery_timeline",
          localField: "_id",
          foreignField: "order_id",
          as: "order_delivery_timeline",
        },
      },
      {
        $lookup: {
          from: "user",
          localField: "user_id",
          foreignField: "_id",
          as: "user_details",
          pipeline: [{ $project: { password: 0 } }],
        },
      },
      { $sort: { createdAt: -1 } },
      ...(limit ? [{ $limit: 5 }] : []),
    ]);

    return successResponse(res, "all orders get successfully", result);
  } catch (err) {
    console.error("Error in CollectAllOrder:", err);
    return errorResponse(res, "Internal server error");
  }
};


// Updated CollectMyOrders function with better data handling
const CollectMyOrders = async (req, res) => {
  try {
    const { id } = req.userData;

    let where = {
      user_id: new mongoose.Types.ObjectId(id),
    };

    const result = await OrderDetailsSchema.aggregate([
      {
        $match: where,
      },
      {
        $lookup: {
          from: "order_delivery_timeline",
          localField: "_id",
          foreignField: "order_id",
          as: "order_delivery_timeline",
        },
      },
      {
        $lookup: {
          from: "user",
          localField: "user_id",
          foreignField: "_id",
          as: "user_details",
          pipeline: [{ $project: { password: 0 } }],
        },
      },
      // Add project stage to ensure all fields are returned
      {
        $project: {
          _id: 1,
          user_id: 1,
          cart_items: 1,
          delivery_address: 1,
          order_status: 1,
          total_price: 1,
          total_amount: 1,
          DeliveryCharges: 1,
          FreeDelivery: 1,
          payment_type: 1,
          invoice_no: 1,
          payment_id: 1,
          payment_status: 1,
          transaction_id: 1,
          payment_date: 1,
          payment_mode: 1,
          card_name: 1,
          gst_no: 1,
          subtotal: 1,
          tax_amount: 1,
          discount_amount: 1,
          total_before_discount: 1,
          payment_option: 1,
          payment_qr_code: 1,
          created_by: 1,
          admin_notes: 1,
          created_by_admin_id: 1,
          payment_failure_reason: 1,
          coupon: 1,
          createdAt: 1,
          updatedAt: 1,
          order_delivery_timeline: 1,
          user_details: 1,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    // Log for debugging
    console.log(`Found ${result.length} orders for user ${id}`);

    return successResponse(res, "get user order success", result);
  } catch (err) {
    console.error("Error in CollectMyOrders:", err);
    return errorResponse(res, "Failed to retrieve orders");
  }
};

// Alternative function to get orders by email (for admin-created orders without user_id)
const CollectMyOrdersByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    const { id } = req.userData;

    if (!email) {
      return errorResponse(res, "Email is required");
    }

    // Find orders by user_id OR by email in delivery address
    const result = await OrderDetailsSchema.aggregate([
      {
        $match: {
          $or: [
            { user_id: new mongoose.Types.ObjectId(id) },
            { "delivery_address.email": email },
          ],
        },
      },
      {
        $lookup: {
          from: "order_delivery_timeline",
          localField: "_id",
          foreignField: "order_id",
          as: "order_delivery_timeline",
        },
      },
      {
        $lookup: {
          from: "user",
          localField: "user_id",
          foreignField: "_id",
          as: "user_details",
          pipeline: [{ $project: { password: 0 } }],
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    console.log(`Found ${result.length} orders for user ${id} or email ${email}`);

    return successResponse(res, "get user orders success", result);
  } catch (err) {
    console.error("Error in CollectMyOrdersByEmail:", err);
    return errorResponse(res, "Failed to retrieve orders");
  }
};


// In your backend API routes file
const acceptOrderByVendor = async (req, res) => {
  try {
    const { order_id, vendor_id, deadline_date, deadline_time, notes } = req.body;
    
    if (!order_id || !vendor_id || !deadline_date || !deadline_time) {
      return errorResponse(res, "Missing required fields", 400);
    }

    if (!isValidObjectId(order_id) || !isValidObjectId(vendor_id)) {
      return errorResponse(res, "Invalid ID format", 400);
    }

    const order = await OrderDetailsSchema.findById(order_id);
    if (!order) {
      return errorResponse(res, "Order not found", 404);
    }

    if (order.vender_id !== vendor_id && order.vendor_id !== vendor_id) {
      return errorResponse(res, "You are not assigned to this order", 403);
    }

    const combinedDeadline = new Date(`${deadline_date}T${deadline_time}`);
    
    if (combinedDeadline <= new Date()) {
      return errorResponse(res, "Deadline must be in the future", 400);
    }

    const vendor = await VendorSchemas.findById(vendor_id);
    if (!vendor) {
      return errorResponse(res, "Vendor not found", 404);
    }

    const updatedOrder = await OrderDetailsSchema.findByIdAndUpdate(
      order_id,
      {
        order_status: 'vendor accepted',
        vendor_deadline: combinedDeadline,
        vendor_accepted_at: new Date(),
        vendor_notes: notes || '',
        vender_id: vendor_id,
        vendor_id: vendor_id
      },
      { new: true }
    );

    await orderdeliverytimelineSchema.create({
      order_id,
      order_status: 'vendor accepted',
      changed_by: vendor_id,
      changed_by_name: vendor.name,
      changed_by_role: 'vendor',
      notes: `Order accepted by vendor ${vendor.name}. Deadline: ${combinedDeadline.toLocaleString()}. ${notes ? `Notes: ${notes}` : ''}`,
      team_participation: {
        vendor: {
          user_id: vendor_id,
          name: vendor.name,
          role: 'vendor',
          action: "accepted",
          timestamp: new Date(),
        },
      },
    });

    try {
      await orderStatusMail({ 
        ...updatedOrder._doc,
        vendor_name: vendor.name 
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    return successResponse(res, "Order accepted successfully", updatedOrder);
  } catch (err) {
    console.error("Error accepting order:", err);
    return errorResponse(res, "Internal server error", 500);
  }
};

const completeOrderByVendor = async (req, res) => {
  try {
    const { order_id, vendor_id } = req.body;
    
    if (!order_id || !vendor_id) {
      return errorResponse(res, "Missing required fields", 400);
    }

    if (!isValidObjectId(order_id) || !isValidObjectId(vendor_id)) {
      return errorResponse(res, "Invalid ID format", 400);
    }

    const order = await OrderDetailsSchema.findById(order_id);
    if (!order) {
      return errorResponse(res, "Order not found", 404);
    }

    if (order.vender_id !== vendor_id && order.vendor_id !== vendor_id) {
      return errorResponse(res, "You are not assigned to this order", 403);
    }

    if (order.order_status !== 'vendor accepted') {
      return errorResponse(res, "Order must be accepted first", 400);
    }

    const vendor = await VendorSchemas.findById(vendor_id);
    if (!vendor) {
      return errorResponse(res, "Vendor not found", 404);
    }

    const updatedOrder = await OrderDetailsSchema.findByIdAndUpdate(
      order_id,
      {
        order_status: 'vendor completed',
        completed_at: new Date(),
      },
      { new: true }
    );

    await orderdeliverytimelineSchema.create({
      order_id,
      order_status: 'vendor completed',
      changed_by: vendor_id,
      changed_by_name: vendor.name,
      changed_by_role: 'vendor',
      notes: `Order completed by vendor ${vendor.name}`,
      team_participation: {
        vendor: {
          user_id: vendor_id,
          name: vendor.name,
          role: 'vendor',
          action: "completed",
          timestamp: new Date(),
        },
      },
    });

    try {
      await orderStatusMail({ 
        ...updatedOrder._doc,
        vendor_name: vendor.name 
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    return successResponse(res, "Order completed successfully", updatedOrder);
  } catch (err) {
    console.error("Error completing order:", err);
    return errorResponse(res, "Internal server error", 500);
  }
};


const UpdateOrderStatus = async (req, res) => {
  try {
    const { order_id, order_status, member_id } = req.body;

    // Validate required fields
    if (!order_id || !order_status || !member_id) {
      return errorResponse(res, "Missing required fields", 400);
    }

    // Get user information
    const user = await AdminUsersSchema.findById(member_id);
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    // Find the current order to get previous status
    const currentOrder = await OrderDetailsSchema.findById(order_id);
    if (!currentOrder) {
      return errorResponse(res, "Order not found", 404);
    }

    // Prepare update data based on user role
    const updateData = {
      order_status,
      $set: {},
    };

    // Map user roles to appropriate fields
    const roleFieldMapping = {
      "accounting team": { field: "account_id", value: member_id },
      "designing team": { field: "designerId", value: member_id },
      "quality check": { field: "package_team_id", value: member_id },
      "packing team": { field: "Quality_check_id", value: member_id },
    };

    if (roleFieldMapping[user.role]) {
      updateData.$set[roleFieldMapping[user.role].field] = 
        roleFieldMapping[user.role].value;
    }

    // Update order status
    const updatedOrder = await OrderDetailsSchema.findByIdAndUpdate(
      order_id,
      updateData,
      { new: true }
    );

    // Get the user who assigned this task (if any)
    // This assumes you have a way to determine who assigned the task
    // For now, I'll use the current user as both processor and assigner
    const assignedByUserId = user._id; // Or get from req.userData if available
    const assignedByUser = await AdminUsersSchema.findById(assignedByUserId);

    // Create delivery timeline record
    await orderdeliverytimelineSchema.create({
      order_id,
      order_status: updatedOrder.order_status,
      changed_by: user._id,
      changed_by_name: user.name,
      changed_by_role: user.role,
      notes: `Order status changed from ${currentOrder.order_status} to ${order_status} by ${user.name}`,
      team_participation: {
        [user.role]: {
          user_id: user._id,
          name: user.name,
          role: user.role,
          action: "processed",
          assigned_by: assignedByUserId, // Use ObjectId instead of name
          assigned_by_name: assignedByUser ? assignedByUser.name : user.name, // Add name field if needed
        },
      },
    });

    // Send status email (fire and forget)
    try {
      await orderStatusMail({ ...updatedOrder._doc });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Continue despite email failure as it's non-critical
    }

    return successResponse(res, "Order status updated successfully");
  } catch (err) {
    console.error("Error updating order status:", err);
    return errorResponse(res, "Internal server error", 500);
  }
};

/**
 * Toggle Order Cancellation Status
 * Allows super admin to request cancellation or remove cancellation request
 * Also supports changing order status when toggling cancellation
 */
const ToggleOrderCancellation = async (req, res) => {
  try {
    const { 
      order_id, 
      cancellation_reason, 
      admin_id,
      change_status, // Optional: new status to set when cancelling
      restore_to_status // Optional: status to restore to when un-cancelling
    } = req.body;

    // Validate required fields
    if (!order_id) {
      return errorResponse(res, "Order ID is required", 400);
    }

    if (!isValidObjectId(order_id)) {
      return errorResponse(res, "Invalid order ID format", 400);
    }

    // Find the current order
    const currentOrder = await OrderDetailsSchema.findById(order_id);
    if (!currentOrder) {
      return errorResponse(res, "Order not found", 404);
    }

    // Check if order is already completed
    if (currentOrder.order_status === "completed") {
      return errorResponse(res, "Cannot cancel a completed order", 400);
    }

    // Get admin user info if admin_id is provided
    let adminUser = null;
    if (admin_id && isValidObjectId(admin_id)) {
      adminUser = await AdminUsersSchema.findById(admin_id);
      if (!adminUser) {
        return errorResponse(res, "Admin user not found", 404);
      }
      
      // Verify admin has permission (super admin only)
      if (adminUser.role !== "super admin") {
        return errorResponse(res, "Only super admin can toggle cancellation", 403);
      }
    }

    // Toggle the cancellation_requested status
    const newCancellationRequested = !currentOrder.cancellation_requested;
    
    // Prepare update data
    const updateData = {
      cancellation_requested: newCancellationRequested,
      cancellation_requested_at: newCancellationRequested ? new Date() : null,
      cancellation_requested_by: newCancellationRequested && adminUser ? adminUser._id : null,
      cancellation_reason: newCancellationRequested ? (cancellation_reason || null) : null,
    };

    // Store original status before cancellation
    if (newCancellationRequested) {
      updateData.status_before_cancellation = currentOrder.order_status;
      
      // If change_status is provided, update to that status
      if (change_status) {
        updateData.order_status = change_status;
      } else {
        // Default: set to "cancelled" status
        updateData.order_status = "cancelled";
      }
    } else {
      // Restoring from cancellation
      if (restore_to_status) {
        updateData.order_status = restore_to_status;
      } else if (currentOrder.status_before_cancellation) {
        // Restore to previous status before cancellation
        updateData.order_status = currentOrder.status_before_cancellation;
      }
      // Clear the stored previous status
      updateData.status_before_cancellation = null;
    }

    // Update the order
    const updatedOrder = await OrderDetailsSchema.findByIdAndUpdate(
      order_id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return errorResponse(res, "Failed to update order", 500);
    }

    // Prepare timeline notes
    let timelineNotes = "";
    if (newCancellationRequested) {
      timelineNotes = `Cancellation requested`;
      if (adminUser) {
        timelineNotes += ` by ${adminUser.name}`;
      }
      if (cancellation_reason) {
        timelineNotes += `. Reason: ${cancellation_reason}`;
      }
      if (currentOrder.order_status !== updatedOrder.order_status) {
        timelineNotes += `. Status changed from "${currentOrder.order_status}" to "${updatedOrder.order_status}"`;
      }
    } else {
      timelineNotes = `Cancellation request removed`;
      if (adminUser) {
        timelineNotes += ` by ${adminUser.name}`;
      }
      if (currentOrder.order_status !== updatedOrder.order_status) {
        timelineNotes += `. Status restored to "${updatedOrder.order_status}"`;
      }
    }

    // Create timeline entry
    const timelineData = {
      order_id: updatedOrder._id,
      order_status: updatedOrder.order_status,
      action_type: newCancellationRequested ? "cancellation_requested" : "cancellation_removed",
      notes: timelineNotes,
      timestamp: new Date(),
    };

    // Add admin info to timeline if available
    if (adminUser) {
      timelineData.changed_by = adminUser._id;
      timelineData.changed_by_name = adminUser.name;
      timelineData.changed_by_role = adminUser.role;
      timelineData.team_participation = {
        "super admin": {
          user_id: adminUser._id,
          name: adminUser.name,
          role: adminUser.role,
          action: newCancellationRequested ? "cancelled" : "restored",
          timestamp: new Date(),
        }
      };
    }

    await orderdeliverytimelineSchema.create(timelineData);

    // Send notification email (optional, fire and forget)
    try {
      await orderStatusMail({ 
        ...updatedOrder._doc,
        cancellation_action: newCancellationRequested ? "requested" : "removed",
        admin_name: adminUser ? adminUser.name : "System"
      });
    } catch (emailError) {
      console.error("Email notification failed:", emailError);
      // Continue despite email failure
    }

    // Prepare success response
    const responseMessage = newCancellationRequested 
      ? "Order cancellation requested successfully" 
      : "Order cancellation request removed successfully";

    const responseData = {
      order_id: updatedOrder._id,
      invoice_no: updatedOrder.invoice_no,
      cancellation_requested: updatedOrder.cancellation_requested,
      order_status: updatedOrder.order_status,
      previous_status: currentOrder.order_status,
      cancellation_reason: updatedOrder.cancellation_reason,
      cancellation_requested_at: updatedOrder.cancellation_requested_at,
      status_before_cancellation: updatedOrder.status_before_cancellation,
    };

    return successResponse(res, responseMessage, responseData);

  } catch (err) {
    console.error("Error toggling order cancellation:", err);
    return errorResponse(res, "Internal server error", 500);
  }
};

const UpdateOrderDesign = async (req, res) => {
  try {
    const { order_id, designFile,design_time,member_id } = req.body;

    // Validate input
    if (!order_id || !designFile||!design_time) {
      return errorResponse(res, "Order ID and design file are required", 400);
    }

    // Get user information
    const user = await AdminUsersSchema.findById(member_id);
    if (!user || user.role !== "designing team") {
      return errorResponse(res, "Only designing team members can update designs", 403);
    }

    // Update order with design file
    const updatedOrder = await OrderDetailsSchema.findByIdAndUpdate(
      order_id,
      {
        $set: {
          designFile: designFile,
          design_time:design_time,
          designerId: member_id,
          order_status: "production team" 
        }
      },
      { new: true }
    );

    if (!updatedOrder) {
      return errorResponse(res, "Order not found", 404);
    }

    // Create timeline entry
    await orderdeliverytimelineSchema.create({
      order_id: updatedOrder._id,
      order_status: updatedOrder.order_status,
      changed_by: user._id,
      changed_by_name: user.name,
      changed_by_role: user.role,
      notes: `Design file updated by ${user.name}`,
      team_participation: {
        [user.role]: {
          user_id: user._id,
          name: user.name,
          role: user.role,
          action: "processed",
          timestamp: new Date(),
          assigned_by: user._id,
        },
      },
    });

    // Send notification email
    try {
      await orderStatusMail({ ...updatedOrder._doc });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    return successResponse(res, "Design file updated successfully");
  } catch (err) {
    console.error("Error updating design:", err);
    return errorResponse(res, "Internal server error", 500);
  }
};

const UpdateOrderVendor = async (req, res) => {
  try {
    const { order_id, vendor_id, member_id } = req.body;

    // Validate input
    if (!order_id || !vendor_id || !member_id) {
      return errorResponse(res, "Order ID, vendor ID, and member ID are required", 400);
    }

    // Validate ObjectId format
    if (!isValidObjectId(order_id) || !isValidObjectId(vendor_id) || !isValidObjectId(member_id)) {
      return errorResponse(res, "Invalid ID format", 400);
    }

    // Get user information
    const user = await AdminUsersSchema.findById(member_id);
    if (!user || user.role !== "production team") {
      return errorResponse(res, "Only production team members can assign vendors", 403);
    }

    // Verify vendor exists (optional but recommended)
    const vendor = await VendorSchemas.findById(vendor_id);
    if (!vendor) {
      return errorResponse(res, "Vendor not found", 404);
    }

    // Update order with vendor assignment
    const updatedOrder = await OrderDetailsSchema.findByIdAndUpdate(
      
      order_id,
      {
        $set: {
          vender_id: vendor_id, 
          production_id: member_id,
          order_status: "vendor assigned" 
        }
      },
      { new: true, runValidators: true } // Added runValidators
    );

    if (!updatedOrder) {
      return errorResponse(res, "Order not found", 404);
    }

    // Create timeline entry with explicit values
    await orderdeliverytimelineSchema.create({
      order_id: order_id,
      order_status: "vendor assigned", // Explicit value
      changed_by: user._id,
      changed_by_name: user.name,
      changed_by_role: user.role,
      notes: `Vendor ${vendor.name} assigned by ${user.name}`,
      team_participation: {
        [user.role]: {
          user_id: user._id,
          name: user.name,
          role: user.role,
          action: "processed",
          timestamp: new Date(),
          assigned_by: user._id,
        },
      },
    });

    // Send notification email
    try {
      await orderStatusMail({ 
        ...updatedOrder._doc,
        vendor_name: vendor.name // Add vendor info to email
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    return successResponse(res, "Vendor assigned successfully", {
      order: updatedOrder,
      vendor: vendor.name
    });

  } catch (err) {
    console.error("Error updating vendor assignment:", err);
    return errorResponse(res, "Internal server error", 500);
  }
};

const getOrderStates = async (req, res) => {
  try {
    const result = await orderdeliverytimelineSchema.aggregate([
      {
        $group: {
          _id: "order_status",
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);
  } catch (err) {
    console.log(err);
  }
};



module.exports = {
  CreateOrder,
  CollectAllOrder,
  CollectMyOrders,
  UpdateOrderStatus,
  getOrderStates,
  UpdateOrderDesign,
  UpdateOrderVendor,
  acceptOrderByVendor,
  completeOrderByVendor,
  CollectMyOrdersByEmail,
  ToggleOrderCancellation
};