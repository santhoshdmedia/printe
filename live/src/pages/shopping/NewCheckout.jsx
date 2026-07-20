/**
 * NewCheckout — #F2C41A Golden Palette Edition
 *
 * Design system (ui-ux-pro-max-skill + custom golden palette):
 *   Primary   : #F2C41A  (golden yellow)
 *   Primary-dk : #C9A00E  (hover / pressed — WCAG safe on white)
 *   On-Primary : #1A1200  (near-black — max contrast on yellow, ~14:1)
 *   Accent     : #1A1200  (same deep ink — consistent with on-primary)
 *   Background : #FFFBEA  (warm cream — yellow-tinted, not blinding white)
 *   Card       : #FFFFFF
 *   Foreground : #1A1200  (deep ink)
 *   Muted      : #FFF6C2  (light yellow tint for auto-filled fields)
 *   Muted-fg   : #7A6A00  (warm dark-gold for labels)
 *   Border     : #F2C41A  (primary colour at full — punchy, on-brand)
 *   Border-soft: #F5D96A  (lighter yellow for inner dividers)
 *   Destructive: #DC2626
 *   Success    : #15803D
 *
 *   Typography : Outfit (headings) + Work Sans (body) — Geometric Modern
 *   Style      : Swiss Modernism 2.0 — grid, 8px unit, single accent rule
 *
 * FIX (this revision):
 *   Coupons with discountType === 'shipping' now waive the delivery fee
 *   instead of being subtracted from the item subtotal. The summary shows
 *   a strikethrough of the original delivery charge, a "FREE" delivery
 *   line, and a separate "Free shipping" coupon line for the amount saved.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  FaCreditCard, FaSpinner, FaUser, FaEnvelope, FaPhone,
  FaMapMarkerAlt, FaCity, FaGlobeAsia, FaMapPin, FaReceipt,
  FaTag, FaShoppingCart, FaCheckCircle, FaChevronRight,
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import _ from 'lodash';
import { applyCouponCode } from '../../helper/api_helper';
import { initiateCCAvenuePayment } from './pay/utils/payment';

// ─── Font + token injection ────────────────────────────────────────────────────
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Work+Sans:wght@300;400;500;600;700&display=swap');

    .co-root {
      --primary:        #F2C41A;
      --primary-dk:     #C9A00E;
      --primary-lt:     #FFF6C2;
      --on-primary:     #1A1200;
      --bg:             #FFFBEA;
      --card:           #FFFFFF;
      --foreground:     #1A1200;
      --muted:          #FFF6C2;
      --muted-fg:       #7A6A00;
      --border:         #F2C41A;
      --border-soft:    #F5D96A;
      --border-input:   #E5D080;
      --destructive:    #DC2626;
      --success:        #15803D;
      --radius:         4px;
      --radius-lg:      8px;
      --base:           8px;
      --font-heading:   'Outfit', sans-serif;
      --font-body:      'Work Sans', sans-serif;
    }

    .co-root * { font-family: var(--font-body); box-sizing: border-box; }
    .co-root h1, .co-root h2, .co-root h3, .co-root h4 { font-family: var(--font-heading); }

    .co-input:focus {
      outline: 2.5px solid var(--primary);
      outline-offset: 1px;
      border-color: var(--primary) !important;
    }

    @keyframes co-spin { to { transform: rotate(360deg); } }
    .co-spin { animation: co-spin 0.75s linear infinite; }

    /* Hover states */
    .co-btn-pay:hover:not(:disabled) {
      background: var(--primary-dk) !important;
      box-shadow: 0 4px 16px rgba(242,196,26,0.38) !important;
      transform: translateY(-1px);
    }
    .co-btn-pay:disabled { opacity: 0.5; cursor: not-allowed; }
    .co-btn-pay { transition: all 150ms ease; }

    .co-btn-apply:hover:not(:disabled) { background: var(--primary-dk) !important; }
    .co-btn-apply { transition: background 130ms ease; }

    .co-btn-remove:hover { background: #b91c1c !important; }

    .co-addr-btn { transition: all 130ms ease; }
    .co-addr-btn:hover { border-color: var(--primary) !important; background: var(--primary-lt) !important; }

    /* Breakpoints */
    @media (max-width: 920px) {
      .co-main-layout { grid-template-columns: 1fr !important; }
      .co-sidebar { position: static !important; }
    }
    @media (max-width: 640px) {
      .co-row2 { grid-template-columns: 1fr !important; }
      .co-addr-grid { grid-template-columns: 1fr !important; }
    }
  `}</style>
);

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

const getItemDeliveryCharge = (item, isTamilNadu) => {
  if (item.FreeDelivery) return 0;
  if (isPhotoFrame(item)) {
    if (getPickupFromOffice(item)) return 0;
    if (!getDeliveryToHome(item)) return 0;
  }
  if (!isTamilNadu) {
    const out = Number(item.out_of_tn_charge);
    return out > 0 ? out : 100;
  }
  return Number(item.DeliveryCharges) || 0;
};

const getTotalDeliveryCharge = (cartData, isTamilNadu) =>
  _.sum(cartData.map((i) => getItemDeliveryCharge(i, isTamilNadu)));

// ─── Design atoms ──────────────────────────────────────────────────────────────

/** Step number badge */
const Badge = ({ n }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 22, height: 22, borderRadius: 2,
    background: 'var(--primary)', color: 'var(--on-primary)',
    fontFamily: 'var(--font-heading)', fontSize: 11, fontWeight: 800,
    flexShrink: 0, letterSpacing: 0,
  }}>{n}</span>
);

/** Section heading */
const SectionHead = ({ badge, icon: Icon, iconColor = 'var(--primary)', children }) => (
  <h2 style={{
    fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 700,
    color: 'var(--foreground)', margin: '0 0 20px',
    display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '-0.01em',
  }}>
    {badge !== undefined && <Badge n={badge} />}
    {Icon && !badge && <Icon style={{ color: iconColor, flexShrink: 0, width: 14 }} />}
    {children}
  </h2>
);

/** White card */
const Card = ({ children, style = {} }) => (
  <div style={{
    background: 'var(--card)', border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '24px', ...style,
  }}>
    {children}
  </div>
);

/** Horizontal rule */
const HR = ({ style = {} }) => (
  <div style={{ height: 1, background: 'var(--border-soft)', margin: '16px 0', ...style }} />
);

/** Two-column row */
const Row2 = ({ children }) => (
  <div className="co-row2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
    {children}
  </div>
);

/** Labelled input wrapper — explicit htmlFor/id for WCAG */
const Field = ({ id, label, icon: Icon, error, required, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    <label htmlFor={id} style={{
      fontFamily: 'var(--font-heading)', fontSize: 10, fontWeight: 700,
      letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--muted-fg)',
    }}>
      {label}
      {required && <span style={{ color: 'var(--destructive)', marginLeft: 2 }}>*</span>}
    </label>
    <div style={{ position: 'relative' }}>
      {Icon && (
        <span style={{
          position: 'absolute', inset: '0 auto 0 0',
          display: 'flex', alignItems: 'center', paddingLeft: 11, pointerEvents: 'none',
        }}>
          <Icon style={{ width: 13, height: 13, color: 'var(--muted-fg)' }} />
        </span>
      )}
      {children}
    </div>
    {error && <p style={{ margin: 0, fontSize: 11, color: 'var(--destructive)', fontWeight: 600 }}>{error}</p>}
  </div>
);

/** Base input style factory */
const iStyle = (hasIcon = true, overrides = {}) => ({
  display: 'block', width: '100%',
  paddingLeft: hasIcon ? '34px' : '12px', paddingRight: 12,
  paddingTop: 9, paddingBottom: 9,
  fontSize: 13, fontFamily: 'var(--font-body)', fontWeight: 400,
  border: '1.5px solid var(--border-input)', borderRadius: 'var(--radius)',
  background: 'var(--card)', color: 'var(--foreground)', outline: 'none',
  ...overrides,
});

// ─── Pricing helpers ──────────────────────────────────────────────────────────
// subtotal → discount off subtotal (skipped for shipping coupons) → GST on
// discounted base → + delivery (waived entirely for shipping coupons) = total
const calcPrices = (cartData, appliedCoupon, paymentOption, isTamilNaduDelivery) => {
  const subtotal    = _.sum(cartData.map((i) => Number(i.final_total_withoutGst) || Number(i.final_total) || 0));
  const rawDelivery = getTotalDeliveryCharge(cartData, isTamilNaduDelivery);

  const isShippingCoupon = appliedCoupon?.discountType === 'shipping';

  // Shipping-type coupons waive delivery charges — they never discount the
  // item subtotal, so `discount` (subtotal discount) is 0 in that case.
  const discount           = isShippingCoupon ? 0 : (appliedCoupon ? Number(appliedCoupon.discountAmount || 0) : 0);
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const tax                = discountedSubtotal * 0.18;

  const delivery         = isShippingCoupon ? 0 : rawDelivery;
  const deliveryDiscount = isShippingCoupon ? rawDelivery : 0; // amount saved on delivery

  const total               = discountedSubtotal + tax + delivery;
  const totalBeforeDiscount = subtotal + subtotal * 0.18 + rawDelivery;
  const payable             = paymentOption === 'half' ? Math.ceil(total * 0.5) : total;

  return {
    subtotal, discount, discountedSubtotal, tax,
    delivery, rawDelivery, deliveryDiscount, isShippingCoupon,
    total, totalBeforeDiscount, payable,
  };
};

// ─── Main component ────────────────────────────────────────────────────────────
const NewCheckout = () => {
  const { user }     = useSelector((s) => s.authSlice);
  const location     = useLocation();
  const navigate     = useNavigate();
  const selectedProducts = location.state?.selectedProducts || [];

  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');
  const [couponCode, setCouponCode]       = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError]     = useState('');
  const [acceptTerms, setAcceptTerms]     = useState(false);
  const [paymentOption]                   = useState('full');   // extend if half-pay needed
  const [cartData, setCartData]           = useState([]);
  const [gstNo, setGstNo]                 = useState(user?.gst_no || '');
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [pincodeLoading, setPincodeLoading]   = useState(false);
  const [pincodeError, setPincodeError]       = useState('');
  const [pincodeResolved, setPincodeResolved] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '', email: user?.email || '',
    phone: String(user?.phone || ''),
    addressLine1: '', addressLine2: '', city: '', state: '', pincode: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const addresses          = _.get(user, 'addresses', []);
  const isTN               = isTamilNaduState(formData.state);
  const calc               = calcPrices(cartData, appliedCoupon, paymentOption, isTN);
  const pincodeTimer       = useRef(null);

  // Guards
  useEffect(() => { if (!user?.name) navigate('/login'); }, [user?.name, navigate]);
  useEffect(() => { if (selectedProducts.length > 0) setCartData(selectedProducts); }, [selectedProducts]);

  // Pre-fill saved address
  useEffect(() => {
    if (!addresses[selectedAddress]) return;
    const addr  = addresses[selectedAddress];
    const parts = addr.street ? addr.street.split('\n') : ['', ''];
    setFormData((p) => ({
      ...p,
      phone: String(addr.mobileNumber || user?.phone || ''),
      addressLine1: parts[0] || '', addressLine2: parts[1] || '',
      city: addr.city || '', state: addr.state || '', pincode: addr.pincode || '',
    }));
    setPincodeResolved(false);
  }, [selectedAddress, user, addresses]);

  // Pincode lookup
  const lookupPincode = useCallback(async (pin) => {
    if (pin.length !== 6) { setPincodeError(''); setPincodeResolved(false); return; }
    setPincodeLoading(true); setPincodeError('');
    try {
      const res  = await fetch(`${PINCODE_API}${pin}`);
      const data = await res.json();
      if (data?.[0]?.Status === 'Success' && data[0].PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        setFormData((p) => ({ ...p, city: po.District || po.Block || p.city, state: po.State || p.state }));
        setFieldErrors((p) => ({ ...p, city: '', state: '', pincode: '' }));
        setPincodeResolved(true); setPincodeError('');
      } else {
        setPincodeError('Pincode not found — enter city and state manually.');
        setPincodeResolved(false);
      }
    } catch {
      setPincodeError('Could not verify pincode — enter city and state manually.');
      setPincodeResolved(false);
    } finally { setPincodeLoading(false); }
  }, []);

  // Validation
  const validateForm = () => {
    const e = {};
    if (!formData.name?.trim()) e.name = 'Required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email || '')) e.email = 'Invalid email';
    if (!/^\d{10}$/.test(String(formData.phone || '').replace(/\D/g, ''))) e.phone = 'Must be 10 digits';
    if (!formData.addressLine1?.trim()) e.addressLine1 = 'Required';
    if (!formData.city?.trim()) e.city = 'Required';
    if (!formData.state?.trim()) e.state = 'Required';
    if (!/^\d{6}$/.test(String(formData.pincode || ''))) e.pincode = 'Must be 6 digits';
    setFieldErrors(e);
    if (Object.keys(e).length) { setError('Please fix the errors above.'); return false; }
    if (!acceptTerms) { setError('Please accept the Terms & Conditions.'); return false; }
    if (!cartData.length) { setError('No products selected.'); return false; }
    return true;
  };

  // Coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) { setCouponError('Enter a coupon code'); return; }
    try {
      setCouponLoading(true); setCouponError('');
      const subtotal    = _.sum(cartData.map((i) => Number(i.final_total_withoutGst) || Number(i.final_total) || 0));
      const delivery    = getTotalDeliveryCharge(cartData, isTN);
      const orderAmount = parseFloat((subtotal + subtotal * 0.18 + delivery).toFixed(2));
      const cartItems   = cartData.map((item) => ({
        productId:  item.product_id?.$oid  || String(item.product_id  || item.productId  || ''),
        categoryId: item.category_id?.$oid || String(item.category_id || item.categoryId || item.category || item.product_category_id || item.cat_id || ''),
        name: item.product_name || '',
        quantity: Number(item.product_quantity) || 1,
        price: parseFloat(((Number(item.final_total_withoutGst || item.final_total) || 0) / (Number(item.product_quantity) || 1)).toFixed(2)),
      }));
      const resp = await applyCouponCode({
        code: couponCode.trim().toUpperCase(), orderAmount,
        userId: user?._id?.toString() || user?.id,
        cartItems, userType: user?.role || 'user',
      });
      if (resp?.success) {
        const coupon = resp.data?.coupon || resp.data;
        if (!coupon) throw new Error('Invalid coupon response');
        setAppliedCoupon(coupon); setCouponError(''); setError('');
      } else {
        throw new Error(resp?.message || resp?.data?.message || 'Coupon application failed');
      }
    } catch (err) {
      let msg = err.response?.data?.message || err.message || 'Invalid coupon code';
      if (msg.includes('minimum order amount')) { const m = msg.match(/₹(\d+)/); msg = m ? `Minimum order ₹${m[1]}` : msg; }
      else if (msg.includes('expired') || msg.includes('not active')) msg = 'Coupon expired or inactive';
      else if (msg.includes('not applicable')) msg = 'Coupon not valid for items in cart';
      setCouponError(msg); setAppliedCoupon(null);
    } finally { setCouponLoading(false); }
  };

  const handleRemoveCoupon = () => { setAppliedCoupon(null); setCouponCode(''); setCouponError(''); };

  const discountLabel = (c) => {
    if (!c) return '';
    return c.discountType === 'percentage'      ? `${c.discountValue || 0}% off`
         : c.discountType === 'fixed'           ? `₹${c.discountValue || 0} off`
         : c.discountType === 'shipping'        ? 'Free shipping'
         : c.discountType === 'tiered_quantity' ? 'Tiered discount'
         : 'Discount applied';
  };

  const discountField = (role) =>
    role === 'Dealer' ? 'Dealer_discountValue' :
    role === 'Corporate' ? 'Corporate_discountValue' : 'Customer_discountValue';

  // Payment
  const handlePayment = async () => {
    if (!validateForm()) return;
    setLoading(true); setError('');
    try {
      const orderId = `PRINTE${Date.now()}`;
      const street  = formData.addressLine2
        ? `${formData.addressLine1}\n${formData.addressLine2}` : formData.addressLine1;
      await initiateCCAvenuePayment({
        amount: calc.payable, order_id: orderId,
        billing_name: formData.name, billing_email: formData.email,
        billing_tel: formData.phone, currency: 'INR',
        cart_items: cartData,
        photo_frame_details: cartData.map((item) => ({
          cart_item_id: item._id, product_id: item.product_id,
          delivery_to_home: getDeliveryToHome(item),
          pickup_from_office: getPickupFromOffice(item),
          ...(item.photo_frame_details || {}),
        })),
        delivery_address: {
          name: formData.name, email: formData.email,
          mobile_number: formData.phone, alternateMobileNumber: '',
          street, city: formData.city, state: formData.state, pincode: formData.pincode,
        },
        user_id: user?._id, delivery_charges: calc.delivery,
        free_delivery: calc.isShippingCoupon || cartData.every((i) => i.FreeDelivery),
        gst_no: gstNo || undefined,
        coupon: appliedCoupon ? {
          couponCode:    appliedCoupon.code,
          discountType:  appliedCoupon.discountType,
          discountValue: appliedCoupon[discountField(user.role)],
          discountAmount: appliedCoupon.discountAmount,
          finalAmount:   appliedCoupon.finalAmount,
          discountTiers: appliedCoupon.discountTiers,
          appliedTiers:  appliedCoupon.appliedTiers,
        } : null,
        subtotal:              calc.subtotal,
        discounted_subtotal:   calc.discountedSubtotal,
        tax_amount:            calc.tax,
        discount_amount:       calc.discount,
        delivery_discount:     calc.deliveryDiscount,
        total_amount:          calc.total,
        payment_type:          paymentOption,
        total_before_discount: calc.totalBeforeDiscount,
      });
    } catch (err) {
      console.error('Payment error:', err);
      setError(err?.message || 'Failed to process payment. Please try again.');
      setLoading(false);
    }
  };

  // Input handlers
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setFieldErrors((p) => ({ ...p, [name]: '' })); setError('');
  }, []);

  const handlePhoneChange = useCallback((e) => {
    setFormData((p) => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }));
    setFieldErrors((p) => ({ ...p, phone: '' })); setError('');
  }, []);

  const handlePincodeChange = useCallback((e) => {
    const pin = e.target.value.replace(/\D/g, '').slice(0, 6);
    setFormData((p) => ({ ...p, pincode: pin, ...(pin.length < 6 ? { city: '', state: '' } : {}) }));
    setFieldErrors((p) => ({ ...p, pincode: '' }));
    setError(''); setPincodeResolved(false); setPincodeError('');
    clearTimeout(pincodeTimer.current);
    if (pin.length === 6) pincodeTimer.current = setTimeout(() => lookupPincode(pin), 500);
  }, [lookupPincode]);

  const handleEmailChange = useCallback((e) => {
    setFormData((p) => ({ ...p, email: e.target.value }));
    setFieldErrors((p) => ({ ...p, email: '' })); setError('');
  }, []);

  // Empty / loading screens
  if (loading && cartData.length === 0)
    return (
      <>
        <FontLoader />
        <div className="co-root" style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FaSpinner className="co-spin" style={{ width: 30, height: 30, color: 'var(--primary)' }} />
        </div>
      </>
    );

  if (!cartData.length && !loading)
    return (
      <>
        <FontLoader />
        <div className="co-root" style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: 340 }}>
            <div style={{ width: 64, height: 64, borderRadius: 4, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <FaShoppingCart style={{ width: 26, height: 26, color: 'var(--on-primary)' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: 'var(--foreground)', margin: '0 0 8px' }}>Cart is empty</h2>
            <p style={{ fontSize: 14, color: 'var(--muted-fg)', margin: '0 0 24px' }}>Add items before checking out.</p>
            <button onClick={() => navigate('/shopping-cart')} style={{
              background: 'var(--primary)', color: 'var(--on-primary)',
              border: 'none', borderRadius: 'var(--radius)', padding: '12px 28px',
              fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14,
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              Go to Cart <FaChevronRight style={{ width: 10 }} />
            </button>
          </div>
        </div>
      </>
    );

  // Build the price-breakdown rows for the order summary, handling the
  // "shipping" coupon type as a delivery waiver rather than a subtotal cut.
  const summaryRows = [
    { label: `Subtotal (${cartData.length} item${cartData.length !== 1 ? 's' : ''})`, val: `₹${calc.subtotal.toFixed(2)}` },
  ];
  if (appliedCoupon && calc.discount > 0) {
    summaryRows.push({ label: `Coupon — ${appliedCoupon.code}`, val: `−₹${calc.discount.toFixed(2)}`, highlight: true });
    summaryRows.push({ label: 'Taxable amount', val: `₹${calc.discountedSubtotal.toFixed(2)}`, small: true });
  }
  summaryRows.push({ label: `GST 18%${appliedCoupon && calc.discount > 0 ? ' (on discounted price)' : ''}`, val: `₹${calc.tax.toFixed(2)}` });

  if (calc.isShippingCoupon) {
    summaryRows.push({
      label: `Coupon — ${appliedCoupon.code} (Free shipping)`,
      val: `−₹${calc.deliveryDiscount.toFixed(2)}`,
      highlight: true,
    });
    summaryRows.push({
      label: `Delivery${formData.state ? ` (${isTN ? 'Tamil Nadu' : 'Outstation'})` : ''}`,
      val: 'FREE',
      strikeVal: calc.rawDelivery > 0 ? `₹${calc.rawDelivery.toFixed(2)}` : null,
      free: true,
    });
  } else {
    summaryRows.push({
      label: `Delivery${formData.state ? ` (${isTN ? 'Tamil Nadu' : 'Outstation'})` : ''}`,
      val: `₹${calc.delivery.toFixed(2)}`,
    });
  }

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <>
      <FontLoader />
      <div className="co-root" style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px 16px 80px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>

          {/* Page header */}
          <div style={{ marginBottom: 32 }}>
            {/* Golden accent bar */}
            <div style={{ width: 36, height: 4, background: 'var(--primary)', borderRadius: 2, marginBottom: 12 }} />
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted-fg)', margin: '0 0 6px' }}>
              Secure Checkout
            </p>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 800, color: 'var(--foreground)', margin: 0, letterSpacing: '-0.025em' }}>
              Complete your order
            </h1>
          </div>

          {/* Layout grid */}
          <div className="co-main-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 376px', gap: 24, alignItems: 'start' }}>

            {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Saved addresses */}
              {addresses.length > 0 && (
                <Card>
                  <SectionHead badge="1">Saved Addresses</SectionHead>
                  <div className="co-addr-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {addresses.map((addr, idx) => (
                      <button key={idx} onClick={() => setSelectedAddress(idx)} className="co-addr-btn"
                        style={{
                          textAlign: 'left', padding: '12px 14px', cursor: 'pointer',
                          border: `2px solid ${selectedAddress === idx ? 'var(--primary)' : 'var(--border-input)'}`,
                          borderRadius: 'var(--radius)', background: selectedAddress === idx ? 'var(--primary-lt)' : 'var(--card)',
                          fontFamily: 'var(--font-body)',
                        }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 12, fontWeight: 700, color: 'var(--foreground)' }}>Address {idx + 1}</span>
                          {selectedAddress === idx && <FaCheckCircle style={{ color: 'var(--primary)', width: 12 }} />}
                        </div>
                        <p style={{ margin: 0, fontSize: 11, color: 'var(--muted-fg)', lineHeight: 1.5,
                          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {[addr.street, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}
                        </p>
                      </button>
                    ))}
                  </div>
                </Card>
              )}

              {/* Shipping form */}
              <Card>
                <SectionHead badge={addresses.length > 0 ? '2' : '1'}>Shipping Details</SectionHead>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>

                  <Field id="name" label="Full Name" icon={FaUser} error={fieldErrors.name} required>
                    <input id="name" name="name" value={formData.name} onChange={handleChange}
                      placeholder="John Doe" disabled={loading} autoComplete="name" className="co-input"
                      style={iStyle(true, fieldErrors.name ? { borderColor: 'var(--destructive)' } : {})} />
                  </Field>

                  <Row2>
                    <Field id="email" label="Email" icon={FaEnvelope} error={fieldErrors.email} required>
                      <input id="email" name="email" type="email" value={formData.email} onChange={handleEmailChange}
                        placeholder="john@example.com" disabled={loading} autoComplete="email" className="co-input"
                        style={iStyle(true, fieldErrors.email ? { borderColor: 'var(--destructive)' } : {})} />
                    </Field>
                    <Field id="phone" label="Phone" icon={FaPhone} error={fieldErrors.phone} required>
                      <input id="phone" name="phone" value={formData.phone} onChange={handlePhoneChange}
                        placeholder="9876543210" maxLength={10} disabled={loading}
                        autoComplete="tel" inputMode="numeric" className="co-input"
                        style={iStyle(true, fieldErrors.phone ? { borderColor: 'var(--destructive)' } : {})} />
                    </Field>
                  </Row2>

                  <Field id="addressLine1" label="Address Line 1" icon={FaMapMarkerAlt} error={fieldErrors.addressLine1} required>
                    <input id="addressLine1" name="addressLine1" value={formData.addressLine1} onChange={handleChange}
                      placeholder="House No., Building, Street, Area" disabled={loading} autoComplete="address-line1" className="co-input"
                      style={iStyle(true, fieldErrors.addressLine1 ? { borderColor: 'var(--destructive)' } : {})} />
                  </Field>

                  <Field id="addressLine2" label="Address Line 2 (optional)" icon={FaMapMarkerAlt}>
                    <input id="addressLine2" name="addressLine2" value={formData.addressLine2} onChange={handleChange}
                      placeholder="Landmark, Apartment, Suite" disabled={loading} autoComplete="address-line2" className="co-input"
                      style={iStyle()} />
                  </Field>

                  {/* Pincode — auto-fills city + state */}
                  <Field id="pincode" label="Pincode" icon={FaMapPin}
                    error={fieldErrors.pincode || pincodeError} required>
                    <input id="pincode" name="pincode" value={formData.pincode} onChange={handlePincodeChange}
                      placeholder="600001" maxLength={6} disabled={loading}
                      inputMode="numeric" autoComplete="postal-code" className="co-input"
                      style={iStyle(true, fieldErrors.pincode ? { borderColor: 'var(--destructive)' } : {})} />
                    {pincodeLoading && (
                      <span style={{ position: 'absolute', inset: '0 0 0 auto', paddingRight: 10, display: 'flex', alignItems: 'center' }}>
                        <FaSpinner className="co-spin" style={{ width: 12, color: 'var(--primary)' }} />
                      </span>
                    )}
                    {pincodeResolved && !pincodeLoading && (
                      <span style={{ position: 'absolute', inset: '0 0 0 auto', paddingRight: 10, display: 'flex', alignItems: 'center' }}>
                        <FaCheckCircle style={{ width: 12, color: 'var(--success)' }} />
                      </span>
                    )}
                  </Field>

                  <Row2>
                    <Field id="city" label="City" icon={FaCity} error={fieldErrors.city} required>
                      <input id="city" name="city" value={formData.city} onChange={handleChange}
                        placeholder={pincodeLoading ? 'Auto-filling…' : 'Chennai'} disabled={loading}
                        autoComplete="address-level2" className="co-input"
                        style={iStyle(true, {
                          ...(fieldErrors.city ? { borderColor: 'var(--destructive)' } : {}),
                          ...(pincodeResolved ? { background: 'var(--muted)', borderColor: 'var(--primary)' } : {}),
                        })} />
                    </Field>
                    <Field id="state" label="State" icon={FaGlobeAsia} error={fieldErrors.state} required>
                      <input id="state" name="state" value={formData.state} onChange={handleChange}
                        placeholder={pincodeLoading ? 'Auto-filling…' : 'Tamil Nadu'} disabled={loading}
                        autoComplete="address-level1" className="co-input"
                        style={iStyle(true, {
                          ...(fieldErrors.state ? { borderColor: 'var(--destructive)' } : {}),
                          ...(pincodeResolved ? { background: 'var(--muted)', borderColor: 'var(--primary)' } : {}),
                        })} />
                    </Field>
                  </Row2>

                  {/* TN / outstation notice */}
                  {formData.state && (
                    <div style={{
                      fontSize: 12, fontWeight: 600, padding: '10px 14px',
                      borderRadius: 'var(--radius)', borderLeft: '3px solid',
                      ...(isTN
                        ? { background: 'var(--primary-lt)', color: '#7A6A00', borderLeftColor: 'var(--primary)' }
                        : { background: '#FFF7ED', color: '#9A3412', borderLeftColor: '#EA580C' }),
                    }}>
                      {isTN
                        ? '✓ Delivering within Tamil Nadu — standard rates apply'
                        : '⚠ Outstation delivery — per-item charges apply'}
                    </div>
                  )}
                </div>
              </Card>

              {/* Coupon */}
              <Card>
                <SectionHead icon={FaTag} iconColor="var(--primary)">Coupon Code</SectionHead>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input type="text" value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                    placeholder="SAVE20" disabled={!!appliedCoupon || couponLoading} autoComplete="off"
                    className="co-input"
                    style={{
                      flex: 1, padding: '9px 14px', fontSize: 13,
                      border: '1.5px solid var(--border-input)', borderRadius: 'var(--radius)',
                      fontFamily: 'var(--font-heading)', fontWeight: 700, letterSpacing: '0.06em',
                      background: appliedCoupon ? 'var(--muted)' : 'var(--card)',
                      color: 'var(--foreground)', outline: 'none',
                    }} />
                  {!appliedCoupon
                    ? (
                      <button onClick={handleApplyCoupon} disabled={!couponCode.trim() || couponLoading}
                        className="co-btn-apply"
                        style={{
                          padding: '9px 18px', background: 'var(--primary)', color: 'var(--on-primary)',
                          border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer',
                          fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13,
                          display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
                          opacity: (!couponCode.trim() || couponLoading) ? 0.45 : 1,
                        }}>
                        {couponLoading ? <FaSpinner className="co-spin" style={{ width: 12 }} /> : 'Apply'}
                      </button>
                    ) : (
                      <button onClick={handleRemoveCoupon} className="co-btn-remove"
                        style={{
                          padding: '9px 18px', background: 'var(--destructive)', color: '#fff',
                          border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer',
                          fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13,
                          transition: 'background 130ms ease',
                        }}>
                        Remove
                      </button>
                    )
                  }
                </div>
                {couponError && (
                  <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--destructive)', fontWeight: 600 }}>{couponError}</p>
                )}
                {appliedCoupon && (
                  <div style={{
                    marginTop: 12, padding: '12px 14px',
                    background: 'var(--primary-lt)', border: '1.5px solid var(--border)',
                    borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <p style={{ margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 13, color: 'var(--on-primary)', letterSpacing: '0.07em' }}>
                        {appliedCoupon.code}
                      </p>
                      <p style={{ margin: '3px 0 0', fontSize: 11, color: 'var(--muted-fg)' }}>{discountLabel(appliedCoupon)}</p>
                    </div>
                    <p style={{ margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 15, color: 'var(--on-primary)' }}>
                      −₹{(calc.isShippingCoupon ? calc.deliveryDiscount : calc.discount).toFixed(2)}
                    </p>
                  </div>
                )}
              </Card>

              {/* GSTIN */}
              <Card>
                <SectionHead icon={FaReceipt} iconColor="#7C3AED">GSTIN (Optional)</SectionHead>
                <input type="text" value={gstNo}
                  onChange={(e) => setGstNo(e.target.value.toUpperCase())}
                  placeholder="22AAAAA0000A1Z5" maxLength={15}
                  className="co-input"
                  style={iStyle(false, {
                    letterSpacing: '0.07em', fontWeight: 700,
                    ...(gstNo && gstNo.length !== 15 ? { borderColor: 'var(--destructive)' } : {}),
                  })} />
                {gstNo && gstNo.length !== 15 && (
                  <p style={{ margin: '6px 0 0', fontSize: 11, color: 'var(--destructive)', fontWeight: 600 }}>GSTIN must be exactly 15 characters</p>
                )}
              </Card>

              {/* Global error banner — UX: always give submit feedback */}
              {error && (
                <div style={{
                  padding: '13px 16px', background: '#FEF2F2',
                  border: '1.5px solid #FECACA', borderLeft: '4px solid var(--destructive)',
                  borderRadius: 'var(--radius)',
                }}>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--destructive)', fontWeight: 700 }}>{error}</p>
                </div>
              )}
            </div>

            {/* ── RIGHT COLUMN: summary + payment ─────────────────────────── */}
            <div className="co-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 24 }}>

              {/* Order summary */}
              <Card>
                {/* Golden top bar — signature element */}
                <div style={{ height: 3, background: 'var(--primary)', borderRadius: 2, margin: '-24px -24px 20px', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)' }} />

                <SectionHead icon={FaShoppingCart} iconColor="var(--primary)">Order Summary</SectionHead>

                {/* Items list */}
                <div>
                  {cartData.map((item, i) => {
                    const charge  = getItemDeliveryCharge(item, isTN);
                    const isFrame = isPhotoFrame(item);
                    const pickup  = getPickupFromOffice(item);
                    const toHome  = getDeliveryToHome(item);
                    return (
                      <div key={item._id} style={{
                        display: 'flex', gap: 12, paddingTop: 12, paddingBottom: 12,
                        borderBottom: i < cartData.length - 1 ? `1px solid var(--border-soft)` : 'none',
                      }}>
                        <img src={item.product_image} alt={item.product_name}
                          style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 'var(--radius)', flexShrink: 0, border: '1px solid var(--border-input)' }}
                          onError={(e) => { e.target.src = '/placeholder-product.jpg'; }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 12, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.product_name}
                          </p>
                          <p style={{ margin: '2px 0 4px', fontSize: 11, color: 'var(--muted-fg)' }}>Qty: {item.product_quantity || 1}</p>
                          {isFrame && pickup && <p style={{ margin: 0, fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>✓ Pickup — no delivery fee</p>}
                          {isFrame && !pickup && !toHome && <p style={{ margin: 0, fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>✓ No delivery fee</p>}
                          {charge > 0 && calc.isShippingCoupon && (
                            <p style={{ margin: 0, fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>✓ Free delivery (coupon)</p>
                          )}
                          {charge > 0 && !calc.isShippingCoupon && (
                            <p style={{ margin: 0, fontSize: 11, color: 'var(--muted-fg)', fontWeight: 500 }}>
                              📦 +₹{charge.toFixed(2)}{!isTN ? ' (outstation)' : ''}
                            </p>
                          )}
                          {item.FreeDelivery && <p style={{ margin: 0, fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>✓ Free delivery</p>}
                        </div>
                        <p style={{ margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, color: 'var(--foreground)', whiteSpace: 'nowrap' }}>
                          ₹{Number(item.final_total_withoutGst || item.final_total).toFixed(2)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <HR />

                {/* Price breakdown */}
                {summaryRows.map(({ label, val, highlight, small, strikeVal, free }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: small ? 11 : 13, color: 'var(--muted-fg)', fontFamily: 'var(--font-body)' }}>{label}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {strikeVal && (
                        <span style={{ fontSize: 11, color: 'var(--muted-fg)', textDecoration: 'line-through' }}>{strikeVal}</span>
                      )}
                      <span style={{
                        fontSize: small ? 11 : 13, fontFamily: 'var(--font-heading)', fontWeight: (highlight || free) ? 800 : 600,
                        color: free ? 'var(--success)' : (highlight ? 'var(--on-primary)' : 'var(--foreground)'),
                        ...(highlight ? { background: 'var(--primary)', padding: '0 6px', borderRadius: 2 } : {}),
                      }}>{val}</span>
                    </span>
                  </div>
                ))}

                <HR style={{ margin: '12px 0' }} />

                {/* Total row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 15, color: 'var(--foreground)' }}>Total</span>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, color: 'var(--on-primary)', background: 'var(--primary)', padding: '2px 10px', borderRadius: 'var(--radius)' }}>
                    ₹{calc.total.toFixed(2)}
                  </span>
                </div>

                {/* Savings callout */}
                {appliedCoupon && (calc.discount > 0 || calc.deliveryDiscount > 0) && (
                  <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--muted-fg)', textDecoration: 'line-through' }}>₹{calc.totalBeforeDiscount.toFixed(2)}</span>
                    <span style={{
                      fontSize: 11, fontFamily: 'var(--font-heading)', fontWeight: 700,
                      color: 'var(--on-primary)', background: 'var(--primary)',
                      padding: '2px 8px', borderRadius: 2,
                    }}>
                      You save ₹{(calc.totalBeforeDiscount - calc.total).toFixed(2)}
                    </span>
                  </div>
                )}
              </Card>

              {/* Payment card */}
              <Card>
                <SectionHead badge="✓">Payment</SectionHead>

                {/* Full payment radio */}
                <label style={{
                  display: 'flex', gap: 12, padding: '13px 14px', cursor: 'pointer',
                  border: '2px solid var(--primary)', borderRadius: 'var(--radius)',
                  background: 'var(--primary-lt)', marginBottom: 18,
                }}>
                  <input type="radio" name="paymentOption" value="full" checked readOnly
                    style={{ accentColor: 'var(--on-primary)', marginTop: 2 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, color: 'var(--foreground)' }}>Full Payment</span>
                      <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 14, color: 'var(--foreground)' }}>₹{calc.total.toFixed(2)}</span>
                    </div>
                    <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--muted-fg)', fontFamily: 'var(--font-body)' }}>Pay the complete amount now</p>
                  </div>
                </label>

                {/* Terms — explicit label for WCAG */}
                <label htmlFor="acceptTerms" style={{ display: 'flex', gap: 10, cursor: 'pointer', marginBottom: 20, alignItems: 'flex-start' }}>
                  <input id="acceptTerms" type="checkbox" checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    style={{ accentColor: 'var(--primary)', marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--muted-fg)', lineHeight: 1.5, fontFamily: 'var(--font-body)' }}>
                    I agree to the{' '}
                    <a href="/terms" style={{ color: 'var(--on-primary)', background: 'var(--primary)', padding: '0 4px', borderRadius: 2, textDecoration: 'none', fontWeight: 700, fontSize: 11 }}>
                      Terms &amp; Conditions
                    </a>
                  </span>
                </label>

                {/* CTA — UX guideline: loading → error feedback */}
                <button onClick={handlePayment} disabled={loading} className="co-btn-pay"
                  style={{
                    width: '100%', padding: '15px', border: 'none',
                    borderRadius: 'var(--radius)', background: 'var(--primary)',
                    color: 'var(--on-primary)', cursor: 'pointer',
                    fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 15,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: '0 2px 10px rgba(242,196,26,0.25)',
                    letterSpacing: '-0.01em',
                  }}>
                  {loading
                    ? <><FaSpinner className="co-spin" style={{ width: 14 }} /> Processing…</>
                    : <><FaCreditCard style={{ width: 14 }} /> Pay ₹{calc.payable.toFixed(2)}</>
                  }
                </button>

                <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13 }}>🔒</span>
                  <span style={{ fontSize: 11, color: 'var(--muted-fg)', fontFamily: 'var(--font-body)', fontWeight: 500, letterSpacing: '0.02em' }}>
                    Secured by CCAvenue
                  </span>
                </div>
              </Card>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewCheckout;