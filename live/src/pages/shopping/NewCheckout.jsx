import { useState, useEffect } from 'react';
import { FaCreditCard, FaSpinner, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCity, FaGlobeAsia, FaMapPin, FaReceipt, FaTag } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import _ from 'lodash';
import { applyCouponCode } from '../../helper/api_helper';

import { initiateCCAvenuePayment } from './pay/utils/payment';

const NewCheckout = () => {
  const { user } = useSelector((state) => state.authSlice);
  const location = useLocation();
  const navigate = useNavigate();
  const selectedProducts = location.state?.selectedProducts || [];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [paymentOption, setPaymentOption] = useState('full');
  const [cardData, setCardData] = useState([]);
  const [gstNo, setGstNo] = useState(user?.gst_no || '');
  const [selectedAddress, setSelectedAddress] = useState(0);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const addresses = _.get(user, 'addresses', []);

  // Redirect to login if user not logged in
  useEffect(() => {
    if (!user?.name) {
      navigate('/login');
    }
  }, [user?.name, navigate]);

  // Set cart data from selected products
  useEffect(() => {
    if (selectedProducts.length > 0) {
      setCardData(selectedProducts);
    }
  }, [selectedProducts]);

  // Set form values when address changes
  useEffect(() => {
    if (addresses[selectedAddress]) {
      const address = addresses[selectedAddress];
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        phone: address.mobileNumber || user?.phone || '',
        address: address.street || '',
        city: address.city || '',
        state: address.state || '',
        pincode: address.pincode || '',
      });
    }
  }, [selectedAddress, user, addresses]);

  // Calculation functions
  const GET_SUB_TOTAL = () => {
    return _.sum(cardData.map((res) => Number(res.final_total) || 0));
  };

  const GET_TAX_TOTAL = () => {
    const subtotal = GET_SUB_TOTAL();
    const taxRate = 0.18; // 18% GST as per your example
    return subtotal * taxRate;
  };

  const get_delivery_Fee = () => {
    const freeDelivery = cardData.every((item) => item.FreeDelivery);
    return freeDelivery ? 0 : (cardData[0]?.DeliveryCharges || 0);
  };

  const GET_COUPON_DISCOUNT = () => {
    return appliedCoupon ? Number(appliedCoupon.discountAmount) : 0;
  };

  const GET_TOTAL_AMOUNT_BEFORE_DISCOUNT = () => {
    return GET_SUB_TOTAL() + GET_TAX_TOTAL() + Number(get_delivery_Fee());
  };

  const GET_TOTAL_AMOUNT = () => {
    const baseTotal = GET_TOTAL_AMOUNT_BEFORE_DISCOUNT();
    return appliedCoupon ? Math.max(0, baseTotal - GET_COUPON_DISCOUNT()) : baseTotal;
  };

  const GET_PAYABLE_AMOUNT = () => {
    const total = GET_TOTAL_AMOUNT();
    return paymentOption === 'half' ? Math.ceil(total * 0.5) : total;
  };

  // Form validation
  const validateForm = () => {
    if (cardData.length === 0) {
      setError('No products selected');
      return false;
    }

    const requiredFields = [
      { field: 'name', message: 'Please enter your name' },
      { field: 'email', message: 'Please enter a valid email address', test: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) },
      { field: 'phone', message: 'Please enter a valid 10-digit phone number', test: (val) => /^\d{10}$/.test(val.replace(/\D/g, '')) },
      { field: 'address', message: 'Please enter your address' },
      { field: 'pincode', message: 'Please enter a valid 6-digit pincode', test: (val) => /^\d{6}$/.test(val) },
    ];

    for (const { field, message, test } of requiredFields) {
      const value = formData[field]?.trim();
      if (!value) {
        setError(message);
        return false;
      }
      if (test && !test(value)) {
        setError(message);
        return false;
      }
    }

    if (!acceptTerms) {
      setError('Please accept terms and conditions');
      return false;
    }

    return true;
  };

  // Coupon functions
const handleApplyCoupon = async () => {
  if (!couponCode.trim()) {
    setCouponError('Please enter a coupon code');
    return;
  }

  try {
    setCouponLoading(true);
    setCouponError('');

    const orderAmount = GET_TOTAL_AMOUNT_BEFORE_DISCOUNT();
    const productIds = cardData.map(item => item.product_id || item._id);
    
    const couponData = {
      code: couponCode,
      orderAmount: orderAmount,
      productIds: productIds,
      userId: user?._id
    };

    const result = await applyCouponCode(couponData);
    console.log(result.data.data.coupon,"coupen");
    

    if (result.success) {
      setAppliedCoupon(result.data.data.coupon.code);
      setCouponError('');
    } else {
      throw new Error(result.message || 'Failed to apply coupon');
    }

  } catch (err) {
    console.error('Coupon application error:', err);
    setCouponError(err.message || 'Invalid coupon code');
    setAppliedCoupon(null);
  } finally {
    setCouponLoading(false);
  }
};
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  // Payment handler
  const handlePayment = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const payableAmount = GET_PAYABLE_AMOUNT();
      const orderId = `PRINTE${Date.now()}`;

      // Prepare cart items - single object as per your structure
      const cartItem = cardData[0]; // Taking first item as per your example

      // Prepare delivery address in exact format
      const deliveryAddress = {
        name: formData.name,
        email: formData.email,
        mobile_number: formData.phone,
        alternateMobileNumber: '', // You can add this field to your form if needed
        street: formData.address,
        pincode: formData.pincode
      };

      const paymentData = {
        amount: payableAmount,
        order_id: orderId,
        billing_name: formData.name,
        billing_email: formData.email,
        billing_tel: formData.phone,
        currency: 'INR',
        // Critical fields for your database
        cart_items: cartItem, // Single object, not array
        delivery_address: deliveryAddress, // Exact format
        user_id: user?._id,
        delivery_charges: get_delivery_Fee(),
        free_delivery: cardData.every(item => item.FreeDelivery),
        gst_no: gstNo || undefined
      };

      console.log('Sending payment data:', paymentData);

      await initiateCCAvenuePayment(paymentData);
    } catch (err) {
      console.error('Payment error:', err);
      setError(err?.message || 'Failed to process payment. Please try again.');
      setLoading(false);
    }
  };

  const InputField = ({ label, name, type = 'text', placeholder, icon: Icon, maxLength, ...props }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type={type}
          name={name}
          value={formData[name] || ''}
          onChange={handleInputChange}
          className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={loading}
          {...props}
        />
      </div>
    </div>
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  // Show loading state
  if (loading && cardData.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Show error if no products
  if (cardData.length === 0 && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Products Selected</h2>
          <p className="mb-4">Please add products to your cart before checkout.</p>
          <button 
            onClick={() => navigate('/cart')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Go to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your purchase securely</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Delivery Information */}
          <div className="xl:col-span-2 space-y-6">
            {/* Address Selection */}
            {addresses.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <FaUser className="text-blue-600" />
                    Select Delivery Address
                  </h2>
                  {addresses.length > 1 && (
                    <select 
                      value={selectedAddress} 
                      onChange={(e) => setSelectedAddress(Number(e.target.value))}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                      {addresses.map((addr, index) => (
                        <option key={index} value={index}>
                          Address {index + 1}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            )}

            {/* Shipping Information */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FaMapMarkerAlt className="text-blue-600" />
                Shipping Information
              </h2>

              <div className="space-y-6">
                <InputField
                  label="Full Name *"
                  name="name"
                  placeholder="John Doe"
                  icon={FaUser}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Email Address *"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    icon={FaEnvelope}
                  />

                  <InputField
                    label="Phone Number *"
                    name="phone"
                    type="tel"
                    placeholder="9876543210"
                    maxLength={10}
                    icon={FaPhone}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complete Address (Street, City, State) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-start pt-3 pointer-events-none">
                      <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      name="address"
                      value={formData.address || ''}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                      placeholder="Street, City, State"
                      rows={3}
                      disabled={loading}
                    />
                  </div>
                </div>

                <InputField
                  label="Pincode *"
                  name="pincode"
                  placeholder="400001"
                  maxLength={6}
                  icon={FaMapPin}
                />
              </div>
            </div>

            {/* Coupon Code Section */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaTag className="text-green-600" />
                Apply Coupon Code
              </h2>
              
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      setCouponError('');
                    }}
                    placeholder="Enter coupon code"
                    disabled={!!appliedCoupon || couponLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
                  />
                </div>
                {!appliedCoupon ? (
                  <button
                    onClick={handleApplyCoupon}
                    disabled={!couponCode.trim() || couponLoading}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                  >
                    {couponLoading ? 'Applying...' : 'Apply'}
                  </button>
                ) : (
                  <button
                    onClick={handleRemoveCoupon}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              {couponError && (
                <div className="mt-2 text-red-600 text-sm">{couponError}</div>
              )}
              
              {appliedCoupon && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium text-green-700">Coupon Applied: {appliedCoupon.code}</span>
                      <div className="text-sm text-green-600">
                        {appliedCoupon.discountType === 'percentage' 
                          ? `${appliedCoupon.discountValue}% off` 
                          : `₹${appliedCoupon.discountValue} off`
                        }
                      </div>
                    </div>
                    <div className="text-green-700 font-bold">
                      -₹{Number(appliedCoupon.discountAmount).toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* GST Information */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaReceipt className="text-purple-600" />
                GST Information (Optional)
              </h2>
              
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={gstNo}
                    onChange={(e) => setGstNo(e.target.value)}
                    placeholder="Enter GSTIN number"
                    maxLength={15}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
              
              {gstNo && gstNo.length !== 15 && (
                <div className="mt-2 text-red-600 text-sm">
                  GST number must be exactly 15 characters long.
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary & Payment */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

              {/* Order Items */}
              <div className="space-y-4 mb-6">
                {cardData.map((item) => (
                  <div key={item._id} className="flex items-center gap-4 py-3 border-b border-gray-200">
                    <img 
                      src={item.product_image} 
                      alt={item.product_name}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = '/placeholder-product.jpg';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.product_name}</h3>
                      <p className="text-sm text-gray-600">Qty: {item.product_quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{Number(item.final_total).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal ({cardData.length} items):</span>
                  <span className="font-semibold">₹{GET_SUB_TOTAL().toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Taxes (18% GST):</span>
                  <span className="font-semibold">₹{GET_TAX_TOTAL().toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Delivery charges:</span>
                  <span className="font-semibold">₹{get_delivery_Fee().toFixed(2)}</span>
                </div>
                
                {appliedCoupon && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>Discount ({appliedCoupon.code}):</span>
                    <span className="font-bold">-₹{GET_COUPON_DISCOUNT().toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Order Total:</span>
                    <span className="text-blue-600">₹{GET_TOTAL_AMOUNT().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Options */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Options</h2>
              
              <div className="space-y-3 mb-6">
                <label className="flex items-start gap-3 p-4 border border-yellow-500 rounded-lg bg-yellow-50 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentOption"
                    value="full"
                    checked={paymentOption === 'full'}
                    onChange={(e) => setPaymentOption(e.target.value)}
                    className="mt-1 text-yellow-600 focus:ring-yellow-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium flex justify-between">
                      <span>Full Payment</span>
                      <span className="font-bold">₹{GET_TOTAL_AMOUNT().toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Pay the full amount now</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg hover:border-yellow-500 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentOption"
                    value="half"
                    checked={paymentOption === 'half'}
                    onChange={(e) => setPaymentOption(e.target.value)}
                    className="mt-1 text-yellow-600 focus:ring-yellow-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium flex justify-between">
                      <span>50% Advance Payment</span>
                      <span className="font-bold">₹{(GET_TOTAL_AMOUNT() * 0.5).toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Pay half now, rest before production</p>
                  </div>
                </label>
              </div>

              {/* Terms and Conditions */}
              <div className="mb-6">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-1 text-yellow-600 focus:ring-yellow-500 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the{' '}
                    <a href="/terms" className="text-blue-600 hover:text-yellow-500 underline">
                      Terms and Conditions
                    </a>
                  </span>
                </label>
              </div>

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={loading || !acceptTerms || cardData.length === 0}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white py-4 px-6 rounded-xl hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 font-bold flex items-center justify-center gap-3 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transform hover:scale-[1.02] disabled:scale-100 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <FaSpinner className="w-5 h-5 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <FaCreditCard className="w-5 h-5" />
                    {paymentOption === 'full' 
                      ? `Pay ₹${GET_PAYABLE_AMOUNT().toFixed(2)}` 
                      : `Pay 50% Advance ₹${GET_PAYABLE_AMOUNT().toFixed(2)}`
                    }
                  </>
                )}
              </button>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-center gap-2 text-blue-700">
                  <div className="flex items-center gap-1 text-sm">
                    <span>🔒</span>
                    <span className="font-medium">Secure Payment</span>
                  </div>
                  <span className="text-blue-400">•</span>
                  <span className="text-sm">Powered by CCAvenue</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewCheckout;