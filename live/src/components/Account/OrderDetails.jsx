import React, { useEffect, useState, useRef } from "react";
import { IconHelper } from "../../helper/IconHelper";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import { Collapse, Spin, Tag, message, Timeline, Tooltip } from "antd";
import moment from "moment";
import OrderDetailsSkeleton from "../LoadingSkeletons/OrderDetailsSkeleton";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { ImageHelper } from "../../helper/ImageHelper";
import { Helmet } from "react-helmet-async";

// At the top of your file with other imports
import signatureImage from "../../../src/assets/logo/signature.png";

const OrderDetails = () => {
  // State
  const [subtotal, setSubtotal] = useState(0);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [allOrders, setAllOrders] = useState([]);
  const pdfContainerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  // Config
  const { order_id } = useParams();
  const dispatch = useDispatch();

  // Redux
  const { my_orders, order_details } = useSelector((state) => state.authSlice);

  // Mount
  useEffect(() => {
    setIsLoading(true);
    dispatch({ type: "GET_ORDER_DETAILS", data: { id: order_id } });
  }, [order_id, dispatch]);

  useEffect(() => {
    if (order_details.data?.invoice_no) {
      dispatch({
        type: "GET_ORDERS_BY_INVOICE",
        data: { invoice_no: order_details.data.invoice_no },
        callback: (orders) => setAllOrders(orders),
      });
    }
  }, [order_details.data, dispatch]);

  useEffect(() => {
    if (order_details.data || my_orders.data.length > 0) {
      setIsLoading(false);
    }
  }, [order_details.data, my_orders.data]);

  useEffect(() => {
    let filterOrderData = my_orders.data.find(
      (order) => order._id === order_id
    );
    if (!filterOrderData) {
      filterOrderData = order_details.data;
    }
    
    if (filterOrderData && filterOrderData.cart_items && filterOrderData.cart_items.length > 0) {
      // Calculate subtotal from all cart items
      const calculatedSubtotal = filterOrderData.cart_items.reduce((total, item) => {
        return total + (item.product_price || 0) * (item.product_quantity || 1);
      }, 0);
      setSubtotal(calculatedSubtotal);
    } else {
      setSubtotal(0);
    }
  }, [my_orders.data, order_id, order_details.data]);

  // Render data with safe access
  const filterOrderData =
    my_orders.data.find((order) => order._id === order_id) ||
    order_details.data;

  // Safely get cart items
  const getCartItems = (order) => {
    if (!order) return [];
    if (Array.isArray(order.cart_items)) return order.cart_items;
    if (order.cart_items && !Array.isArray(order.cart_items)) return [order.cart_items];
    return [];
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      console.log("PDF generation started");
      const pdf = new jsPDF("p", "pt", "a4");
      const options = {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: false,
        backgroundColor: "#FFFFFF",
        quality: 1.2,
      };

      const ordersToExport =
        allOrders.length > 0 ? allOrders : (filterOrderData ? [filterOrderData] : []);

      if (ordersToExport.length === 0) {
        message.error("No order data available for PDF generation");
        setPdfLoading(false);
        return;
      }

      // Group orders by invoice_no
      const ordersByInvoice = _.groupBy(ordersToExport, "invoice_no");

      let pageCount = 0;

      // Create a temporary container for PDF generation
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      tempContainer.style.width = "794px";
      tempContainer.style.fontFamily = "Arial, sans-serif";
      tempContainer.style.backgroundColor = "#FFFFFF";
      document.body.appendChild(tempContainer);

      console.log("Processing invoices:", Object.keys(ordersByInvoice));

      // Process each unique invoice
      for (const [invoiceNo, orders] of Object.entries(ordersByInvoice)) {
        console.log(`Processing invoice: ${invoiceNo}`);

        // Create invoice content
        const invoiceElement = document.createElement("div");
        const invoiceHTML = generateInvoiceHTML(orders, invoiceNo);
        invoiceElement.innerHTML = invoiceHTML;
        tempContainer.appendChild(invoiceElement);

        const invoiceCanvas = await html2canvas(invoiceElement, options);
        const invoiceImgData = invoiceCanvas.toDataURL("image/jpeg", 0.8);
        const invoiceImgWidth = pdf.internal.pageSize.getWidth() - 40;
        const invoiceImgHeight =
          (invoiceCanvas.height * invoiceImgWidth) / invoiceCanvas.width;

        if (pageCount > 0) pdf.addPage();
        pdf.addImage(
          invoiceImgData,
          "JPEG",
          20,
          20,
          invoiceImgWidth,
          invoiceImgHeight
        );
        pageCount++;

        // Clean up
        tempContainer.removeChild(invoiceElement);
      }

      document.body.removeChild(tempContainer);

      const fileName = `Invoice_${_.get(
        filterOrderData,
        "invoice_no",
        "order"
      )}.pdf`;

      pdf.save(fileName, { compression: true });
      message.success("PDF downloaded successfully");
    } catch (error) {
      console.error("PDF generation error:", error);
      message.error("Failed to generate PDF. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  // Helper function to generate invoice HTML
  const generateInvoiceHTML = (orders, invoiceNo) => {
    if (!orders || orders.length === 0) {
      return "<div>No order data available</div>";
    }

    // Calculate totals safely using getCartItems
    const subtotal = orders.reduce((total, order) => {
      const cartItems = getCartItems(order);
      return total + cartItems.reduce((itemTotal, item) => {
        return itemTotal + (item.product_price || 0) * (item.product_quantity || 0);
      }, 0);
    }, 0);

    const grandTotal = orders.reduce((total, order) => {
      const cartItems = getCartItems(order);
      const orderTotal = cartItems.reduce((itemTotal, item) => {
        return itemTotal + (item.product_price || 0) * (item.product_quantity || 0);
      }, 0);
      return total + orderTotal;
    }, 0);

    const firstOrder = orders[0] || {};

    // Get payment status information
    let paymentStatusHTML = "";
    if (
      firstOrder.payment_status === "completed" ||
      firstOrder.payment_status === "fully_paid"
    ) {
      paymentStatusHTML = `
        <div class="flex justify-between font-bold text-green-600 mt-2">
          <span>Payment Status:</span>
          <span>No Pending</span>
        </div>
      `;
    } else if (firstOrder.payment_status === "advance_paid") {
      const advancePayment = parseFloat(firstOrder.advance_payment || 0);
      const remainingAmount = parseFloat(firstOrder.remaining_amount || 0);

      paymentStatusHTML = `
        <div class="flex justify-between mt-2">
          <span>Advance Paid:</span>
          <span>₹ ${advancePayment.toFixed(2)}</span>
        </div>
        <div class="flex justify-between font-bold text-orange-600 mt-1">
          <span>Balance Amount:</span>
          <span>₹ ${remainingAmount.toFixed(2)}</span>
        </div>
      `;
    }

    // Get cart items for table generation
    const allCartItems = orders.flatMap(order => getCartItems(order));

    return `
      <div class="w-full " style=" font-family: Arial, sans-serif; position:relative; min-height: 1120px; width: 794px; ">
        <div class="w-full rounded " style="margin-bottom: 0.1rem; ">
         <div class="flex justify-between items-start">
    <div className="text-start">
    <img src="${ImageHelper.pdf_logo || ""}" alt="Company Logo" crossOrigin="anonymous" style="width:150px;height:2.8rem;object-fit:cover; margin-bottom:0px;" />
    
    <div className="flex" style="margin-bottom: 1px;display: flex; gap: 20px;">
      <p className="text-sm mr-5"><b>GSTIN :</b> 33AANCP3376Q1ZN</p>
      <p className="text-sm"><b>PAN :</b> AANCP3376Q</p>
    </div>
    
    <div style="margin-bottom: 1px;">
      <p className="text-[0.8rem]">#6 Church Colony, Tiruchirappalli Tamil Nadu 620017</p>
    </div>

    <div style="display: flex; gap:20px;">
        <p style="margin-bottom: 1px; font-size:0.9rem;"><b>Mobile :</b> <a href="tel:+919585610000" className="text-sm">+91 95856 10000</a></p>
        <p style="margin-bottom: 1px; font-size:0.9rem;"><b>Email :</b> <a href="mailto:info@printe.in" className="text-sm">info@printe.in</a></p>
        <p style="margin-bottom: 1px; font-size:0.9rem;"><b>Website :</b> <a href="https://www.printe.in" className="text-sm">www.printe.in</a></p>
    </div>  
    </div>
    </div>
        </div>

        <div class="flex flex-wrap justify-between">
          <div class="w-full">
            <h2 class="text-lg font-bold text-gray-800 mb-1">Order Information</h2>
            <div class="rounded" style="display: flex; gap: 20px;">
              <p><span style="margin-bottom: 1px; font-size:0.9rem;"><b>INVOICE:</b></span> ${invoiceNo}</p>
              <p><span style="margin-bottom: 1px; font-size:0.9rem;"><b>Order Date:</b></span> ${moment(firstOrder.createdAt).format("DD-MMM-yyyy")}</p>
              <p><span style="margin-bottom: 1px; font-size:0.9rem;"><b>Payment Method:</b></span> ${firstOrder.payment_type || ""}</p>
              ${firstOrder.payment_id ? `<p><span class="text-sm"><b>Payment ID:</b></span> ${firstOrder.payment_id}</p>` : ""}
            </div>
          </div>
        </div>

        <div class="flex flex-wrap mb-2" style="gap:8rem;">
        <div className="">
              <h2 className="font-bold text-gray-800" style="font-weight: 700; font-size: 0.925rem; line-height: 1.75rem;">
              Customer Details
            </h2>
              <p className="font-semibold">${firstOrder.delivery_address?.name || ""}</p>
            </div>

         <div class="text-start">
            <h2 class="font-bold text-gray-800" style="font-weight: 700; font-size: 0.925rem;">Billing Address</h2>
            <div class="rounded">
              <p style="font-size:0.9rem;">${firstOrder.delivery_address?.name || ""}</p>
              <p style="font-size:0.9rem;">${firstOrder.delivery_address?.street_address || ""}</p>
              <p style="font-size:0.9rem;">${firstOrder.delivery_address?.pincode || ""}</p>
              <p style="font-size:0.9rem;">Phone: ${firstOrder.delivery_address?.mobile_number || ""}</p>
              ${firstOrder.delivery_address?.Alternate_mobile_number ? `<p style="font-size:0.9rem;">Alt Phone: ${firstOrder.delivery_address?.Alternate_mobile_number}</p>` : ""}
            </div>
          </div>

           <div class="text-start">
            <h2 class="font-bold text-gray-800" style="font-weight: 700; font-size: 0.925rem;">Shipping Address</h2>
            <div class="rounded">
              <p style="font-size:0.9rem;">${firstOrder.delivery_address?.name || ""}</p>
              <p style="font-size:0.9rem;">${firstOrder.delivery_address?.street_address || ""}</p>
              <p style="font-size:0.9rem;">${firstOrder.delivery_address?.pincode || ""}</p>
              <p style="font-size:0.9rem;">Phone: ${firstOrder.delivery_address?.mobile_number || ""}</p>
              ${firstOrder.delivery_address?.Alternate_mobile_number ? `<p style="font-size:0.9rem;">Alt Phone: ${firstOrder.delivery_address?.Alternate_mobile_number}</p>` : ""}
            </div>
          </div>
        </div>

        <h2 class="text-xl font-bold text-gray-800 mb-2 border-b pb-2">Order Summary</h2>

        <div class="mb-1 overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-100">
                <th class="text-left border bg-[#f2c41a]" style="font-size:0.9rem; padding:0rem 0.4rem 0.4rem 0.4rem">Order ID</th>
                <th class="text-left border bg-[#f2c41a]" style="font-size:0.9rem; padding:0rem 0.4rem 0.4rem 0.4rem">Product Name</th>
                <th class="text-center border bg-[#f2c41a]" style="font-size:0.9rem;padding:0rem 0.4rem 0.4rem 0.4rem">Price</th>
                <th class="text-center border bg-[#f2c41a]" style="font-size:0.9rem;padding:0rem 0.4rem 0.4rem 0.4rem">Qty</th>
                <th class="text-center border bg-[#f2c41a]" style="font-size:0.9rem;padding:0rem 0.4rem 0.4rem 0.4rem">Total</th>
              </tr>
            </thead>
            <tbody>
              ${allCartItems
                .map(
                  (item, index) => `
                <tr key="${index}" class="border-b">
                  <td class="border" style="font-size:0.8rem; padding:0rem 0.4rem 0.4rem 0.4rem"> ${invoiceNo}</td>
                  <td class="border" style="font-size:0.8rem;padding:0rem 0.4rem 0.4rem 0.4rem">
                    <div class="flex flex-col gap-y-1">
                      <p class="font-semibold" style="font-size:0.8rem;padding:0rem 0.4rem 0.4rem 0.4rem">${item?.product_name || ""}</p>
                    </div>
                  </td>
                  <td class="text-center border" style="font-size:0.8rem;padding:0rem 0.4rem 0.4rem 0.4rem">₹ ${item?.product_price || 0}</td>
                  <td class="text-center border" style="font-size:0.8rem;padding:0rem 0.4rem 0.4rem 0.4rem">${item?.product_quantity || 0}</td>
                  <td class="text-center border" style="font-size:0.8rem;padding:0rem 0.4rem 0.4rem 0.4rem">₹ ${(item?.product_price || 0) * (item?.product_quantity || 0)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>

        <h2 class="text-xl font-bold text-gray-800 mb-3 border-b pb-2 mt-[0.2rem]">Payment Summary</h2>

        <div class="mb-6 overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-100">
                <th class="text-left border bg-[#f2c41a]" style="padding:0rem 0.4rem 0.4rem 0.4rem; text-align: left;font-size:0.9rem;">Description</th>
                <th class="text-center border bg-[#f2c41a]" style="padding:0rem 0.4rem 0.4rem 0.4rem; text-align: left;font-size:0.9rem;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b">
                <td class="border font-semibold" style="text-align: left;font-size:0.8rem; padding:0rem 0.4rem 0.4rem 0.4rem;">Subtotal</td>
                <td class="text-center border" style="padding:0rem 0.4rem 0.4rem 0.4rem; font-size:0.8rem;">₹ ${subtotal.toFixed(2)}</td>
              </tr>
              <tr class="border-b">
                <td class="border font-semibold" style="text-align: left;font-size:0.8rem; padding:0rem 0.4rem 0.4rem 0.4rem;">Shipping</td>
                <td class="text-center border" style="padding:0rem 0.4rem 0.4rem 0.4rem; font-size:0.8rem;">₹ 0.00</td>
              </tr>
              <tr class="border-b">
                <td class="border font-semibold" style="text-align: left;font-size:0.8rem; padding:0rem 0.4rem 0.4rem 0.4rem;">Tax</td>
                <td class="text-center border" style="padding:0rem 0.4rem 0.4rem 0.4rem; font-size:0.8rem;">₹ 0.00</td>
              </tr>
              <tr class="border-b">
                <td class="border font-bold" style="text-align: left;font-size:0.8rem; padding:0rem 0.4rem 0.4rem 0.4rem;">Grand Total</td>
                <td class="text-center border font-bold text-orange-600" style="padding:0rem 0.4rem 0.4rem 0.4rem; font-size:0.8rem;">
                  ₹ ${grandTotal.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-end">
          <div class="w-full md:w-1/3 bg-gray-50 p-4 rounded">
            ${paymentStatusHTML}
          </div>
        </div>

        <div style="display: flex; justify-content: end;">
        <div class="">
          <img src="${signatureImage}" alt="signature" style="width:100px;height:100px;margin-left:1.5rem;" crossOrigin="anonymous" />
          <p class="text-lg" style="font-weight:700;">Authorized Signature</p>
        </div>
        </div>

        <div style="position: absolute; bottom: 0%; left: 0; right: 0;">
          <div class="mt-4 pt-2 border-t text-sm text-gray-500 p-4" style="width: 800px; font-family: Arial, sans-serif;">
            <div class="text-center mb-3">
              <p>MARKETED BY PAZHANAM DESIGNS AND CONSTRUCTIONS PRIVATE LIMITED</p>
            </div>

            <div class="w-full text-white flex justify-between bg-[#444444] h-10 px-4 rounded" style="align-items:baseline;">
              <span><p className="text-sm mb-1"> <a href="mailto:info@printe.in" className="text-sm">info@printe.in</a></p></span>
              <span>Powerd By <a href="https://www.dmedia.in/" className="text-sm" style="color: white; text-decoration: underline;"><b>DMEDIA</b></a></span>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const renderInvoice = (orders, invoiceNo) => {
    // Calculate totals safely
    const calculatedSubtotal = orders.reduce((total, order) => {
      const cartItems = getCartItems(order);
      return total + cartItems.reduce((itemTotal, item) => {
        return itemTotal + (item.product_price || 0) * (item.product_quantity || 0);
      }, 0);
    }, 0);

    // FIXED: Calculate grandTotal properly (same as subtotal since no shipping/tax)
    const grandTotal = orders.reduce((total, order) => {
      const cartItems = getCartItems(order);
      return total + cartItems.reduce((itemTotal, item) => {
        return itemTotal + (item.product_price || 0) * (item.product_quantity || 0);
      }, 0);
    }, 0);

    const firstOrder = orders[0] || {};

    // Get payment status information
    let paymentStatusJSX = null;
    if (
      firstOrder.payment_status === "completed" ||
      firstOrder.payment_status === "fully_paid"
    ) {
      paymentStatusJSX = (
        <div className="flex justify-between font-bold text-green-600 mt-2">
          <span>Payment Status:</span>
          <span>No Pending amount</span>
        </div>
      );
    } else if (firstOrder.payment_status === "advance_paid") {
      const advancePayment = parseFloat(firstOrder.advance_payment || 0);
      const remainingAmount = parseFloat(firstOrder.remaining_amount || 0);

      paymentStatusJSX = (
        <>
          <div className="flex justify-between mt-2">
            <span>Advance Paid:</span>
            <span>₹ {advancePayment.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-orange-600 mt-1">
            <span>Balance Amount:</span>
            <span>₹ {remainingAmount.toFixed(2)}</span>
          </div>
        </>
      );
    }

    return (
      <div
        key={invoiceNo}
        className="w-full mx-auto px-4 pb-4 !font-billfont bg-white mb-5"
        style={{ width: "794px" }}
      >
        {/* Header */}
        <div className="w-full mb-2 rounded">
          <div className="flex justify-between items-start">
            <div className="text-start">
              <h2 className="text-2xl font-bold items-start">Printe</h2>
              <div className="flex gap-5">
                <p className="text-sm">
                  <b>GSTIN :</b> 33AANCP3376Q1ZN
                </p>
                <p className="text-sm">
                  <b>PAN :</b> AANCP3376Q
                </p>
              </div>

              <p className="text-[0.8rem]">
                #6 Church Colony, Tiruchirappalli Tamil Nadu 620017
              </p>

              <div className="flex gap-5 justify-center items-baseline">
                <p className="text-sm">
                  <b>Mobile :</b>{" "}
                  <a href="tel:+919585610000" className="text-sm">
                    +91 95856 10000
                  </a>
                </p>
                <p className="text-sm">
                  <b>Email :</b>{" "}
                  <a href="mailto:info@printe.in" className="text-sm">
                    info@printe.in
                  </a>
                </p>
                <p className="text-sm">
                  <b>Website :</b>{" "}
                  <a href="https://www.printe.in" className="text-sm">
                    www.printe.in
                  </a>
                </p>
              </div>
            </div>
            <img
              src={ImageHelper.without_bg}
              alt="Company Logo"
              className="h-16"
              crossOrigin="anonymous"
            />
          </div>
        </div>

        {/* Order Info */}
        <div className="flex flex-wrap justify-between mb-0">
          <div className="w-full mb-4 ">
            <h2 className="text-[1.1rem] font-bold text-gray-800 ">
              Order Information
            </h2>
            <div className="flex rounded justify-between items-center">
              <p>
                <span className="text-sm">
                  <b>INVOICE NO:</b>
                </span>{" "}
                {invoiceNo}
              </p>
              <p>
                <span className="text-sm">
                  <b>Order Date:</b>
                </span>{" "}
                {firstOrder.createdAt ? moment(firstOrder.createdAt).format("DD-MMM-yyyy") : "N/A"}
              </p>
              <p>
                <span className="text-sm">
                  <b>Payment Method:</b>
                </span>{" "}
                {firstOrder.payment_type || "N/A"}
              </p>
              {firstOrder.payment_id && (
                <p>
                  <span className="text-sm">
                    <b>Payment ID:</b>
                  </span>{" "}
                  {firstOrder.payment_id}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="w-full flex justify-between">
          <div className="">
            <h2 className="text-lg font-bold text-gray-800 ">
              Customer Details
            </h2>
            <p className="font-semibold">{firstOrder.delivery_address?.name || "N/A"}</p>
          </div>

          <div className="rounded">
            <h2 className="text-lg font-bold text-gray-800 ">
              Billing Address
            </h2>
            <p className="font-semibold">{firstOrder.delivery_address?.name || "N/A"}</p>
            <p>{firstOrder.delivery_address?.street_address || "N/A"}</p>
            <p>{firstOrder.delivery_address?.pincode || "N/A"}</p>
            <p>Phone: {firstOrder.delivery_address?.mobile_number || "N/A"}</p>
            {firstOrder.delivery_address?.Alternate_mobile_number && (
              <p>
                Alt Phone:{" "}
                {firstOrder.delivery_address?.Alternate_mobile_number}
              </p>
            )}
          </div>
          
          <div className="rounded">
            <h2 className="text-lg font-bold text-gray-800 ">
              Shipping Address
            </h2>
            <p className="font-semibold">{firstOrder.delivery_address?.name || "N/A"}</p>
            <p>{firstOrder.delivery_address?.street_address || "N/A"}</p>
            <p>{firstOrder.delivery_address?.pincode || "N/A"}</p>
            <p>Phone: {firstOrder.delivery_address?.mobile_number || "N/A"}</p>
            {firstOrder.delivery_address?.Alternate_mobile_number && (
              <p>
                Alt Phone:{" "}
                {firstOrder.delivery_address?.Alternate_mobile_number}
              </p>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <h2 className="text-[1.1rem] font-bold text-gray-800 mb-2 border-b pb-1">
          Order Summary
        </h2>

        {/* Product Table - FIXED SECTION */}
        <div className="mb-2 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-1 text-left border bg-[#f2c41a]">Order ID</th>
                <th className="p-1 text-left border bg-[#f2c41a]">
                  Product Name
                </th>
                <th className="p-1 text-center border bg-[#f2c41a]">Price</th>
                <th className="p-1 text-center border bg-[#f2c41a]">Qty</th>
                <th className="p-1 text-center border bg-[#f2c41a]">Total</th>
              </tr>
            </thead>
            <tbody className="text-[0.8rem]">
              {orders.map((order) => {
                const items = getCartItems(order);
                return items.map((item, index) => (
                  <tr key={`${order._id}_${index}`} className="border-b">
                    <td className="p-1 border"> {invoiceNo}</td>
                    <td className="p-1 border">
                      <div className="flex flex-col gap-y-1">
                        <p className="font-semibold">
                          {item?.product_name || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className="p-1 text-center border">
                      ₹ {item?.product_price || 0}
                    </td>
                    <td className="p-1 text-center border">
                      {item?.product_quantity || 0}
                    </td>
                    <td className="p-1 text-center border">
                      ₹ {((item?.product_price || 0) * (item?.product_quantity || 0)).toFixed(2)}
                    </td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>

        {/* Payment Summary */}
        <h2 className="text-[1.1rem] font-bold text-gray-800 mb-2 border-b pb-1 ">
          Payment Summary
        </h2>

        {/* Payment Table */}
        <div className="mb-6 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-1 text-left border bg-[#f2c41a]">
                  Description
                </th>
                <th className="p-1 text-center border bg-[#f2c41a]">Amount</th>
              </tr>
            </thead>
            <tbody className="text-[0.8rem]">
              <tr className="border-b">
                <td className="p-1 border font-semibold">Subtotal</td>
                <td className="p-1 text-center border">
                  ₹ {calculatedSubtotal.toFixed(2)}
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-1 border font-semibold">Shipping</td>
                <td className="p-1 text-center border">₹ 0.00</td>
              </tr>
              <tr className="border-b">
                <td className="p-1 border font-semibold">Tax</td>
                <td className="p-1 text-center border">₹ 0.00</td>
              </tr>
              <tr className="border-b">
                <td className="p-1 border font-bold">Grand Total</td>
                <td className="p-1 text-center border font-bold text-orange-600">
                  ₹ {grandTotal.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Payment Status */}
        <div className="flex justify-end">
          <div className="w-full md:w-[40%] bg-gray-50 p-4 rounded-lg">
            {paymentStatusJSX}
          </div>
        </div>
      </div>
    );
  };

  // Track order status functionality
  const items = [
    { key: "1", label: "placed" },
    { key: "2", label: "design" },
    { key: "3", label: "production" },
    { key: "4", label: "quality check" },
    { key: "5", label: "packing" },
    { key: "6", label: "out for delivery" },
    { key: "7", label: "completed" },
  ];

  // Create a mapping between UI labels and database status names
  const statusMapping = {
    placed: "placed",
    design: "designing team",
    production: "production team",
    "quality check": "quality_check",
    packing: "packing",
    "out for delivery": "out_for_delivery",
    completed: "completed",
  };

  const ORDER_TIME_LINE = (status) => {
    const dbStatus = statusMapping[status.toLowerCase()] || status;
    const orderTimeline = _.get(filterOrderData, "order_delivery_timeline", []);
    return orderTimeline.find((timeline) => timeline.order_status === dbStatus);
  };

  let completed_timelines = _.get(
    filterOrderData,
    "order_delivery_timeline",
    []
  ).map((res) => {
    return res.order_status;
  });

  // Make sure "placed" is included if it's not already in the timeline
  if (!completed_timelines.includes("placed")) {
    completed_timelines.push("placed");
  }

  const GET_COLOR_STATUS = (res) => {
    try {
      const dbStatus = statusMapping[res?.label?.toLowerCase()] || res?.label;
      return completed_timelines.includes(dbStatus) ? "green" : "gray";
    } catch (err) {
      return "gray";
    }
  };

  // Group orders by invoice number
  const ordersByInvoice = _.groupBy(
    allOrders.length > 0 ? allOrders : (filterOrderData ? [filterOrderData] : []),
    "invoice_no"
  );

  // Add loading state check at the beginning of return
  if (isLoading || !filterOrderData) {
    return <OrderDetailsSkeleton />;
  }

  return (
    <div className="w-full h-auto flex-1 flex gap-3 flex-col">
       <Helmet>
        <title>My Orders – Printe.in Account | Track & Manage Your Orders</title>
        <meta name="description" content="View, track, and manage your printing and gifting orders on Printe.in. Check order status, order history, invoices, and delivery updates easily." />
        <meta name="keywords" content="printe my orders, order history, track printing orders, order status printe, user orders dashboard, manage orders online" />
    </Helmet>
      <Collapse
        defaultActiveKey={["1"]}
        className="!bg-white overflow-hidden"
      >
        <Collapse.Panel
          key="1"
          header="Invoice"
          extra={
            <Tag
              onClick={handleDownloadPDF}
              color="green"
              className="!center_div gap-x-2 !cursor-pointer"
            >
              {pdfLoading ? (
                <Spin size="small" />
              ) : (
                <IconHelper.DOWNLOAD_ICON />
              )}
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

        {/* Track Order Status Panel */}
        <Collapse.Panel key={"2"} header={"Track Order Status"}>
          <div className="bg-white p-5 mt-4">
            <h1 className="pt-4 text-center pb-10">Track Order Status</h1>

            <Timeline
              className="text-sm"
              items={items.map((res) => {
                const timelineEntry = ORDER_TIME_LINE(res.label);
                const createdAt = _.get(timelineEntry, "createdAt", null);
                let color = GET_COLOR_STATUS(res);

                return {
                  dot: <IconHelper.DELIVERY_ICON className="!text-2xl" />,
                  children: (
                    <div
                      className={`${
                        createdAt ? "" : "grayscale"
                      } !h-[50px] !font-primary_font !text-[16px] capitalize pb-2`}
                    >
                      <h1> {res.label}</h1>
                      <h1 className="text-black !text-[12px]">
                        {createdAt
                          ? moment(createdAt).format("DD-MMM-yyyy")
                          : ""}
                      </h1>
                    </div>
                  ),
                  color: color,
                };
              })}
            />
          </div>
        </Collapse.Panel>

        {/* Design File Panel */}
        <Collapse.Panel key={"3"} header={"Design File"}>
          <div className="bg-white p-5 mt-4">
            <Tag color="green" className="flex ">
              <Tooltip
                title={_.get(
                  filterOrderData,
                  "cart_items.product_design_file",
                  ""
                )}
              >
                <span className="line-clamp-1 text-slate-600 overflow-clip">
                  {_.get(
                    filterOrderData,
                    "cart_items.product_design_file",
                    ""
                  )}
                </span>
              </Tooltip>
              ...
            </Tag>
            <div className="pt-3">
              <a
                href={_.get(
                  filterOrderData,
                  "cart_items.product_design_file",
                  ""
                )}
                target="_blank"
                className="!my-2 text-sm text-blue-500"
              >
                Download
              </a>
            </div>
          </div>
        </Collapse.Panel>
      </Collapse>
    </div>
  );
};

export default OrderDetails;