import { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import {
  FaArrowLeft, FaTag, FaTimes, FaMapMarkerAlt,
  FaCreditCard, FaMoneyBillWave, FaShieldAlt, FaCheck,
} from 'react-icons/fa';

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan',
  'Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Delhi','Jammu & Kashmir','Ladakh','Chandigarh','Puducherry',
];

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const EMPTY_ADDRESS = { name: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '' };

const Checkout = () => {
  const { cart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // --- Price calculations ---
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = appliedCoupon?.discount || 0;
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const tax = discountedSubtotal * 0.08;
  const shipping = discountedSubtotal > 500 ? 0 : 50;
  const total = discountedSubtotal + tax + shipping;

  // --- Validation ---
  const validate = () => {
    const e = {};
    if (!address.name.trim()) e.name = 'Full name is required';
    if (!/^\d{10}$/.test(address.phone)) e.phone = 'Enter a valid 10-digit phone number';
    if (!address.addressLine1.trim()) e.addressLine1 = 'Address is required';
    if (!address.city.trim()) e.city = 'City is required';
    if (!address.state) e.state = 'State is required';
    if (!/^\d{6}$/.test(address.pincode)) e.pincode = 'Enter a valid 6-digit pincode';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  // --- Coupon ---
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      const data = await api.post('/api/payment/coupon/apply', { code: couponInput, subtotal });
      setAppliedCoupon(data);
      toast.success(data.message || `Coupon applied! You save ₹${data.discount}`);
    } catch (err) {
      toast.error(err.message || 'Invalid coupon code.');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => { setAppliedCoupon(null); setCouponInput(''); };

  // --- Razorpay Payment ---
  const handleRazorpayPayment = async () => {
    if (!validate()) { toast.error('Please fill in all required fields.'); return; }
    if (cart.length === 0) { toast.error('Your cart is empty.'); return; }

    const loaded = await loadRazorpayScript();
    if (!loaded) { toast.error('Payment gateway failed to load. Please try again.'); return; }

    setPaymentLoading(true);
    let orderId = null;

    try {
      const data = await api.post('/api/payment/create-order', {
        shippingAddress: address,
        couponCode: appliedCoupon?.code,
        discount: Number(discount) || 0,
      });

      orderId = data.orderId;

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'EcoStore',
        description: 'Eco-friendly products',
        image: '/logo.png',
        order_id: data.razorpayOrderId,
        handler: async (response) => {
          try {
            await api.post('/api/payment/verify', {
              orderId: data.orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              couponCode: appliedCoupon?.code,
            });
            clearCart();
            navigate(`/order-success?orderId=${data.orderId}`);
          } catch {
            toast.error('Payment verification failed. Contact support.');
            navigate(`/order-failure?orderId=${data.orderId}`);
          }
        },
        prefill: { name: address.name, contact: address.phone },
        theme: { color: '#16a34a' },
        modal: {
          ondismiss: async () => {
            if (orderId) await api.post('/api/payment/failed', { orderId }).catch(() => {});
            setPaymentLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async () => {
        if (orderId) await api.post('/api/payment/failed', { orderId }).catch(() => {});
        toast.error('Payment failed. Please try again.');
        setPaymentLoading(false);
      });
      rzp.open();
    } catch (err) {
      toast.error(err.message || 'Failed to initiate payment.');
      setPaymentLoading(false);
    }
  };

  // --- COD Payment ---
  const handleCODOrder = async () => {
    if (!validate()) { toast.error('Please fill in all required fields.'); return; }
    if (cart.length === 0) { toast.error('Your cart is empty.'); return; }

    setPaymentLoading(true);
    try {
      const { orderId } = await api.post('/api/payment/cod', {
        shippingAddress: address,
        couponCode: appliedCoupon?.code,
        discount: Number(discount) || 0,
      });
      clearCart();
      navigate(`/order-success?orderId=${orderId}`);
    } catch (err) {
      toast.error(err.message || 'Failed to place order.');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <p className="text-xl text-gray-600">Your cart is empty.</p>
        <Link to="/shop" className="text-green-600 hover:underline font-semibold">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link to="/cart" className="inline-flex items-center gap-2 text-gray-500 hover:text-green-600 transition-colors mb-4">
            <FaArrowLeft /> Back to Cart
          </Link>
          <h1 className="text-4xl font-bold text-gray-800">Secure Checkout</h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <FaShieldAlt className="text-green-500" /> SSL encrypted & secure
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT: Address Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Delivery Address */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                <FaMapMarkerAlt className="text-green-500" /> Delivery Address
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name *" name="name" value={address.name} onChange={handleAddressChange} error={errors.name} placeholder="John Doe" />
                <Field label="Phone Number *" name="phone" value={address.phone} onChange={handleAddressChange} error={errors.phone} placeholder="10-digit mobile" maxLength={10} />
                <div className="sm:col-span-2">
                  <Field label="Address Line 1 *" name="addressLine1" value={address.addressLine1} onChange={handleAddressChange} error={errors.addressLine1} placeholder="House no, Street, Area" />
                </div>
                <div className="sm:col-span-2">
                  <Field label="Address Line 2" name="addressLine2" value={address.addressLine2} onChange={handleAddressChange} placeholder="Landmark, Apartment (optional)" />
                </div>
                <Field label="City *" name="city" value={address.city} onChange={handleAddressChange} error={errors.city} placeholder="City" />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <select
                    name="state"
                    value={address.state}
                    onChange={handleAddressChange}
                    className={`w-full border rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition ${errors.state ? 'border-red-400' : 'border-gray-300'}`}
                  >
                    <option value="">Select State</option>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
                </div>
                <Field label="Pincode *" name="pincode" value={address.pincode} onChange={handleAddressChange} error={errors.pincode} placeholder="6-digit pincode" maxLength={6} />
              </div>
            </div>

            {/* Order Summary (mobile-first view) */}
            <div className="bg-white rounded-2xl shadow-lg p-6 lg:hidden">
              <OrderSummary cart={cart} />
            </div>
          </motion.div>

          {/* RIGHT: Price Summary + Payment */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Order Items - desktop */}
            <div className="bg-white rounded-2xl shadow-lg p-6 hidden lg:block">
              <OrderSummary cart={cart} />
            </div>

            {/* Coupon */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaTag className="text-green-500" /> Coupon Code
              </h2>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <div>
                    <p className="font-semibold text-green-700">{appliedCoupon.code}</p>
                    <p className="text-xs text-green-600">You save ₹{Number(appliedCoupon.discount).toFixed(2)}</p>
                  </div>
                  <button onClick={removeCoupon} className="text-red-400 hover:text-red-600 transition-colors">
                    <FaTimes />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                      placeholder="Enter coupon code"
                      className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 uppercase"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                      className="bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-60 transition-colors"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                  {/* Quick coupon hints */}
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Try these codes:</p>
                    <div className="flex flex-wrap gap-2">
                      {['WELCOME', 'ECO10', 'GREEN20', 'SAVE15'].map(code => (
                        <button
                          key={code}
                          onClick={() => { setCouponInput(code); }}
                          className="text-xs px-2.5 py-1 bg-gray-100 hover:bg-green-100 hover:text-green-700 text-gray-600 rounded-full border border-gray-200 hover:border-green-300 transition-colors font-mono"
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Price Details</h2>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.length} items)</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Coupon Discount</span>
                    <span>- ₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax (8%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                {shipping > 0 && <p className="text-xs text-gray-400">Free shipping on orders above ₹500</p>}
                <hr className="border-gray-200" />
                <div className="flex justify-between text-lg font-bold text-gray-800">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-400">Estimated delivery: 3–5 business days</p>
              </div>
            </div>

            {/* Payment Buttons */}
            <div className="space-y-3">
              <motion.button
                onClick={handleRazorpayPayment}
                disabled={paymentLoading}
                whileHover={{ scale: paymentLoading ? 1 : 1.02 }}
                whileTap={{ scale: paymentLoading ? 1 : 0.98 }}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold text-base shadow-lg flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {paymentLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FaCreditCard />
                )}
                Pay ₹{total.toFixed(2)} with Razorpay
              </motion.button>

              <div className="flex items-center gap-3">
                <hr className="flex-1 border-gray-200" />
                <span className="text-xs text-gray-400">or</span>
                <hr className="flex-1 border-gray-200" />
              </div>

              <motion.button
                onClick={handleCODOrder}
                disabled={paymentLoading}
                whileHover={{ scale: paymentLoading ? 1 : 1.02 }}
                whileTap={{ scale: paymentLoading ? 1 : 0.98 }}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-xl hover:from-green-700 hover:to-green-800 transition-all font-semibold text-base shadow-lg flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {paymentLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FaMoneyBillWave />
                )}
                Cash on Delivery (COD)
              </motion.button>

              <p className="text-xs text-center text-gray-400 flex items-center justify-center gap-1 pt-1">
                <FaShieldAlt className="text-green-500" /> 100% secure checkout
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, name, value, onChange, error, placeholder, maxLength }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      className={`w-full border rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition ${error ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const OrderSummary = ({ cart }) => (
  <>
    <h2 className="text-lg font-bold text-gray-800 mb-4">Order Summary ({cart.length} items)</h2>
    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
      {cart.map((item) => (
        <div key={item.id} className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
          </div>
          <div className="flex items-center gap-1 text-green-600 text-sm font-semibold flex-shrink-0">
            <FaCheck className="text-xs text-green-400" />
            ₹{(item.price * item.quantity).toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  </>
);

export default Checkout;
