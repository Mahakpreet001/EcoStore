import { useEffect, useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaBoxOpen, FaReceipt, FaTruck, FaCheckCircle, FaTimesCircle, FaClock, FaChevronDown, FaChevronUp, FaMapMarkerAlt, FaCalendarAlt, FaCreditCard, FaMoneyBillWave } from 'react-icons/fa';
import { api } from '../services/api';
import { CartContext } from '../context/CartContext';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    color: 'bg-yellow-100 text-yellow-800', icon: <FaClock /> },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800',    icon: <FaReceipt /> },
  shipped:    { label: 'Shipped',    color: 'bg-purple-100 text-purple-800', icon: <FaTruck /> },
  delivered:  { label: 'Delivered',  color: 'bg-green-100 text-green-800',   icon: <FaCheckCircle /> },
  cancelled:  { label: 'Cancelled',  color: 'bg-red-100 text-red-800',       icon: <FaTimesCircle /> },
};

const OrderCard = ({ order, onCancel }) => {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-gray-100"
    >
      {/* Order Header */}
      <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <p className="text-xs text-gray-400 mb-1">Order ID</p>
          <p className="font-mono text-sm font-semibold text-gray-700 truncate max-w-[200px]">#{order._id}</p>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${status.color}`}>
            {status.icon} {status.label}
          </span>
          {order.paymentStatus === 'paid' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
              <FaCreditCard className="text-xs" /> Paid
            </span>
          )}
          {order.paymentMethod === 'COD' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
              <FaMoneyBillWave className="text-xs" /> COD
            </span>
          )}
          <span className="text-lg font-bold text-green-600">₹{order.total.toFixed(2)}</span>
        </div>

        <div className="flex items-center gap-3">
          {order.status === 'pending' && (
            <button
              onClick={() => onCancel(order._id)}
              className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-full transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => setExpanded(prev => !prev)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 transition-colors"
          >
            {expanded ? 'Hide' : 'Details'}
            {expanded ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
          </button>
        </div>
      </div>

      {/* Order Items (expandable) */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-gray-100"
          >
            <div className="p-6 space-y-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded-xl flex-shrink-0"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-700">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}

              {order.shippingAddress && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <FaMapMarkerAlt className="text-green-500" /> Delivery Address
                  </p>
                  <p className="text-sm text-gray-700 font-medium">{order.shippingAddress.name} · {order.shippingAddress.phone}</p>
                  <p className="text-sm text-gray-500">{order.shippingAddress.addressLine1}{order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}</p>
                  <p className="text-sm text-gray-500">{order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}</p>
                </div>
              )}

              {order.estimatedDelivery && (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-xl px-3 py-2">
                  <FaCalendarAlt className="flex-shrink-0" />
                  <span>Estimated delivery: <strong>{new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</strong></span>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 space-y-1.5 text-sm text-gray-600">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{order.subtotal.toFixed(2)}</span></div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600"><span>Discount</span><span>- ₹{order.discount.toFixed(2)}</span></div>
                )}
                <div className="flex justify-between"><span>Tax (8%)</span><span>₹{order.tax.toFixed(2)}</span></div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className={order.shipping === 0 ? 'text-green-600 font-semibold' : ''}>
                    {order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-gray-800 text-base pt-1">
                  <span>Total</span><span>₹{order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { clearCart } = useContext(CartContext);

  useEffect(() => {
    api.get('/api/orders')
      .then(data => setOrders(data))
      .catch(() => toast.error('Failed to load orders.'))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (orderId) => {
    try {
      const updated = await api.put(`/api/orders/${orderId}/cancel`, {});
      setOrders(prev => prev.map(o => o._id === orderId ? updated : o));
      toast.success('Order cancelled.');
    } catch (err) {
      toast.error(err.message || 'Failed to cancel order.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>
          <p className="text-gray-500 mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
        </motion.div>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl p-12 text-center"
          >
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-400 mx-auto mb-6">
              <FaBoxOpen size={48} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">No orders yet</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Once you place your first order, it will appear here with full tracking.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              Start Shopping
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <OrderCard key={order._id} order={order} onCancel={handleCancel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
