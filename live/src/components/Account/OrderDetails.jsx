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
  const [pdfLoading, setPdfLoading] = useState(false);
  const [allOrders, setAllOrders] = useState([]);
  const pdfContainerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  const { order_id } = useParams();
  const dispatch = useDispatch();
  const { my_orders, order_details } = useSelector((state) => state.authSlice);

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
    if (order_details.data || my_orders.data.length > 0) setIsLoading(false);
  }, [order_details.data, my_orders.data]);

  const filterOrderData =
    my_orders.data.find((order) => order._id === order_id) || order_details.data;

  const getCartItems = (order) => {
    if (!order) return [];
    if (Array.isArray(order.cart_items)) return order.cart_items;
    if (order.cart_items && !Array.isArray(order.cart_items)) return [order.cart_items];
    return [];
  };

  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const thousands = ['', 'Thousand', 'Lakh', 'Crore'];
    if (num === 0) return 'Zero Rupees Only';
    const cvt = (n) => {
      if (n === 0) return '';
      if (n < 20) return ones[n] + ' ';
      if (n < 100) return tens[Math.floor(n / 10)] + ' ' + ones[n % 10] + ' ';
      return ones[Math.floor(n / 100)] + ' Hundred ' + cvt(n % 100);
    };
    let result = ''; let i = 0; let t = Math.floor(num);
    if (t === 0) { result = 'Zero'; } else {
      while (t > 0) { const c = t % 1000; if (c !== 0) result = cvt(c) + thousands[i] + ' ' + result; t = Math.floor(t / 1000); i++; }
    }
    const paise = Math.round((num - Math.floor(num)) * 100);
    return result.trim() + ' Rupees' + (paise > 0 ? ' and ' + cvt(paise).trim() + ' Paise' : '') + ' Only';
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const pdf = new jsPDF("p", "pt", "a4");
      const options = { scale: 2, useCORS: true, logging: false, allowTaint: false, backgroundColor: "#FFFFFF", quality: 1.2 };
      const ordersToExport = allOrders.length > 0 ? allOrders : (filterOrderData ? [filterOrderData] : []);
      if (ordersToExport.length === 0) { message.error("No order data available"); setPdfLoading(false); return; }
      const ordersByInvoice = _.groupBy(ordersToExport, "invoice_no");
      let pageCount = 0;
      const tempContainer = document.createElement("div");
      tempContainer.style.cssText = "position:absolute;left:-9999px;width:794px;font-family:Arial,sans-serif;background:#fff;";
      document.body.appendChild(tempContainer);
      for (const [invoiceNo, orders] of Object.entries(ordersByInvoice)) {
        const el = document.createElement("div");
        el.innerHTML = generateInvoiceHTML(orders, invoiceNo);
        tempContainer.appendChild(el);
        const canvas = await html2canvas(el, options);
        const imgData = canvas.toDataURL("image/jpeg", 0.8);
        const imgWidth = pdf.internal.pageSize.getWidth() - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        if (pageCount > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 20, 20, imgWidth, imgHeight);
        pageCount++;
        tempContainer.removeChild(el);
      }
      document.body.removeChild(tempContainer);
      pdf.save(`Invoice_${_.get(filterOrderData, "invoice_no", "order")}.pdf`, { compression: true });
      message.success("PDF downloaded successfully");
    } catch (error) {
      console.error("PDF generation error:", error);
      message.error("Failed to generate PDF. Please try again.");
    } finally { setPdfLoading(false); }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // generateInvoiceHTML  (used for PDF export via html2canvas)
  // The outer wrapper is position:relative + min-height:1122px (A4 height px).
  // All dynamic content sits inside a top div with padding-bottom:320px to
  // reserve space. The bottom section uses position:absolute;bottom:0 so it
  // is always anchored to the page base regardless of content height.
  // ─────────────────────────────────────────────────────────────────────────
  const generateInvoiceHTML = (orders, invoiceNo) => {
    if (!orders || orders.length === 0) return "<div>No order data available</div>";
    const firstOrder = orders[0] || {};
    const cartItems = getCartItems(firstOrder);

    const itemDetails = cartItems.map(item => {
      const taxableValue = (item.price || 0) * (item.quantity || 0);
      const taxAmount = taxableValue * 0.18;
      return { ...item, taxableValue, taxAmount, amount: taxableValue + taxAmount };
    });
    const taxableAmount = itemDetails.reduce((s, i) => s + i.taxableValue, 0);
    const totalTax = itemDetails.reduce((s, i) => s + i.taxAmount, 0);
    const cgst = totalTax / 2; const sgst = totalTax / 2;
    const MRP = cartItems.reduce((s, i) => s + (i.mrp_price || 0), 0);
    const grandTotal = Math.round(taxableAmount + totalTax + (firstOrder.DeliveryCharges || 0));
    const grandSavings = Number(Math.abs(MRP - grandTotal));
    const da = firstOrder.delivery_address || {};
    const fullAddress = [da.street || da.street_address, da.city, da.state, da.pincode ? `PINCODE: ${da.pincode}` : null].filter(Boolean).join(", ");

    let paymentStatusHTML = "";
    if (firstOrder.payment_status === "pending") {
      paymentStatusHTML = `<div style="padding:5px;background:#fff3cd;border:1px solid #ffeaa7;border-radius:4px;margin-bottom:6px;">
        <p style="margin:0;font-weight:bold;color:#856404;font-size:11px;">Payment Status: <span style="color:#dc3545;">Pending Payment</span></p>
        <p style="margin:4px 0 0;font-size:10px;">Please complete the payment to process your order</p>
      </div>`;
    } else if (firstOrder.payment_status === "completed" || firstOrder.payment_status === "fully_paid") {
      paymentStatusHTML = `<div style="padding:8px;background:#d4edda;border:1px solid #c3e6cb;border-radius:4px;margin-bottom:6px;">
        <p style="margin:0;font-weight:bold;color:#155724;font-size:11px;">Payment Status: <span style="color:#28a745;">Paid</span></p>
      </div>`;
    }

    return `
<div style="font-family:Arial,sans-serif;position:relative;min-height:1122px;width:794px;box-sizing:border-box;">

  <!-- TOP CONTENT — padding-bottom reserves space for the fixed bottom block -->
  <div style="padding:0 0 320px 0;">

    <!-- Header -->
    <div style="text-align:center;border-bottom:2px solid #000;padding-bottom:2px;margin-bottom:4px;">
    <div style="display:flex;justify-content:center;">
      <img src="${ImageHelper.pdf_logo}" style="width:140px;height:40px;object-fit:contain;margin-bottom:2px;"/>
      </div>
      <div style="display:flex;justify-content:center;gap:20px;font-size:10px;">
        <p style="margin:0;"><b>Email:</b> <a href="mailto:info@printe.in">info@printe.in</a></p>
        <p style="margin:0;"><b>Website:</b> <a href="http://www.printe.in">www.printe.in</a></p>
      </div>
    </div>

    <!-- Invoice meta -->
    <div style="display:flex;justify-content:space-between;background:#f8f9fa;padding:4px;border-radius:4px;margin-bottom:4px;">
      <div>
        <p style="margin:4px 0;font-size:10px;"><b>Invoice #:</b> ${invoiceNo}</p>
        <p style="margin:4px 0;font-size:10px;"><b>Invoice Date:</b> ${moment(firstOrder.createdAt).format("DD MMM YYYY")}</p>
      </div>
      ${firstOrder.payment_status === "pending" ? `<div style="text-align:right;"><p style="margin:0;font-weight:bold;font-size:12px;color:#ff6b6b;">PAYMENT PENDING</p></div>` : ''}
    </div>

    <!-- Customer + Shipping -->
    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
      <div style="flex:1;">
        <h3 style="font-size:12px;font-weight:bold;margin:0 0 2px;border-bottom:1px solid #ddd;padding-bottom:1px;">Customer Details:</h3>
        <p style="margin:2px 0;font-size:10px;font-weight:bold;">Mr.${da.name || "Customer Name"}</p>
        <p style="margin:2px 0;font-size:10px;line-height:1.4;width:80%;">${fullAddress}</p>
        <p style="margin:2px 0;font-size:10px;"><b>Phone:</b> ${da.mobile_number || ""}</p>
        <p style="margin:1px 0;font-size:10px;"><b>Email:</b> ${da.email || ""}</p>
      </div>
      <div style="flex:1;padding-left:20px;">
        <h3 style="font-size:12px;font-weight:bold;margin:0 0 2px;border-bottom:1px solid #ddd;padding-bottom:2px;">Shipping Details:</h3>
        <p style="margin:2px 0;font-size:10px;"><b>Shipping Method:</b> Standard Delivery</p>
        <p style="margin:2px 0;font-size:10px;"><b>Expected Delivery:</b> 5-7 Business Days</p>
        <p style="margin:2px 0;font-size:10px;"><b>Place of Supply:</b> TRICHY, TAMIL NADU</p>
      </div>
    </div>

    <!-- Items Table -->
    <table style="width:100%;border-collapse:collapse;font-size:10px;margin-bottom:4px;">
      <thead>
        <tr style="background:#f2c41a;color:#333;">
          <th style="border:1px solid #ddd;padding:2px;text-align:left;width:30px;">#</th>
          <th style="border:1px solid #ddd;padding:2px;text-align:left;">Item</th>
          <th style="border:1px solid #ddd;padding:2px;text-align:right;width:80px;">MRP</th>
          <th style="border:1px solid #ddd;padding:2px;text-align:center;width:60px;">Qty</th>
          <th style="border:1px solid #ddd;padding:2px;text-align:right;width:100px;">Rate / Item</th>
          <th style="border:1px solid #ddd;padding:2px;text-align:right;width:120px;">Tax Amount (18%)</th>
          <th style="border:1px solid #ddd;padding:2px;text-align:right;width:100px;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemDetails.map((item, idx) => `
        <tr>
          <td style="border:1px solid #ddd;padding:2px;vertical-align:top;">${idx + 1}</td>
          <td style="border:1px solid #ddd;padding:2px;vertical-align:top;">
            <span style="font-weight:bold;text-transform:uppercase;">${item.product_name || "Product"}</span>
            ${item.notes ? `<br/><span style="font-weight:400;text-transform:capitalize;">${item.notes}</span>` : ''}
            ${item.size ? `<div style="font-size:9px;color:#666;">Size: ${item.size}</div>` : ''}
            ${item.color ? `<div style="font-size:9px;color:#666;">Color: ${item.color}</div>` : ''}
          </td>
          <td style="border:1px solid #ddd;padding:2px;text-align:right;vertical-align:top;">₹ ${(item.mrp_price || 0).toFixed(2)}</td>
          <td style="border:1px solid #ddd;padding:2px;text-align:center;vertical-align:top;">${item.quantity || 0}</td>
          <td style="border:1px solid #ddd;padding:2px;text-align:right;vertical-align:top;">₹ ${item.taxableValue.toFixed(2)}</td>
          <td style="border:1px solid #ddd;padding:2px;text-align:right;vertical-align:top;">₹ ${item.taxAmount.toFixed(2)}</td>
          <td style="border:1px solid #ddd;padding:2px;text-align:right;vertical-align:top;font-weight:bold;">₹ ${item.amount.toFixed(2)}</td>
        </tr>`).join('')}
      </tbody>
    </table>

    <!-- Total in words -->
    <p style="margin:0 0 6px;font-size:11px;font-style:italic;background:#f8f9fa;padding:5px;border-radius:4px;">
      <b>Total amount (in words):</b>&nbsp;INR ${numberToWords(grandTotal)}
    </p>

    <!-- QR + Totals -->
    <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
      <div style="flex:1;">
        ${firstOrder.payment_status === "pending" && firstOrder.payment_qr_code ? `
        <div style="border:1px solid #ddd;padding:5px;border-radius:4px;display:inline-block;text-align:center;">
          <h4 style="font-size:11px;font-weight:bold;margin:0 0 6px;">Payment QR Code</h4>
          <img src="${firstOrder.payment_qr_code}" style="width:100px;height:100px;margin-bottom:4px;"/>
          <p style="margin:0;font-size:9px;font-weight:bold;">Scan to Pay</p>
          <p style="margin:3px 0 0;font-size:8px;color:#666;">Use any UPI app to scan</p>
        </div>`: ''}
      </div>
      <div style="width:380px;">
        <table style="width:100%;border-collapse:collapse;font-size:10px;">
          <tbody>
            <tr><td style="padding:6px 10px;border-bottom:1px solid #ddd;font-weight:bold;">Taxable Amount</td>
                <td style="padding:6px 10px;border-bottom:1px solid #ddd;text-align:right;font-weight:bold;">₹ ${taxableAmount.toFixed(2)}</td></tr>
            <tr><td style="padding:6px 10px;border-bottom:1px solid #ddd;">CGST 9.0%</td>
                <td style="padding:6px 10px;border-bottom:1px solid #ddd;text-align:right;">₹ ${cgst.toFixed(2)}</td></tr>
            <tr><td style="padding:6px 10px;border-bottom:1px solid #ddd;">SGST 9.0%</td>
                <td style="padding:6px 10px;border-bottom:1px solid #ddd;text-align:right;">₹ ${sgst.toFixed(2)}</td></tr>
            ${firstOrder.DeliveryCharges ? `<tr><td style="padding:6px 10px;border-bottom:1px solid #ddd;">Shipping Charges</td>
                <td style="padding:6px 10px;border-bottom:1px solid #ddd;text-align:right;">₹ ${firstOrder.DeliveryCharges.toFixed(2)}</td></tr>` : ''}
            <tr style="color:#1b8755;"><td style="padding:6px 10px;border-bottom:1px solid #ddd;"><b>Savings</b></td>
                <td style="padding:6px 10px;border-bottom:1px solid #ddd;text-align:right;"><b>₹ ${grandSavings.toFixed(2)}</b></td></tr>
            <tr><td style="padding:10px;background:#f8f9fa;font-weight:bold;font-size:13px;">Total Amount</td>
                <td style="padding:10px;background:#f8f9fa;text-align:right;font-weight:bold;font-size:13px;color:#ff6b6b;">₹ ${grandTotal.toFixed(2)}</td></tr>
          </tbody>
        </table>
      </div>
    </div>

  </div><!-- end top content -->

  <!-- ═══════════════════════════════════════════════════════════
       BOTTOM-PINNED BLOCK
       position:absolute + bottom:0 always sticks to the base
       of the 1122px page regardless of content height above.
       ═══════════════════════════════════════════════════════════ -->
  <div style="position:absolute;bottom:0;left:0;right:0;width:794px;background:#fff;">

    ${paymentStatusHTML}

    <!-- Seller Info + Signature -->
    <div style="padding-top:4px;border-top:1px solid #ddd;margin-bottom:4px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;">
        <div style="flex:1;">
          <p style="margin:2px 0;font-size:10px;">Seller Information</p>
          <table style="font-size:10px;">
            <tr><td><b>GST NO</b></td><td>: 33AANCP3376Q1ZN</td></tr>
            <tr><td><b>PAN NO</b></td><td>: AANCP3376Q</td></tr>
          </table>
        </div>
        <div style="text-align:center;">
          <p style="font-size:6px;color:#666;margin:2px 0 0;">For PAZHANAM DESIGNS AND CONSTRUCTIONS PRIVATE LIMITED</p>
          <img src="${signatureImage}" style="width:80px;height:auto;transform:rotate(30deg);margin-left:50px;"/>
          <p style="font-size:8px;font-weight:bold;margin:0;">Authorized Signature</p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="border-top:2px solid #f2c41a;text-align:center;font-size:11px;color:#666;padding-top:4px;">
      <p style="margin:2px 0;">MARKETED BY PAZHANAM DESIGNS AND CONSTRUCTIONS PRIVATE LIMITED</p>
      <p style="margin:2px 0;">#8 Church Colony, Tiruchirappalli, Tamil Nadu - 620017</p>
      <p style="margin:2px 0;">Email: info@printe.in | Customer-care: +91 95856 10000 | Website: www.printe.in</p>
      <div style="background:#444;color:white;padding:8px;margin-top:6px;text-align:center;">
        Powered By <a href="https://www.dmedia.in/" style="color:white;text-decoration:underline;font-weight:bold;">DMEDIA</a>
      </div>
    </div>

  </div><!-- end bottom-pinned block -->

</div>`;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // renderInvoice  (on-screen JSX version)
  // Outer wrapper: flex column + minHeight 1122px.
  // Top content: flex:1 so it expands.
  // Bottom section: marginTop:"auto" pushes it to the bottom.
  // ─────────────────────────────────────────────────────────────────────────
  const renderInvoice = (orders, invoiceNo) => {
    if (!orders || orders.length === 0) return <div className="text-center p-8">No order data available</div>;
    const firstOrder = orders[0] || {};
    const cartItems = getCartItems(firstOrder);

    const itemDetails = cartItems.map(item => {
      const taxableValue = (item.price || 0) * (item.quantity || 0);
      const taxAmount = taxableValue * 0.18;
      return { ...item, taxableValue, taxAmount, amount: taxableValue + taxAmount };
    });
    const taxableAmount = itemDetails.reduce((s, i) => s + i.taxableValue, 0);
    const totalTax = itemDetails.reduce((s, i) => s + i.taxAmount, 0);
    const MRP = cartItems.reduce((s, i) => s + (i.mrp_price || 0), 0);
    const cgst = totalTax / 2; const sgst = totalTax / 2;
    const grandTotal = Math.round(taxableAmount + totalTax + (firstOrder.DeliveryCharges || 0));
    const grandSavings = Number(Math.abs(MRP - grandTotal));
    const totalQuantity = itemDetails.reduce((s, i) => s + (i.quantity || 0), 0);
    const da = firstOrder.delivery_address || {};
    const fullAddress = [da.street || da.street_address, da.city, da.state, da.pincode ? `PINCode: ${da.pincode}` : null].filter(Boolean).join(", ");

    return (
      <div
        key={invoiceNo}
        className="w-full mx-auto bg-white border border-gray-200 rounded-lg shadow-sm mb-6"
        style={{ maxWidth: "794px", minHeight: "1122px", display: "flex", flexDirection: "column" }}
      >

        {/* ── TOP: grows to fill available space ── */}
        <div style={{ flex: 1 }} className="p-6">

          {/* Header */}
          <div className="text-center mb-4 pb-3 border-b-2 border-gray-800">
            <img src={ImageHelper.pdf_logo} alt="Logo" className="w-36 mx-auto object-contain mb-2" />
            <div className="flex justify-center gap-6 text-sm text-gray-600">
              <p><span className="font-semibold">Email:</span> info@printe.in</p>
              <p><span className="font-semibold">Website:</span> www.printe.in</p>
            </div>
          </div>

          {/* Invoice meta */}
          <div className="flex justify-between items-start mb-6 bg-gray-50 p-4 rounded-lg">
            <div className="flex gap-8">
              <div>
                <p className="text-sm"><span className="font-semibold">Invoice #:</span> {invoiceNo}</p>
                <p className="text-sm"><span className="font-semibold">Invoice Date:</span>{" "}
                  {firstOrder.createdAt ? moment(firstOrder.createdAt).format("DD MMM YYYY") : "N/A"}</p>
              </div>
              <div>
                <p className="text-sm"><span className="font-semibold">Due Date:</span>{" "}
                  {firstOrder.createdAt ? moment(firstOrder.createdAt).add(7, 'days').format("DD MMM YYYY") : "N/A"}</p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded ${firstOrder.payment_status === "pending" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
              <p className="font-bold text-sm">{firstOrder.payment_status === "pending" ? "PAYMENT PENDING" : "PAID"}</p>
            </div>
          </div>

          {/* Customer + Shipping */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b">Customer Details:</h3>
              <p className="font-bold text-gray-800">{da.name || "Customer Name"}</p>
              <p className="text-sm text-gray-600 mt-1 w-[80%]">{fullAddress}</p>
              <p className="text-sm text-gray-600 mt-1"><span className="font-semibold">Phone:</span> {da.mobile_number || "N/A"}</p>
              <p className="text-sm text-gray-600 mt-1"><span className="font-semibold">Email:</span> {da.email || "N/A"}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b">Shipping Details:</h3>
              <p className="text-sm"><span className="font-semibold">Shipping Method:</span> Standard Delivery</p>
              <p className="text-sm"><span className="font-semibold">Expected Delivery:</span> 5-7 Business Days</p>
              <p className="text-sm"><span className="font-semibold">Place of Supply:</span> TRICHY, TAMIL NADU</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-4 overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-yellow-500 text-gray-800">
                  <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold w-8">#</th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold">Item</th>
                  <th className="border border-gray-300 px-4 py-2 text-right text-xs font-semibold w-24">MRP</th>
                  <th className="border border-gray-300 px-4 py-2 text-center text-xs font-semibold w-16">Qty</th>
                  <th className="border border-gray-300 px-4 py-2 text-right text-xs font-semibold w-32">Rate / Item</th>
                  <th className="border border-gray-300 px-4 py-2 text-right text-xs font-semibold w-36">Tax Amount (18%)</th>
                  <th className="border border-gray-300 px-4 py-2 text-right text-xs font-semibold w-32">Amount</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {itemDetails.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-1 pt-2 align-top">{index + 1}</td>
                    <td className="border border-gray-300 px-4 py-1 pt-2 align-top">
                      <div className="font-semibold mb-1 uppercase">{item.product_name || "Product"}</div>
                      {item.notes && <div className="text-xs text-gray-500 capitalize">{item.notes}</div>}
                      {item.size && <div className="text-xs text-gray-500">Size: {item.size}</div>}
                      {item.color && <div className="text-xs text-gray-500">Color: {item.color}</div>}
                    </td>
                    <td className="border border-gray-300 px-4 py-1 pt-2 text-right align-top">₹ {(item.mrp_price || 0).toFixed(2)}</td>
                    <td className="border border-gray-300 px-4 py-1 pt-2 text-center align-top">{item.quantity || 0}</td>
                    <td className="border border-gray-300 px-4 py-1 pt-2 text-right align-top">₹ {item.taxableValue.toFixed(2)}</td>
                    <td className="border border-gray-300 px-4 py-1 pt-2 text-right align-top">₹ {item.taxAmount.toFixed(2)}</td>
                    <td className="border border-gray-300 px-4 py-1 pt-2 text-right align-top font-semibold">₹ {item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total in words */}
          <div className="mb-4 bg-gray-50 p-4 rounded border border-gray-200 flex gap-2 items-center">
            <h4 className="font-semibold text-gray-800">Total amount (in words):</h4>
            <p className="text-sm italic text-gray-700">INR {numberToWords(grandTotal)}</p>
          </div>

          {/* QR + Totals */}
          <div className="flex lg:flex-row gap-8">
            <div className="flex-1">
              {firstOrder.payment_status === "pending" && firstOrder.payment_qr_code && (
                <div className="mt-4">
                  <div className="border border-gray-300 rounded-lg p-4 inline-block">
                    <h4 className="font-semibold text-gray-800 mb-3 text-center">Payment QR Code</h4>
                    <img src={firstOrder.payment_qr_code} alt="Payment QR Code" className="w-48 h-48 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-center">Scan to Pay</p>
                    <p className="text-xs text-gray-500 text-center mt-1">Use any UPI app to scan</p>
                  </div>
                </div>
              )}
            </div>
            <div className="w-[50%]">
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <table className="w-full">
                  <tbody>
                    <tr className="bg-gray-50"><td className="px-4 py-3 font-semibold">Taxable Amount</td><td className="px-4 py-3 text-right font-semibold">₹ {taxableAmount.toFixed(2)}</td></tr>
                    <tr className="border-t border-gray-300"><td className="px-4 py-3">CGST 9.0%</td><td className="px-4 py-3 text-right">₹ {cgst.toFixed(2)}</td></tr>
                    <tr className="border-t border-gray-300"><td className="px-4 py-3">SGST 9.0%</td><td className="px-4 py-3 text-right">₹ {sgst.toFixed(2)}</td></tr>
                    {firstOrder.DeliveryCharges > 0 && <tr className="border-t border-gray-300"><td className="px-4 py-3">Shipping Charges</td><td className="px-4 py-3 text-right">₹ {firstOrder.DeliveryCharges.toFixed(2)}</td></tr>}
                    <tr className="border-t border-gray-300 text-green-700"><td className="px-4 py-3">Savings</td><td className="px-4 py-3 text-right">₹ {grandSavings.toFixed(2)}</td></tr>
                    <tr className="border-t border-gray-300 bg-gray-800 text-white"><td className="px-4 py-3 font-bold">Total Amount</td><td className="px-4 py-3 text-right font-bold">₹ {grandTotal.toFixed(2)}</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-sm text-gray-600 text-center">
                <p>Total Items: {itemDetails.length}</p>
                <p>Total Quantity: {totalQuantity}</p>
              </div>
            </div>
          </div>

        </div>
        {/* ── END top content ── */}

        {/* ══════════════════════════════════════════════════════════════
            BOTTOM-PINNED SECTION
            marginTop:"auto" pushes this block to the bottom of the
            flex-column container regardless of content height above it.
            ══════════════════════════════════════════════════════════════ */}
        <div style={{ marginTop: "auto" }} className="px-6 pb-0">

          {/* Payment Status */}
          {firstOrder.payment_status === "pending" ? (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="font-semibold text-yellow-800">Payment Status: <span className="text-red-600">Pending Payment</span></p>
              <p className="text-sm text-yellow-700 mt-1">Please complete the payment to process your order</p>
            </div>
          ) : (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-semibold text-green-800">Payment Status: <span className="text-green-600">Paid</span></p>
            </div>
          )}

          {/* Seller Info + Signature */}
          <div className="pt-4 border-t border-gray-300 mb-0">
            <div className="flex justify-between items-start">
              <div className="w-2/3">
                <p className="font-bold text-md uppercase text-gray-800 mb-2">Seller information:</p>
                <table><tbody>
                  <tr><td className="font-semibold pr-2">GST NO</td><td>: 33AANCP3376Q1ZN</td></tr>
                  <tr><td className="font-semibold pr-2">PAN</td><td>: AANCP3376Q</td></tr>
                </tbody></table>
              </div>
              <div className="text-center">
                <p className="text-[10px] w-[90%] text-gray-600">For PAZHANAM DESIGNS AND CONSTRUCTIONS PRIVATE LIMITED</p>
                <img src={signatureImage} alt="Authorized Signature" className="w-24 mx-auto rotate-12" />
                <p className="font-semibold text-gray-800">Authorized Signature</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
            <p className="mb-1">MARKETED BY PAZHANAM DESIGNS AND CONSTRUCTIONS PRIVATE LIMITED</p>
            <p className="mb-1">#8 Church Colony, Tiruchirappalli, Tamil Nadu - 620017</p>
            <p className="mb-3">Email: info@printe.in | Customer-care: +91 95856 10000 | Website: www.printe.in</p>
            <div className="bg-gray-800 text-white py-2 px-4 rounded">
              Powered By{" "}<a href="https://www.dmedia.in/" className="text-white font-bold hover:underline">DMEDIA</a>
            </div>
          </div>

        </div>
        {/* ══ END BOTTOM-PINNED SECTION ══ */}

      </div>
    );
  };

  // Track order status
  const statusItems = [
    { key: "1", label: "placed" }, { key: "2", label: "design" }, { key: "3", label: "production" },
    { key: "4", label: "quality check" }, { key: "5", label: "packing" },
    { key: "6", label: "out for delivery" }, { key: "7", label: "completed" },
  ];
  const statusMapping = {
    placed: "placed", design: "designing team", production: "production team",
    "quality check": "quality_check", packing: "packing",
    "out for delivery": "out_for_delivery", completed: "completed",
  };
  const ORDER_TIME_LINE = (status) => {
    const dbStatus = statusMapping[status.toLowerCase()] || status;
    return _.get(filterOrderData, "order_delivery_timeline", []).find(t => t.order_status === dbStatus);
  };
  const completedTimelines = _.get(filterOrderData, "order_delivery_timeline", []).map(r => r.order_status);
  if (!completedTimelines.includes("placed")) completedTimelines.push("placed");
  const GET_COLOR_STATUS = (res) => {
    try { return completedTimelines.includes(statusMapping[res?.label?.toLowerCase()] || res?.label) ? "green" : "gray"; }
    catch { return "gray"; }
  };

  const ordersByInvoice = _.groupBy(
    allOrders.length > 0 ? allOrders : (filterOrderData ? [filterOrderData] : []),
    "invoice_no"
  );

  if (isLoading || !filterOrderData) return <OrderDetailsSkeleton />;

  return (
    <div className="w-full h-auto flex-1 flex gap-3 flex-col">
      <Helmet>
        <title>My Orders – Printe.in Account | Track & Manage Your Orders</title>
        <meta name="description" content="View, track, and manage your printing and gifting orders on Printe.in. Check order status, order history, invoices, and delivery updates easily." />
        <meta name="keywords" content="printe my orders, order history, track printing orders, order status printe, user orders dashboard, manage orders online" />
      </Helmet>
      <Collapse defaultActiveKey={["1"]} className="!bg-white overflow-hidden">
        <Collapse.Panel key="1" header="Invoice"
          extra={
            <Tag onClick={handleDownloadPDF} color="green" className="!flex items-center gap-x-2 !cursor-pointer hover:bg-green-100">
              {pdfLoading ? <Spin size="small" /> : <IconHelper.DOWNLOAD_ICON />}
              Download Invoice
            </Tag>
          }
        >
          <div className="w-full flex justify-center items-start overflow-auto">
            {Object.entries(ordersByInvoice).map(([invoiceNo, orders]) => renderInvoice(orders, invoiceNo))}
          </div>
        </Collapse.Panel>
        <Collapse.Panel key="2" header="Track Order Status">
          <div className="bg-white p-5">
            <h2 className="text-xl font-bold text-center mb-6">Track Order Status</h2>
            <Timeline className="text-sm" items={statusItems.map((res) => {
              const timelineEntry = ORDER_TIME_LINE(res.label);
              const createdAt = _.get(timelineEntry, "createdAt", null);
              const color = GET_COLOR_STATUS(res);
              return {
                dot: <div className={`w-3 h-3 rounded-full ${color === "green" ? "bg-green-500" : "bg-gray-300"}`} />,
                children: (
                  <div className={`pl-4 ${createdAt ? "" : "opacity-50"}`}>
                    <h3 className="font-medium capitalize text-gray-800">{res.label}</h3>
                    {createdAt && <p className="text-sm text-gray-500">{moment(createdAt).format("DD-MMM-YYYY")}</p>}
                  </div>
                ),
                color,
              };
            })} />
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Current Status:</h4>
              <p className="text-gray-600">{filterOrderData.order_status ? _.startCase(filterOrderData.order_status) : "Order placed"}</p>
            </div>
          </div>
        </Collapse.Panel>
      </Collapse>
    </div>
  );
};

export default OrderDetails;