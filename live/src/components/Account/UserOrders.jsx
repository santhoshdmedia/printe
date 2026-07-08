import { Table, Tag, Card, Statistic, Row, Col, Tooltip } from "antd";
import React, { useEffect } from "react";
import dayjs from 'dayjs';
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import {
  ShoppingOutlined,
  CalendarOutlined,
  EyeOutlined,
  TagOutlined,
} from "@ant-design/icons";

const RupeeIcon = () => <span style={{ fontFamily: "inherit" }}>₹</span>;

const UserOrders = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { my_orders } = useSelector((state) => state.authSlice);

  useEffect(() => {
    dispatch({ type: "GET_MY_ORDERS" });
  }, [dispatch]);

  const orders = my_orders?.data || [];

  // Statistics — always use total_price (the actual amount paid after coupon/discount)
  const totalOrders = orders.length;

  const totalSpent = orders.reduce((sum, order) => {
    const paid = Number(order.total_price);
    return sum + (isNaN(paid) ? 0 : paid);
  }, 0);

  const recentOrder =
    orders.length > 0
      ? dayjs(orders[orders.length - 1].createdAt).fromNow()
      : "No orders yet";

  const columns = [
    {
      title: "Invoice No.",
      dataIndex: "invoice_no",
      key: "invoice_no",
      render: (text) => (
        <span style={{ fontFamily: "monospace", fontSize: 13 }}>{text}</span>
      ),
    },
    {
      title: "Product",
      dataIndex: "cart_items",
      key: "cart_items",
      render: (items) => {
        if (!items || items.length === 0) return <span>—</span>;
        // Show first product name; if multiple, show count
        const firstName = _.get(items[0], "product_name", "Unknown Product");
        return (
          <span>
            {firstName}
            {items.length > 1 && (
              <Tag
                style={{ marginLeft: 6, fontSize: 11 }}
                color="default"
              >
                +{items.length - 1} more
              </Tag>
            )}
          </span>
        );
      },
    },
    {
      title: "Amount Paid",
      dataIndex: "total_price",
      key: "total_price",
      sorter: (a, b) => Number(a.total_price) - Number(b.total_price),
      render: (price, record) => {
        const paid = Number(price);
        const original = Number(record.subtotal || record.total_before_discount || 0);
        const hasCoupon = record.coupon && record.coupon.code;
        const discountAmount = Number(record.discount_amount || 0);

        return (
          <div>
            <span style={{ fontWeight: 600, color: "#3f8600" }}>
              ₹ {paid.toFixed(2)}
            </span>
            {hasCoupon && discountAmount > 0 && (
              <Tooltip
                title={
                  <span>
                    Coupon: <strong>{record.coupon.code}</strong>
                    <br />
                    Original: ₹{original.toFixed(2)}
                    <br />
                    Discount: −₹{discountAmount.toFixed(2)}
                  </span>
                }
              >
                <Tag
                  icon={<TagOutlined />}
                  color="gold"
                  style={{
                    marginLeft: 6,
                    fontSize: 11,
                    cursor: "pointer",
                  }}
                >
                  Coupon
                </Tag>
              </Tooltip>
            )}
            {hasCoupon && discountAmount > 0 && (
              <div>
                <span
                  style={{
                    fontSize: 11,
                    color: "#999",
                    textDecoration: "line-through",
                  }}
                >
                  ₹{original.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Payment",
      dataIndex: "payment_status",
      key: "payment_status",
      render: (status) => {
        const colorMap = {
          completed: "success",
          pending: "warning",
          failed: "error",
        };
        return (
          <Tag color={colorMap[status] || "default"}>
            {status ? status.charAt(0).toUpperCase() + status.slice(1) : "—"}
          </Tag>
        );
      },
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (createdAt) => (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <CalendarOutlined style={{ color: "#aaa" }} />
          <span>{dayjs(createdAt).format("DD MMM YYYY")}</span>
        </div>
      ),
    },
    {
      title: "View",
      key: "view",
      align: "center",
      render: (_, record) => (
        <Tag
          icon={<EyeOutlined />}
          className="!text-sm bg-[#fdecba] !text-black !cursor-pointer !border-transparent !flex !items-center !justify-center !px-3 !py-1"
          onClick={() => navigate(`/account/my-orders/${record._id}`)}
        >
          Open
        </Tag>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <Card
        className="border-0 shadow-md rounded-lg"
        bodyStyle={{ padding: 0 }}
      >
        <div className="p-4">
          {/* Header */}
          <div className="mb-5 border-b border-gray-300 pb-3">
            <h1 className="text-xl font-bold text-gray-800 mb-0">My Orders</h1>
          </div>

          {/* Statistics Cards */}
          <Row gutter={16} className="mb-6">
            <Col span={8}>
              <Card className="shadow-md rounded-lg border-0 bg-[#fff8e5]">
                <Statistic
                  title="Total Orders"
                  value={totalOrders}
                  prefix={<ShoppingOutlined style={{ color: "#1677ff" }} />}
                  valueStyle={{ color: "#000" }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card className="shadow-md rounded-lg border-0 bg-[#fff8e5]">
                <Statistic
                  title="Total Amount Paid"
                  value={totalSpent}
                  precision={2}
                  prefix={<RupeeIcon />}
                  valueStyle={{ color: "#3f8600" }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card className="shadow-md rounded-lg border-0 bg-[#fff8e5]">
                <Statistic
                  title="Last Order"
                  value={recentOrder}
                  prefix={<CalendarOutlined style={{ color: "#fa8c16" }} />}
                  valueStyle={{ color: "#000", fontSize: 16 }}
                />
              </Card>
            </Col>
          </Row>

          <h2 className="text-lg font-semibold text-gray-700">Order History</h2>
          <p className="text-gray-500 mb-0">
            View and manage all your orders
          </p>
        </div>

        <Table
          columns={columns}
          dataSource={orders}
          rowKey="_id"
          pagination={{
            pageSize: 5,
            showSizeChanger: false,
            showTotal: (total, range) =>
              `${range[0]}–${range[1]} of ${total} orders`,
          }}
          className="overflow-auto"
          rowClassName="hover:bg-gray-50 transition-colors"
        />
      </Card>
    </div>
  );
};

export default UserOrders;