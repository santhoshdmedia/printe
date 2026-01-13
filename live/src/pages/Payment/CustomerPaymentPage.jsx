import { useState, useEffect } from 'react';
// import { FaCreditCard, FaShoppingCart, FaMapMarkerAlt, FaReceipt, FaSpinner, FaCheckCircle } from 'lucide-react';

const CustomerPaymentPage = () => {
  // Get invoice_no from URL path
  const getInvoiceFromUrl = () => {
    const path = window.location.pathname;
    const parts = path.split('/');
    return parts[parts.length - 1];
  };

  const invoice_no = getInvoiceFromUrl();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/payment/order/invoice/${invoice_no}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Order not found');
      }

      setOrder(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setPaying(true);
    setError('');

    try {
      const paymentData = {
        amount: order.total_amount,
        order_id: order.invoice_no,
        billing_name: order.customer_name,
        billing_email: order.customer_email,
        billing_tel: order.customer_phone,
        cart_items: order.cart_items,
        delivery_address: order.delivery_address,
        delivery_charges: order.delivery_charges,
        free_delivery: order.delivery_charges === 0,
        gst_no: order.gst_no,
        subtotal: order.subtotal,
        tax_amount: order.tax_amount,
        discount_amount: order.discount_amount,
        total_amount: order.total_amount,
        payment_type: 'full',
        total_before_discount: order.subtotal + order.tax_amount + order.delivery_charges
      };

      const response = await fetch('http://localhost:8080/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to initiate payment');
      }

      // Create form and submit to CCAvenue
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.data.gateway_url;

      const encRequestInput = document.createElement('input');
      encRequestInput.type = 'hidden';
      encRequestInput.name = 'encRequest';
      encRequestInput.value = data.data.encrypted_data;
      form.appendChild(encRequestInput);

      const accessCodeInput = document.createElement('input');
      accessCodeInput.type = 'hidden';
      accessCodeInput.name = 'access_code';
      accessCodeInput.value = data.data.access_code;
      form.appendChild(accessCodeInput);

      document.body.appendChild(form);
      form.submit();

    } catch (err) {
      setError(err.message);
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {/* <FaCheckCircle className="w-8 h-8 text-red-600" /> */}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (order && order.payment_status !== 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Already Processed</h2>
          <p className="text-gray-600 mb-4">
            This order has already been {order.payment_status}.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-600 mb-1">Order Number</div>
            <div className="font-bold text-gray-900">{order.invoice_no}</div>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Complete Your Payment</h1>
          <p className="text-gray-600">Review your order details and proceed to payment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                {/* <FaMapMarkerAlt className="text-blue-600" /> */}
                Delivery Information
              </h2>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600">Customer Name</div>
                  <div className="font-medium text-gray-900">{order.customer_name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Email</div>
                  <div className="font-medium text-gray-900">{order.customer_email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Phone</div>
                  <div className="font-medium text-gray-900">{order.customer_phone}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Delivery Address</div>
                  <div className="font-medium text-gray-900">
                    {order.delivery_address.street}<br />
                    {order.delivery_address.city}, {order.delivery_address.state} {order.delivery_address.pincode}<br />
                    {order.delivery_address.country}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                {/* <FaShoppingCart className="text-blue-600" /> */}
                Order Items
              </h2>
              <div className="space-y-4">
                {order.cart_items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start py-3 border-b border-gray-200 last:border-0">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.product_name}</div>
                      <div className="text-sm text-gray-600">
                        Quantity: {item.quantity} × ₹{item.price.toFixed(2)}
                      </div>
                      {item.size && (
                        <div className="text-xs text-gray-500">Size: {item.size}</div>
                      )}
                      {item.color && (
                        <div className="text-xs text-gray-500">Color: {item.color}</div>
                      )}
                    </div>
                    <div className="font-bold text-gray-900">
                      ₹{(item.quantity * item.price).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                {/* <FaReceipt className="text-blue-600" /> */}
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoice No:</span>
                  <span className="font-medium">{order.invoice_no}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">₹{order.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (18% GST):</span>
                  <span className="font-semibold">₹{order.tax_amount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery:</span>
                  <span className="font-semibold">
                    {order.delivery_charges === 0 ? 'FREE' : `₹${order.delivery_charges.toFixed(2)}`}
                  </span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span className="font-bold">-₹{order.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                {order.gst_no && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">GST No:</span>
                    <span className="font-medium">{order.gst_no}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold text-gray-900">Total Amount:</span>
                  <span className="font-bold text-blue-600 text-2xl">
                    ₹{order.total_amount?.toFixed(2)}
                  </span>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={paying}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-bold flex items-center justify-center gap-3 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {paying ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    {/* <FaCreditCard className="w-5 h-5" /> */}
                    Proceed to Payment
                  </>
                )}
              </button>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-center gap-2 text-blue-700 text-sm">
                  <span>🔒</span>
                  <span className="font-medium">Secure Payment</span>
                  <span className="text-blue-400">•</span>
                  <span>Powered by CCAvenue</span>
                </div>
              </div>

              <div className="mt-4 text-center text-xs text-gray-500">
                By proceeding, you agree to our Terms & Conditions
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPaymentPage;