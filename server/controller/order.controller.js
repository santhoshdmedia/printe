const { default: mongoose } = require("mongoose");
const { successResponse, errorResponse } = require("../helper/response.helper");
const { OrderDetailsSchema, orderdeliverytimelineSchema, ProductSchema, PaymentSchema } = require("./models_import");
const { order_delivery_timeline } = require("../modals/orderdetails.modals");
const _ = require("lodash");
const moment = require("moment");
const { orderMail, orderStatusMail } = require("../mail/sendMail");

// const CreateOrder = async (req, res) => {
//   try {
//     const { 
//       delivery_address, 
//       payment_type, 
//       cart_items, 
//       total_price, 
//       gst_no, 
//       payment_id, 
//       transaction_id, 
//       payment_status,
//       payment_amount,
//       remaining_amount,
//       payment_mode,
//       invoice_no
//     } = req.body;

//     // Get user ID from either req.userData (existing) or req.user (new)
//     const userId = req.userData?.id || req.user?._id;
    
//     if (!userId) {
//       return errorResponse(res, "User authentication required");
//     }

//     const orders = Array.isArray(cart_items) ? cart_items : [cart_items];
//     const createdOrders = [];

//     for (const item of orders) {
//       const orderData = {
//         user_id: userId,
//         cart_items: item,
//         delivery_address,
//         order_status: "placed",
//         total_price: item.final_total || total_price,
//         payment_type,
//         invoice_no,
//         payment_ids: [payment_id],
//         transaction_ids: [transaction_id],
//         gst_no,
//         payment_status,
//         payment_date: new Date(),
//         payment_mode,
//         remaining_amount: remaining_amount || 0
//       };

//       if (payment_status === "advance_paid") {
//         orderData.advance_payment = payment_amount;
//         orderData.remaining_amount = remaining_amount;
//       } else if (payment_status === "completed") {
//         orderData.full_payment = payment_amount;
//       }

//       const order = new OrderDetailsSchema(orderData);
//       await order.save();
//       createdOrders.push(order);

//       // Update product stock if needed
//       if (item.product_variants && item.product_variants.length > 0) {
//         const quantity_value = Number(_.get(item, "product_quantity", ""));
//         const product_code = _.get(item, "product_variants[0].product_code", "");
//         const current_stock = Number(_.get(item, "product_variants[0].stock", ""));

//         await ProductSchema.updateOne(
//           { "variants_price.product_unique_code": product_code },
//           { $set: { "variants_price.$[elem].stock": current_stock - quantity_value } },
//           { arrayFilters: [{ "elem.product_code": product_code }], new: true }
//         );
//       }

//       // Create timeline entry
//       await orderdeliverytimelineSchema.create({
//         order_id: order._id
//       });

//       // Send email
//       await orderMail({ ...order._doc, invoice_no });
//     }

//     successResponse(res, "Order created successfully", createdOrders);
//   } catch (error) {
//     console.error("Error creating order:", error);
//     errorResponse(res, error.message || "Error creating order");
//   }
// };

const CreateOrder = async (req, res) => {
  try {
    const { 
      delivery_address, 
      payment_type, 
      cart_items, 
      total_price, 
      gst_no, 
      payment_id, 
      transaction_id, 
      payment_status,
      payment_amount,
      remaining_amount,
      payment_mode,
      invoice_no
    } = req.body;

    // Get user ID from either req.userData (existing) or req.user (new)
    const userId = req.userData?.id || req.user?._id;
    
    if (!userId) {
      return errorResponse(res, "User authentication required");
    }

    const orders = Array.isArray(cart_items) ? cart_items : [cart_items];
    const createdOrders = [];

    for (const item of orders) {
      const orderData = {
        user_id: userId,
        cart_items: item,
        delivery_address,
        order_status: "placed",
        total_price: parseFloat(total_price).toFixed(2),
        payment_type,
        invoice_no,
        payment_ids: [payment_id],
        transaction_ids: [transaction_id],
        gst_no,
        payment_status,
        payment_date: new Date(),
        payment_mode,
        remaining_amount: parseFloat(remaining_amount || 0).toFixed(2)
      };

      if (payment_status === "advance_paid") {
        orderData.advance_payment = parseFloat(payment_amount).toFixed(2);
        orderData.remaining_amount = parseFloat(remaining_amount).toFixed(2);
      } else if (payment_status === "completed") {
        orderData.full_payment = parseFloat(payment_amount).toFixed(2);
      }

      const order = new OrderDetailsSchema(orderData);
      await order.save();
      createdOrders.push(order);

      // Update product stock if needed
      if (item.product_variants && item.product_variants.length > 0) {
        const quantity_value = Number(_.get(item, "product_quantity", ""));
        const product_code = _.get(item, "product_variants[0].product_code", "");
        const current_stock = Number(_.get(item, "product_variants[0].stock", ""));

        await ProductSchema.updateOne(
          { "variants_price.product_unique_code": product_code },
          { $set: { "variants_price.$[elem].stock": current_stock - quantity_value } },
          { arrayFilters: [{ "elem.product_code": product_code }], new: true }
        );
      }

      // Create timeline entry
      await orderdeliverytimelineSchema.create({
        order_id: order._id
      });

      // Send email
      await orderMail({ ...order._doc, invoice_no });
    }

    successResponse(res, "Order created successfully", createdOrders);
  } catch (error) {
    console.error("Error creating order:", error);
    errorResponse(res, error.message || "Error creating order");
  }
};

const CollectAllOrder = async (req, res) => {
  try {
    let where = {};
    const params = JSON.parse(req.params.id);
    const { id, search, limit, date_filter, order_status, invoice_no } = params;

    // Use exact match for invoice_no for better performance
    if (invoice_no && invoice_no !== "null") {
      where.invoice_no = invoice_no;
    } else if (id && id !== "null") {
      where._id = new mongoose.Types.ObjectId(id);
    } else if (search && search !== "null") {
      // Use text index for better search performance
      where.$text = { $search: search };
    }

    if (order_status && order_status !== "null") {
      where.order_status = order_status;
    }

    if (date_filter && date_filter !== "null") {
      const startOfDay = moment(date_filter[0]).startOf("day").toDate();
      const endOfDay = moment(date_filter[1]).endOf("day").toDate();
      where.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    // Add pagination for better performance with large datasets
    const page = parseInt(params.page) || 1;
    const pageSize = parseInt(limit) || 10;
    const skip = (page - 1) * pageSize;

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
      { $skip: skip },
      { $limit: pageSize },
    ]);

    // Get total count for pagination
    const totalCount = await OrderDetailsSchema.countDocuments(where);

    return successResponse(res, "all orders get successfully", {
      orders: result,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / pageSize)
    });
  } catch (err) {
    console.error("Error in CollectAllOrder:", err);
    return errorResponse(res, "Failed to fetch orders");
  }
};

// const CollectAllOrder = async (req, res) => {
//   try {
//     let where = {};

//     const { id, search, limit, date_filter, order_status } = JSON.parse(req.params.id);

//     if (id && id !== "null") {
//       where._id = new mongoose.Types.ObjectId(id);
//     }
//     if (search && search !== "null") {
//       where.invoice_no = { $regex: search, $options: "i" };
//     }

//     if (order_status && order_status !== "null") {
//       where.order_status = order_status;
//     }
//     console.log(date_filter);
//     if (date_filter && date_filter !== "null") {
//       const startOfDay = moment(date_filter[0]).startOf("day").toDate();
//       const endOfDay = moment(date_filter[1]).endOf("day").toDate();

//       where.createdAt = { $gte: startOfDay, $lte: endOfDay };
//     }

//     const result = await OrderDetailsSchema.aggregate([
//       {
//         $match: where,
//       },
//       {
//         $lookup: {
//           from: "order_delivery_timeline",
//           localField: "_id",
//           foreignField: "order_id",
//           as: "order_delivery_timeline",
//         },
//       },
//       {
//         $lookup: {
//           from: "user",
//           localField: "user_id",
//           foreignField: "_id",
//           as: "user_details",
//           pipeline: [
//             {
//               $project: {
//                 password: 0,
//               },
//             },
//           ],
//         },
//       },
//       {
//         $sort: {
//           createdAt: -1,
//         },
//       },
//       ...(limit ? [{ $limit: 5 }] : []),
//     ]);
//     return successResponse(res, "all orders get successfully", result);
//   } catch (err) {
//     console.log(err);
//   }
// };

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
    const { order_id, order_status } = req.body;
    const result = await OrderDetailsSchema.findByIdAndUpdate(order_id, {
      order_status: order_status,
    });

    await orderdeliverytimelineSchema.create(req.body);

    try {
      const email = await orderStatusMail({ ...result._doc });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    return successResponse(res, "update sucess");
  } catch (err) {
    console.log(err);
    errorResponse(res, "");
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
};