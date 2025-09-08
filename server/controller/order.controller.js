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

const users=AdminUsersSchema;

const CreateOrder = async (req, res) => {
  try {
    const { id } = req.userData;
    const { delivery_address, cart_items, payment_id, transaction_id } =
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
      console.log("Raw date_filter:", date_filter); // Debug log

      const start = moment(date_filter[0]);
      const end = moment(date_filter[1]);

      // Check if dates are valid
      if (start.isValid() && end.isValid()) {
        const startOfDay = start.startOf("day").toDate();
        const endOfDay = end.endOf("day").toDate();
        where.createdAt = { $gte: startOfDay, $lte: endOfDay };
        console.log("Processed Date Range:", startOfDay, endOfDay); // Debug log
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

const CollectMyOrders = async (req, res) => {
  try {
    const { id } = req.userData;

    let where = {
      user_id: new mongoose.Types.ObjectId(id),
    };

    // if (order_id) {
    //   where._id = new mongoose.Types.ObjectId(order_id);
    // }

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
        $sort: {
          createdAt: -1,
        },
      },
    ]);
    successResponse(res, "get user order success", result);
  } catch (err) {
    console.log(err);
    errorResponse(res, "");
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
  UpdateOrderVendor
};
