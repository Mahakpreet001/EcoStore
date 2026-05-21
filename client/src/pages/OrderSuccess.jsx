import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { FaCheckCircle, FaBoxOpen, FaTruck, FaCalendarAlt, FaHome, FaReceipt, FaPrint } from 'react-icons/fa';

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) { navigate('/orders'); return; }
    api.get(`/api/orders/${orderId}`)
      .then(setOrder)
      .catch(() => navigate('/orders'))
      .finally(() => setLoading(false));
  }, [orderId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) return null;

  const deliveryDate = order.estimatedDelivery
    ? new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'Within 5–7 business days';

  const isCOD = order.paymentMethod === 'COD';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Success Header */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 shadow-lg">
            <FaCheckCircle className="text-green-500 text-5xl" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Order Placed!</h1>
          <p className="text-gray-500 text-lg">
            {isCOD ? 'Your order is confirmed. Pay on delivery.' : 'Payment successful. Your order is confirmed.'}
          </p>
        </motion.div>

        {/* Order Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          {/* Order Info Bar */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-xs opacity-75">Order ID</p>
                <p className="font-mono font-semibold text-sm">#{order._id}</p>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-75">Total Amount</p>
                <p className="text-xl font-bold">₹{order.total.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">

            {/* Status Chips */}
            <div className="flex flex-wrap gap-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${isCOD ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                {isCOD ? '💵 Cash on Delivery' : '✅ Payment Paid'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                <FaBoxOpen className="text-xs" /> {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>

            {/* Estimated Delivery */}
            <div className="flex items-start gap-4 bg-green-50 rounded-2xl p-4 border border-green-100">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FaCalendarAlt className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Estimated Delivery</p>
                <p className="text-green-700 font-medium">{deliveryDate}</p>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaTruck className="text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Delivering to</p>
                  <p className="text-sm text-gray-600 font-medium">{order.shippingAddress.name}</p>
                  <p className="text-sm text-gray-500">{order.shippingAddress.addressLine1}{order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}</p>
                  <p className="text-sm text-gray-500">{order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}</p>
                  <p className="text-sm text-gray-500">📞 {order.shippingAddress.phone}</p>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Items Ordered</p>
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-xl flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-700 flex-shrink-0">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-gray-100 pt-4 space-y-1.5 text-sm text-gray-600">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{order.subtotal.toFixed(2)}</span></div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600"><span>Discount</span><span>- ₹{order.discount.toFixed(2)}</span></div>
              )}
              <div className="flex justify-between"><span>Tax (8%)</span><span>₹{order.tax.toFixed(2)}</span></div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className={order.shipping === 0 ? 'text-green-600 font-semibold' : ''}>{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-800 text-base pt-1 border-t border-gray-100">
                <span>Total</span><span>₹{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 mt-6"
        >
          <Link
            to="/orders"
            className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-green-600 text-green-600 py-3 px-6 rounded-xl hover:bg-green-50 transition-all font-semibold"
          >
            <FaReceipt /> View All Orders
          </Link>
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-600 py-3 px-6 rounded-xl hover:bg-gray-50 transition-all font-semibold"
          >
            <FaPrint /> Print Receipt
          </button>
          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-semibold shadow-lg"
          >
            <FaHome /> Continue Shopping
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccess;
