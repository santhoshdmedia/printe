const { VerfiyToken } = require("../helper/shared.helper");
const { CreateOrder, CollectAllOrder, CollectMyOrders, UpdateOrderStatus, getOrderStates,UpdateOrderDesign,UpdateOrderVendor,acceptOrderByVendor,completeOrderByVendor } = require("./controller_import");

const router = require("express").Router();

router.post("/create_order", CreateOrder);
router.get("/collect_all_orders/:id", CollectAllOrder);

router.put("/update_order_status", UpdateOrderStatus);
router.get("/collect_my_orders", CollectMyOrders);
router.get("/get_order_status", getOrderStates);
router.put('/update-design',  UpdateOrderDesign);
router.put('/update-vendor',  UpdateOrderVendor);
router.post('/accept-order',  acceptOrderByVendor);
router.post('/complete-order', completeOrderByVendor);

module.exports = router;
