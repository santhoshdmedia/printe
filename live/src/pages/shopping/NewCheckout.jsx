import { useState, useEffect, useRef } from 'react';
import { FaCreditCard, FaSpinner, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCity, FaGlobeAsia, FaMapPin, FaTag, FaReceipt } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import _ from 'lodash';

import { initiateCCAvenuePayment } from './pay/utils/payment';

const NewCheckout = () => {
  const { user } = useSelector((state) => state.authSlice);
  const location = useLocation();
  const navigate = useNavigate();
  const selectedProducts = location.state?.selectedProducts || [];

  // State declarations
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [paymentOption, setPaymentOption] = useState('full');
  const [cardData, setCardData] = useState([]);
  const [gstRate, setGstRate] = useState(0);
  const [isEditable, setIsEditable] = useState(false);
  const [gstNo, setGstNo] = useState(user.gst_no || '');
  const [selectedAddress, setSelectedAddress] = useState(0);

  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const addresses = _.get(user, 'addresses', []);
  const gstin_ref = useRef();

  // Redirect to login if user not logged in
  useEffect(() => {
    if (!user.name) {
      navigate('/login');
    }
  }, [user.name, navigate]);

  // Fetch cart data (mock function - replace with actual API call)
  const fetchCartData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockCartData = selectedProducts.length > 0 ? selectedProducts : [
        {
          _id: '1',
          product_name: 'Sample Product',
          product_image: '/sample.jpg',
          product_price: 500,
          final_total: 500,
          product_quantity: 1,
          MRP_savings: 100,
          TotalSavings: 50,
          FreeDelivery: true,
          DeliveryCharges: 0,
          sgst: 9,
          cgst: 9,
        }
      ];
      setCardData(mockCartData);
      
      // Calculate GST rate from first item
      const gst = Number(_.get(mockCartData, '[0].sgst', 0)) * 2;
      setGstRate(gst / 100);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Failed to load cart data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartData();
  }, []);

  // Set form values when address changes
  useEffect(() => {
    if (addresses[selectedAddress]) {
      const address = addresses[selectedAddress];
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: address.mobileNumber || '',
        address: `${address.street}, ${address.city}, ${address.state}`,
        city: address.city || '',
        state: address.state || '',
        pincode: address.pincode || '',
      });
    }
  }, [selectedAddress, user, addresses]);

  // Calculation functions
  const GET_SUB_TOTAL = () => {
    return _.sum(cardData.map((res) => Number(res.final_total)));
  };

  const GET_TAX_TOTAL = () => {
    return _.sum(cardData.map((res) => Number(res.final_total) * gstRate));
  };

  const GET_MRP_savings = () => {
    return _.sum(cardData.map((res) => Number(res.MRP_savings)));
  };

  const GET_additonal_savings = () => {
    return _.sum(cardData.map((res) => Number(res.TotalSavings)));
  };

  const GET_COUPON_DISCOUNT = () => {
    return appliedCoupon && appliedCoupon.discountAmount ? Number(appliedCoupon.discountAmount) : 0;
  };

  const GET_TOTAL_SAVINGS = () => {
    return GET_MRP_savings() + GET_additonal_savings() + GET_COUPON_DISCOUNT();
  };

  const get_delivery_Fee = () => {
    const freeDelivery = cardData.every((item) => item.FreeDelivery);
    if (freeDelivery) return 0;
    
    return cardData.reduce((total, item) => {
      return total + (item.FreeDelivery ? 0 : item.DeliveryCharges);
    }, 0);
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
    const requiredFields = [
      { field: 'name', message: 'Please enter your name' },
      { field: 'email', message: 'Please enter a valid email address', test: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) },
      { field: 'phone', message: 'Please enter a valid 10-digit phone number', test: (val) => /^\d{10}$/.test(val.replace(/\D/g, '')) },
      { field: 'address', message: 'Please enter your address' },
      { field: 'city', message: 'Please enter your city' },
      { field: 'state', message: 'Please enter your state' },
      { field: 'pincode', message: 'Please enter a valid 6-digit pincode', test: (val) => /^\d{6}$/.test(val) },
    ];

    for (const { field, message, test } of requiredFields) {
      const value = formData[field].trim();
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

    if (gstNo && gstNo.length !== 15) {
      setError('Please enter a valid GST Number (15 characters)');
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

      // Mock coupon application - replace with actual API call
      const mockCoupon = {
        code: couponCode.toUpperCase(),
        discountAmount: 100,
        discountType: 'fixed',
        discountValue: 100
      };
      
      setAppliedCoupon(mockCoupon);
      setCouponError('');

    } catch (err) {
      setCouponError('Invalid coupon code');
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
      const orderId = `ORD_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

      const paymentData = {
        amount: payableAmount,
        order_id: orderId,
        billing_name: formData.name,
        billing_email: formData.email,
        billing_tel: formData.phone,
        billing_address: formData.address,
        billing_city: formData.city,
        billing_state: formData.state,
        billing_zip: formData.pincode,
        billing_country: 'India',
        delivery_name: formData.name,
        delivery_address: formData.address,
        delivery_city: formData.city,
        delivery_state: formData.state,
        delivery_zip: formData.pincode,
        delivery_country: 'India',
        delivery_tel: formData.phone,
        currency: 'INR',
      };

      const result=await initiateCCAvenuePayment(paymentData);
      console.log(result,"payment");
      
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
          value={formData[name]}
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

  const handleEditGST = () => {
    setIsEditable(!isEditable);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your purchase securely</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Delivery and Additional Information */}
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
                    Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-start pt-3 pointer-events-none">
                      <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                      placeholder="Street address"
                      rows={3}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InputField
                    label="City *"
                    name="city"
                    placeholder="Mumbai"
                    icon={FaCity}
                  />

                  <InputField
                    label="State *"
                    name="state"
                    placeholder="Maharashtra"
                    icon={FaGlobeAsia}
                  />

                  <InputField
                    label="Pincode *"
                    name="pincode"
                    placeholder="400001"
                    maxLength={6}
                    icon={FaMapPin}
                  />
                </div>
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
                    ref={gstin_ref}
                    type="text"
                    value={gstNo}
                    onChange={(e) => setGstNo(e.target.value)}
                    placeholder="Enter GSTIN number"
                    disabled={!isEditable}
                    maxLength={15}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
                  />
                </div>
                <button
                  onClick={handleEditGST}
                  className={`px-6 py-3 rounded-lg font-medium ${
                    isEditable 
                      ? 'bg-purple-600 text-white hover:bg-purple-700' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {isEditable ? 'Save' : 'Edit'}
                </button>
                {isEditable && (
                  <button
                    onClick={() => setIsEditable(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    I don't have GSTIN
                  </button>
                )}
              </div>
              
              {gstNo && gstNo.length !== 15 && (
                <div className="mt-2 text-red-600 text-sm">
                  GST number must be exactly 15 characters long.
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-pulse">
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
                  <span className="text-gray-600">
                    Taxes (including SGST & CGST {(gstRate * 100).toFixed(1)}%):
                  </span>
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

              {/* Savings Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-bold text-gray-900 mb-3">Your Savings</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Saved from MRP:</span>
                    <span className="text-green-600">₹{GET_MRP_savings().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Additional Savings:</span>
                    <span className="text-green-600">₹{GET_additonal_savings().toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between">
                      <span>Coupon Savings:</span>
                      <span className="text-green-600">₹{GET_COUPON_DISCOUNT().toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                    <span>Total Savings:</span>
                    <span className="text-green-600">₹{GET_TOTAL_SAVINGS().toFixed(2)}</span>
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
                disabled={loading || !acceptTerms}
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