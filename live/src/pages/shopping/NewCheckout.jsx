import { useState, useEffect, useCallback } from 'react';
import { FaCreditCard, FaSpinner, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCity, FaGlobeAsia, FaMapPin, FaReceipt, FaTag, FaPercent, FaShoppingCart } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import _ from 'lodash';
import { applyCouponCode } from '../../helper/api_helper';
import { initiateCCAvenuePayment } from './pay/utils/payment';

// Create separate input field components for different types
const TextInputField = ({ label, name, type = 'text', placeholder, icon: Icon, value, onChange, disabled, ...props }) => (
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
        value={value || ''}
        onChange={onChange}
        className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors focus:outline-none"
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="on"
        {...props}
      />
    </div>
  </div>
);

const NumberInputField = ({ label, name, placeholder, icon: Icon, maxLength, value, onChange, disabled, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        name={name}
        value={value || ''}
        onChange={onChange}
        className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors focus:outline-none"
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        autoComplete="on"
        inputMode="numeric"
        pattern="[0-9]*"
        {...props}
      />
    </div>
    {name === 'phone' && value && value.length !== 10 && (
      <div className="mt-1 text-xs text-red-500">
        Phone number must be exactly 10 digits
      </div>
    )}
    {name === 'pincode' && value && value.length !== 6 && (
      <div className="mt-1 text-xs text-red-500">
        Pincode must be exactly 6 digits
      </div>
    )}
  </div>
);

const NewCheckout = () => {
  const { user } = useSelector((state) => state.authSlice);
  const location = useLocation();
  const navigate = useNavigate();
  const selectedProducts = location.state?.selectedProducts || [];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponType, setCouponType] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [paymentOption, setPaymentOption] = useState('full');
  const [cartData, setCartData] = useState([]);
  const [gstNo, setGstNo] = useState(user?.gst_no || '');
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [calculations, setCalculations] = useState({
    subtotal: 0,
    tax: 0,
    delivery: 0,
    discount: 0,
    total: 0,
    totalBeforeDiscount: 0,
    payable: 0
  });

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  });

  const addresses = _.get(user, 'addresses', []);

  useEffect(() => {
    if (!user?.name) {
      navigate('/login');
    }
  }, [user?.name, navigate]);

  useEffect(() => {
    if (selectedProducts.length > 0) {
      setCartData(selectedProducts);
    }
  }, [selectedProducts]);

  useEffect(() => {
    if (addresses[selectedAddress]) {
      const address = addresses[selectedAddress];
      const streetParts = address.street ? address.street.split('\n') : ['', ''];
      setFormData(prev => ({
        ...prev,
        phone: address.mobileNumber || user?.phone || '',
        addressLine1: streetParts[0] || '',
        addressLine2: streetParts[1] || '',
        city: address.city || '',
        state: address.state || '',
        pincode: address.pincode || '',
      }));
    }
  }, [selectedAddress, user, addresses]);

  useEffect(() => {
    const calculateAll = () => {
      const subtotal = _.sum(cartData.map(item => Number(item.final_total_withoutGst) || Number(item.final_total) || 0));
      const tax = subtotal * 0.18;
      const freeDelivery = cartData.every(item => item.FreeDelivery);
      const delivery = freeDelivery ? 0 : (cartData[0]?.DeliveryCharges || 0);
      const discount = appliedCoupon ? Number(appliedCoupon.discountAmount || 0) : 0;
      const totalBeforeDiscount = subtotal + tax + delivery;
      const total = Math.max(0, totalBeforeDiscount - discount);
      const payable = paymentOption === 'half' ? Math.ceil(total * 0.5) : total;

      setCalculations({ subtotal, tax, delivery, discount, total, totalBeforeDiscount, payable });
    };

    calculateAll();
  }, [cartData, appliedCoupon, paymentOption]);

  const validateForm = () => {
    if (cartData.length === 0) {
      setError('No products selected');
      return false;
    }

    const requiredFields = [
      { field: 'name', message: 'Please enter your name' },
      { field: 'email', message: 'Please enter a valid email address', test: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) },
      { field: 'phone', message: 'Please enter a valid 10-digit phone number', test: (val) => /^\d{10}$/.test(val.replace(/\D/g, '')) },
      { field: 'addressLine1', message: 'Please enter your address (Line 1)' },
      { field: 'city', message: 'Please enter your city' },
      { field: 'state', message: 'Please enter your state' },
      { field: 'pincode', message: 'Please enter a valid 6-digit pincode', test: (val) => /^\d{6}$/.test(val) },
    ];

    for (const { field, message, test } of requiredFields) {
      const value = formData[field]?.trim();
      if (!value) { setError(message); return false; }
      if (test && !test(value)) { setError(message); return false; }
    }

    if (!acceptTerms) {
      setError('Please accept terms and conditions');
      return false;
    }

    return true;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    try {
      setCouponLoading(true);
      setCouponError('');

      const orderAmount = calculations.totalBeforeDiscount;

      // FIX: Build cart items with ALL fields the backend needs to validate coupons:
      //   - productId: the actual product's MongoDB _id (not the cart row _id)
      //   - categoryId: the product's category — required for category-restricted coupons
      //                 like TECHIEFEED50 which uses applicableCategories, NOT applicableProducts
      //   - name: product name — used as fallback for tiered_quantity coupons with no applicableProducts
      const cartItems = cartData.map(item => {
        // Extract the real product ID.
        // Cart items typically have product_id as the product reference.
        // item._id is the cart row's own ID — never use it as productId.
        let productId = '';
        if (item.product_id?.$oid) {
          productId = item.product_id.$oid;           // Mongoose Extended JSON format
        } else if (item.product_id) {
          productId = item.product_id.toString();     // Normal ObjectId or string
        } else if (item.productId) {
          productId = item.productId.toString();      // Already normalized field
        }

        // Extract category ID.
        // FIX: Previously never sent — caused category-restricted coupons (e.g. TECHIEFEED50)
        // to always fail validation because the backend found no matching categoryId in cartItems.
        let categoryId = '';
        if (item.category_id?.$oid) {
          categoryId = item.category_id.$oid;
        } else if (item.category_id) {
          categoryId = item.category_id.toString();
        } else if (item.categoryId) {
          categoryId = item.categoryId.toString();
        } else if (item.category) {
          categoryId = item.category.toString();      // Some schemas store it as 'category'
        }

        const quantity = Number(item.product_quantity) || 1;
        const totalPrice = Number(item.final_total_withoutGst || item.final_total) || 0;
        const price = parseFloat((totalPrice / quantity).toFixed(2));

        // If categoryId is still empty, try common alternative field names.
        // Log a warning so you can identify the correct field name in your cart data.
        const resolvedCategoryId = categoryId
          || (item.product_category_id || '').toString()
          || (item.cat_id || '').toString()
          || '';

        if (!resolvedCategoryId) {
          console.warn('Could not find categoryId for cart item. Available fields:', Object.keys(item));
        }

        return {
          productId,
          categoryId: resolvedCategoryId,
          name: item.product_name || item.name || '',
          quantity,
          price,
        };
      });

      // FIX: Log the mapped items so you can verify productId and categoryId are correct
      console.log('Cart items sent to coupon API:', cartItems);

      const couponData = {
        code: couponCode.trim().toUpperCase(),
        orderAmount: parseFloat(orderAmount.toFixed(2)),
        userId: user?._id?.toString() || user?.id,
        cartItems,
        userType: user?.role || 'user',
      };

      console.log('Sending coupon request:', couponData);

      const response = await applyCouponCode(couponData);

      console.log('Coupon response:', response);

      if (response?.success === true) {
        const coupon = response.data?.coupon || response.data;
        const coupontyp = response.data?.coupon?.discountType || '';

        if (coupon) {
          setCouponType(coupontyp);
          setAppliedCoupon(coupon);
          setCouponError('');
          setError('');

          const discountAmount = Number(coupon.discountAmount) || 0;
          const newTotal = Math.max(0, calculations.totalBeforeDiscount - discountAmount);
          const newPayable = paymentOption === 'half' ? Math.ceil(newTotal * 0.5) : newTotal;

          setCalculations(prev => ({
            ...prev,
            discount: discountAmount,
            total: newTotal,
            payable: newPayable
          }));
        } else {
          throw new Error('Invalid coupon response');
        }
      } else {
        const errorMsg = response?.message ||
                         response?.data?.message ||
                         response?.error?.message ||
                         'Coupon application failed';
        throw new Error(errorMsg);
      }

    } catch (err) {
      console.error('Coupon error:', err);

      let errorMessage = 'Invalid coupon code';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      if (errorMessage.includes('Victoria Luxe')) {
        errorMessage = 'This coupon only applies to Victoria Luxe products';
      } else if (errorMessage.includes('minimum order amount')) {
        const match = errorMessage.match(/₹(\d+)/);
        errorMessage = match ? `Minimum order amount is ₹${match[1]}` : errorMessage;
      } else if (errorMessage.includes('expired') || errorMessage.includes('not active')) {
        errorMessage = 'This coupon is not valid or has expired';
      } else if (errorMessage.includes('not applicable to the categories')) {
        errorMessage = 'This coupon is not valid for the products in your cart';
      } else if (errorMessage.includes('not applicable to the products')) {
        errorMessage = 'This coupon is not valid for the products in your cart';
      }

      setCouponError(errorMessage);
      setAppliedCoupon(null);

      setCalculations(prev => ({
        ...prev,
        discount: 0,
        total: prev.totalBeforeDiscount,
        payable: paymentOption === 'half' ? Math.ceil(prev.totalBeforeDiscount * 0.5) : prev.totalBeforeDiscount
      }));
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
    setCalculations(prev => ({
      ...prev,
      discount: 0,
      total: prev.totalBeforeDiscount,
      payable: paymentOption === 'half' ? Math.ceil(prev.totalBeforeDiscount * 0.5) : prev.totalBeforeDiscount
    }));
  };

  const getDiscountDescription = (coupon) => {
    if (!coupon) return '';
    switch (coupon.discountType) {
      case 'percentage':    return `${coupon.discountValue || 0}% off`;
      case 'fixed':         return `₹${coupon.discountValue || 0} off`;
      case 'shipping':      return 'Free shipping';
      case 'tiered_quantity': return 'Tiered discount applied';
      default:              return 'Discount applied';
    }
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const orderId = `PRINTE${Date.now()}`;

      const street = formData.addressLine2
        ? `${formData.addressLine1}\n${formData.addressLine2}`
        : formData.addressLine1;

      const deliveryAddress = {
        name: formData.name,
        email: formData.email,
        mobile_number: formData.phone,
        alternateMobileNumber: '',
        street,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode
      };

      const couponData = appliedCoupon ? {
        couponCode: appliedCoupon.code,
        discountType: appliedCoupon.discountType,
        discountValue: appliedCoupon[getDiscountField(user.role)],
        discountAmount: appliedCoupon.discountAmount,
        finalAmount: appliedCoupon.finalAmount,
        discountTiers: appliedCoupon.discountTiers,
        appliedTiers: appliedCoupon.appliedTiers
      } : null;

      const paymentData = {
        amount: calculations.payable,
        order_id: orderId,
        billing_name: formData.name,
        billing_email: formData.email,
        billing_tel: formData.phone,
        currency: 'INR',
        cart_items: cartData,
        delivery_address: deliveryAddress,
        user_id: user?._id,
        delivery_charges: calculations.delivery,
        free_delivery: cartData.every(item => item.FreeDelivery),
        gst_no: gstNo || undefined,
        coupon: couponData,
        subtotal: calculations.subtotal,
        tax_amount: calculations.tax,
        discount_amount: calculations.discount,
        total_amount: calculations.total,
        payment_type: paymentOption,
        total_before_discount: calculations.totalBeforeDiscount
      };

      await initiateCCAvenuePayment(paymentData);
    } catch (err) {
      console.error('Payment error:', err);
      setError(err?.message || 'Failed to process payment. Please try again.');
      setLoading(false);
    }
  };

  const handleTextChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  }, []);

  const handlePhoneChange = useCallback((e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData(prev => ({ ...prev, phone: value }));
    setError('');
  }, []);

  const handlePincodeChange = useCallback((e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, pincode: value }));
    setError('');
  }, []);

  const handleEmailChange = useCallback((e) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, email: value }));
    setError('');
  }, []);

  const handleGstChange = useCallback((e) => {
    setGstNo(e.target.value.toUpperCase());
  }, []);

  const getDiscountField = (role) => {
    switch (role) {
      case 'Dealer':    return 'Dealer_discountValue';
      case 'Corporate': return 'Corporate_discountValue';
      default:          return 'Customer_discountValue';
    }
  };

  if (loading && cartData.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (cartData.length === 0 && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Products Selected</h2>
          <p className="mb-4">Please add products to your cart before checkout.</p>
          <button
            onClick={() => navigate('/shopping-cart')}
            className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700"
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
          {/* Left Column */}
          <div className="xl:col-span-2 space-y-6">
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
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {addresses.map((addr, index) => (
                        <option key={index} value={index}>Address {index + 1}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FaMapMarkerAlt className="text-blue-600" />
                Shipping Information
              </h2>
              <div className="space-y-6">
                <TextInputField label="Full Name *" name="name" value={formData.name} onChange={handleTextChange} placeholder="John Doe" icon={FaUser} disabled={loading} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextInputField label="Email Address *" name="email" type="email" value={formData.email} onChange={handleEmailChange} placeholder="john@example.com" icon={FaEnvelope} disabled={loading} />
                  <NumberInputField label="Phone Number *" name="phone" value={formData.phone} onChange={handlePhoneChange} placeholder="9876543210" maxLength={10} icon={FaPhone} disabled={loading} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1 (Street, Building) *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                    </div>
                    <input name="addressLine1" value={formData.addressLine1 || ''} onChange={handleTextChange} className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors focus:outline-none" placeholder="House No., Building, Street, Area" disabled={loading} autoComplete="address-line1" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2 (Optional)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                    </div>
                    <input name="addressLine2" value={formData.addressLine2 || ''} onChange={handleTextChange} className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors focus:outline-none" placeholder="Landmark, Apartment, Suite, Unit" disabled={loading} autoComplete="address-line2" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <TextInputField label="City *" name="city" value={formData.city} onChange={handleTextChange} placeholder="Mumbai" icon={FaCity} disabled={loading} />
                  <TextInputField label="State *" name="state" value={formData.state} onChange={handleTextChange} placeholder="Maharashtra" icon={FaGlobeAsia} disabled={loading} />
                  <NumberInputField label="Pincode *" name="pincode" value={formData.pincode} onChange={handlePincodeChange} placeholder="400001" maxLength={6} icon={FaMapPin} disabled={loading} />
                </div>
              </div>
            </div>

            {/* Coupon Section */}
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
                    onChange={(e) => { setCouponCode(e.target.value); setCouponError(''); }}
                    placeholder="Enter coupon code"
                    disabled={!!appliedCoupon || couponLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 focus:outline-none"
                    autoComplete="off"
                  />
                </div>
                {!appliedCoupon ? (
                  <button onClick={handleApplyCoupon} disabled={!couponCode.trim() || couponLoading} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium">
                    {couponLoading ? <><FaSpinner className="inline mr-2 animate-spin" />Applying...</> : 'Apply'}
                  </button>
                ) : (
                  <button onClick={handleRemoveCoupon} className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">Remove</button>
                )}
              </div>
              {couponError && <div className="mt-2 text-red-600 text-sm">{couponError}</div>}
              {appliedCoupon && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="font-medium text-green-700">Coupon Applied: {appliedCoupon.code}</span>
                      <div className="text-sm text-green-600">{getDiscountDescription(appliedCoupon)}</div>
                    </div>
                    <div className="text-green-700 font-bold">
                      {`Discounted Price ₹${calculations.total.toFixed(2)}`}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* GST Section */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaReceipt className="text-purple-600" />
                GST Information (Optional)
              </h2>
              <div className="flex gap-3">
                <div className="flex-1">
                  <input type="text" value={gstNo} onChange={handleGstChange} placeholder="Enter GSTIN number (15 characters)" maxLength={15} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none" />
                </div>
              </div>
              {gstNo && gstNo.length !== 15 && (
                <div className="mt-2 text-red-600 text-sm">GST number must be exactly 15 characters long.</div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FaShoppingCart className="text-blue-600" />
                Order Summary
              </h2>
              <div className="space-y-4 mb-6">
                {cartData.map((item) => (
                  <div key={item._id} className="flex items-center gap-4 py-3 border-b border-gray-200">
                    <img src={item.product_image} alt={item.product_name} className="w-16 h-16 object-cover rounded-lg" onError={(e) => { e.target.src = '/placeholder-product.jpg'; }} />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 line-clamp-1">{item.product_name}</h3>
                      <p className="text-sm text-gray-600">Qty: {item.product_quantity || 1}</p>
                      <p className="text-sm text-gray-600">₹{(Number(item.final_total_withoutGst || item.final_total) / (item.product_quantity || 1)).toFixed(2)} each</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{Number(item.final_total_withoutGst || item.final_total).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal ({cartData.length} items):</span>
                  <span className="font-semibold">₹{calculations.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Taxes (18% GST):</span>
                  <span className="font-semibold">₹{calculations.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Delivery charges:</span>
                  <span className="font-semibold">₹{calculations.delivery.toFixed(2)}</span>
                </div>
                {appliedCoupon && calculations.discount > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>Discount ({appliedCoupon.code}):</span>
                    <span className="font-bold">-₹{calculations.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Order Total:</span>
                    <span className="text-blue-600">₹{calculations.total.toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="text-sm text-gray-500 mt-1">
                      Original: <span className="line-through">₹{calculations.totalBeforeDiscount.toFixed(2)}</span>
                      <span className="ml-2 text-green-600">(Saved ₹{calculations.discount.toFixed(2)})</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Options</h2>
              <div className="space-y-3 mb-6">
                <label className="flex items-start gap-3 p-4 border border-yellow-500 rounded-lg bg-yellow-50 cursor-pointer">
                  <input type="radio" name="paymentOption" value="full" checked={paymentOption === 'full'} onChange={(e) => setPaymentOption(e.target.value)} className="mt-1 text-yellow-600 focus:ring-yellow-500" />
                  <div className="flex-1">
                    <div className="font-medium flex justify-between">
                      <span>Full Payment</span>
                      <span className="font-bold">₹{calculations.total.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Pay the full amount now</p>
                  </div>
                </label>
              </div>
              <div className="mb-6">
                <label className="flex items-start gap-3">
                  <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="mt-1 text-yellow-600 focus:ring-yellow-500 rounded" />
                  <span className="text-sm text-gray-700">
                    I agree to the{' '}
                    <a href="/terms" className="text-blue-600 hover:text-yellow-500 underline">Terms and Conditions</a>
                  </span>
                </label>
              </div>
              <button onClick={handlePayment} disabled={loading || !acceptTerms || cartData.length === 0} className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white py-4 px-6 rounded-xl hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 font-bold flex items-center justify-center gap-3 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transform hover:scale-[1.02] disabled:scale-100 shadow-lg hover:shadow-xl">
                {loading ? (
                  <><FaSpinner className="w-5 h-5 animate-spin" />Processing Payment...</>
                ) : (
                  <><FaCreditCard className="w-5 h-5" />Pay ₹{calculations.payable.toFixed(2)}</>
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