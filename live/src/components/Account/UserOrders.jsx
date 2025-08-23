import { Table, Tag } from "antd";
import React, { useEffect } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";

const UserOrders = () => {
  //config
  const navigate = useNavigate();
  const dispatch = useDispatch();

  //redux
  const { my_orders } = useSelector((state) => state.authSlice);
  // console.log(my_orders);
  //mount
  useEffect(() => {
    dispatch({ type: "GET_MY_ORDERS" });
  }, [dispatch]);

  //rendering data
  const columns = [
    {
      title: "Invoice Number",
      dataIndex: "invoice_no",
      key: "invoice_no",
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
    dataIndex: "total_price",  // Changed from cart_items to total_price
    key: "total_price",
    render: (price) => {
      return <span>₹ {Number(price).toFixed(2)}</span>;  // Format the price
      },
    },
    {
      title: "Date",
      dataIndex: "createdAt",

      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (_, { createdAt }) => {
        return <span>{moment(createdAt).format("YYYY-MM-DD")}</span>;
      },
    },

    // {
    //   title: "Status",
    //   dataIndex: "order_status",
    //   filters: [
    //     { text: "Placed", value: "placed" },
    //     { text: "Accounting team", value: "accounting team" },
    //     { text: "Delivery team", value: "delivery team" },
    //     { text: "desiging team", value: "designing team" },
    //     { text: "Cancelled", value: "cancelled" },
    //     { text: "Completed", value: "completed" },
    //   ],
    //   onFilter: (value, record) => record.order_status === value,
    //   render: (_, { order_status }) => {
    //     let color;
    //     switch (order_status) {
    //       case "placed":
    //         color = "orange";
    //         break;
    //       case "delivered":
    //       case "completed":
    //         color = "green";
    //         break;
    //       case "cancelled":
    //         color = "red";
    //         break;
    //       default:
    //         color = "blue";
    //     }
    //     return (
    //       <Tag color={color} className="capitalize">
    //         {order_status}
    //       </Tag>
    //     );
    //   },
    // },
    {
      title: "View",
      key: "View",
      align: "center",
      render: (_, record) => (
        <Tag className="!text-sm !bg-orange-500 !text-white !cursor-pointer !border-transparent" onClick={() => handleView(record._id)}>
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
    <div className="flex-1">
      <div className="px-5 md:px-10 py-5 border shadow-md rounded-lg flex flex-col gap-5">
        <div>
          <h1 className="title">My Orders</h1>
        </div>
        <Table columns={columns} dataSource={my_orders.data} pagination={{ pageSize: 5 }} className=" overflow-auto" />
      </div>
    </div>
  );
};

export default UserOrders;
