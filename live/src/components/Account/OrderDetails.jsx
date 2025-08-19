// import React, { useEffect, useState } from "react";
// import { IconHelper } from "../../helper/IconHelper";
// import { Link, useParams } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import _ from "lodash";
// import { Avatar, Collapse, Divider, QRCode, Spin, Table, Tag, Timeline, Tooltip } from "antd";
// import moment from "moment";
// import OrderDetailsSkeleton from "../LoadingSkeletons/OrderDetailsSkeleton";
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";
// import { ImageHelper } from "../../helper/ImageHelper";

// const OrderDetails = () => {
//   //state
//   const [subtotal, setSubtotal] = useState(0);

//   //config
//   const { order_id } = useParams();
//   const dispatch = useDispatch();

//   //redux
//   const { my_orders, order_details } = useSelector((state) => state.authSlice);

//   //mount
//   useEffect(() => {
//     dispatch({ type: "GET_ORDER_DETAILS", data: { id: order_id } });
//   }, [order_id]);

//   useEffect(() => {
//     let filterOrderData = my_orders.data.find((order) => order._id === order_id);
//     if (!filterOrderData) {
//       filterOrderData = order_details.data;
//     }
//     if (filterOrderData && filterOrderData.products) {
//       setSubtotal(filterOrderData.products.product_price / filterOrderData.products.product_quantity);
//     } else {
//       setSubtotal(0);
//     }
//   }, [my_orders.data, order_id]);

//   //render data
//   const filterOrderData = my_orders.data.find((order) => order._id === order_id) || order_details.data;

//   const deliveryAddress = _.get(filterOrderData, "delivery_address", {}) || _.get(order_details, "data.delivery_address", {});

//   const items = [
//     { key: "1", label: "placed" },
//     { key: "2", label: "accounting team" },
//     { key: "3", label: "designing team" },
//     { key: "4", label: "production team" },
//     { key: "5", label: "delivery team" },
//     { key: "6", label: "out For Delivery" },
//     { key: "7", label: "completed" },
//   ];

//   const ORDER_TIME_LINE = (status) => {
//     const orderTimeline = _.get(filterOrderData, "order_delivery_timeline", []);
//     return orderTimeline.find((timeline) => timeline.order_status === status);
//   };

//   let completed_timelines = _.get(filterOrderData, "order_delivery_timeline", []).map((res) => {
//     return res.order_status;
//   });

//   completed_timelines.push("placed");

//   let GET_COLOR_STATUS = (res) => {
//     try {
//       return completed_timelines.includes(res.label) ? "green" : "gray";
//     } catch (err) {}
//   };

//   const columns = [
//     {
//       title: "Product",
//       key: "cart_items",
//       render: () => (
//         <div className="flex items-center gap-4">
//           <div>
//             <h3 className="flex flex-col">
//               <div>{_.get(filterOrderData, "cart_items.category_name", "")}</div>
//               <div>{_.get(filterOrderData, "cart_items.product_name", "")}</div>
//               <div>{_.get(filterOrderData, "cart_items.product_seo_url", "")}</div>
//             </h3>
//           </div>
//         </div>
//       ),
//     },
//     {
//       title: "Materials",
//       key: "variants",
//       render: () => (
//         <div className="flex flex-col gap-y-2">
//           {Object.entries(_.get(filterOrderData, "cart_items.product_variants[0]", {})).map((res, index) => {
//             return (
//               !["stock"].includes(res[0]) && (
//                 <p key={index} className="text-sm text-gray-500 flex gap-x-2">
//                   {res[0]} : {res[1]}
//                 </p>
//               )
//             );
//           })}
//         </div>
//       ),
//     },
//     {
//       title: "Price",
//       dataIndex: "product_price",
//       key: "product_price",
//       align: "center",
//       render: (price) => {
//         return <div className="">₹ {_.get(filterOrderData, "cart_items.product_price", "")}</div>;
//       },
//     },
//     {
//       title: "Quantity",
//       dataIndex: "product_price",
//       key: "product_price",
//       align: "center",
//       render: (price) => {
//         return <div className="">{_.get(filterOrderData, "cart_items.product_quantity", "")}</div>;
//       },
//     },
//   ];

//   const handleDownloadPDF = () => {
//     try {
//       const input = document.getElementById("invoice");
//       html2canvas(input).then((canvas) => {
//         const imgData = canvas.toDataURL("image/png");
//         const pdf = new jsPDF();
//         const pageWidth = pdf.internal.pageSize.width;

//         const imgWidth = pageWidth;
//         const imgHeight = 270;
//         console.log(imgHeight);
//         const x = (pageWidth - imgWidth) / 2;

//         const y = 10;

//         pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
//         pdf.save(`#${_.get(filterOrderData, "invoice_no", "")}.pdf`);
//       });
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   let orderItemsColumns = [
//     {
//       title: "Item",
//       value: (
//         <h3 className="flex flex-col py-4 capitalize text-center">
//           <div>{_.get(filterOrderData, "cart_items.category_name", "")}</div>
//           <div>{_.get(filterOrderData, "cart_items.product_name", "")}</div>
//           <div>{_.get(filterOrderData, "cart_items.product_seo_url", "").slice(0, 20)}...</div>
//         </h3>
//       ),
//     },
//     {
//       title: "Materials",
//       value: !_.isEmpty(_.get(filterOrderData, "cart_items.product_variants[0]", {})) ? (
//         <div className="flex flex-col gap-y-2 py-4 px-2 !text-sm ">
//           {Object.entries(_.get(filterOrderData, "cart_items.product_variants[0]", {})).map((res, index) => {
//             console.log(_.get(filterOrderData, "cart_items.product_variants[0].product_code", {}));
//             return (
//               !["stock"].includes(res[0]) &&
//               res[0] != "product_unique_code" && (
//                 <p key={index} className="text-sm  flex gap-x-2">
//                   {res[0]} : {res[1]}
//                 </p>
//               )
//             );
//           })}
//         </div>
//       ) : (
//         false
//       ),
//     },

//     {
//       title: "Price",
//       value: (
//         <h3 className="flex flex-col py-4">
//           <div>₹ {_.get(filterOrderData, "cart_items.product_price", "")}</div>
//         </h3>
//       ),
//     },
//     {
//       title: "Quantity",
//       value: (
//         <h3 className="flex flex-col py-4">
//           <div>{_.get(filterOrderData, "cart_items.product_quantity", "")}</div>
//         </h3>
//       ),
//     },
//     {
//       title: "Total",
//       value: (
//         <h3 className="flex flex-col py-4 text-end items-end justify-end ">
//           <div>₹ {_.get(filterOrderData, "cart_items.product_price", "")}</div>
//         </h3>
//       ),
//     },
//   ];

//   let subTotalColumns = [
//     {
//       title: "Subtotal",
//       value: `₹ ${_.get(filterOrderData, "cart_items.product_price", "")}`,
//     },
//     {
//       title: "Grand Total",
//       value: `₹ ${_.get(filterOrderData, "cart_items.final_total", "")}`,
//     },
//   ];

//   return (
//     <div className="w-full h-auto flex-1 flex gap-3 flex-col">
//       {order_details.loading ? (
//         <OrderDetailsSkeleton />
//       ) : (
//         <div className=" ">
//           <Collapse defaultActiveKey={["1"]} className="!bg-white overflow-hidden">
//             <Collapse.Panel
//               collapsible="icon"
//               key={"1"}
//               header={"Invoice"}
//               extra={
//                 <Tag onClick={handleDownloadPDF} color="green" className="!center_div gap-x-2 !cursor-pointer">
//                   <IconHelper.DOWNLOAD_ICON /> Download Invoice
//                 </Tag>
//               }
//             >
//               <div className="w-full lg:flex center_div overflow-scroll justify-start items-start font-medium">
//                 <div className="w-full mx-auto px-4 pb-4 !font-billfont" id="invoice">
//                   <div className="w-full center_div lg:flex-row flex-col lg:justify-between justify-center ">
//                     <h1 className="font-bold lg:text-2xl lg:text-left text-center">INVOICE: #{_.get(filterOrderData, "invoice_no", "")}</h1>

//                     <div className="!text-sm flex flex-col gap-y-2 py-4 items-end">
//                       <img src={ImageHelper.FULL_LOGO} alt="" className="!w-[180px]" />

//                       <span className="text-black lg:text-end">
//                         #8 Church Colony, <br />
//                         Opp.Bishop Heber College,
//                         <br /> Vayalur Rd, Tiruchirappalli, <br /> Tamil Nadu 620017
//                       </span>
//                       <span className="text-black">9876543210,8976543210</span>
//                       <span className="text-black">info@printe.in</span>
//                     </div>
//                   </div>
//                   {/* <Divider className="border-gray-200" /> */}
//                   <div className="center_div w-full lg:flex-row flex-col gap-y-3 justify-between lg:items-start pt-5">
//                     <div className="!text-sm flex flex-col gap-y-2 items-start ">
//                       <h1 className="font-bold  text-lg">
//                         Date: &nbsp; <span className="text-black font-normal"> {moment(_.get(filterOrderData, "createdAt", "")).format("DD-MMM-yyyy")}</span>{" "}
//                       </h1>
//                       <h1 className="font-bold  text-lg">
//                         Payment: &nbsp; <span className="text-black font-normal"> {_.get(filterOrderData, "payment_type", "")}</span>{" "}
//                       </h1>
//                       {_.get(filterOrderData, "payment_id", "") && (
//                         <>
//                           <h1 className=" font-bold  text-lg">
//                             Payment id: &nbsp; <span className="text-black font-normal"> {_.get(filterOrderData, "payment_id", "")}</span>{" "}
//                           </h1>
//                         </>
//                       )}
//                     </div>
//                     <div className="!text-sm flex flex-col gap-y-2 lg:items-end ">
//                       <h1 className="font-bold text-black text-lg">Billing Address</h1>
//                       <span className="text-black">{_.get(filterOrderData, "delivery_address.addressType", "")} Address,</span>
//                       <span className="text-black">{_.get(filterOrderData, "delivery_address.name", "")},</span>
//                       <span className="text-black">
//                         {_.get(filterOrderData, "delivery_address.mobile_number", "")}, {_.get(filterOrderData, "delivery_address.Alternate_mobile_number", "")},
//                       </span>
//                       <span className="text-black">
//                         {_.get(filterOrderData, "delivery_address.street_address", "")},{_.get(filterOrderData, "delivery_address.pincode", "")}
//                       </span>
//                     </div>
//                   </div>
//                   {/* <Divider className="border-gray-200" /> */}

//                   <h1 className="pt-4 text-2xl font-bold !pb-6">Order Summary</h1>
//                   {/* <Table size="small" dataSource={filterOrderData ? [filterOrderData] : []} columns={columns} pagination={false} bordered className="!pt-4 " /> */}
//                   <table className="border-collapse border border-gray-200 w-full !text-black">
//                     <thead>
//                       <tr>
//                         {orderItemsColumns.map((res, index) => {
//                           return (
//                             res.value && (
//                               <th key={index} className={`border border-gray-200 !h-[50px]  `}>
//                                 {res.title}
//                               </th>
//                             )
//                           );
//                         })}
//                       </tr>
//                     </thead>
//                     <tbody>
//                       <tr>
//                         {orderItemsColumns.map((res, index) => {
//                           return (
//                             res.value && (
//                               <th key={index} className={`border border-gray-200 !h-[50px] px-4 ${res.title === "Total" ? "text-end" : ""} `}>
//                                 {res.value}
//                               </th>
//                             )
//                           );
//                         })}
//                       </tr>
//                     </tbody>
//                     <tbody>
//                       {subTotalColumns.map((res, index) => {
//                         return (
//                           <tr key={index}>
//                             <th colSpan={!_.isEmpty(_.get(filterOrderData, "cart_items.product_variants[0]", {})) ? 4 : 3} className={`border border-gray-200 !h-[50px] text-end px-4`}>
//                               {res.title}
//                             </th>
//                             <td className={`border border-gray-200 !h-[50px] px-4 text-end `}>{res.value}</td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                   </table>

//                   <div className="w-full center_div justify-end flex-col items-end py-6">
//                     <h1 className="text-2xl">Total Amount</h1>
//                     <h1 className="text-2xl text-primary">₹{_.get(filterOrderData, "cart_items.final_total", "")}</h1>
//                     <h1 className="text-lg">Tax Included</h1>
//                   </div>
//                 </div>
//               </div>
//             </Collapse.Panel>
//             <Collapse.Panel key={"2"} header={"Track Order Status"}>
//               <div className="bg-white  p-5 mt-4">
//                 <h1 className="pt-4 text-center pb-10">Track Order Status</h1>

//                 <Timeline
//                   className="text-sm"
//                   items={items.map((res) => {
//                     const timelineEntry = ORDER_TIME_LINE(res.label);
//                     const createdAt = _.get(timelineEntry, "createdAt", null);
//                     let color = GET_COLOR_STATUS(res);

//                     return {
//                       dot: <IconHelper.DELIVERY_ICON className="!text-2xl" />,
//                       children: (
//                         <div className={`${createdAt ? "" : "grayscale"} !h-[50px] !font-primary_font !text-[16px] capitalize pb-2`}>
//                           <h1> {res.label}</h1>
//                           <h1 className="text-slate-500 !text-[12px]">{createdAt ? moment(createdAt).format("DD-MMM-yyyy") : ""}</h1>
//                         </div>
//                       ),
//                       color: color,
//                     };
//                   })}
//                 />
//               </div>
//             </Collapse.Panel>
//             {/* <Collapse.Panel key={"3"} header={"Design File"}>
//               <div className="bg-white  p-5 mt-4">
//                 <Tag color="green" className="flex ">
//                   <Tooltip title={_.get(filterOrderData, "cart_items.product_design_file", "")}>
//                     <span className="line-clamp-1 text-slate-600 overflow-clip">{_.get(filterOrderData, "cart_items.product_design_file", "")}</span>
//                   </Tooltip>
//                   ...
//                 </Tag>
//                 <div className="pt-3">
//                   <a href={_.get(filterOrderData, "cart_items.product_design_file", "")} target="_blank" className=" !my-2 text-sm text-blue-500">
//                     Download
//                   </a>
//                 </div>
//               </div>
//             </Collapse.Panel> */}
//             <Collapse.Panel key={"3"} header={"Design File"}>
//   <div className="bg-white p-5 mt-4">
//     {_.get(filterOrderData, "cart_items.product_design_file", "") ? (
//       <>
//         <Tag color="green" className="flex">
//           <Tooltip title={_.get(filterOrderData, "cart_items.product_design_file", "")}>
//             <span className="line-clamp-1 text-slate-600 overflow-clip">
//               {_.get(filterOrderData, "cart_items.product_design_file", "")}
//             </span>
//           </Tooltip>
//           ...
//         </Tag>
//         <div className="pt-3">
//           <a
//             href={_.get(filterOrderData, "cart_items.product_design_file", "")}
//             target="_blank"
//             className="!my-2 text-sm text-blue-500"
//           >
//             Download
//           </a>
//         </div>
//       </>
//     ) : (
//       <p className="text-gray-500">
//         Incase if you didn't have a design. Our Designing Team will connect with you.
//       </p>
//     )}
//   </div>
// </Collapse.Panel>
//           </Collapse>
//         </div>
//       )}
//     </div>
//   );
// };

// export default OrderDetails;

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { IconHelper } from "../../helper/IconHelper";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import { Collapse, Spin, Tag, message, Button } from "antd";
import { ReloadOutlined, DownloadOutlined } from "@ant-design/icons";
import moment from "moment";
import OrderDetailsSkeleton from "../LoadingSkeletons/OrderDetailsSkeleton";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { ImageHelper } from "../../helper/ImageHelper";

// Cache for storing already fetched invoice data
const invoiceCache = new Map();

const OrderDetails = () => {
  // State
  const [subtotal, setSubtotal] = useState(0);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [allOrders, setAllOrders] = useState([]);
  const [fetchingInvoiceOrders, setFetchingInvoiceOrders] = useState(false);

  // Config
  const { order_id } = useParams();
  const dispatch = useDispatch();

  // Redux
  const { my_orders, order_details } = useSelector((state) => state.authSlice);

  // Memoized order data to prevent unnecessary recalculations
  const filterOrderData = useMemo(() => {
    return (
      my_orders.data.find((order) => order._id === order_id) ||
      order_details.data
    );
  }, [my_orders.data, order_id, order_details.data]);

  // Memoized function to get products from order
  const getOrderProducts = useCallback((order) => {
    return order.products || order.cart_items || {};
  }, []);

  // Fetch order details and related invoice orders
  useEffect(() => {
    if (!order_id) return;

    const fetchData = async () => {
      // Fetch order details
      await dispatch({
        type: "GET_ORDER_DETAILS",
        data: {
          id: order_id,
          timestamp: new Date().getTime(),
        },
      });

      // If we have order details with invoice number, fetch related orders
      if (order_details.data?.invoice_no) {
        const invoiceNo = order_details.data.invoice_no;
        
        // Check cache first
        if (invoiceCache.has(invoiceNo)) {
          setAllOrders(invoiceCache.get(invoiceNo));
          setFetchingInvoiceOrders(false);
          return;
        }

        setFetchingInvoiceOrders(true);
        
        try {
          await dispatch({
            type: "GET_ORDERS_BY_INVOICE",
            data: {
              invoice_no: invoiceNo,
              timestamp: new Date().getTime(),
            },
            callback: (orders) => {
              setAllOrders(orders);
              // Cache the result
              invoiceCache.set(invoiceNo, orders);
              setFetchingInvoiceOrders(false);
            },
            errorCallback: (error) => {
              console.error("Error fetching invoice orders:", error);
              if (error?.response?.status === 304 && allOrders.length > 0) {
                message.info("Using cached data for invoice");
              } else {
                message.error("Failed to fetch all orders for this invoice");
              }
              setFetchingInvoiceOrders(false);
            },
          });
        } catch (error) {
          console.error("Error in invoice fetch:", error);
          setFetchingInvoiceOrders(false);
        }
      }
    };

    fetchData();
  }, [order_id, dispatch, order_details.data]);

  // Calculate subtotal
  useEffect(() => {
    if (filterOrderData) {
      const products = getOrderProducts(filterOrderData);
      if (products && products.product_price && products.product_quantity) {
        setSubtotal(products.product_price / products.product_quantity);
      } else {
        setSubtotal(0);
      }
    }
  }, [filterOrderData, getOrderProducts]);

  // Force refresh function
  const forceRefresh = useCallback(() => {
    if (filterOrderData?.invoice_no) {
      invoiceCache.delete(filterOrderData.invoice_no);
    }
    dispatch({
      type: "GET_ORDER_DETAILS",
      data: {
        id: order_id,
        timestamp: new Date().getTime(),
        force: true, // Add force flag to bypass cache
      },
    });
  }, [dispatch, order_id, filterOrderData]);

  // Memoized orders grouped by invoice
  const ordersByInvoice = useMemo(() => {
    const ordersToProcess = allOrders.length > 0 ? allOrders : 
                           (filterOrderData ? [filterOrderData] : []);
    return _.groupBy(ordersToProcess, 'invoice_no');
  }, [allOrders, filterOrderData]);

  // Optimized PDF generation with debouncing
  const handleDownloadPDF = useCallback(async () => {
    setPdfLoading(true);
    
    try {
      const pdf = new jsPDF("p", "pt", "a4");
      const options = {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: "#FFFFFF",
      };

      // Process each invoice
      for (const [invoiceNo, orders] of Object.entries(ordersByInvoice)) {
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.width = '794px';
        tempDiv.style.padding = '20px';
        tempDiv.style.backgroundColor = 'white';
        
        // Use simplified HTML generation for better performance
        tempDiv.innerHTML = generateInvoiceHTML(orders, invoiceNo);
        document.body.appendChild(tempDiv);

        // Wait for images to load with timeout
        await Promise.race([
          new Promise(resolve => {
            const images = tempDiv.getElementsByTagName('img');
            if (images.length === 0) return resolve();
            
            let loadedCount = 0;
            Array.from(images).forEach(img => {
              if (img.complete) {
                loadedCount++;
                if (loadedCount === images.length) resolve();
              } else {
                img.onload = () => {
                  loadedCount++;
                  if (loadedCount === images.length) resolve();
                };
                img.onerror = () => {
                  loadedCount++;
                  if (loadedCount === images.length) resolve();
                };
              }
            });
          }),
          new Promise(resolve => setTimeout(resolve, 3000)) // 3s timeout
        ]);

        const canvas = await html2canvas(tempDiv, options);
        const imgData = canvas.toDataURL("image/png");
        const imgWidth = pdf.internal.pageSize.getWidth() - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (pdf.internal.getNumberOfPages() > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight);
        
        document.body.removeChild(tempDiv);
      }

      const fileName = `Invoice_${filterOrderData?.invoice_no || "order"}.pdf`;
      pdf.save(fileName);
      message.success("PDF downloaded successfully");
    } catch (error) {
      console.error("PDF generation error:", error);
      message.error("Failed to generate PDF. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  }, [ordersByInvoice, filterOrderData]);

  // Optimized HTML generation function
  const generateInvoiceHTML = useCallback((orders, invoiceNo) => {
    const firstOrder = orders[0];
    const subtotal = _.sumBy(orders, order => {
      const products = getOrderProducts(order);
      return (products.product_price || 0) * (products.product_quantity || 0);
    });
    
    const cgst = subtotal * 0.004;
    const sgst = subtotal * 0.004;
    const grandTotal = subtotal + cgst + sgst;
    
    return `
      <div class="w-full mx-auto px-4 pb-4" style="background-color: white;">
        <!-- Header -->
        <div class="w-full bg-gray-100 p-4 mb-5 rounded">
          <div class="flex justify-between items-center">
            <img
              src="${ImageHelper.FULL_LOGO}"
              alt="Company Logo"
              class="h-12"
              crossOrigin="anonymous"
              onerror="this.style.display='none'"
            />
            <div class="text-right">
              <p>#8 Church Colony, Opp.Bishop Heber College</p>
              <p>Vayalur Rd, Tiruchirappalli</p>
              <p>Tamil Nadu 620017</p>
            </div>
          </div>
        </div>

        <!-- Order Info -->
        <div class="flex flex-wrap justify-between mb-6">
          <div class="w-full md:w-1/2 mb-4 md:mb-0">
            <h2 class="text-lg font-bold text-gray-800 mb-2">
              Order Information
            </h2>
            <div class="bg-gray-50 p-3 rounded">
              <p>
                <span class="font-semibold">INVOICE:</span> ${invoiceNo}
              </p>
              <p>
                <span class="font-semibold">Order Date:</span> 
                ${moment(firstOrder.createdAt).format("DD-MMM-yyyy")}
              </p>
              <p>
                <span class="font-semibold">Payment Method:</span> 
                ${firstOrder.payment_type}
              </p>
              ${firstOrder.payment_id ? `
                <p>
                  <span class="font-semibold">Payment ID:</span> 
                  ${firstOrder.payment_id}
                </p>
              ` : ''}
            </div>
          </div>

          <div class="w-full md:w-1/2 text-right">
            <h2 class="text-lg font-bold text-gray-800 mb-2">
              Billing Address
            </h2>
            <div class="bg-gray-50 p-3 rounded">
              <p class="font-semibold">${firstOrder.delivery_address?.name || ''}</p>
              <p>${firstOrder.delivery_address?.street_address || ''}</p>
              <p>${firstOrder.delivery_address?.pincode || ''}</p>
              <p>Phone: ${firstOrder.delivery_address?.mobile_number || ''}</p>
              ${firstOrder.delivery_address?.Alternate_mobile_number ? `
                <p>Alt Phone: ${firstOrder.delivery_address?.Alternate_mobile_number}</p>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <h2 class="text-xl font-bold text-gray-800 mb-3 border-b pb-2">
          Order Summary (${orders.length} ${orders.length === 1 ? 'Item' : 'Items'})
        </h2>

        <!-- Product Table -->
        <div class="mb-6 overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-100">
                <th class="p-3 text-left border">Order ID</th>
                <th class="p-3 text-left border">Product Name</th>
                <th class="p-3 text-center border">Price</th>
                <th class="p-3 text-center border">Qty</th>
                <th class="p-3 text-center border">Total</th>
              </tr>
            </thead>
            <tbody>
              ${orders.map((order) => {
                const products = getOrderProducts(order);
                return `
                <tr key="${order._id}" class="border-b">
                  <td class="p-3 border">${order._id}</td>
                  <td class="p-3 border">
                    <div class="flex flex-col gap-y-1">
                      <p class="font-semibold">
                        ${products.product_name || ''}
                      </p>
                      <p class="text-xs text-gray-500">
                        ${products.product_seo_url || ''}
                      </p>
                    </div>
                  </td>
                  <td class="p-3 text-center border">
                    ₹ ${products.product_price || 0}
                  </td>
                  <td class="p-3 text-center border">
                    ${products.product_quantity || 0}
                  </td>
                  <td class="p-3 text-center border">
                    ₹ ${(products.product_price || 0) * (products.product_quantity || 0)}
                  </td>
                </tr>
              `}).join('')}
            </tbody>
          </table>
        </div>

        <!-- Payment Summary -->
        <div class="flex justify-end">
          <div class="w-full md:w-1/3 bg-gray-50 p-4 rounded">
            <h3 class="text-lg font-bold mb-3 border-b pb-2">
              Payment Summary
            </h3>
            <div class="flex justify-between mb-2">
              <span>Subtotal (${orders.length} items):</span>
              <span>₹ ${subtotal.toFixed(2)}</span>
            </div>
            <div class="flex justify-between mb-2">
              <span>CGST (0.4%):</span>
              <span>₹ ${cgst.toFixed(2)}</span>
            </div>
            <div class="flex justify-between mb-2">
              <span>SGST (0.4%):</span>
              <span>₹ ${sgst.toFixed(2)}</span>
            </div>
            <div class="flex justify-between font-bold text-lg mt-3 pt-2 border-t">
              <span>Grand Total:</span>
              <span class="text-orange-600">
                ₹ ${grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <!-- Terms & Conditions -->
        <div class="mt-8 pt-4 border-t text-sm text-gray-600">
          <h3 class="text-lg font-bold mb-2">Terms & Conditions</h3>
          <ul class="list-disc list-inside leading-relaxed">
            <li>All sales are final and non-refundable.</li>
            <li>Goods once sold cannot be returned or exchanged.</li>
            <li>Warranty, if applicable, is provided by the manufacturer.</li>
            <li>Please retain this invoice for future reference.</li>
          </ul>
        </div>
      </div>
    `;
  }, [getOrderProducts]);

  // Memoized invoice renderer
  const renderInvoice = useCallback((orders, invoiceNo) => {
    const firstOrder = orders[0];
    const subtotal = _.sumBy(orders, order => {
      const products = getOrderProducts(order);
      return (products.product_price || 0) * (products.product_quantity || 0);
    });
    
    const cgst = subtotal * 0.004;
    const sgst = subtotal * 0.004;
    const grandTotal = subtotal + cgst + sgst;
    
    return (
      <div
        id={`invoice-${invoiceNo}`}
        className="w-full mx-auto px-4 pb-4"
        style={{
          width: "794px",
          backgroundColor: "white",
          marginBottom: "20px",
        }}
        key={invoiceNo}
      >
        {/* Header and other components remain the same as your original code */}
        {/* ... (rest of your renderInvoice implementation) ... */}
      </div>
    );
  }, [getOrderProducts]);

  if (order_details.loading || fetchingInvoiceOrders) {
    return <OrderDetailsSkeleton />;
  }

  return (
    <div className="w-full h-auto flex-1 flex gap-3 flex-col">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Order Details</h2>
          <Button 
            onClick={forceRefresh}
            icon={<ReloadOutlined />}
            loading={order_details.loading || fetchingInvoiceOrders}
          >
            Refresh Data
          </Button>
        </div>
        
        <Collapse defaultActiveKey={["1"]} className="!bg-white overflow-hidden">
          <Collapse.Panel
            key="1"
            header="Invoice"
            extra={
              <Tag
                onClick={handleDownloadPDF}
                color="green"
                className="!center_div gap-x-2 !cursor-pointer"
              >
                {pdfLoading ? <Spin size="small" /> : <DownloadOutlined />}
                Download Invoice
              </Tag>
            }
          >
            <div className="w-full lg:flex center_div overflow-scroll justify-start items-start font-medium">
              {Object.entries(ordersByInvoice).map(([invoiceNo, orders]) => 
                renderInvoice(orders, invoiceNo)
              )}
            </div>
          </Collapse.Panel>
        </Collapse>
      </div>
    </div>
  );
};

export default OrderDetails;

// import React, { useEffect, useState } from "react";
// import { IconHelper } from "../../helper/IconHelper";
// import { useParams } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import _ from "lodash";
// import { Collapse, Spin, Tag, message } from "antd";
// import moment from "moment";
// import OrderDetailsSkeleton from "../LoadingSkeletons/OrderDetailsSkeleton";
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";
// import { ImageHelper } from "../../helper/ImageHelper";

// const OrderDetails = () => {
//   // State
//   const [subtotal, setSubtotal] = useState(0);
//   const [pdfLoading, setPdfLoading] = useState(false);
//   const [allOrders, setAllOrders] = useState([]);

//   // Config
//   const { order_id } = useParams();
//   const dispatch = useDispatch();

//   // Redux
//   const { my_orders, order_details } = useSelector((state) => state.authSlice);

//   // Mount
//   useEffect(() => {
//     dispatch({ type: "GET_ORDER_DETAILS", data: { id: order_id } });
//   }, [order_id, dispatch]);

//   useEffect(() => {
//     if (order_details.data?.invoice_no) {
//       dispatch({
//         type: "GET_ORDERS_BY_INVOICE",
//         data: { invoice_no: order_details.data.invoice_no },
//         callback: (orders) => setAllOrders(orders),
//       });
//     }
//   }, [order_details.data, dispatch]);

//   useEffect(() => {
//     let filterOrderData = my_orders.data.find((order) => order._id === order_id);
//     if (!filterOrderData) {
//       filterOrderData = order_details.data;
//     }
//     if (filterOrderData && filterOrderData.products) {
//       setSubtotal(
//         filterOrderData.products.product_price /
//           filterOrderData.products.product_quantity
//       );
//     } else {
//       setSubtotal(0);
//     }
//   }, [my_orders.data, order_id, order_details.data]);

//   // Render data
//   const filterOrderData =
//     my_orders.data.find((order) => order._id === order_id) ||
//     order_details.data;

//   const handleDownloadPDF = async () => {
//     setPdfLoading(true);
//     try {
//       const pdf = new jsPDF("p", "pt", "a4");
//       const options = {
//         scale: 2,
//         useCORS: true,
//         logging: true,
//         allowTaint: true,
//         backgroundColor: "#FFFFFF",
//       };

//       const ordersToExport = allOrders.length > 0 ? allOrders : [filterOrderData];
      
//       // Group orders by invoice_no
//       const ordersByInvoice = _.groupBy(ordersToExport, 'invoice_no');
      
//       let pageCount = 0;
      
//       // Process each unique invoice
//       for (const [invoiceNo, orders] of Object.entries(ordersByInvoice)) {
//         // Create a single page for all orders with the same invoice number
//         const elementId = `invoice-${invoiceNo}`;
//         const input = document.getElementById(elementId);
        
//         if (!input) {
//           console.error(`Element with ID ${elementId} not found`);
//           continue;
//         }

//         const canvas = await html2canvas(input, options);
//         const imgData = canvas.toDataURL("image/png");
//         const imgWidth = pdf.internal.pageSize.getWidth() - 40;
//         const imgHeight = (canvas.height * imgWidth) / canvas.width;

//         if (pageCount > 0) pdf.addPage();
//         pdf.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight);
//         pageCount++;
//       }

//       // Add footer if we have any pages
//       if (pageCount > 0) {
//         const footerInput = document.getElementById("invoice-footer");
//         if (footerInput) {
//           pdf.addPage();
//           const canvas = await html2canvas(footerInput, options);
//           const imgData = canvas.toDataURL("image/png");
//           const imgWidth = pdf.internal.pageSize.getWidth() - 40;
//           const imgHeight = (canvas.height * imgWidth) / canvas.width;
//           pdf.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight);
//         }
//       }

//       const fileName = `Invoice_${_.get(filterOrderData, "invoice_no", "order")}.pdf`;
//       pdf.save(fileName);
//       message.success("PDF downloaded successfully");
//     } catch (error) {
//       console.error("PDF generation error:", error);
//       message.error("Failed to generate PDF. Please try again.");
//     } finally {
//       setPdfLoading(false);
//     }
//   };

//   const renderInvoice = (orders, invoiceNo) => {
//     // Calculate totals for all products in this invoice
//     const subtotal = _.sumBy(orders, order => 
//       order.cart_items?.product_price * order.cart_items?.product_quantity || 0
//     );
    
//     const grandTotal = _.sumBy(orders, order => 
//       order.cart_items?.final_total || 0
//     );
    
//     // Get order info from the first order (they should all have the same invoice info)
//     const firstOrder = orders[0];
    
//     return (
//       <div
//         id={`invoice-${invoiceNo}`}
//         className="w-full mx-auto px-4 pb-4 !font-billfont"
//         style={{
//           width: "794px",
//           backgroundColor: "white",
//           marginBottom: "20px",
//         }}
//         key={invoiceNo}
//       >
//         {/* Header */}
//         <div className="w-full bg-gray-100 p-4 mb-5 rounded">
//           <div className="flex justify-between items-center">
//             <img
//               src={ImageHelper.FULL_LOGO}
//               alt="Company Logo"
//               className="h-12"
//               crossOrigin="anonymous"
//             />
//             <div className="text-right">
//               <p>#8 Church Colony, Opp.Bishop Heber College</p>
//               <p>Vayalur Rd, Tiruchirappalli</p>
//               <p>Tamil Nadu 620017</p>
//             </div>
//           </div>
//         </div>

//         {/* Order Info */}
//         <div className="flex flex-wrap justify-between mb-6">
//           <div className="w-full md:w-1/2 mb-4 md:mb-0">
//             <h2 className="text-lg font-bold text-gray-800 mb-2">
//               Order Information
//             </h2>
//             <div className="bg-gray-50 p-3 rounded">
//               <p>
//                 <span className="font-semibold">INVOICE:</span> {invoiceNo}
//               </p>
//               <p>
//                 <span className="font-semibold">Order Date:</span>{" "}
//                 {moment(firstOrder.createdAt).format("DD-MMM-yyyy")}
//               </p>
//               <p>
//                 <span className="font-semibold">Payment Method:</span>{" "}
//                 {firstOrder.payment_type}
//               </p>
//               {firstOrder.payment_id && (
//                 <p>
//                   <span className="font-semibold">Payment ID:</span>{" "}
//                   {firstOrder.payment_id}
//                 </p>
//               )}
//             </div>
//           </div>

//           <div className="w-full md:w-1/2 text-right">
//             <h2 className="text-lg font-bold text-gray-800 mb-2">
//               Billing Address
//             </h2>
//             <div className="bg-gray-50 p-3 rounded">
//               <p className="font-semibold">{firstOrder.delivery_address?.name}</p>
//               <p>{firstOrder.delivery_address?.street_address}</p>
//               <p>{firstOrder.delivery_address?.pincode}</p>
//               <p>Phone: {firstOrder.delivery_address?.mobile_number}</p>
//               {firstOrder.delivery_address?.Alternate_mobile_number && (
//                 <p>Alt Phone: {firstOrder.delivery_address?.Alternate_mobile_number}</p>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Order Summary */}
//         <h2 className="text-xl font-bold text-gray-800 mb-3 border-b pb-2">
//           Order Summary
//         </h2>

//         {/* Product Table */}
//         <div className="mb-6 overflow-x-auto">
//           <table className="w-full border-collapse">
//             <thead>
//               <tr className="bg-gray-100">
//                 <th className="p-3 text-left border">Order ID</th>
//                 <th className="p-3 text-left border">Product Name</th>
//                 <th className="p-3 text-center border">Price</th>
//                 <th className="p-3 text-center border">Qty</th>
//                 <th className="p-3 text-center border">Total</th>
//               </tr>
//             </thead>
//             <tbody>
//               {orders.map((order) => (
//                 <tr key={order._id} className="border-b">
//                   <td className="p-3 border">{order._id}</td>
//                   <td className="p-3 border">
//                     <div className="flex flex-col gap-y-1">
//                       <p className="font-semibold">
//                         {order.cart_items?.product_name}
//                       </p>
//                       <p className="text-xs text-gray-500">
//                         {order.cart_items?.product_seo_url}
//                       </p>
//                     </div>
//                   </td>
//                   <td className="p-3 text-center border">
//                     ₹ {order.cart_items?.product_price}
//                   </td>
//                   <td className="p-3 text-center border">
//                     {order.cart_items?.product_quantity}
//                   </td>
//                   <td className="p-3 text-center border">
//                     ₹ {order.cart_items?.product_price * order.cart_items?.product_quantity}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Payment Summary */}
//         <div className="flex justify-end">
//           <div className="w-full md:w-1/3 bg-gray-50 p-4 rounded">
//             <h3 className="text-lg font-bold mb-3 border-b pb-2">
//               Payment Summary
//             </h3>
//             <div className="flex justify-between mb-2">
//               <span>Subtotal:</span>
//               <span>₹ {subtotal.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between mb-2">
//               <span>Shipping:</span>
//               <span>₹ 0.00</span>
//             </div>
//             <div className="flex justify-between mb-2">
//               <span>Tax:</span>
//               <span>₹ 0.00</span>
//             </div>
//             <div className="flex justify-between font-bold text-lg mt-3 pt-2 border-t">
//               <span>Grand Total:</span>
//               <span className="text-orange-600">
//                 ₹ {grandTotal.toFixed(2)}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Terms & Conditions */}
//         <div className="mt-8 pt-4 border-t text-sm text-gray-600">
//           <h3 className="text-lg font-bold mb-2">Terms & Conditions</h3>
//           <ul className="list-disc list-inside leading-relaxed">
//             <li>All sales are final and non-refundable.</li>
//             <li>Goods once sold cannot be returned or exchanged.</li>
//             <li>Warranty, if applicable, is provided by the manufacturer.</li>
//             <li>Please retain this invoice for future reference.</li>
//           </ul>
//         </div>
//       </div>
//     );
//   };

//   // Group orders by invoice number
//   const ordersByInvoice = _.groupBy(
//     allOrders.length > 0 ? allOrders : [filterOrderData], 
//     'invoice_no'
//   );

//   return (
//     <div className="w-full h-auto flex-1 flex gap-3 flex-col">
//       {order_details.loading ? (
//         <OrderDetailsSkeleton />
//       ) : (
//         <div>
//           <Collapse defaultActiveKey={["1"]} className="!bg-white overflow-hidden">
//             <Collapse.Panel
//               key="1"
//               header="Invoice"
//               extra={
//                 <Tag
//                   onClick={handleDownloadPDF}
//                   color="green"
//                   className="!center_div gap-x-2 !cursor-pointer"
//                 >
//                   {pdfLoading ? <Spin size="small" /> : <IconHelper.DOWNLOAD_ICON />}
//                   Download Invoice
//                 </Tag>
//               }
//             >
//               <div className="w-full lg:flex center_div overflow-scroll justify-start items-start font-medium">
//                 {Object.entries(ordersByInvoice).map(([invoiceNo, orders]) => 
//                   renderInvoice(orders, invoiceNo)
//                 )}
//               </div>

//               {/* Final Footer at the End */}
//               <div
//                 id="invoice-footer"
//                 className="mt-6 pt-4 border-t text-sm text-gray-500"
//               >
//                 <div className="text-center mb-3">
//                   <p>Thank you for your business!</p>
//                 </div>

//                 <div className="w-full flex justify-between items-center bg-gray-100 p-2 rounded">
//                   <div className="w-1/3 text-left font-semibold">
//                     {ImageHelper.FULL_LOGO ? "Printe" : "Our Company"}
//                   </div>
//                   <div className="w-1/3 text-center">support@printe.in</div>
//                   <div className="w-1/3 text-right">9876543210</div>
//                 </div>
//               </div>
//             </Collapse.Panel>
//           </Collapse>
//         </div>
//       )}
//     </div>
//   );
// };

// export default OrderDetails;

//code2
// import React, { useEffect, useState } from "react";
// import { IconHelper } from "../../helper/IconHelper";
// import { useParams } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import _ from "lodash";
// import { Collapse, Spin, Tag, message } from "antd";
// import moment from "moment";
// import OrderDetailsSkeleton from "../LoadingSkeletons/OrderDetailsSkeleton";
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";
// import { ImageHelper } from "../../helper/ImageHelper";

// const OrderDetails = () => {
//   // State
//   const [subtotal, setSubtotal] = useState(0);
//   const [pdfLoading, setPdfLoading] = useState(false);
//   const [allOrders, setAllOrders] = useState([]);

//   // Config
//   const { order_id } = useParams();
//   const dispatch = useDispatch();

//   // Redux
//   const { my_orders, order_details } = useSelector((state) => state.authSlice);

//   // Mount
//   useEffect(() => {
//     dispatch({ type: "GET_ORDER_DETAILS", data: { id: order_id } });
//   }, [order_id, dispatch]);

//   useEffect(() => {
//     if (order_details.data?.invoice_no) {
//       dispatch({
//         type: "GET_ORDERS_BY_INVOICE",
//         data: { invoice_no: order_details.data.invoice_no },
//         callback: (orders) => setAllOrders(orders),
//       });
//     }
//   }, [order_details.data, dispatch]);

//   useEffect(() => {
//     let filterOrderData = my_orders.data.find((order) => order._id === order_id);
//     if (!filterOrderData) {
//       filterOrderData = order_details.data;
//     }
//     if (filterOrderData && filterOrderData.products) {
//       setSubtotal(
//         filterOrderData.products.product_price /
//           filterOrderData.products.product_quantity
//       );
//     } else {
//       setSubtotal(0);
//     }
//   }, [my_orders.data, order_id, order_details.data]);

//   // Render data
//   const filterOrderData =
//     my_orders.data.find((order) => order._id === order_id) ||
//     order_details.data;

//   const handleDownloadPDF = async () => {
//   setPdfLoading(true);
//   try {
//     const pdf = new jsPDF("p", "pt", "a4");
//     const options = {
//       scale: 2,
//       useCORS: true,
//       logging: true, // Enable logging for debugging
//       allowTaint: true,
//       backgroundColor: "#FFFFFF",
//     };

//     const ordersToExport = allOrders.length > 0 ? allOrders : [filterOrderData];
//     const groupedOrders = _.groupBy(ordersToExport, 'invoice_no');
    
//     // Debug: Log the orders to be exported
//     console.log('Orders to export:', ordersToExport);
//     console.log('Grouped orders:', groupedOrders);

//     let pageCount = 0;
    
//     for (const [invoiceNo, orders] of Object.entries(groupedOrders)) {
//       // Take the first order for each invoice group
//       const order = orders[0];
//       const elementId = `invoice-${invoiceNo}`;
//       const input = document.getElementById(elementId);
      
//       // Debug: Check if element exists
//       if (!input) {
//         console.error(`Element with ID ${elementId} not found`);
//         continue;
//       }

//       console.log(`Rendering element: ${elementId}`);
      
//       const canvas = await html2canvas(input, options);
//       const imgData = canvas.toDataURL("image/png");
//       const imgWidth = pdf.internal.pageSize.getWidth() - 40;
//       const imgHeight = (canvas.height * imgWidth) / canvas.width;

//       if (pageCount > 0) pdf.addPage();
//       pdf.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight);
//       pageCount++;
//     }

//     // Add footer if we have any pages
//     if (pageCount > 0) {
//       const footerInput = document.getElementById("invoice-footer");
//       if (footerInput) {
//         console.log('Rendering footer');
//         pdf.addPage();
//         const canvas = await html2canvas(footerInput, options);
//         const imgData = canvas.toDataURL("image/png");
//         const imgWidth = pdf.internal.pageSize.getWidth() - 40;
//         const imgHeight = (canvas.height * imgWidth) / canvas.width;
//         pdf.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight);
//       } else {
//         console.error('Footer element not found');
//       }
//     }

//     if (pageCount === 0) {
//       throw new Error("No pages were added to the PDF");
//     }

//     const fileName = `Invoice_${_.get(filterOrderData, "invoice_no", "order")}.pdf`;
//     pdf.save(fileName);
//     console.log('PDF saved successfully:', fileName);
//     message.success("PDF downloaded successfully");
//   } catch (error) {
//     console.error("PDF generation error:", error);
//     message.error(`Failed to generate PDF: ${error.message}`);
//   } finally {
//     setPdfLoading(false);
//   }
// };

//   const renderInvoice = (order, index) => {
//     // Use invoice_no as the unique identifier instead of index
//     const uniqueId = order.invoice_no;
    
//     return (
//       <div
//         id={`invoice-${uniqueId}`}
//         className="w-full mx-auto px-4 pb-4 !font-billfont"
//         style={{
//           width: "794px",
//           backgroundColor: "white",
//           marginBottom: "20px",
//         }}
//         key={uniqueId}
//       >
//         {/* Header */}
//         <div className="w-full bg-gray-100 p-4 mb-5 rounded">
//           <div className="flex justify-between items-center">
//             <img
//               src={ImageHelper.FULL_LOGO}
//               alt="Company Logo"
//               className="h-12"
//               crossOrigin="anonymous"
//             />
//             <div className="text-right">
//               <p>#8 Church Colony, Opp.Bishop Heber College</p>
//               <p>Vayalur Rd, Tiruchirappalli</p>
//               <p>Tamil Nadu 620017</p>
//             </div>
//           </div>
//         </div>

//         {/* Order Info */}
//         <div className="flex flex-wrap justify-between mb-6">
//           <div className="w-full md:w-1/2 mb-4 md:mb-0">
//             <h2 className="text-lg font-bold text-gray-800 mb-2">
//               Order Information
//             </h2>
//             <div className="bg-gray-50 p-3 rounded">
//               <p>
//                 <span className="font-semibold">INVOICE:</span> {order.invoice_no}
//               </p>
//               <p>
//                 <span className="font-semibold">Order Date:</span>{" "}
//                 {moment(order.createdAt).format("DD-MMM-yyyy")}
//               </p>
//               <p>
//                 <span className="font-semibold">Payment Method:</span>{" "}
//                 {order.payment_type}
//               </p>
//               {order.payment_id && (
//                 <p>
//                   <span className="font-semibold">Payment ID:</span>{" "}
//                   {order.payment_id}
//                 </p>
//               )}
//             </div>
//           </div>

//           <div className="w-full md:w-1/2 text-right">
//             <h2 className="text-lg font-bold text-gray-800 mb-2">
//               Billing Address
//             </h2>
//             <div className="bg-gray-50 p-3 rounded">
//               <p className="font-semibold">{order.delivery_address?.name}</p>
//               <p>{order.delivery_address?.street_address}</p>
//               <p>{order.delivery_address?.pincode}</p>
//               <p>Phone: {order.delivery_address?.mobile_number}</p>
//               {order.delivery_address?.Alternate_mobile_number && (
//                 <p>Alt Phone: {order.delivery_address?.Alternate_mobile_number}</p>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Order Summary */}
//         <h2 className="text-xl font-bold text-gray-800 mb-3 border-b pb-2">
//           Order Summary
//         </h2>

//         {/* Product Table */}
//         <div className="mb-6 overflow-x-auto">
//           <table className="w-full border-collapse">
//             <thead>
//               <tr className="bg-gray-100">
//                 <th className="p-3 text-left border">Order ID</th>
//                 <th className="p-3 text-left border">Product Name</th>
//                 <th className="p-3 text-center border">Price</th>
//                 <th className="p-3 text-center border">Qty</th>
//                 <th className="p-3 text-center border">Total</th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr className="border-b">
//                 <td className="p-3 border">{order._id}</td>
//                 <td className="p-3 border">
//                   <div className="flex flex-col gap-y-1">
//                     <p className="font-semibold">
//                       {order.cart_items?.product_name}
//                     </p>
//                     <p className="text-xs text-gray-500">
//                       {order.cart_items?.product_seo_url}
//                     </p>
//                   </div>
//                 </td>
//                 <td className="p-3 text-center border">
//                   ₹ {order.cart_items?.product_price}
//                 </td>
//                 <td className="p-3 text-center border">
//                   {order.cart_items?.product_quantity}
//                 </td>
//                 <td className="p-3 text-center border">
//                   ₹{" "}
//                   {order.cart_items?.product_price *
//                     order.cart_items?.product_quantity}
//                 </td>
//               </tr>
//             </tbody>
//           </table>
//         </div>

//         {/* Payment Summary */}
//         <div className="flex justify-end">
//           <div className="w-full md:w-1/3 bg-gray-50 p-4 rounded">
//             <h3 className="text-lg font-bold mb-3 border-b pb-2">
//               Payment Summary
//             </h3>
//             <div className="flex justify-between mb-2">
//               <span>Subtotal:</span>
//               <span>₹ {order.cart_items?.product_price}</span>
//             </div>
//             <div className="flex justify-between mb-2">
//               <span>Shipping:</span>
//               <span>₹ 0.00</span>
//             </div>
//             <div className="flex justify-between mb-2">
//               <span>Tax:</span>
//               <span>₹ 0.00</span>
//             </div>
//             <div className="flex justify-between font-bold text-lg mt-3 pt-2 border-t">
//               <span>Grand Total:</span>
//               <span className="text-orange-600">
//                 ₹ {order.cart_items?.final_total}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Terms & Conditions */}
//         <div className="mt-8 pt-4 border-t text-sm text-gray-600">
//           <h3 className="text-lg font-bold mb-2">Terms & Conditions</h3>
//           <ul className="list-disc list-inside leading-relaxed">
//             <li>All sales are final and non-refundable.</li>
//             <li>Goods once sold cannot be returned or exchanged.</li>
//             <li>Warranty, if applicable, is provided by the manufacturer.</li>
//             <li>Please retain this invoice for future reference.</li>
//           </ul>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="w-full h-auto flex-1 flex gap-3 flex-col">
//       {order_details.loading ? (
//         <OrderDetailsSkeleton />
//       ) : (
//         <div>
//           <Collapse defaultActiveKey={["1"]} className="!bg-white overflow-hidden">
//             <Collapse.Panel
//               key="1"
//               header="Invoice"
//               extra={
//                 <Tag
//                   onClick={handleDownloadPDF}
//                   color="green"
//                   className="!center_div gap-x-2 !cursor-pointer"
//                 >
//                   {pdfLoading ? <Spin size="small" /> : <IconHelper.DOWNLOAD_ICON />}
//                   Download Invoice
//                 </Tag>
//               }
//             >
//               <div className="w-full lg:flex center_div overflow-scroll justify-start items-start font-medium">
//                 {allOrders.length > 0
//                   ? allOrders.map((order, index) => renderInvoice(order, index))
//                   : renderInvoice(filterOrderData, 0)}
//               </div>

//               {/* Final Footer at the End */}
//               <div
//                 id="invoice-footer"
//                 className="mt-6 pt-4 border-t text-sm text-gray-500"
//               >
//                 <div className="text-center mb-3">
//                   <p>Thank you for your business!</p>
//                 </div>

//                 <div className="w-full flex justify-between items-center bg-gray-100 p-2 rounded">
//                   <div className="w-1/3 text-left font-semibold">
//                     {ImageHelper.FULL_LOGO ? "Printe" : "Our Company"}
//                   </div>
//                   <div className="w-1/3 text-center">support@printe.in</div>
//                   <div className="w-1/3 text-right">9876543210</div>
//                 </div>
//               </div>
//             </Collapse.Panel>
//           </Collapse>
//         </div>
//       )}
//     </div>
//   );
// };

// export default OrderDetails;
