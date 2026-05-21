const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createRazorpayOrder,
  verifyPayment,
  handlePaymentFailure,
  razorpayWebhook,
  applyCoupon,
  placeCODOrder,
} = require('../controllers/paymentController');

// ── Protected routes (user must be logged in) ──────────────────────────────
router.post('/coupon/apply',   protect, applyCoupon);
router.post('/create-order',   protect, createRazorpayOrder);
router.post('/verify',         protect, verifyPayment);
router.post('/failed',         protect, handlePaymentFailure);
router.post('/cod',            protect, placeCODOrder);

// ── Razorpay Webhook — PUBLIC (Razorpay hits this directly) ────────────────
// Raw body needed for HMAC signature verification
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    // Parse raw body back to JSON for the handler
    if (Buffer.isBuffer(req.body)) {
      try {
        req.body = JSON.parse(req.body.toString());
      } catch {
        return res.status(400).json({ message: 'Invalid JSON payload.' });
      }
    }
    next();
  },
  razorpayWebhook
);

module.exports = router;
