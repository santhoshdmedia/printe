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

// At the top of your file with other imports
import signatureImage from "../../../src/assets/logo/signature.png";

const OrderDetails = () => {
  // State
  const [subtotal, setSubtotal] = useState(0);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [allOrders, setAllOrders] = useState([]);
  const pdfContainerRef = useRef(null);

  // Config
  const { order_id } = useParams();
  const dispatch = useDispatch();

  // Redux
  const { my_orders, order_details } = useSelector((state) => state.authSlice);

  // Mount
  useEffect(() => {
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
    let filterOrderData = my_orders.data.find((order) => order._id === order_id);
    if (!filterOrderData) {
      filterOrderData = order_details.data;
    }
    if (filterOrderData && filterOrderData.cart_items) {
      // Fixed: Access cart_items instead of products
      const price = parseFloat(filterOrderData.cart_items.product_price) || 0;
      const quantity = parseFloat(filterOrderData.cart_items.product_quantity) || 1;
      setSubtotal(price * quantity);
    } else {
      setSubtotal(0);
    }
    console.log(filterOrderData,"forder");
    
  }, [my_orders.data, order_id, order_details.data]);

  // Render data
  const filterOrderData =
    my_orders.data.find((order) => order._id === order_id) ||
    order_details.data;

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const pdf = new jsPDF("p", "pt", "a4");
      const options = {
        scale: 2,
        useCORS: true,
        logging: true,
        allowTaint: false,
        backgroundColor: "#FFFFFF",
      };

      const ordersToExport = allOrders.length > 0 ? allOrders : [filterOrderData];
      
      // Group orders by invoice_no
      const ordersByInvoice = _.groupBy(ordersToExport, 'invoice_no');
      
      let pageCount = 0;
      
      // Create a temporary container for PDF generation
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '794px';
      tempContainer.style.fontFamily = 'Arial, sans-serif';
      document.body.appendChild(tempContainer);
      
      // Process each unique invoice
      for (const [invoiceNo, orders] of Object.entries(ordersByInvoice)) {
        // Create invoice content
        const invoiceElement = document.createElement('div');
        invoiceElement.innerHTML = generateInvoiceHTML(orders, invoiceNo);
        tempContainer.appendChild(invoiceElement);
        
        const invoiceCanvas = await html2canvas(invoiceElement, options);
        const invoiceImgData = invoiceCanvas.toDataURL("image/png");
        const invoiceImgWidth = pdf.internal.pageSize.getWidth() - 40;
        const invoiceImgHeight = (invoiceCanvas.height * invoiceImgWidth) / invoiceCanvas.width;

        if (pageCount > 0) pdf.addPage();
        pdf.addImage(invoiceImgData, "PNG", 20, 20, invoiceImgWidth, invoiceImgHeight);
        pageCount++;
        
        // Create T&C content with footer at the bottom
        const tncElement = document.createElement('div');
        tncElement.innerHTML = generateTncHTML(orders[0], invoiceNo);
        tempContainer.appendChild(tncElement);
        
        const tncCanvas = await html2canvas(tncElement, options);
        const tncImgData = tncCanvas.toDataURL("image/png");
        const tncImgWidth = pdf.internal.pageSize.getWidth() - 40;
        const tncImgHeight = (tncCanvas.height * tncImgWidth) / tncCanvas.width;
        
        pdf.addPage();
        pdf.addImage(tncImgData, "PNG", 20, 20, tncImgWidth, tncImgHeight);
        pageCount++;
        
        // Clean up
        tempContainer.removeChild(invoiceElement);
        tempContainer.removeChild(tncElement);
      }
      
      document.body.removeChild(tempContainer);

      const fileName = `Invoice_${_.get(filterOrderData, "invoice_no", "order")}.pdf`;
      pdf.save(fileName);
      message.success("PDF downloaded successfully");
    } catch (error) {
      console.error("PDF generation error:", error);
      message.error("Failed to generate PDF. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  // Helper function to generate invoice HTML with correct data
  const generateInvoiceHTML = (orders, invoiceNo) => {
    // Calculate subtotal and grand total from actual data
    const subtotal = _.sumBy(orders, order => {
      const price = parseFloat(order.cart_items?.product_price) || 0;
      const quantity = parseFloat(order.cart_items?.product_quantity) || 1;
      return price * quantity;
    });
    
    const grandTotal = _.sumBy(orders, order => 
      parseFloat(order.cart_items?.final_total) || 0
    );
    
    const firstOrder = orders[0];
    
    // Calculate tax if needed (from your data: sgst: "9", cgst: "9")
    const taxAmount = _.sumBy(orders, order => {
      const price = parseFloat(order.cart_items?.product_price) || 0;
      const quantity = parseFloat(order.cart_items?.product_quantity) || 1;
      const sgst = parseFloat(order.cart_items?.sgst) || 0;
      const cgst = parseFloat(order.cart_items?.cgst) || 0;
      return (price * quantity * (sgst + cgst)) / 100;
    });
    
    // Get payment status information
    let paymentStatusHTML = '';
    if (firstOrder.payment_status === "completed" || firstOrder.payment_status === "fully_paid") {
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

    // Get variant information
    const variant = firstOrder.cart_items?.product_variants?.[0] || {};
    const mrpPrice = parseFloat(variant.MRP_price) || parseFloat(firstOrder.cart_items?.product_price) || 0;
    const customerPrice = parseFloat(variant.customer_product_price) || parseFloat(firstOrder.cart_items?.product_price) || 0;
    
    return `
      <div class="w-full pb-2" style="font-family: Arial, sans-serif; position: relative; min-height: 1120px; width: 794px;">
        <div class="w-full rounded mb-2">
          <div class="flex justify-between items-start">
            <div className="text-start">
              <h2 style="font-size:2.2rem;"><b>Printe</b></h2>
              
              <!-- GSTIN and PAN in a simple row without flex gap -->
              <div className="flex" style="margin-bottom: 2px;display: flex; gap: 20px;">
                <p className="text-sm mr-5"><b>GSTIN :</b> 33AANCP3376Q1ZN</p>
                <p className="text-sm"><b>PAN :</b> AANCP3376Q</p>
              </div>
              
              <!-- Address section -->
              <div style="margin-bottom: 2px;">
                <p className="text-[0.8rem]">#6 Church Colony,</p>
                <p className="text-[0.8rem]">Tiruchirappalli</p>
                <p className="text-[0.8rem]">Tamil Nadu 620017</p>
              </div>

              <!-- Contact info - simpler layout -->
              <div style="display: flex; gap:20px;">
                <p className="text-sm mb-1"><b>Mobile :</b> <a href="tel:+919585610000" className="text-sm">+91 95856 10000</a></p>
                <p className="text-sm mb-1"><b>Email :</b> <a href="mailto:info@printe.in" className="text-sm">info@printe.in</a></p>
                <p className="text-sm mb-1"><b>Website :</b> <a href="https://www.printe.in" className="text-sm">www.printe.in</a></p>
              </div>
            </div>

            <img src="${ImageHelper.without_bg}" alt="Company Logo" class="h-16" crossOrigin="anonymous" />
          </div>
        </div>

        <div class="flex flex-wrap justify-between mb-2">
          <div class="w-full">
            <h2 class="text-lg font-bold text-gray-800 mb-1">Order Information</h2>
            <div class="rounded" style="display: flex; gap: 20px;">
              <p><span class="text-sm"><b>INVOICE:</b></span> ${invoiceNo}</p>
              <p><span class="text-sm"><b>Order Date:</b></span> ${moment(firstOrder.createdAt).format("DD-MMM-yyyy")}</p>
              <p><span class="text-sm"><b>Payment Method:</b></span> ${firstOrder.payment_type}</p>
              ${firstOrder.payment_id ? `<p><span class="text-sm"><b>Payment ID:</b></span> ${firstOrder.payment_id}</p>` : ''}
            </div>
          </div>
        </div>

        <div class="flex flex-wrap mb-6" style="gap:10rem;">
          <div className="">
            <h2 className="font-bold text-gray-800" style="font-weight: 700; font-size: 1.125rem; line-height: 1.75rem;">
              Customer Details
            </h2>
            <p className="font-semibold">${firstOrder.delivery_address?.name || ''}</p>
          </div>

          <div class="text-start">
            <h2 class="text-lg font-bold text-gray-800">Billing Address</h2>
            <div class="rounded">
              <p>${firstOrder.delivery_address?.name || ''}</p>
              <p>${firstOrder.delivery_address?.street_address || ''}</p>
              <p>${firstOrder.delivery_address?.pincode || ''}</p>
              <p>Phone: ${firstOrder.delivery_address?.mobile_number || ''}</p>
              ${firstOrder.delivery_address?.Alternate_mobile_number ? `<p>Alt Phone: ${firstOrder.delivery_address?.Alternate_mobile_number}</p>` : ''}
            </div>
          </div>
        </div>

        <h2 class="text-xl font-bold text-gray-800 mb-2 border-b pb-4">Order Summary</h2>

        <div class="mb-2 overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-100">
                <th class="p-[0.5rem] text-left border bg-[#f2c41a]">Order ID</th>
                <th class="p-[0.5rem] text-left border bg-[#f2c41a]">Product Name</th>
                <th class="p-[0.5rem] text-center border bg-[#f2c41a]">Price</th>
                <th class="p-[0.5rem] text-center border bg-[#f2c41a]">Qty</th>
                <th class="p-[0.5rem] text-center border bg-[#f2c41a]">Total</th>
              </tr>
            </thead>
            <tbody>
              ${orders.map(order => {
                const price = parseFloat(order.cart_items?.product_price) || 0;
                const quantity = parseFloat(order.cart_items?.product_quantity) || 1;
                const total = price * quantity;
                
                return `
                  <tr key="${order._id}" class="border-b">
                    <td class="p-[0.5rem] border">${order._id}</td>
                    <td class="p-[0.5rem] border">
                      <div class="flex flex-col gap-y-1">
                        <p class="font-semibold">${order.cart_items?.product_name || ''}</p>
                        <p class="text-xs text-gray-500">${order.cart_items?.category_name || ''} - ${order.cart_items?.subcategory_name || ''}</p>
                        ${variant.Colour ? `<p class="text-xs text-gray-500">Color: ${variant.Colour}</p>` : ''}
                      </div>
                    </td>
                    <td class="p-[0.5rem] text-center border">₹${price.toFixed(2)}</td>
                    <td class="p-[0.5rem] text-center border">${quantity}</td>
                    <td class="p-[0.5rem] text-center border">₹ ${total.toFixed(2)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <h2 class="text-xl font-bold text-gray-800 mb-3 border-b pb-2 mt-[0.5rem]">Payment Summary</h2>

        <div class="mb-6 overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-100">
                <th class="p-[0.5rem] text-left border bg-[#f2c41a]" style="padding:0.8rem; text-align: left;">Description</th>
                <th class="p-[0.5rem] text-center border bg-[#f2c41a]" style="padding:0.8rem; text-align: left;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b">
                <td class="p-[0.5rem] border font-semibold">Subtotal</td>
                <td class="p-[0.5rem] text-center border">₹ ${subtotal.toFixed(2)}</td>
              </tr>
              <tr class="border-b">
                <td class="p-[0.5rem] border font-semibold">Shipping</td>
                <td class="p-[0.5rem] text-center border">₹ ${firstOrder.cart_items?.FreeDelivery ? '0.00' : (parseFloat(firstOrder.cart_items?.DeliveryCharges) || 0).toFixed(2)}</td>
              </tr>
              <tr class="border-b">
                <td class="p-[0.5rem] border font-semibold">Tax (GST)</td>
                <td class="p-[0.5rem] text-center border">₹ ${taxAmount.toFixed(2)}</td>
              </tr>
              ${mrpPrice > customerPrice ? `
                <tr class="border-b">
                  <td class="p-[0.5rem] border font-semibold">Discount</td>
                  <td class="p-[0.5rem] text-center border text-green-600">-₹ ${(mrpPrice - customerPrice).toFixed(2)}</td>
                </tr>
              ` : ''}
              <tr class="border-b">
                <td class="p-[0.5rem] border font-bold">Grand Total</td>
                <td class="p-[0.5rem] text-center border font-bold text-orange-600">
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
            <img src="${signatureImage}" alt="signature" style="width:100px;height:100px;" crossOrigin="anonymous" />
            <p class="text-lg" style="font-weight:700;">Authorized Signature</p>
          </div>
        </div>

        <!-- Footer section positioned at the bottom of the T&C page -->
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

  // Helper function to generate T&C HTML with footer at the bottom
  const generateTncHTML = (order, invoiceNo) => {
    return `
      <div class="w-full mx-auto px-4 pb-4 bg-white" style="width: 794px; font-family: Arial, sans-serif; position: relative; min-height: 1123px;">
        <div class="w-full bg-[#f2c41a] p-1 mb-5 rounded">
          <h3 class="text-lg font-bold mb-4 text-center">Terms & Conditions</h3>
        </div>

        <div class="mt-2 pt-2 text-sm text-gray-600">
          <ul class="list-disc list-inside leading-relaxed space-y-2">
            <li>All sales are final and non-refundable.</li>
            <li>Goods once sold cannot be returned or exchanged.</li>
            <li>Warranty, if applicable, is provided by the manufacturer.</li>
            <li>Please retain this invoice for future reference.</li>
            <li>Any disputes are subject to the jurisdiction of Tiruchirappalli courts.</li>
            <li>Prices are inclusive of all taxes unless specified otherwise.</li>
            <li>Delivery timelines are estimates and not guaranteed.</li>
            <li>Product images are for representation purposes only.</li>
            <li>We reserve the right to cancel any order without prior notice.</li>
            <li>Installation services are provided where mentioned explicitly.</li>
          </ul>
          
          <!-- Footer section positioned at the bottom of the T&C page -->
          <div style="position: absolute; bottom: 17px; left: 0; right: 0;">
            <div class="mt-4 pt-2 border-t text-sm text-gray-500 bg-white p-4" style="width: 800px; font-family: Arial, sans-serif;">
              <div class="text-center mb-3">
                <p>Thank you for your business!</p>
              </div>

              <div class="w-full text-white flex justify-between bg-[#444444] h-10 px-4 rounded" style="align-items:baseline;">
                <span><p className="text-sm mb-1"> <a href="mailto:info@printe.in" className="text-sm">info@printe.in</a></p></span>
                <span>Powerd By <a href="https://www.dmedia.in/" className="text-sm" style="color: white; text-decoration: underline;"><b>DMEDIA</b></a></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const renderInvoice = (orders, invoiceNo) => {
    const subtotal = _.sumBy(orders, order => {
      const price = parseFloat(order.cart_items?.product_price) || 0;
      const quantity = parseFloat(order.cart_items?.product_quantity) || 1;
      return price * quantity;
    });
    
    const grandTotal = _.sumBy(orders, order => 
      parseFloat(order.cart_items?.final_total) || 0
    );
    
    const firstOrder = orders[0];
    const variant = firstOrder.cart_items?.product_variants?.[0] || {};
    
    // Calculate tax
    const taxAmount = _.sumBy(orders, order => {
      const price = parseFloat(order.cart_items?.product_price) || 0;
      const quantity = parseFloat(order.cart_items?.product_quantity) || 1;
      const sgst = parseFloat(order.cart_items?.sgst) || 0;
      const cgst = parseFloat(order.cart_items?.cgst) || 0;
      return (price * quantity * (sgst + cgst)) / 100;
    });
    
    // Get payment status information
    let paymentStatusJSX = null;
    if (firstOrder.payment_status === "completed" || firstOrder.payment_status === "fully_paid") {
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
      <div key={invoiceNo} className="w-full mx-auto px-4 pb-4 !font-billfont bg-white mb-5" style={{ width: "794px" }}>
        {/* Header */}
        <div className="w-full mb-4 rounded">
          <div className="flex justify-between items-start">
            <div className="text-start">
              <h2 className="text-2xl font-bold items-start">Printe</h2>
              <div className="flex gap-5">
                <p className="text-sm"><b>GSTIN :</b> 33AANCP3376Q1ZN</p>
                <p className="text-sm"><b>PAN :</b> AANCP3376Q</p>
              </div>
              
              <p className="text-[0.8rem]">#6 Church Colony,</p>
              <p className="text-[0.8rem]">Tiruchirappalli</p>
              <p className="text-[0.8rem]">Tamil Nadu 620017</p>

              <div className="flex gap-5 justify-center items-baseline">
                <p className="text-sm"><b>Mobile :</b> <a href="tel:+919585610000" className="text-sm">+91 95856 10000</a></p>
                <p className="text-sm"><b>Email :</b> <a href="mailto:info@printe.in" className="text-sm">info@printe.in</a></p>
                <p className="text-sm"><b>Website :</b> <a href="https://www.printe.in" className="text-sm">www.printe.in</a></p>
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
        <div className="flex flex-wrap justify-between mb-6">
          <div className="w-full mb-4 ">
            <h2 className="text-[1.1rem] font-bold text-gray-800 ">
              Order Information
            </h2>
            <div className="flex rounded justify-between items-center">
              <p>
                <span className="text-sm"><b>INVOICE NO:</b></span> {invoiceNo}
              </p>
              <p>
                <span className="text-sm"><b>Order Date:</b></span>{" "}
                {moment(firstOrder.createdAt).format("DD-MMM-yyyy")}
              </p>
              <p>
                <span className="text-sm"><b>Payment Method:</b></span>{" "}
                {firstOrder.payment_type}
              </p>
              {firstOrder.payment_id && (
                <p>
                  <span className="text-sm"><b>Payment ID:</b></span>{" "}
                  {firstOrder.payment_id}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="w-full flex gap-[11rem] items-baseline">
          <div className="">
            <h2 className="text-lg font-bold text-gray-800">
              Customer Details
            </h2>
            <p className="font-semibold">{firstOrder.delivery_address?.name}</p>
          </div>
          
          <div className="rounded">
            <h2 className="text-lg font-bold text-gray-800">
              Billing Address
            </h2>
            <p className="font-semibold">{firstOrder.delivery_address?.name}</p>
            <p>{firstOrder.delivery_address?.street_address}</p>
            <p>{firstOrder.delivery_address?.pincode}</p>
            <p>Phone: {firstOrder.delivery_address?.mobile_number}</p>
            {firstOrder.delivery_address?.Alternate_mobile_number && (
              <p>Alt Phone: {firstOrder.delivery_address?.Alternate_mobile_number}</p>
            )}
          </div>
        </div>
        
        {/* Order Summary */}
        <h2 className="text-[1.1rem] font-bold text-gray-800 mb-2 border-b pb-1">
          Order Summary
        </h2>

        {/* Product Table */}
        <div className="mb-2 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-1 text-left border bg-[#f2c41a]">Order ID</th>
                <th className="p-1 text-left border bg-[#f2c41a]">Product Name</th>
                <th className="p-1 text-center border bg-[#f2c41a]">Price</th>
                <th className="p-1 text-center border bg-[#f2c41a]">Qty</th>
                <th className="p-1 text-center border bg-[#f2c41a]">Total</th>
              </tr>
            </thead>
            <tbody className="text-[0.8rem]">
              {orders.map((order) => {
                const price = parseFloat(order.cart_items?.product_price) || 0;
                const quantity = parseFloat(order.cart_items?.product_quantity) || 1;
                const total = price * quantity;
                
                return (
                  <tr key={order._id} className="border-b">
                    <td className="p-1 border">{order._id}</td>
                    <td className="p-1 border">
                      <div className="flex flex-col gap-y-1">
                        <p className="font-semibold">
                          {order.cart_items?.product_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.cart_items?.category_name} - {order.cart_items?.subcategory_name}
                        </p>
                        {variant.Colour && (
                          <p className="text-xs text-gray-500">Color: {variant.Colour}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-1 text-center border">
                      ₹ {price.toFixed(2)}
                    </td>
                    <td className="p-1 text-center border">
                      {quantity}
                    </td>
                    <td className="p-1 text-center border">
                      ₹ {total.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Payment Summary */}
        <h2 className="text-[1.1rem] font-bold text-gray-800 mb-2 border-b pb-1">
          Payment Summary
        </h2>

        {/* Payment Table */}
        <div className="mb-6 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-1 text-left border bg-[#f2c41a]">Description</th>
                <th className="p-1 text-center border bg-[#f2c41a]">Amount</th>
              </tr>
            </thead>
            <tbody className="text-[0.8rem]">
              <tr className="border-b">
                <td className="p-1 border font-semibold">Subtotal</td>
                <td className="p-1 text-center border">₹ {subtotal.toFixed(2)}</td>
              </tr>
              <tr className="border-b">
                <td className="p-1 border font-semibold">Shipping</td>
                <td className="p-1 text-center border">
                  ₹ {firstOrder.cart_items?.FreeDelivery ? '0.00' : (parseFloat(firstOrder.cart_items?.DeliveryCharges) || 0).toFixed(2)}
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-1 border font-semibold">Tax (GST)</td>
                <td className="p-1 text-center border">₹ {taxAmount.toFixed(2)}</td>
              </tr>
              {parseFloat(variant.MRP_price) > parseFloat(variant.customer_product_price) && (
                <tr className="border-b">
                  <td className="p-1 border font-semibold">Discount</td>
                  <td className="p-1 text-center border text-green-600">
                    -₹ {(parseFloat(variant.MRP_price) - parseFloat(variant.customer_product_price)).toFixed(2)}
                  </td>
                </tr>
              )}
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

  // Track order status functionality (unchanged)
  const items = [
    { key: "1", label: "placed" },
    { key: "2", label: "design" },
    { key: "3", label: "production" },
    { key: "4", label: "quality check" },
    { key: "5", label: "packing" },
    { key: "6", label: "out for delivery" },
    { key: "7", label: "completed" },
  ];
  
  const statusMapping = {
    "placed": "placed",
    "design": "designing team",
    "production": "production team",
    "quality check": "quality_check",
    "packing": "packing",
    "out for delivery": "out_for_delivery",
    "completed": "completed"
  };

  const ORDER_TIME_LINE = (status) => {
    const dbStatus = statusMapping[status.toLowerCase()] || status;
    const orderTimeline = _.get(filterOrderData, "order_delivery_timeline", []);
    return orderTimeline.find((timeline) => 
      timeline.order_status === dbStatus
    );
  };

  let completed_timelines = _.get(filterOrderData, "order_delivery_timeline", []).map((res) => {
    return res.order_status;
  });

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
    allOrders.length > 0 ? allOrders : [filterOrderData], 
    'invoice_no'
  );

  return (
    <div className="w-full h-auto flex-1 flex gap-3 flex-col">
      {order_details.loading ? (
        <OrderDetailsSkeleton />
      ) : (
        <div>
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
                  {pdfLoading ? <Spin size="small" /> : <IconHelper.DOWNLOAD_ICON />}
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
                        <div className={`${createdAt ? "" : "grayscale"} !h-[50px] !font-primary_font !text-[16px] capitalize pb-2`}>
                          <h1> {res.label}</h1>
                          <h1 className="text-black !text-[12px]">{createdAt ? moment(createdAt).format("DD-MMM-yyyy") : ""}</h1>
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
                  <Tooltip title={_.get(filterOrderData, "cart_items.product_design_file", "")}>
                    <span className="line-clamp-1 text-slate-600 overflow-clip">{_.get(filterOrderData, "cart_items.product_design_file", "")}</span>
                  </Tooltip>
                  ...
                </Tag>
                <div className="pt-3">
                  <a href={_.get(filterOrderData, "cart_items.product_design_file", "")} target="_blank" className=" !my-2 text-sm text-blue-500">
                    Download
                  </a>
                </div>
              </div>
            </Collapse.Panel>
          </Collapse>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;