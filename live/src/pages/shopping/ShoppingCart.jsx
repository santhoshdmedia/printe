import React, { useEffect, useState } from "react";
import Breadcrumbs from "../../components/cards/Breadcrumbs";
import { getMyShoppingCart, removeMyShoppingCart } from "../../helper/api_helper";
import _ from "lodash";
import { Button, Divider, Modal, Spin } from "antd";
import { IconHelper } from "../../helper/IconHelper";
import { ERROR_NOTIFICATION, SUCCESS_NOTIFICATION } from "../../helper/notification_helper";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { SET_CART_ITEMS } from "../../redux/slices/cart.slice";
import { ImageHelper } from "../../helper/ImageHelper";

const ShoppingCart = () => {
  const { user } = useSelector((state) => state.authSlice);
  const [cardData, setCardData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [designModalVisible, setDesignModalVisible] = useState(false);

  const dispatch = useDispatch();
  const navigation = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getMyShoppingCart();
      if (user.name === "" && result.data.data[0]._id) {
        localStorage.setItem("guest", result.data.data[0]._id);
      }
      let data = _.get(result, "data.data", []);
      setCardData(data);
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
      await fetchData();
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

  const GET_TOTAL_AMOUNT = () => {
    return _.sum(cardData.map((res) => Number(res.final_total)));
  };

  return (
    <>
      <style>{`
        .cart-item-card {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.07);
          padding: 16px;
          margin-bottom: 12px;
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .cart-item-image {
          width: 80px;
          height: 80px;
          object-fit: contain;
          border-radius: 8px;
          border: 1px solid #f0f0f0;
          flex-shrink: 0;
        }
        .cart-item-body {
          flex: 1;
          min-width: 0;
        }
        .cart-item-name {
          font-size: 14px;
          font-weight: 600;
          color: #1a77d2;
          text-decoration: none;
          line-height: 1.4;
          display: block;
          margin-bottom: 4px;
          overflow-wrap: break-word;
        }
        .cart-item-name:hover { text-decoration: underline; }
        .cart-item-meta {
          font-size: 12px;
          color: #888;
          margin-bottom: 2px;
        }
        .cart-item-price-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 10px;
          flex-wrap: wrap;
          gap: 8px;
        }
        .cart-item-price {
          font-size: 16px;
          font-weight: 700;
          color: #1a1a1a;
        }
        .cart-item-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .btn-buy-now {
          background: #f5c518 !important;
          border: none !important;
          color: #1a1a1a !important;
          font-weight: 600 !important;
          font-size: 13px !important;
          height: 34px !important;
          padding: 0 14px !important;
          border-radius: 6px !important;
        }
        .btn-buy-now:hover {
          background: #e6b800 !important;
        }
        .btn-delete {
          color: #d9363e !important;
          font-size: 13px !important;
          height: 34px !important;
          padding: 0 10px !important;
          border: 1px solid #ffcdd2 !important;
          border-radius: 6px !important;
        }
        .btn-preview-design {
          font-size: 12px !important;
          padding: 0 !important;
          height: auto !important;
          color: #1a77d2 !important;
          margin-top: 4px;
        }
        .cart-summary-bar {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 -2px 12px rgba(0,0,0,0.06);
          padding: 14px 16px;
          position: sticky;
          bottom: 0;
          z-index: 10;
          margin-top: 8px;
        }
        .cart-summary-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .cart-summary-text {
          font-size: 15px;
          font-weight: 700;
          color: #1a1a1a;
        }
        .cart-summary-amount {
          color: #e05c00;
        }
        .btn-checkout {
          background: #f5c518 !important;
          border: none !important;
          color: #1a1a1a !important;
          font-weight: 700 !important;
          font-size: 15px !important;
          height: 44px !important;
          padding: 0 24px !important;
          border-radius: 8px !important;
          white-space: nowrap;
        }
        .btn-checkout:hover {
          background: #e6b800 !important;
        }
        .cart-page-wrapper {
          width: 100%;
          min-height: 100svh;
          background: #f5f5f5;
          padding: 12px;
          box-sizing: border-box;
        }
        .cart-header {
          background: #fff;
          border-radius: 12px;
          padding: 14px 16px 10px;
          margin-bottom: 12px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }
        .cart-header h1 {
          font-size: 18px;
          font-weight: 700;
          margin: 0;
          color: #1a1a1a;
        }
        .cart-empty-wrapper {
          min-height: 100svh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
          text-align: center;
        }
        .cart-empty-wrapper img {
          width: min(280px, 80vw);
          object-fit: contain;
          margin-bottom: 16px;
        }
        .cart-empty-wrapper h1 {
          font-size: 15px;
          color: #555;
          max-width: 300px;
          margin-bottom: 12px;
          line-height: 1.6;
        }
        .in-stock-badge {
          display: inline-block;
          font-size: 11px;
          color: #2e7d32;
          background: #e8f5e9;
          border-radius: 4px;
          padding: 1px 6px;
          margin-bottom: 2px;
          font-weight: 500;
        }

        @media (min-width: 640px) {
          .cart-page-wrapper {
            padding: 20px;
          }
          .cart-item-image {
            width: 96px;
            height: 96px;
          }
          .cart-item-name {
            font-size: 15px;
          }
          .cart-item-price {
            font-size: 17px;
          }
          .cart-header h1 {
            font-size: 20px;
          }
        }

        @media (min-width: 1024px) {
          .cart-page-wrapper {
            max-width: 860px;
            margin: 0 auto;
            padding: 28px 20px;
          }
          .cart-item-card {
            padding: 20px;
            gap: 16px;
          }
          .cart-item-image {
            width: 110px;
            height: 110px;
          }
          .cart-item-name {
            font-size: 16px;
          }
          .cart-summary-bar {
            padding: 16px 20px;
          }
        }
      `}</style>

      <Spin
        spinning={loading}
        indicator={
          <IconHelper.CIRCLELOADING_ICON className="animate-spin !text-yellow-500" />
        }
      >
        {_.isEmpty(cardData) ? (
          <div className="cart-empty-wrapper">
            <img
              fetchpriority="high"
              loading="eager"
              src={ImageHelper.EmptyCard}
              alt="Empty cart"
            />
            <h1>
              Your cart is empty! Start adding amazing products now and enjoy a
              seamless shopping experience.
            </h1>
            <Link to="/" className="!text-primary !font-medium">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-page-wrapper">
            <Breadcrumbs title={"Shopping cart"} />

            {/* Header */}
            <div className="cart-header">
              <h1>Shopping Cart ({cardData.length} {cardData.length === 1 ? "item" : "items"})</h1>
            </div>

            {/* Cart items */}
            <div>
              {cardData.map((item) => (
                <div key={item._id} className="cart-item-card">
                  {/* Product image */}
                  <Link
                    to={`/product/${_.get(item, "product_seo_url", "")}`}
                    target="_blank"
                  >
                    <img
                      fetchpriority="high"
                      loading="eager"
                      src={item.product_image}
                      alt={item.product_name}
                      className="cart-item-image"
                    />
                  </Link>

                  {/* Product body */}
                  <div className="cart-item-body">
                    <Link
                      to={`/product/${_.get(item, "product_seo_url", "")}`}
                      target="_blank"
                      className="cart-item-name"
                    >
                      {item.product_name}
                    </Link>

                    <span className="in-stock-badge">In Stock</span>

                    <div className="cart-item-meta">
                      Qty: <strong>{item.product_quantity}</strong>
                    </div>

                    {item.product_design_file && (
                      <Button
                        type="link"
                        size="small"
                        onClick={() => handleViewDesign(item)}
                        className="btn-preview-design"
                      >
                        Preview Design
                      </Button>
                    )}

                    {/* Price + actions */}
                    <div className="cart-item-price-row">
                      <span className="cart-item-price">
                        ₹{Number(item.final_total).toFixed(2)}
                      </span>
                      <div className="cart-item-actions">
                        <Button
                          size="small"
                          onClick={() => handleProceedToBuy(item)}
                          className="btn-buy-now"
                        >
                          Buy Now
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleDelete(item._id)}
                          loading={deleteLoading === item._id}
                          disabled={deleteLoading === item._id}
                          className="btn-delete"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sticky summary + checkout */}
            <div className="cart-summary-bar">
              <div className="cart-summary-inner">
                <div className="cart-summary-text">
                  Subtotal ({cardData.length}{" "}
                  {cardData.length === 1 ? "item" : "items"}):{" "}
                  <span className="cart-summary-amount">
                    ₹{Number(GET_TOTAL_AMOUNT()).toFixed(2)}
                  </span>
                </div>
                <Button
                  size="large"
                  onClick={() => handleProceedToBuy(null)}
                  className="btn-checkout"
                >
                  Check Out All
                </Button>
              </div>
            </div>
          </div>
        )}
      </Spin>

      {/* Design preview modal */}
      <Modal
        title="Design Preview"
        open={designModalVisible}
        onCancel={() => setDesignModalVisible(false)}
        footer={null}
        width="90%"
        style={{ maxWidth: 760 }}
        centered
      >
        {selectedProduct && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0" }}>
            <img
              fetchpriority="high"
              loading="eager"
              src={selectedProduct.product_design_file}
              alt="Design Preview"
              style={{ maxWidth: "100%", maxHeight: "65vh", objectFit: "contain", borderRadius: 8 }}
            />
            <div style={{ marginTop: 16, textAlign: "center" }}>
              <h3 style={{ fontWeight: 700, marginBottom: 4 }}>{selectedProduct.product_name}</h3>
              <p style={{ color: "#666", margin: 0 }}>Quantity: {selectedProduct.product_quantity}</p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ShoppingCart;