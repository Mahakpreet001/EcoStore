import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaBoxOpen, FaCheckCircle, FaTruck, FaTimesCircle,
  FaShoppingBag, FaChevronDown, FaChevronUp, FaSync,
  FaRupeeSign, FaClock, FaCog,
} from 'react-icons/fa';
import { api } from '../services/api';
import toast from 'react-hot-toast';

// ── Config ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    badge: 'text-yellow-700 bg-yellow-100 border-yellow-300',    dot: 'bg-yellow-500' },
  processing: { label: 'Processing', badge: 'text-blue-700 bg-blue-100 border-blue-300',          dot: 'bg-blue-500'   },
  shipped:    { label: 'Shipped',    badge: 'text-purple-700 bg-purple-100 border-purple-300',    dot: 'bg-purple-500' },
  delivered:  { label: 'Delivered',  badge: 'text-green-700 bg-green-100 border-green-300',       dot: 'bg-green-500'  },
  cancelled:  { label: 'Cancelled',  badge: 'text-red-700 bg-red-100 border-red-300',             dot: 'bg-red-500'    },
};

const STATUS_TRANSITIONS = {
  pending:    [
    { to: 'processing', label: 'Accept Order',   cls: 'bg-green-600 hover:bg-green-700 text-white' },
    { to: 'cancelled',  label: 'Reject Order',   cls: 'bg-red-500 hover:bg-red-600 text-white'     },
  ],
  processing: [
    { to: 'shipped',    label: 'Mark as Shipped', cls: 'bg-purple-600 hover:bg-purple-700 text-white' },
    { to: 'cancelled',  label: 'Cancel Order',    cls: 'bg-red-400 hover:bg-red-500 text-white'        },
  ],
  shipped:    [
    { to: 'delivered',  label: 'Mark Delivered',  cls: 'bg-green-600 hover:bg-green-700 text-white' },
  ],
  delivered:  [],
  cancelled:  [],
};

const FILTERS = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

// ── Sub-components ────────────────────────────────────────────────────

const StatCard = ({ label, value, icon, iconColor, border }) => (
  <motion.div whileHover={{ y: -2 }} className={`bg-white rounded-2xl p-5 border-2 ${border} shadow-sm flex items-center gap-4`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${iconColor}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-extrabold text-gray-900 leading-none">{value}</p>
      <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">{label}</p>
    </div>
  </motion.div>
);

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ── Main Component ────────────────────────────────────────────────────

const AdminDashboard = () => {
  const [orders, setOrders]       = useState([]);
  const [stats, setStats]         = useState({});
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('all');
  const [page, setPage]           = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const [updating, setUpdating]   = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (filter !== 'all') params.set('status', filter);
      const data = await api.get(`/api/admin/orders?${params}`);
      setOrders(data.orders);
      setStats(data.stats);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { setPage(1); }, [filter]);

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const updated = await api.put(`/api/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => (o._id === orderId ? { ...o, status: updated.status } : o)));
      const label = newStatus === 'cancelled' ? 'rejected' : newStatus;
      toast.success(`Order marked as ${label}.`);
      // Refresh stats
      fetchOrders();
    } catch (err) {
      toast.error(err.message || 'Failed to update order.');
    } finally {
      setUpdating(null);
    }
  };

  const toggleExpand = (id) => setExpandedId(prev => (prev === id ? null : id));

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
              <span className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <FaCog className="text-white text-base" />
              </span>
              Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Manage all customer orders in one place</p>
          </div>
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 text-gray-600 rounded-xl hover:border-green-400 hover:text-green-600 transition-all text-sm font-semibold shadow-sm"
          >
            <FaSync className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <StatCard label="Total Orders"  value={stats.totalOrders ?? 0}                                           icon={<FaShoppingBag />}    iconColor="bg-gray-100 text-gray-600"    border="border-gray-200"   />
          <StatCard label="Revenue"       value={`₹${Number(stats.totalRevenue || 0).toLocaleString('en-IN')}`}   icon={<FaRupeeSign />}      iconColor="bg-green-100 text-green-600"  border="border-green-200"  />
          <StatCard label="Pending"       value={stats.pending ?? 0}                                               icon={<FaClock />}          iconColor="bg-yellow-100 text-yellow-600" border="border-yellow-200" />
          <StatCard label="Processing"    value={stats.processing ?? 0}                                            icon={<FaBoxOpen />}        iconColor="bg-blue-100 text-blue-600"    border="border-blue-200"   />
          <StatCard label="Shipped"       value={stats.shipped ?? 0}                                               icon={<FaTruck />}          iconColor="bg-purple-100 text-purple-600" border="border-purple-200" />
          <StatCard label="Delivered"     value={stats.delivered ?? 0}                                             icon={<FaCheckCircle />}    iconColor="bg-green-100 text-green-700"  border="border-green-300"  />
        </div>

        {/* ── Filter Tabs ── */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all capitalize
                ${filter === f
                  ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
            >
              {f === 'all' ? 'All Orders' : STATUS_CONFIG[f]?.label}
              {f !== 'all' && stats[f] != null && (
                <span className={`ml-1.5 text-xs font-bold px-1.5 py-0.5 rounded-full
                  ${filter === f ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  {stats[f]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Orders List ── */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-gray-100 shadow-sm" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <FaBoxOpen className="text-5xl text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-500">No orders found</p>
            <p className="text-sm text-gray-400 mt-1">
              {filter !== 'all' ? `No ${filter} orders at the moment.` : 'No orders have been placed yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => {
              const transitions = STATUS_TRANSITIONS[order.status] || [];
              const isExpanded  = expandedId === order._id;
              const isUpdating  = updating === order._id;

              return (
                <motion.div key={order._id} layout className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                  {/* ── Order row ── */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5">

                    {/* Left: order info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded border">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                        <StatusBadge status={order.status} />
                        <span className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="font-semibold text-gray-800 text-sm truncate">{order.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-400 truncate">{order.user?.email}</p>
                    </div>

                    {/* Center: price + items */}
                    <div className="text-right sm:text-center shrink-0">
                      <p className="text-lg font-extrabold text-gray-900">₹{order.total.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-gray-400">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                    </div>

                    {/* Right: action buttons + expand toggle */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {transitions.map(t => (
                        <motion.button
                          key={t.to}
                          onClick={() => updateStatus(order._id, t.to)}
                          disabled={isUpdating}
                          whileHover={{ scale: isUpdating ? 1 : 1.03 }}
                          whileTap={{ scale: isUpdating ? 1 : 0.97 }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${t.cls}`}
                        >
                          {isUpdating ? (
                            <span className="flex items-center gap-1.5">
                              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Updating…
                            </span>
                          ) : t.label}
                        </motion.button>
                      ))}

                      {transitions.length === 0 && (
                        <span className="text-xs text-gray-400 italic px-2">
                          {order.status === 'delivered' ? 'Completed' : 'Closed'}
                        </span>
                      )}

                      <button
                        onClick={() => toggleExpand(order._id)}
                        className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition"
                        aria-label={isExpanded ? 'Collapse' : 'Expand order details'}
                      >
                        {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                      </button>
                    </div>
                  </div>

                  {/* ── Expanded: order items ── */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        key="expanded"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 space-y-3">

                          {/* Item rows */}
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                              <img
                                src={item.image}
                                alt={item.name}
                                onError={e => { e.target.onerror = null; e.target.src = '/placeholder.svg'; }}
                                className="w-14 h-14 rounded-lg object-cover border border-gray-200 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                                </p>
                              </div>
                              <p className="text-sm font-bold text-gray-900 shrink-0">
                                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                              </p>
                            </div>
                          ))}

                          {/* Order totals */}
                          <div className="flex flex-wrap gap-x-6 gap-y-1 pt-2 border-t border-gray-200 text-xs text-gray-500">
                            <span>Subtotal: <strong className="text-gray-700">₹{order.subtotal.toLocaleString('en-IN')}</strong></span>
                            <span>Tax: <strong className="text-gray-700">₹{order.tax.toLocaleString('en-IN')}</strong></span>
                            <span>Shipping: <strong className="text-gray-700">{order.shipping === 0 ? 'Free' : `₹${order.shipping}`}</strong></span>
                            <span className="ml-auto font-bold text-gray-900 text-sm">
                              Total: ₹{order.total.toLocaleString('en-IN')}
                            </span>
                          </div>

                          {/* Payment method */}
                          <p className="text-xs text-gray-400">Payment: {order.paymentMethod || 'COD'}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ── Pagination ── */}
        {!loading && pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8">
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1}
              className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-600 transition disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-sm"
            >
              ← Prev
            </button>
            <span className="text-sm text-gray-600 font-medium">
              Page {page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page === pagination.pages}
              className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-600 transition disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-sm"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
