// ==================== PAYMENT PAGE COMPONENT ====================
// File: pages/CustomerPaymentPage.jsx
// This is the main payment page that shows order details and QR code

import React, { useState, useEffect } from 'react';
import { CreditCard, Package, MapPin, User, Mail, Phone, AlertCircle, Download, Share2, QrCode } from 'lucide-react';

const CustomerPaymentPage = () => {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Get invoice number from URL path
  const invoiceNo = window.location.pathname.split('/').pop();
  const API_BASE_URL =  'http://localhost:8080';

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payment/order/invoice/${invoiceNo}`);
      const data = await response.json();
      
      if (data.success) {
        setOrderData(data.data);
        
        // Redirect if already paid
        if (data.data.payment_status === 'completed') {
          window.location.href = `/payment/success?order_id=${invoiceNo}&already_paid=true`;
        }
      } else {
        setError(data.message || 'Order not found');
      }
    } catch (err) {
      setError('Failed to load order details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = () => {
    setProcessing(true);
    // Redirect to QR endpoint which will auto-submit to gateway
    window.location.href = `${API_BASE_URL}/api/payment/qr-redirect/${invoiceNo}`;
  };

  const downloadQR = () => {
    if (!orderData?.qr_code) return;
    
    const link = document.createElement('a');
    link.href = orderData.qr_code;
    link.download = `payment-qr-${invoiceNo}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sharePaymentLink = async () => {
    const paymentUrl = `${window.location.origin}/payment/${invoiceNo}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Payment Link',
          text: `Complete your payment for Order ${invoiceNo}`,
          url: paymentUrl
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(paymentUrl);
      alert('Payment link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-purple-600 mx-auto mb-6"></div>
          <p className="text-gray-700 text-xl font-semibold">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 to-pink-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full">
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-3">Order Not Found</h2>
          <p className="text-gray-600 text-center mb-8">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-red-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-600 transition transform hover:scale-105"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-t-3xl shadow-2xl p-8 border-b-4 border-purple-600">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Payment Details</h1>
              <p className="text-gray-600 text-lg">Complete your secure payment</p>
            </div>
            <CreditCard className="w-16 h-16 text-purple-600" />
          </div>
        </div>

        <div className="bg-white shadow-2xl rounded-b-3xl p-8">
          
          {/* Payment Status Alert */}
          {orderData?.payment_status === 'pending' && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-5 mb-8 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-6 h-6 text-yellow-600 mr-3" />
                <p className="text-yellow-800 font-semibold text-lg">Payment Pending - Complete to confirm order</p>
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 mb-8 border-2 border-purple-200">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Order ID</p>
                <p className="text-2xl font-bold text-gray-800">{orderData?.invoice_no}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                <p className="text-4xl font-bold text-purple-600">
                  ₹{orderData?.total_amount?.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            
            {/* Left Column - Order Details */}
            <div>
              
              {/* Customer Details */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <User className="w-6 h-6 mr-3 text-purple-600" />
                  Customer Information
                </h3>
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <div className="flex items-start">
                    <User className="w-5 h-5 mr-3 text-gray-600 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Name</p>
                      <p className="font-semibold text-gray-800 text-lg">{orderData?.customer_name}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail className="w-5 h-5 mr-3 text-gray-600 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Email</p>
                      <p className="font-semibold text-gray-800 text-lg">{orderData?.customer_email}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="w-5 h-5 mr-3 text-gray-600 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Phone</p>
                      <p className="font-semibold text-gray-800 text-lg">{orderData?.customer_phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <MapPin className="w-6 h-6 mr-3 text-purple-600" />
                  Delivery Address
                </h3>
                <div className="bg-gray-50 rounded-xl p-6">
                  <p className="text-gray-800 text-lg leading-relaxed">
                    {orderData?.delivery_address?.street}
                    {orderData?.delivery_address?.landmark && `, ${orderData.delivery_address.landmark}`}
                    <br />
                    {orderData?.delivery_address?.city}, {orderData?.delivery_address?.state} - {orderData?.delivery_address?.pincode}
                    <br />
                    {orderData?.delivery_address?.country}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <Package className="w-6 h-6 mr-3 text-purple-600" />
                  Order Items ({orderData?.cart_items?.length})
                </h3>
                <div className="space-y-4">
                  {orderData?.cart_items?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 rounded-xl p-5 hover:shadow-md transition">
                      <div className="flex items-center flex-1">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.product_name}
                            className="w-20 h-20 object-cover rounded-lg mr-5 border-2 border-gray-200"
                          />
                        )}
                        <div>
                          <p className="font-bold text-gray-800 text-lg">{item.product_name}</p>
                          <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                          {item.size && <p className="text-xs text-gray-500">Size: {item.size}</p>}
                          {item.color && <p className="text-xs text-gray-500">Color: {item.color}</p>}
                        </div>
                      </div>
                      <p className="font-bold text-purple-600 text-xl ml-4">₹{item.price?.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Price Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-700 text-lg">
                    <span>Subtotal</span>
                    <span>₹{orderData?.subtotal?.toFixed(2)}</span>
                  </div>
                  {orderData?.tax_amount > 0 && (
                    <div className="flex justify-between text-gray-700 text-lg">
                      <span>Tax (GST)</span>
                      <span>₹{orderData?.tax_amount?.toFixed(2)}</span>
                    </div>
                  )}
                  {orderData?.delivery_charges > 0 && (
                    <div className="flex justify-between text-gray-700 text-lg">
                      <span>Delivery Charges</span>
                      <span>₹{orderData?.delivery_charges?.toFixed(2)}</span>
                    </div>
                  )}
                  {orderData?.discount_amount > 0 && (
                    <div className="flex justify-between text-green-600 text-lg">
                      <span>Discount</span>
                      <span>-₹{orderData?.discount_amount?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-gray-300 pt-3 mt-3">
                    <div className="flex justify-between text-2xl font-bold text-gray-800">
                      <span>Total Amount</span>
                      <span className="text-purple-600">₹{orderData?.total_amount?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Payment Options */}
            <div>
              
              {/* QR Code Section */}
              {orderData?.qr_code && (
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 mb-6 border-2 border-purple-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                      <QrCode className="w-7 h-7 mr-3 text-purple-600" />
                      Scan to Pay
                    </h3>
                    <button
                      onClick={() => setShowQR(!showQR)}
                      className="text-purple-600 hover:text-purple-700 font-semibold"
                    >
                      {showQR ? 'Hide' : 'Show'} QR
                    </button>
                  </div>

                  {showQR && (
                    <div className="text-center">
                      <div className="bg-white p-6 rounded-2xl inline-block shadow-lg mb-6">
                        <img 
                          src={orderData.qr_code} 
                          alt="Payment QR Code"
                          className="w-64 h-64 mx-auto"
                        />
                      </div>
                      <p className="text-gray-700 mb-6 text-lg">
                        Scan this QR code with your phone camera to proceed to payment gateway
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={downloadQR}
                          className="flex-1 bg-white text-purple-600 py-3 px-6 rounded-xl font-bold hover:bg-gray-50 transition flex items-center justify-center border-2 border-purple-600"
                        >
                          <Download className="w-5 h-5 mr-2" />
                          Download QR
                        </button>
                        <button
                          onClick={sharePaymentLink}
                          className="flex-1 bg-white text-purple-600 py-3 px-6 rounded-xl font-bold hover:bg-gray-50 transition flex items-center justify-center border-2 border-purple-600"
                        >
                          <Share2 className="w-5 h-5 mr-2" />
                          Share Link
                        </button>
                      </div>
                    </div>
                  )}

                  {!showQR && (
                    <div className="text-center py-8">
                      <QrCode className="w-24 h-24 mx-auto text-purple-300 mb-4" />
                      <p className="text-gray-600">Click "Show QR" to display payment QR code</p>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Button */}
              <div className="sticky top-4">
                <button
                  onClick={handlePayNow}
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-6 rounded-2xl font-bold text-xl hover:from-purple-700 hover:to-blue-700 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center shadow-2xl"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-6 h-6 mr-3" />
                      Proceed to Payment Gateway
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-gray-500 mt-6 flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2"/>
                  </svg>
                  Secure payment powered by CCAvenue
                </p>

                {/* Trust Badges */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 font-semibold">SSL Encrypted</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 font-semibold">PCI Compliant</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 font-semibold">100% Secure</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPaymentPage;