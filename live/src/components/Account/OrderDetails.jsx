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
import signatureImage from "../../../src/assets/logo/signature.png";

const OrderDetails = () => {
  // State
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

  // Number to words function for Indian Rupees
  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const thousands = ['', 'Thousand', 'Lakh', 'Crore'];

    if (num === 0) return 'Zero Rupees Only';

    const convertLessThanThousand = (n) => {
      if (n === 0) return '';
      if (n < 20) return ones[n] + ' ';
      if (n < 100) return tens[Math.floor(n / 10)] + ' ' + ones[n % 10] + ' ';
      return ones[Math.floor(n / 100)] + ' Hundred ' + convertLessThanThousand(n % 100);
    };

    let result = '';
    let i = 0;
    let tempNum = Math.floor(num);

    if (tempNum === 0) {
      result = 'Zero';
    } else {
      while (tempNum > 0) {
        const chunk = tempNum % 1000;
        if (chunk !== 0) {
          result = convertLessThanThousand(chunk) + thousands[i] + ' ' + result;
        }
        tempNum = Math.floor(tempNum / 1000);
        i++;
      }
    }

    // Handle paise
    const paise = Math.round((num - Math.floor(num)) * 100);
    let paiseWords = '';
    if (paise > 0) {
      paiseWords = ' and ' + convertLessThanThousand(paise).trim() + ' Paise';
    }

    return result.trim() + ' Rupees' + paiseWords + ' Only';
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

    const firstOrder = orders[0] || {};
    const cartItems = getCartItems(firstOrder);

    // Calculate item details
    const itemDetails = cartItems.map(item => {
      const taxableValue = (item.price || 0) * (item.quantity || 0);
      const taxAmount = taxableValue * 0.18; // 18% GST
      const amount = taxableValue + taxAmount;

      return {
        ...item,
        taxableValue,
        taxAmount,
        amount
      };
    });

    // Calculate totals
    const taxableAmount = itemDetails.reduce((sum, item) => sum + item.taxableValue, 0);
    const totalTax = itemDetails.reduce((sum, item) => sum + item.taxAmount, 0);
    const cgst = totalTax / 2;
    const sgst = totalTax / 2;
    const grandTotal = Math.round(taxableAmount + totalTax + (firstOrder.DeliveryCharges || 0));
    const totalQuantity = itemDetails.reduce((sum, item) => sum + (item.quantity || 0), 0);

    // Get delivery address
    const deliveryAddress = firstOrder.delivery_address || {};

    // Generate address string
    const addressParts = [
      deliveryAddress.street || deliveryAddress.street_address,
      deliveryAddress.city,
      deliveryAddress.state,
      deliveryAddress.pincode ? `PIN: ${deliveryAddress.pincode}` : null
    ].filter(Boolean);
    const fullAddress = addressParts.join(", ");

    // Generate QR code HTML if payment is pending
    let qrCodeHTML = "";
    if (firstOrder.payment_status === "pending" && firstOrder.payment_qr_code) {
      qrCodeHTML = `
        <div style="position: absolute; bottom: 120px; left: 40px; width: 200px; text-align: center;">
          <div style="border: 1px solid #ddd; padding: 10px; background: white; border-radius: 4px;">
            <img src="${firstOrder.payment_qr_code}" alt="Payment QR Code" style="width: 180px; height: 180px;" />
            <p style="margin-top: 8px; font-size: 12px; font-weight: bold;">Scan QR Code to Pay</p>
          </div>
        </div>
      `;
    }

    // Get payment status information
    let paymentStatusHTML = "";
    if (firstOrder.payment_status === "pending") {
      paymentStatusHTML = `
        <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px;">
          <p style="margin: 0; font-weight: bold; color: #856404;">
            Payment Status: <span style="color: #dc3545;">Pending Payment</span>
          </p>
          <p style="margin: 5px 0 0 0; font-size: 13px;">
            Please complete the payment to process your order
          </p>
        </div>
      `;
    } else if (firstOrder.payment_status === "completed" || firstOrder.payment_status === "fully_paid") {
      paymentStatusHTML = `
        <div style="margin-top: 20px; padding: 15px; background: #d4edda; border: 1px solid #c3e6cb; border-radius: 4px;">
          <p style="margin: 0; font-weight: bold; color: #155724;">
            Payment Status: <span style="color: #28a745;">Paid</span>
          </p>
        </div>
      `;
    }

    return `
      <div class="w-full" style="font-family: Arial, sans-serif; position: relative; min-height: 1120px; width: 794px; padding: 20px 20px;">
        <!-- Header Section -->
        <div style="text-align: center; margin-bottom: 10px; border-bottom: 2px solid #000; padding-bottom: 5px; position: relative;">
        <div style=" padding: 0px;  display: inline-block; text-align: center;">
                  <img src="${ImageHelper.pdf_logo}" alt="Payment QR Code" style="width: 150px; height: 50px; margin-bottom: 10px;" />
                </div>
          <div style="display: flex; justify-content: center; gap: 30px; margin: 8px 0;">
            <p style="margin: 0; font-size: 10px;">
              <b>GSTIN:</b> 33AANCP3376Q1ZN
            </p>
            <p style="margin: 0; font-size: 10px;">
              <b>PAN:</b> AANCP3376Q
            </p>
          </div>
          <p style="margin: 5px 0; font-size: 10px; line-height: 1.4;">
          #6 Church Colony, Tiruchirappalli  Tamil Nadu 620017
          </p>
          <div style="display: flex; justify-content: center; gap: 20px; margin: 8px 0; font-size: 10px;">
            <p style="margin: 0;">
              <b>Mobile:</b> +91 95856 10000
            </p>
            <p style="margin: 0;">
              <b>Email:</b> info@printe.in
            </p>
            <p style="margin: 0;">
              <b>Website:</b> www.printe.in
            </p>
          </div>
        </div>

        <!-- Invoice Details -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px; background: #f8f9fa; padding: 5px; border-radius: 4px;">
          <div>
            <div style="display: flex; gap: 40px;">
              <div>
                <p style="margin: 5px 0; font-size: 10px;">
                  <b>Invoice #:</b> ${invoiceNo}
                </p>
                <p style="margin: 5px 0; font-size: 10px;">
                  <b>Invoice Date:</b> ${moment(firstOrder.createdAt).format("DD MMM YYYY")}
                </p>
              </div>
              
            </div>
          </div>
          ${firstOrder.payment_status === "pending" &&
      ` <div style="text-align: right;">
            <div style=" color: #ff6b6b; padding: 8px 10px; border-radius: 4px; display: inline-block;">
              <p style="margin: 0; font-weight: bold; font-size: 12px; ">
                ${firstOrder.payment_status === "pending" ? "PAYMENT PENDING" : "PAID"}
              </p>
            </div>
          </div>`
      }
        </div>

        <!-- Customer and Shipping Details -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <div style="flex: 1;">
            <h3 style="font-size: 13px; font-weight: bold; margin: 0 0 10px 0; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
              Customer Details:
            </h3>
            <p style="margin: 5px 0; font-size: 13px; font-weight: bold;">${deliveryAddress.name || "Customer Name"}</p>
            <p style="margin: 5px 0; font-size: 12px; line-height: 1.4;">${fullAddress}</p>
            <p style="margin: 5px 0; font-size: 12px;"><b>Phone:</b> ${deliveryAddress.mobile_number || ""}</p>
            <p style="margin: 5px 0; font-size: 12px;"><b>Email:</b> ${deliveryAddress.email || ""}</p>
          </div>
          
          <div style="flex: 1; padding-left: 20px;">
            <h3 style="font-size: 12px; font-weight: bold; margin: 0 0 10px 0; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
              Shipping Details:
            </h3>
            <p style="margin: 5px 0; font-size: 12px;"><b>Shipping Method:</b> Standard Delivery</p>
            <p style="margin: 5px 0; font-size: 12px;"><b>Expected Delivery:</b> 5-7 Business Days</p>
            <p style="margin: 5px 0; font-size: 12px;"><b>Place of Supply:</b> ${"TRICHY, TAMIL NADU"}</p>
          </div>
        </div>

        <!-- Items Table -->
        <div style="margin-bottom: 10px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
            <thead>
              <tr style="background-color: #f2c41a; color: #333;">
                <th style="border: 1px solid #ddd; padding: 10px; text-align: left; width: 30px;">#</th>
                <th style="border: 1px solid #ddd; padding: 10px; text-align: left; width: 250px;">Item</th>
                <th style="border: 1px solid #ddd; padding: 10px; text-align: right; width: 80px;">Rate / Item</th>
                <th style="border: 1px solid #ddd; padding: 10px; text-align: center; width: 60px;">Qty</th>
                <th style="border: 1px solid #ddd; padding: 10px; text-align: right; width: 100px;">Taxable Value</th>
                <th style="border: 1px solid #ddd; padding: 10px; text-align: right; width: 120px;">Tax Amount</th>
                <th style="border: 1px solid #ddd; padding: 10px; text-align: right; width: 100px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemDetails.map((item, index) => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 10px; vertical-align: top;">${index + 1}</td>
                  <td style="border: 1px solid #ddd; padding: 10px; vertical-align: top;">
                    <div style="font-weight: bold; margin-bottom: 3px;">${item.product_name || "Product"}</div>
                    ${item.size ? `<div style="font-size: 11px; color: #666;">Size: ${item.size}</div>` : ''}
                    ${item.color ? `<div style="font-size: 11px; color: #666;">Color: ${item.color}</div>` : ''}
                  </td>
                  <td style="border: 1px solid #ddd; padding: 10px; text-align: right; vertical-align: top;">₹ ${(item.price || 0).toFixed(2)}</td>
                  <td style="border: 1px solid #ddd; padding: 10px; text-align: center; vertical-align: top;">${item.quantity || 0}</td>
                  <td style="border: 1px solid #ddd; padding: 10px; text-align: right; vertical-align: top;">₹ ${item.taxableValue.toFixed(2)}</td>
                  <td style="border: 1px solid #ddd; padding: 10px; text-align: right; vertical-align: top;">
                    ₹ ${item.taxAmount.toFixed(2)}<br/>
                    <span style="font-size: 11px; color: #666;">(18%)</span>
                  </td>
                  <td style="border: 1px solid #ddd; padding: 10px; text-align: right; vertical-align: top; font-weight: bold;">₹ ${item.amount.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
          
            <div style="margin-bottom: 5px;">
              <h4 style="font-size: 12px; font-weight: bold; margin: 0 0 10px 0;">Total amount (in words):</h4>
              <p style="margin: 0; font-size: 13px; font-style: italic; background: #f8f9fa; padding: 10px; border-radius: 4px;">
                INR ${numberToWords(grandTotal)}
              </p>
            </div>

        <!-- Summary Section -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <!-- Left: Total in words and QR Code Section -->
        <div style="flex: 1;">
            
            <!-- QR Code Section -->
            ${firstOrder.payment_status === "pending" && firstOrder.payment_qr_code ? `
              <div style="margin-top: 20px;">
                <div style="border: 1px solid #ddd; padding: 15px; border-radius: 4px; display: inline-block; text-align: center;">
                  <h4 style="font-size: 12px; font-weight: bold; margin: 0 0 10px 0;">Payment QR Code</h4>
                  <img src="${firstOrder.payment_qr_code}" alt="Payment QR Code" style="width: 100px; height: 100px; margin-bottom: 5px;" />
                  <p style="margin: 0; font-size: 10px; font-weight: bold; color: #333;">Scan to Pay</p>
                  <p style="margin: 5px 0 0 0; font-size: 8px; color: #666;">Use any UPI app to scan</p>
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Right: Totals -->
          <div style="width: 400px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 10px;">
              <tbody>
                <tr>
                  <td style="padding: 8px 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Taxable Amount</td>
                  <td style="padding: 8px 10px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold;">₹ ${taxableAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 10px; border-bottom: 1px solid #ddd;">CGST 9.0%</td>
                  <td style="padding: 8px 10px; border-bottom: 1px solid #ddd; text-align: right;">₹ ${cgst.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 10px; border-bottom: 1px solid #ddd;">SGST 9.0%</td>
                  <td style="padding: 8px 10px; border-bottom: 1px solid #ddd; text-align: right;">₹ ${sgst.toFixed(2)}</td>
                </tr>
                ${firstOrder.DeliveryCharges ? `
                  <tr>
                    <td style="padding: 8px 10px; border-bottom: 1px solid #ddd;">Shipping Charges</td>
                    <td style="padding: 8px 10px; border-bottom: 1px solid #ddd; text-align: right;">₹ ${firstOrder.DeliveryCharges.toFixed(2)}</td>
                  </tr>
                ` : ''}
                <tr>
                  <td style="padding: 12px 10px; background: #f8f9fa; font-weight: bold; font-size: 14px;">Total Amount</td>
                  <td style="padding: 12px 10px; background: #f8f9fa; text-align: right; font-weight: bold; font-size: 14px; color: #ff6b6b;">₹ ${grandTotal.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            
            <div style="font-size: 12px; color: #666; text-align: center;">
              <p style="margin: 5px 0;">Total Items: ${itemDetails.length}</p>
              <p style="margin: 5px 0;">Total Quantity: ${totalQuantity}</p>
            </div>
          </div>
        </div>

        <!-- Payment Status -->
        ${paymentStatusHTML}

      

         <!-- Terms and Signature -->
        <div style="margin-top: 10px; margin-bottom:10px; padding-top: 10px; border-top: 1px solid #ddd;">
          <div style="display: flex; justify-content: space-between; align-items: flex-end;">
            <div style="flex: 1;">
              <h4 style="font-size: 10px; margin-bottom: 10px;">Terms & Conditions:</h4>
              <ul style="font-size: 8px; margin: 0; padding-left: 15px; color: #666;">
                <li>Goods once sold will not be taken back</li>
                <li>All disputes subject to Tiruchirappalli jurisdiction</li>
                <li>Payment due within 7 days from invoice date</li>
              </ul>
            </div>
            
            <div style="text-align: center; displat:flex; flex-direction:coloum;">
            <p style="font-size: 6px; color: #666; margin: 5px 0 0 0;">For PAZHANAM DESIGNS AND CONSTRUCTIONS PRIVATE LIMITED</p>
            <div style="margin-bottom: 2px;">
            <img src="${signatureImage}" alt="Authorized Signature" style="width: 80px; height: auto; transform:rotate(30deg); margin-left:50px;" />
            </div>
            <p style="font-size: 8px; font-weight: bold; margin: 0;">Authorized Signature</p>
            </div>
          </div>
        </div>



<div style="margin-top: 2px; padding-top: 2px; border-top: 2px solid #f2c41a; text-align: center; font-size: 8px; color: #666;">
          <p style="margin: 2px 0;">MARKETED BY PAZHANAM DESIGNS AND CONSTRUCTIONS PRIVATE LIMITED</p>
          <p style="margin: 2px 0;">Registered Office: #6 Church Colony, Tiruchirappalli, Tamil Nadu - 620017</p>
          <p style="margin: 2px 0; margin-bottom:5px;">Email: info@printe.in | Phone: +91 95856 10000 | Website: www.printe.in</p>
          <div style="background-color: #444; color: white; padding: 8px; margin-top: 5px; border-radius: 4px;">
            <span>Powered By <a href="https://www.dmedia.in/" style="color: white; text-decoration: underline; font-weight: bold;">DMEDIA</a></span>
          </div>
        </div>
      </div>
    `;
  };

  const renderInvoice = (orders, invoiceNo) => {
    if (!orders || orders.length === 0) {
      return <div className="text-center p-8">No order data available</div>;
    }

    const firstOrder = orders[0] || {};
    const cartItems = getCartItems(firstOrder);

    // Calculate item details
    const itemDetails = cartItems.map(item => {
      const taxableValue = (item.price || 0) * (item.quantity || 0);
      const taxAmount = taxableValue * 0.18; // 18% GST
      const amount = taxableValue + taxAmount;

      return {
        ...item,
        taxableValue,
        taxAmount,
        amount
      };
    });

    // Calculate totals
    const taxableAmount = itemDetails.reduce((sum, item) => sum + item.taxableValue, 0);
    const totalTax = itemDetails.reduce((sum, item) => sum + item.taxAmount, 0);
    const cgst = totalTax / 2;
    const sgst = totalTax / 2;
    const grandTotal = Math.round(taxableAmount + totalTax + (firstOrder.DeliveryCharges || 0));
    const totalQuantity = itemDetails.reduce((sum, item) => sum + (item.quantity || 0), 0);

    // Get delivery address
    const deliveryAddress = firstOrder.delivery_address || {};

    // Generate address string
    const addressParts = [
      deliveryAddress.street || deliveryAddress.street_address,
      deliveryAddress.city,
      deliveryAddress.state,
      deliveryAddress.pincode ? `PIN: ${deliveryAddress.pincode}` : null
    ].filter(Boolean);
    const fullAddress = addressParts.join(", ");

    return (
      <div
        key={invoiceNo}
        className="w-full mx-auto p-6 bg-white border border-gray-200 rounded-lg shadow-sm mb-6"
        style={{ maxWidth: "794px" }}
      >
        {/* Header Section */}
        <div className="text-center mb-8 pb-6 border-b-2 border-gray-800 relative">
            <img
              src={ImageHelper.pdf_logo}
              alt="Authorized Signature"
              className="w-36 mx-auto object-contain mb-2"
            />

          
          <div className="flex justify-center gap-6 mb-2">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">GSTIN:</span> 33AANCP3376Q1ZN
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">PAN:</span> AANCP3376Q
            </p>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            #6 Church Colony,  Tiruchirappalli  Tamil Nadu 620017
          </p>
          <div className="flex justify-center gap-4 text-sm text-gray-600">
            <p>
              <span className="font-semibold">Mobile:</span> +91 95856 10000
            </p>
            <p>
              <span className="font-semibold">Email:</span> info@printe.in
            </p>
            <p>
              <span className="font-semibold">Website:</span> www.printe.in
            </p>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="flex justify-between items-start mb-8 bg-gray-50 p-4 rounded-lg">
          <div>
            <div className="flex gap-8">
              <div>
                <p className="text-sm">
                  <span className="font-semibold">Invoice #:</span> {invoiceNo}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Invoice Date:</span>{" "}
                  {firstOrder.createdAt
                    ? moment(firstOrder.createdAt).format("DD MMM YYYY")
                    : "N/A"}
                </p>
              </div>
              <div>

                <p className="text-sm">
                  <span className="font-semibold">Due Date:</span>{" "}
                  {firstOrder.createdAt
                    ? moment(firstOrder.createdAt).add(7, 'days').format("DD MMM YYYY")
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
          <div className={`px-4 py-2 rounded ${firstOrder.payment_status === "pending"
            ? "bg-red-100 text-red-800"
            : "bg-green-100 text-green-800"
            }`}>
            <p className="font-bold text-sm">
              {firstOrder.payment_status === "pending" ? "PAYMENT PENDING" : "PAID"}
            </p>
          </div>
        </div>

        {/* Customer and Shipping Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b">
              Customer Details:
            </h3>
            <p className="font-bold text-gray-800">{deliveryAddress.name || "Customer Name"}</p>
            <p className="text-sm text-gray-600 mt-1">{fullAddress}</p>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-semibold">Phone:</span> {deliveryAddress.mobile_number || "N/A"}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-semibold">Email:</span> {deliveryAddress.email || "N/A"}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b">
              Shipping Details:
            </h3>
            <p className="text-sm">
              <span className="font-semibold">Shipping Method:</span> Standard Delivery
            </p>
            <p className="text-sm">
              <span className="font-semibold">Expected Delivery:</span> 5-7 Business Days
            </p>
            <p className="text-sm">
              <span className="font-semibold">Place of Supply:</span>{" "}
              {"TRICHY, TAMIL NADU"}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-2 overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-yellow-500 text-gray-800">
                <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold w-8 ">#</th>
                <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold">Item</th>
                <th className="border border-gray-300 px-4 py-2 text-right text-xs font-semibold w-24">Rate / Item</th>
                <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold w-16">Qty</th>
                <th className="border border-gray-300 px-4 py-2 text-right text-xs font-semibold w-32">Taxable Value</th>
                <th className="border border-gray-300 px-4 py-2 text-right text-xs font-semibold w-36">Tax Amount</th>
                <th className="border border-gray-300 px-4 py-2 text-right text-xs font-semibold w-32">Amount</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {itemDetails.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 align-top">{index + 1}</td>
                  <td className="border border-gray-300 px-4 py-3 align-top">
                    <div className="font-semibold mb-1">{item.product_name || "Product"}</div>
                    {item.size && (
                      <div className="text-xs text-gray-500">Size: {item.size}</div>
                    )}
                    {item.color && (
                      <div className="text-xs text-gray-500">Color: {item.color}</div>
                    )}

                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-right align-top">
                    ₹ {(item.price || 0).toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center align-top">
                    {item.quantity || 0}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-right align-top">
                    ₹ {item.taxableValue.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-right align-top">
                    <div>₹ {item.taxAmount.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">(18%)</div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-right align-top font-semibold">
                    ₹ {item.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mb-6 text-right">
          <div className="bg-gray-50 p-4 rounded border border-gray-200 flex gap-2 items-center">
            <h4 className="font-semibold text-gray-800 ">Total amount (in words):</h4>
            <p className="text-sm italic text-gray-700">
              INR {numberToWords(grandTotal)}
            </p>
          </div>
        </div>

        {/* Summary Section */}
        <div className="flex  lg:flex-row gap-8 mb-8">
          {/* Left: Total in words and QR Code */}
          <div className="flex-1">
            {/* QR Code for pending payments */}
            {firstOrder.payment_status === "pending" && firstOrder.payment_qr_code && (
              <div className="mt-4">
                <div className="border border-gray-300 rounded-lg p-4 inline-block">
                  <h4 className="font-semibold text-gray-800 mb-3 text-center">Payment QR Code</h4>
                  <img
                    src={firstOrder.payment_qr_code}
                    alt="Payment QR Code"
                    className="w-48 h-48 mx-auto mb-3"
                  />
                  <p className="text-sm font-semibold text-center text-gray-800">Scan to Pay</p>
                  <p className="text-xs text-gray-500 text-center mt-1">Use any UPI app to scan</p>
                </div>
              </div>
            )}
          </div>

          {/* Right: Totals */}
          <div className=" w-[50%]">
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <table className="w-full">
                <tbody>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-3 font-semibold">Taxable Amount</td>
                    <td className="px-4 py-3 text-right font-semibold">₹ {taxableAmount.toFixed(2)}</td>
                  </tr>
                  <tr className="border-t border-gray-300">
                    <td className="px-4 py-3">CGST 9.0%</td>
                    <td className="px-4 py-3 text-right">₹ {cgst.toFixed(2)}</td>
                  </tr>
                  <tr className="border-t border-gray-300">
                    <td className="px-4 py-3">SGST 9.0%</td>
                    <td className="px-4 py-3 text-right">₹ {sgst.toFixed(2)}</td>
                  </tr>
                  {firstOrder.DeliveryCharges && (
                    <tr className="border-t border-gray-300">
                      <td className="px-4 py-3">Shipping Charges</td>
                      <td className="px-4 py-3 text-right">₹ {firstOrder.DeliveryCharges.toFixed(2)}</td>
                    </tr>
                  )}
                  <tr className="border-t border-gray-300 bg-gray-800 text-white">
                    <td className="px-4 py-3 font-bold">Total Amount</td>
                    <td className="px-4 py-3 text-right font-bold">₹ {grandTotal.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-sm text-gray-600 text-center">
              <p>Total Items: {itemDetails.length}</p>
              <p>Total Quantity: {totalQuantity}</p>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        {firstOrder.payment_status === "pending" ? (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="font-semibold text-yellow-800">
              Payment Status: <span className="text-red-600">Pending Payment</span>
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              Please complete the payment to process your order
            </p>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="font-semibold text-green-800">
              Payment Status: <span className="text-green-600">Paid</span>
            </p>
          </div>
        )}


        {/* [azhanam] */}
        <div className="mt-8 pt-6 border-t border-gray-300">
          <div className="flex justify-between items-start">
            <div className="w-2/3">
              <h4 className="font-semibold text-gray-800 mb-2">Terms & Conditions:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Goods once sold will not be taken back</li>
                <li>• All disputes subject to Tiruchirappalli jurisdiction</li>
                <li>• Payment due within 7 days from invoice date</li>
              </ul>
            </div>

            <div className="text-center">
              <p className="text-[10px] w-[90%]  text-gray-600">For PAZHANAM DESIGNS AND CONSTRUCTIONS PRIVATE LIMITED</p>
              <div className="mb-2">
                <img
                  src={signatureImage}
                  alt="Authorized Signature"
                  className="w-24 mx-auto rotate-12"
                />
              </div>
              <p className="font-semibold text-gray-800">Authorized Signature</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
            <p className="mb-1">MARKETED BY PAZHANAM DESIGNS AND CONSTRUCTIONS PRIVATE LIMITED</p>
            <p className="mb-1">Registered Office: #6 Church Colony, Tiruchirappalli, Tamil Nadu - 620017</p>
            <p className="mb-3">Email: info@printe.in | Phone: +91 95856 10000 | Website: www.printe.in</p>
            <div className="bg-gray-800 text-white py-2 px-4 rounded">
              <span>Powered By{" "}
                <a href="https://www.dmedia.in/" className="text-white font-bold hover:underline">
                  DMEDIA
                </a>
              </span>
            </div>
          </div>
        </div>


        {/* Footer */}
        {/* <div className="mt-8 pt-6 border-t border-gray-300 text-center text-xs text-gray-500 ">
          <p className="mb-2">This is a computer generated invoice and does not require a physical signature</p>
          <p className="mb-2">For any queries, please contact: info@printe.in or call +91 95856 10000</p>
          <p className="mb-4">Thank you for your business!</p>
          <div className="bg-gray-800 text-white py-3 px-4 rounded">
            <span>Powered By{" "}
              <a href="https://www.dmedia.in/" className="text-white font-bold hover:underline">
                DMEDIA
              </a>
            </span>
          </div>
        </div> */}
      </div>
    );
  };

  // Track order status functionality
  const statusItems = [
    { key: "1", label: "placed" },
    { key: "2", label: "design" },
    { key: "3", label: "production" },
    { key: "4", label: "quality check" },
    { key: "5", label: "packing" },
    { key: "6", label: "out for delivery" },
    { key: "7", label: "completed" },
  ];

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

  const completedTimelines = _.get(filterOrderData, "order_delivery_timeline", []).map(
    (res) => res.order_status
  );

  if (!completedTimelines.includes("placed")) {
    completedTimelines.push("placed");
  }

  const GET_COLOR_STATUS = (res) => {
    try {
      const dbStatus = statusMapping[res?.label?.toLowerCase()] || res?.label;
      return completedTimelines.includes(dbStatus) ? "green" : "gray";
    } catch (err) {
      return "gray";
    }
  };

  // Group orders by invoice number
  const ordersByInvoice = _.groupBy(
    allOrders.length > 0 ? allOrders : (filterOrderData ? [filterOrderData] : []),
    "invoice_no"
  );

  // Add loading state check
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

      <Collapse defaultActiveKey={["1"]} className="!bg-white overflow-hidden">
        {/* Invoice Panel */}
        <Collapse.Panel
          key="1"
          header="Invoice"
          extra={
            <Tag
              onClick={handleDownloadPDF}
              color="green"
              className="!flex items-center gap-x-2 !cursor-pointer hover:bg-green-100"
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
          <div className="w-full flex justify-center items-start overflow-auto">
            {Object.entries(ordersByInvoice).map(([invoiceNo, orders]) =>
              renderInvoice(orders, invoiceNo)
            )}
          </div>
        </Collapse.Panel>

        {/* Track Order Status Panel */}
        <Collapse.Panel key={"2"} header={"Track Order Status"}>
          <div className="bg-white p-5">
            <h2 className="text-xl font-bold text-center mb-6">Track Order Status</h2>

            <Timeline
              className="text-sm"
              items={statusItems.map((res) => {
                const timelineEntry = ORDER_TIME_LINE(res.label);
                const createdAt = _.get(timelineEntry, "createdAt", null);
                const color = GET_COLOR_STATUS(res);

                return {
                  dot: (
                    <div className={`w-3 h-3 rounded-full ${color === "green" ? "bg-green-500" : "bg-gray-300"
                      }`} />
                  ),
                  children: (
                    <div className={`pl-4 ${createdAt ? "" : "opacity-50"}`}>
                      <h3 className="font-medium capitalize text-gray-800">
                        {res.label}
                      </h3>
                      {createdAt && (
                        <p className="text-sm text-gray-500">
                          {moment(createdAt).format("DD-MMM-YYYY")}
                        </p>
                      )}
                    </div>
                  ),
                  color: color,
                };
              })}
            />

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Current Status:</h4>
              <p className="text-gray-600">
                {filterOrderData.order_status
                  ? _.startCase(filterOrderData.order_status)
                  : "Order placed"}
              </p>
            </div>
          </div>
        </Collapse.Panel>
      </Collapse>
    </div>
  );
};

export default OrderDetails;