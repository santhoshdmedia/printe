import { useState, useEffect, useCallback, useRef } from 'react';
import {
  FaCreditCard, FaSpinner, FaUser, FaEnvelope, FaPhone,
  FaMapMarkerAlt, FaCity, FaGlobeAsia, FaMapPin, FaReceipt,
  FaTag, FaShoppingCart, FaCheckCircle,
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import _ from 'lodash';
import { applyCouponCode } from '../../helper/api_helper';
import { initiateCCAvenuePayment } from './pay/utils/payment';

// ─── Constants ─────────────────────────────────────────────────────────────────

const PINCODE_API = 'https://api.postalpincode.in/pincode/';

// ─── Helpers ───────────────────────────────────────────────────────────────────

const isPhotoFrame = (item) =>
  Boolean(
    item.is_photo_frame ||
    item.is_photoframe ||
    (item.photo_frame_details && Object.keys(item.photo_frame_details).length > 0)
  );

const getDeliveryToHome = (item) => {
  if (!isPhotoFrame(item)) return true;
  if (item.photo_frame_details && typeof item.photo_frame_details.delivery_to_home === 'boolean')
    return item.photo_frame_details.delivery_to_home;
  if (typeof item.delivery_to_home === 'boolean') return item.delivery_to_home;
  return true;
};

const getPickupFromOffice = (item) => {
  if (!isPhotoFrame(item)) return false;
  return Boolean(item.photo_frame_details?.pickup_from_office);
};

const isTamilNaduState = (state) => {
  if (!state) return false;
  const n = state.trim().toLowerCase().replace(/\s+/g, '');
  return n === 'tamilnadu' || n === 'tn';
};

/**
 * Delivery charge for a single item.
 * Uses:
 *   - item.DeliveryCharges  → Tamil Nadu charge
 *   - item.out_of_tn_charge → outside-TN charge (fallback 100 if 0/missing)
 */
const getItemDeliveryCharge = (item, isTamilNadu) => {
  if (item.FreeDelivery) return 0;

  if (isPhotoFrame(item)) {
    if (getPickupFromOffice(item)) return 0;
    if (!getDeliveryToHome(item)) return 0;
  }

  if (!isTamilNadu) {
    // Use out_of_tn_charge from API; fall back to 100 if not set
    const outCharge = Number(item.out_of_tn_charge);
    return outCharge > 0 ? outCharge : 100;
  }

  return Number(item.DeliveryCharges) || 0;
};

const getTotalDeliveryCharge = (cartData, isTamilNadu) =>
  _.sum(cartData.map((item) => getItemDeliveryCharge(item, isTamilNadu)));

// ─── Input components ──────────────────────────────────────────────────────────

const Field = ({ label, icon: Icon, error, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-4 w-4 text-gray-400" />
      </div>
      {children}
    </div>
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const inputCls =
  'block w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg ' +
  'focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors focus:outline-none ' +
  'disabled:bg-gray-50 disabled:text-gray-400 bg-white';

// ─── Main component ────────────────────────────────────────────────────────────

const NewCheckout = () => {
  const { user } = useSelector((s) => s.authSlice);
  const location = useLocation();
  const navigate = useNavigate();
  const selectedProducts = location.state?.selectedProducts || [];

  // ── State ──────────────────────────────────────────────────────────────────
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');
  const [couponCode, setCouponCode]       = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError]     = useState('');
  const [acceptTerms, setAcceptTerms]     = useState(false);
  const [paymentOption, setPaymentOption] = useState('full');
  const [cartData, setCartData]           = useState([]);
  const [gstNo, setGstNo]                 = useState(user?.gst_no || '');
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [pincodeLoading, setPincodeLoading]   = useState(false);
  const [pincodeError, setPincodeError]       = useState('');
  const [pincodeResolved, setPincodeResolved] = useState(false);

  const [calculations, setCalculations] = useState({
    subtotal: 0, tax: 0, delivery: 0, discount: 0,
    total: 0, totalBeforeDiscount: 0, payable: 0,
  });

  const [formData, setFormData] = useState({
    name: user?.name || '', email: user?.email || '', phone: String(user?.phone || ''),
    addressLine1: '', addressLine2: '', city: '', state: '', pincode: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const addresses = _.get(user, 'addresses', []);
  const isTamilNaduDelivery = isTamilNaduState(formData.state);

  // Debounced pincode lookup ref
  const pincodeTimer = useRef(null);

  // ── Guards ─────────────────────────────────────────────────────────────────
  useEffect(() => { if (!user?.name) navigate('/login'); }, [user?.name, navigate]);
  useEffect(() => { if (selectedProducts.length > 0) setCartData(selectedProducts); }, [selectedProducts]);

  // Pre-fill saved address
  useEffect(() => {
    if (addresses[selectedAddress]) {
      const addr = addresses[selectedAddress];
      const parts = addr.street ? addr.street.split('\n') : ['', ''];
      setFormData((prev) => ({
        ...prev,
        phone: String(addr.mobileNumber || user?.phone || ''),
        addressLine1: parts[0] || '',
        addressLine2: parts[1] || '',
        city: addr.city || '',
        state: addr.state || '',
        pincode: addr.pincode || '',
      }));
      setPincodeResolved(false);
    }
  }, [selectedAddress, user, addresses]);

  // ── Pincode lookup ─────────────────────────────────────────────────────────
  const lookupPincode = useCallback(async (pin) => {
    if (pin.length !== 6) {
      setPincodeError('');
      setPincodeResolved(false);
      return;
    }
    setPincodeLoading(true);
    setPincodeError('');
    try {
      const res  = await fetch(`${PINCODE_API}${pin}`);
      const data = await res.json();
      if (data?.[0]?.Status === 'Success' && data[0].PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        setFormData((prev) => ({
          ...prev,
          city:  po.District || po.Block || prev.city,
          state: po.State    || prev.state,
        }));
        setFieldErrors((prev) => ({ ...prev, city: '', state: '', pincode: '' }));
        setPincodeResolved(true);
        setPincodeError('');
      } else {
        setPincodeError('Pincode not found. Please enter city and state manually.');
        setPincodeResolved(false);
      }
    } catch {
      setPincodeError('Could not verify pincode. Please enter city and state manually.');
      setPincodeResolved(false);
    } finally {
      setPincodeLoading(false);
    }
  }, []);

  // ── Price calculations ─────────────────────────────────────────────────────
  useEffect(() => {
    const subtotal  = _.sum(cartData.map((i) => Number(i.final_total_withoutGst) || Number(i.final_total) || 0));
    const tax       = subtotal * 0.18;
    const delivery  = getTotalDeliveryCharge(cartData, isTamilNaduDelivery);
    const discount  = appliedCoupon ? Number(appliedCoupon.discountAmount || 0) : 0;
    const totalBeforeDiscount = subtotal + tax + delivery;
    const total     = Math.max(0, totalBeforeDiscount - discount);
    const payable   = paymentOption === 'half' ? Math.ceil(total * 0.5) : total;
    setCalculations({ subtotal, tax, delivery, discount, total, totalBeforeDiscount, payable });
  }, [cartData, appliedCoupon, paymentOption, isTamilNaduDelivery]);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateForm = () => {
    const errs = {};
    if (!formData.name?.trim())              errs.name         = 'Required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email || '')) errs.email = 'Invalid email';
    if (!/^\d{10}$/.test(String(formData.phone || '').replace(/\D/g, ''))) errs.phone = 'Must be 10 digits';
    if (!formData.addressLine1?.trim())      errs.addressLine1 = 'Required';
    if (!formData.city?.trim())             errs.city         = 'Required';
    if (!formData.state?.trim())            errs.state        = 'Required';
    if (!/^\d{6}$/.test(String(formData.pincode || ''))) errs.pincode = 'Must be 6 digits';

    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) { setError('Please fix the errors above'); return false; }
    if (!acceptTerms) { setError('Please accept the Terms & Conditions'); return false; }
    if (cartData.length === 0) { setError('No products selected'); return false; }
    return true;
  };

  // ── Coupon ─────────────────────────────────────────────────────────────────
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) { setCouponError('Enter a coupon code'); return; }
    try {
      setCouponLoading(true); setCouponError('');
      const cartItems = cartData.map((item) => {
        const productId  = item.product_id?.$oid  || String(item.product_id  || item.productId  || '');
        const categoryId = item.category_id?.$oid || String(item.category_id || item.categoryId || item.category || item.product_category_id || item.cat_id || '');
        const quantity   = Number(item.product_quantity) || 1;
        const totalPrice = Number(item.final_total_withoutGst || item.final_total) || 0;
        return { productId, categoryId, name: item.product_name || '', quantity, price: parseFloat((totalPrice / quantity).toFixed(2)) };
      });
      const resp = await applyCouponCode({
        code: couponCode.trim().toUpperCase(),
        orderAmount: parseFloat(calculations.totalBeforeDiscount.toFixed(2)),
        userId: user?._id?.toString() || user?.id,
        cartItems,
        userType: user?.role || 'user',
      });
      if (resp?.success) {
        const coupon = resp.data?.coupon || resp.data;
        if (!coupon) throw new Error('Invalid coupon response');
        setAppliedCoupon(coupon);
        setCouponError('');
        setError('');
      } else {
        throw new Error(resp?.message || resp?.data?.message || 'Coupon application failed');
      }
    } catch (err) {
      let msg = err.response?.data?.message || err.message || 'Invalid coupon code';
      if (msg.includes('minimum order amount')) { const m = msg.match(/₹(\d+)/); msg = m ? `Minimum order ₹${m[1]}` : msg; }
      else if (msg.includes('expired') || msg.includes('not active')) msg = 'Coupon expired or inactive';
      else if (msg.includes('not applicable')) msg = 'Coupon not valid for items in cart';
      setCouponError(msg);
      setAppliedCoupon(null);
    } finally { setCouponLoading(false); }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null); setCouponCode(''); setCouponError('');
  };

  const getDiscountLabel = (c) => {
    if (!c) return '';
    switch (c.discountType) {
      case 'percentage':      return `${c.discountValue || 0}% off`;
      case 'fixed':           return `₹${c.discountValue || 0} off`;
      case 'shipping':        return 'Free shipping';
      case 'tiered_quantity': return 'Tiered discount';
      default:                return 'Discount applied';
    }
  };

  const getDiscountField = (role) =>
    role === 'Dealer' ? 'Dealer_discountValue' :
    role === 'Corporate' ? 'Corporate_discountValue' : 'Customer_discountValue';

  // ── Payment ────────────────────────────────────────────────────────────────
  const handlePayment = async () => {
    if (!validateForm()) return;
    setLoading(true); setError('');
    try {
      const orderId = `PRINTE${Date.now()}`;
      const street  = formData.addressLine2
        ? `${formData.addressLine1}\n${formData.addressLine2}`
        : formData.addressLine1;

      await initiateCCAvenuePayment({
        amount:          calculations.payable,
        order_id:        orderId,
        billing_name:    formData.name,
        billing_email:   formData.email,
        billing_tel:     formData.phone,
        currency:        'INR',
        cart_items:      cartData,
        photo_frame_details: cartData.map((item) => ({
          cart_item_id: item._id, product_id: item.product_id,
          delivery_to_home: getDeliveryToHome(item),
          pickup_from_office: getPickupFromOffice(item),
          ...(item.photo_frame_details || {}),
        })),
        delivery_address: {
          name: formData.name, email: formData.email, mobile_number: formData.phone,
          alternateMobileNumber: '', street, city: formData.city,
          state: formData.state, pincode: formData.pincode,
        },
        user_id:          user?._id,
        delivery_charges: calculations.delivery,
        free_delivery:    cartData.every((i) => i.FreeDelivery),
        gst_no:           gstNo || undefined,
        coupon: appliedCoupon ? {
          couponCode:    appliedCoupon.code,
          discountType:  appliedCoupon.discountType,
          discountValue: appliedCoupon[getDiscountField(user.role)],
          discountAmount: appliedCoupon.discountAmount,
          finalAmount:   appliedCoupon.finalAmount,
          discountTiers: appliedCoupon.discountTiers,
          appliedTiers:  appliedCoupon.appliedTiers,
        } : null,
        subtotal:              calculations.subtotal,
        tax_amount:            calculations.tax,
        discount_amount:       calculations.discount,
        total_amount:          calculations.total,
        payment_type:          paymentOption,
        total_before_discount: calculations.totalBeforeDiscount,
      });
    } catch (err) {
      console.error('Payment error:', err);
      setError(err?.message || 'Failed to process payment. Please try again.');
      setLoading(false);
    }
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setFieldErrors((p) => ({ ...p, [name]: '' }));
    setError('');
  }, []);

  const handlePhoneChange = useCallback((e) => {
    setFormData((p) => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }));
    setFieldErrors((p) => ({ ...p, phone: '' }));
    setError('');
  }, []);

  const handlePincodeChange = useCallback((e) => {
    const pin = e.target.value.replace(/\D/g, '').slice(0, 6);
    setFormData((p) => ({ ...p, pincode: pin }));
    setFieldErrors((p) => ({ ...p, pincode: '' }));
    setError('');
    setPincodeResolved(false);
    setPincodeError('');

    // Clear city/state when pincode changes so stale auto-fill doesn't persist
    if (pin.length < 6) {
      setFormData((p) => ({ ...p, pincode: pin, city: '', state: '' }));
    }

    // Debounce the API call
    clearTimeout(pincodeTimer.current);
    if (pin.length === 6) {
      pincodeTimer.current = setTimeout(() => lookupPincode(pin), 500);
    }
  }, [lookupPincode]);

  const handleEmailChange = useCallback((e) => {
    setFormData((p) => ({ ...p, email: e.target.value }));
    setFieldErrors((p) => ({ ...p, email: '' }));
    setError('');
  }, []);

  const handleGstChange = useCallback((e) => setGstNo(e.target.value.toUpperCase()), []);

  // ── Early returns ──────────────────────────────────────────────────────────
  if (loading && cartData.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (cartData.length === 0 && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add products to your cart before checkout.</p>
          <button onClick={() => navigate('/shopping-cart')}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
            Go to Cart
          </button>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-500 mt-1">Review your order and complete your purchase</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* ── Left column ──────────────────────────────────────────────── */}
          <div className="xl:col-span-2 space-y-6">

            {/* Saved address picker */}
            {addresses.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaUser className="text-indigo-500" /> Saved Addresses
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addresses.map((addr, idx) => (
                    <button key={idx} onClick={() => setSelectedAddress(idx)}
                      className={`text-left p-4 rounded-xl border-2 transition-all text-sm ${
                        selectedAddress === idx
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <div className="font-semibold text-gray-800 mb-1">Address {idx + 1}</div>
                      <div className="text-gray-500 line-clamp-2">
                        {[addr.street, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}
                      </div>
                      {selectedAddress === idx && (
                        <div className="mt-2 text-indigo-600 text-xs font-semibold flex items-center gap-1">
                          <FaCheckCircle /> Selected
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Shipping information */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaMapMarkerAlt className="text-indigo-500" /> Shipping Information
              </h2>
              <div className="space-y-5">

                {/* Name */}
                <Field label="Full Name *" icon={FaUser} error={fieldErrors.name}>
                  <input name="name" value={formData.name} onChange={handleChange}
                    placeholder="John Doe" disabled={loading} autoComplete="name"
                    className={inputCls} />
                </Field>

                {/* Email + Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Email Address *" icon={FaEnvelope} error={fieldErrors.email}>
                    <input name="email" type="email" value={formData.email} onChange={handleEmailChange}
                      placeholder="john@example.com" disabled={loading} autoComplete="email"
                      className={inputCls} />
                  </Field>
                  <Field label="Phone Number *" icon={FaPhone} error={fieldErrors.phone}>
                    <input name="phone" value={formData.phone} onChange={handlePhoneChange}
                      placeholder="9876543210" maxLength={10} disabled={loading}
                      autoComplete="tel" inputMode="numeric" pattern="[0-9]*"
                      className={inputCls} />
                  </Field>
                </div>

                {/* Address Line 1 */}
                <Field label="Address Line 1 *" icon={FaMapMarkerAlt} error={fieldErrors.addressLine1}>
                  <input name="addressLine1" value={formData.addressLine1} onChange={handleChange}
                    placeholder="House No., Building, Street, Area" disabled={loading}
                    autoComplete="address-line1" className={inputCls} />
                </Field>

                {/* Address Line 2 */}
                <Field label="Address Line 2 (Optional)" icon={FaMapMarkerAlt}>
                  <input name="addressLine2" value={formData.addressLine2} onChange={handleChange}
                    placeholder="Landmark, Apartment, Suite" disabled={loading}
                    autoComplete="address-line2" className={inputCls} />
                </Field>

                {/* Pincode — auto-fills City + State */}
                <Field label="Pincode *" icon={FaMapPin}
                  error={fieldErrors.pincode || pincodeError}>
                  <input name="pincode" value={formData.pincode} onChange={handlePincodeChange}
                    placeholder="600001" maxLength={6} disabled={loading}
                    inputMode="numeric" pattern="[0-9]*" autoComplete="postal-code"
                    className={inputCls} />
                  {pincodeLoading && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <FaSpinner className="h-4 w-4 text-indigo-500 animate-spin" />
                    </div>
                  )}
                  {pincodeResolved && !pincodeLoading && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <FaCheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  )}
                </Field>

                {/* City + State — auto-filled from pincode */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="City *" icon={FaCity} error={fieldErrors.city}>
                    <input name="city" value={formData.city} onChange={handleChange}
                      placeholder={pincodeLoading ? 'Auto-filling…' : 'Mumbai'}
                      disabled={loading} autoComplete="address-level2"
                      className={inputCls + (pincodeResolved ? ' bg-green-50' : '')} />
                  </Field>
                  <Field label="State *" icon={FaGlobeAsia} error={fieldErrors.state}>
                    <input name="state" value={formData.state} onChange={handleChange}
                      placeholder={pincodeLoading ? 'Auto-filling…' : 'Maharashtra'}
                      disabled={loading} autoComplete="address-level1"
                      className={inputCls + (pincodeResolved ? ' bg-green-50' : '')} />
                  </Field>
                </div>

                {/* TN / outstation indicator */}
                {formData.state && (
                  <div className={`text-xs font-medium px-3 py-2 rounded-lg ${
                    isTamilNaduDelivery
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {isTamilNaduDelivery
                      ? '✓ Delivering within Tamil Nadu — standard delivery charges apply'
                      : '⚠ Outstation delivery (outside Tamil Nadu) — per-item outstation charges apply'}
                  </div>
                )}
              </div>
            </div>

            {/* Coupon */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaTag className="text-green-600" /> Coupon Code
              </h2>
              <div className="flex gap-3">
                <input type="text" value={couponCode}
                  onChange={(e) => { setCouponCode(e.target.value); setCouponError(''); }}
                  placeholder="Enter coupon code" disabled={!!appliedCoupon || couponLoading}
                  autoComplete="off"
                  className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 focus:outline-none" />
                {!appliedCoupon
                  ? <button onClick={handleApplyCoupon}
                      disabled={!couponCode.trim() || couponLoading}
                      className="px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                      {couponLoading ? <FaSpinner className="animate-spin" /> : 'Apply'}
                    </button>
                  : <button onClick={handleRemoveCoupon}
                      className="px-5 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-colors">
                      Remove
                    </button>
                }
              </div>
              {couponError && <p className="mt-2 text-xs text-red-500">{couponError}</p>}
              {appliedCoupon && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold text-green-700">{appliedCoupon.code}</p>
                    <p className="text-xs text-green-600">{getDiscountLabel(appliedCoupon)}</p>
                  </div>
                  <p className="text-sm font-bold text-green-700">
                    −₹{calculations.discount.toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            {/* GST */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaReceipt className="text-purple-500" /> GSTIN (Optional)
              </h2>
              <input type="text" value={gstNo} onChange={handleGstChange}
                placeholder="Enter GSTIN (15 characters)" maxLength={15}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none" />
              {gstNo && gstNo.length !== 15 && (
                <p className="mt-1 text-xs text-red-500">GSTIN must be exactly 15 characters</p>
              )}
            </div>

            {/* Global error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}
          </div>

          {/* ── Right column ─────────────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Order summary */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-800 mb-5 flex items-center gap-2">
                <FaShoppingCart className="text-indigo-500" /> Order Summary
              </h2>

              {/* Items */}
              <div className="divide-y divide-gray-100 mb-5">
                {cartData.map((item) => {
                  const charge = getItemDeliveryCharge(item, isTamilNaduDelivery);
                  const isFrame = isPhotoFrame(item);
                  const pickup  = getPickupFromOffice(item);
                  const toHome  = getDeliveryToHome(item);

                  return (
                    <div key={item._id} className="py-3 flex gap-3">
                      <img src={item.product_image} alt={item.product_name}
                        className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                        onError={(e) => { e.target.src = '/placeholder-product.jpg'; }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{item.product_name}</p>
                        <p className="text-xs text-gray-400">Qty: {item.product_quantity || 1}</p>
                        {isFrame && pickup && (
                          <p className="text-xs text-green-600 mt-0.5">✓ Pickup — no delivery</p>
                        )}
                        {isFrame && !pickup && !toHome && (
                          <p className="text-xs text-green-600 mt-0.5">✓ No delivery charge</p>
                        )}
                        {charge > 0 && (
                          <p className="text-xs text-indigo-600 mt-0.5">
                            📦 Delivery ₹{charge.toFixed(2)} {!isTamilNaduDelivery ? '(Outstation)' : ''}
                          </p>
                        )}
                        {item.FreeDelivery && (
                          <p className="text-xs text-green-600 mt-0.5">✓ Free delivery</p>
                        )}
                      </div>
                      <p className="text-sm font-bold text-gray-800 whitespace-nowrap">
                        ₹{Number(item.final_total_withoutGst || item.final_total).toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartData.length} items)</span>
                  <span className="font-medium text-gray-800">₹{calculations.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST (18%)</span>
                  <span className="font-medium text-gray-800">₹{calculations.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>
                    Delivery
                    {formData.state
                      ? ` (${isTamilNaduDelivery ? 'Tamil Nadu' : 'Outstation'})`
                      : ''}
                  </span>
                  <span className="font-medium text-gray-800">₹{calculations.delivery.toFixed(2)}</span>
                </div>
                {appliedCoupon && calculations.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span className="font-semibold">−₹{calculations.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-3 mt-1 flex justify-between items-center">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <span className="text-base font-bold text-indigo-600">
                    ₹{calculations.total.toFixed(2)}
                  </span>
                </div>
                {appliedCoupon && (
                  <p className="text-xs text-gray-400">
                    Was <span className="line-through">₹{calculations.totalBeforeDiscount.toFixed(2)}</span>
                    <span className="text-green-600 ml-1">Save ₹{calculations.discount.toFixed(2)}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-800 mb-4">Payment</h2>

              <label className="flex items-start gap-3 p-4 border-2 border-indigo-500 bg-indigo-50 rounded-xl cursor-pointer mb-5">
                <input type="radio" name="paymentOption" value="full" checked={paymentOption === 'full'}
                  onChange={(e) => setPaymentOption(e.target.value)}
                  className="mt-0.5 text-indigo-600 focus:ring-indigo-500" />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-semibold text-sm">Full Payment</span>
                    <span className="font-bold text-sm">₹{calculations.total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Pay the full amount now</p>
                </div>
              </label>

              <label className="flex items-start gap-3 mb-6">
                <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 text-indigo-600 focus:ring-indigo-500 rounded" />
                <span className="text-xs text-gray-600">
                  I agree to the{' '}
                  <a href="/terms" className="text-indigo-600 underline hover:text-indigo-700">
                    Terms and Conditions
                  </a>
                </span>
              </label>

              <button onClick={handlePayment} disabled={loading}
                className="w-full bg-indigo-600 text-white py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg">
                {loading
                  ? <><FaSpinner className="animate-spin" /> Processing…</>
                  : <><FaCreditCard /> Pay ₹{calculations.payable.toFixed(2)}</>
                }
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                <span>🔒</span>
                <span>Secure payment via CCAvenue</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default NewCheckout;