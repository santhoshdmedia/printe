
import { Table, Tag, Card, Statistic, Row, Col } from "antd";
import React, { useEffect } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import {
  ShoppingOutlined,
  CalendarOutlined,
  EyeOutlined
} from "@ant-design/icons";

// Alternative approach using a simple rupee symbol
const RupeeCircleOutlined = () => <span className="anticon">₹</span>;

const UserOrders = () => {
  //config
  const navigate = useNavigate();
  const dispatch = useDispatch();

  //redux
  const { my_orders } = useSelector((state) => state.authSlice);
  
  //mount
  useEffect(() => {
    dispatch({ type: "GET_MY_ORDERS" });
  }, [dispatch]);

  // Calculate statistics
  const totalOrders = my_orders?.data?.length || 0;
  const totalSpent = my_orders?.data?.reduce((sum, order) => sum + Number(order.total_price), 0) || 0;
  const recentOrder = my_orders?.data?.length > 0 
    ? moment(my_orders.data[my_orders.data.length - 1].createdAt).fromNow() 
    : "No orders";

  //rendering data
  const columns = [
    {
      title: "Invoice Number",
      dataIndex: "invoice_no",
      key: "invoice_no",
      render: (text) => <span className="font-mono">{text}</span>,
    },
    {
      title: "Orders",
      dataIndex: "cart_items",
      key: "cart_items",
      render: (record) => {
        return <span>{_.get(record, "product_name", "")}</span>;
      },
    },
    {
      title: "Price",
      dataIndex: "total_price",
      key: "total_price",
      render: (price) => {
        return <span className="font-semibold">₹ {Number(price).toFixed(2)}</span>;
      },
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (_, { createdAt }) => {
        return (
          <div className="flex items-center">
            <CalendarOutlined className="mr-1 text-gray-400" />
            <span>{moment(createdAt).format("YYYY-MM-DD")}</span>
          </div>
        );
      },
    },
    {
      title: "View",
      key: "View",
      align: "center",
      render: (_, record) => (
        <Tag 
          className="!text-sm !bg-orange-500 !text-white !cursor-pointer !border-transparent !flex !items-center !justify-center !px-3 !py-1"
          onClick={() => handleView(record._id)}
          icon={<EyeOutlined />}
        >
          Open
        </Tag>
      ),
    },
  ];

  //function
  const handleView = (key) => {
    navigate(`/account/my-orders/${key}`);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>
      
      {/* Statistics Cards */}
      <Row gutter={16} className="mb-6">
        <Col span={8}>
          <Card className="shadow-md rounded-lg border-0">
            <Statistic
              title="Total Orders"
              value={totalOrders}
              prefix={<ShoppingOutlined className="text-blue-500" />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="shadow-md rounded-lg border-0">
            <Statistic
              title="Total Amount Spent"
              value={totalSpent}
              precision={2}
              prefix={<RupeeCircleOutlined className="text-green-500" />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="shadow-md rounded-lg border-0">
            <Statistic
              title="Last Order"
              value={recentOrder}
              prefix={<CalendarOutlined className="text-orange-500" />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Orders Table */}
      <Card 
        className="border-0 shadow-md rounded-lg"
        bodyStyle={{ padding: 0 }}
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700">Order History</h2>
          <p className="text-gray-500">View and manage all your orders</p>
        </div>
        <Table 
          columns={columns} 
          dataSource={my_orders.data} 
          pagination={{ 
            pageSize: 5, 
            showSizeChanger: false,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} orders`
          }} 
          className="overflow-auto"
          rowClassName="hover:bg-gray-50 transition-colors"
        />
      </Card>
    </div>
  );
};

export default UserOrders;