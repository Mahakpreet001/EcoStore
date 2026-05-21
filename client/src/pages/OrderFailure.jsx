import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  FaTimesCircle, FaExclamationTriangle, FaRedo,
  FaHeadset, FaHome, FaShoppingBag,
} from 'react-icons/fa';

const POSSIBLE_REASONS = [
  'Your card was declined by the issuing bank.',
  'Insufficient funds in the account.',
  'You cancelled the payment window.',
  'Payment session timed out.',
  'Network error during transaction.',
];

const OrderFailure = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!orderId) return;
    api.get(`/api/orders/${orderId}`)
      .then(setOrder)
      .catch(() => {});
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-12 px-4 flex items-center">
      <div className="max-w-xl mx-auto w-full">

        {/* Animated failure icon */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6 shadow-lg"
          >
            <FaTimesCircle className="text-red-500 text-5xl" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Payment Failed</h1>
          <p className="text-gray-500 text-lg">
            Don't worry — your cart is safe. Please try again.
          </p>
        </motion.div>

        {/* Order ID info */}
        {orderId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-md p-5 mb-5 border border-red-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">Order Reference</p>
                <p className="font-mono text-sm font-semibold text-gray-700">#{orderId}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                <FaTimesCircle className="text-xs" /> Payment Failed
              </span>
            </div>
            {order && (
              <p className="text-xs text-gray-400 mt-2">
                Amount attempted: <strong className="text-gray-600">₹{order.total?.toFixed(2)}</strong>
              </p>
            )}
          </motion.div>
        )}

        {/* Possible Reasons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-md p-6 mb-5 border border-orange-100"
        >
          <h2 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FaExclamationTriangle className="text-orange-400" />
            Common Reasons for Failure
          </h2>
          <ul className="space-y-2">
            {POSSIBLE_REASONS.map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-500">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
                {reason}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* What happens now */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6"
        >
          <p className="text-sm text-blue-700 font-medium">
            ℹ️ <strong>No money was deducted.</strong> Any temporary hold will be released within 5–7 business days.
            If you see a deduction, please contact your bank or reach out to our support.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <button
            onClick={() => navigate('/checkout')}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-5 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-semibold shadow-md"
          >
            <FaRedo /> Retry Payment
          </button>

          <Link
            to="/cart"
            className="flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 py-3 px-5 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all font-semibold"
          >
            <FaShoppingBag /> View Cart
          </Link>

          <Link
            to="/"
            className="flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 py-3 px-5 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all font-semibold"
          >
            <FaHome /> Continue Shopping
          </Link>

          <a
            href="mailto:support@ecostore.com"
            className="flex items-center justify-center gap-2 bg-orange-50 border-2 border-orange-200 text-orange-700 py-3 px-5 rounded-xl hover:bg-orange-100 transition-all font-semibold"
          >
            <FaHeadset /> Contact Support
          </a>
        </motion.div>

      </div>
    </div>
  );
};

export default OrderFailure;
