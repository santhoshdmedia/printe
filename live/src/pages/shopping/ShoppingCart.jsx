import React, { useEffect, useState } from "react";
import Breadcrumbs from "../../components/cards/Breadcrumbs";
import { getMyShoppingCart, removeMyShoppingCart, } from "../../helper/api_helper";
import _ from "lodash";
import { Button, Divider, Modal, Spin, Table } from "antd";
import { IconHelper } from "../../helper/IconHelper";
import { ERROR_NOTIFICATION, SUCCESS_NOTIFICATION } from "../../helper/notification_helper";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch,useSelector } from "react-redux";
import { SET_CART_ITEMS } from "../../redux/slices/cart.slice"; // Changed import
import { ImageHelper } from "../../helper/ImageHelper";

const ShoppingCart = () => {
  const { user } = useSelector((state) => state.authSlice);
  const [cardData, setCardData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null); // Separate loading for delete
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [designModalVisible, setDesignModalVisible] = useState(false);  

  const dispatch = useDispatch();
  const navigation = useNavigate();
  const storeGuestId=()=>{
    
  }

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, []);
  

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getMyShoppingCart();
      if(user.name==""&&result.data.data[0]._id){
        localStorage.setItem("guest",result.data.data[0]._id)
      }

     
      let data = _.get(result, "data.data", []);
      setCardData(data);
      // Corrected dispatch - use SET_CART_ITEMS instead of ADD_TO_CART
      dispatch(SET_CART_ITEMS(data));
    } catch (err) {
      console.error("Error fetching cart:", err);
      ERROR_NOTIFICATION("Failed to load cart data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setDeleteLoading(id);
      const result = await removeMyShoppingCart(id);
      SUCCESS_NOTIFICATION(result);
      await fetchData(); // Wait for refresh
    } catch (err) {
      ERROR_NOTIFICATION(err);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleProceedToBuy = (product) => {
    if (product) {
      navigation("/checkout", { state: { selectedProducts: [product] } });
    } else {
      navigation("/checkout", { state: { selectedProducts: cardData } });
    }
  };

  const handleViewDesign = (product) => {
    setSelectedProduct(product);
    setDesignModalVisible(true);
  };

  const columns = [
    {
      title: "Product",
      dataIndex: "product_image",
      key: "image",
      render: (image, record) => (
        <div className="flex items-start gap-4">
          <Link to={`/product/${_.get(record, "product_seo_url", "")}`} target="_blank">
            <img src={image} alt={record.product_name} className="w-20 h-20 object-contain" />
          </Link>
          <div className="flex-1">
            <Link to={`/product/${_.get(record, "product_seo_url", "")}`} className="text-blue-600 hover:text-blue-800 text-base">
              {record.product_name}
            </Link>
            <div className="text-sm text-gray-600">In Stock</div>
            <div className="text-sm">
              <span className="text-gray-500">Qty: </span>
              <span className="font-medium">{record.product_quantity}</span>
            </div>
            {record.product_design_file && (
              <Button 
                type="link" 
                size="small" 
                onClick={() => handleViewDesign(record)}
                className="!p-0 !text-blue-600 !h-auto"
              >
                Preview Design
              </Button>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Price",
      dataIndex: `${(user.role === "Dealer" || user.role === "Corporate")?"final_total":""}`,
      key: `final_total`,
      render: (price, record) => {
        return (
          <div className="flex flex-col items-end">
            <span className="font-medium text-base">₹{Number(price).toFixed(2)}</span>
            <div className="flex gap-2 mt-2">
              <Button 
                type="primary"
                size="small"
                onClick={() => handleProceedToBuy(record)}
                className="!bg-yellow-400 hover:!bg-yellow-500 !text-black !border-none !font-medium !h-8 !px-3"
              >
                Buy Now
              </Button>
              <Button 
                type="text" 
                size="small" 
                onClick={() => handleDelete(record._id)}
                loading={deleteLoading === record._id}
                disabled={deleteLoading === record._id}
                className="!text-red-600 !h-8 !px-3"
              >
                Delete
              </Button>
            </div>
          </div>
        );
      },
    },
  ];

  const GET_SUB_TOTAL = () => {
    return _.sum(
      cardData.map((res) => {
        return Number(res.final_total);
      })
    );
  };

  const GET_TOTAL_AMOUNT = () => {
    return GET_SUB_TOTAL();
  };

  return (
    <Spin spinning={loading} indicator={<IconHelper.CIRCLELOADING_ICON className="animate-spin !text-yellow-500" />}>
      {_.isEmpty(cardData) ? (
        <div className="min-h-screen center_div flex-col">
          <img className="size-[300px] object-contain" src={ImageHelper.EmptyCard} alt="" />
          <h1 className="w-[300px] text-center pb-2">Your cart is empty! Start adding amazing products now and enjoy a seamless shopping experience.</h1>
          <div className="center_div">
            <Link to="/" className="!text-primary !font-medium">
              Continue Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="w-full min-h-screen bg-gray-50 py-4">
          <div className="max-w-6xl mx-auto px-4">
            <Breadcrumbs title={"Shopping cart"} />
            
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <h1 className="text-2xl font-bold mb-4">Shopping Cart ({cardData.length} items)</h1>
              <Divider className="my-2" />
              
              <Table 
                dataSource={cardData} 
                loading={loading} 
                columns={columns} 
                bordered={false}
                pagination={false}
                rowKey="_id"
                className="cart-table"
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 sticky bottom-0">
              <div className="flex justify-end items-center">
                <div className="text-right mr-4">
                  <div className="text-lg font-bold">
                    Subtotal ({cardData.length} items): <span className="text-orange-600">₹{Number(GET_TOTAL_AMOUNT()).toFixed(2)}</span>
                  </div>
                </div>
                <Button 
                  type="primary" 
                  size="large"
                  onClick={() => handleProceedToBuy(null)}
                  className="bg-yellow-400 hover:bg-yellow-500 border-none text-black font-bold"
                >
                  Check Out All
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Design View Modal */}
      <Modal
        title="Design Preview"
        visible={designModalVisible}
        onCancel={() => setDesignModalVisible(false)}
        footer={null}
        width="80%"
      >
        {selectedProduct && (
          <div className="flex flex-col items-center">
            <img 
              src={selectedProduct.product_design_file} 
              alt="Design Preview" 
              className="max-w-full max-h-[70vh] object-contain"
            />
            <div className="mt-4">
              <h3 className="font-bold">{selectedProduct.product_name}</h3>
              <p>Quantity: {selectedProduct.product_quantity}</p>
            </div>
          </div>
        )}
      </Modal>
    </Spin>
  );
};

export default ShoppingCart;