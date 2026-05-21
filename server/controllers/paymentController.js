const Razorpay = require('razorpay');
const crypto = require('crypto');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');

const TAX_RATE = 0.08;
const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_COST = 50;
const DELIVERY_DAYS = 5;

// ── Helpers ────────────────────────────────────────────────────────────────

const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials not configured.');
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

const calculatePricing = (items, discount = 0) => {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const tax = parseFloat((discountedSubtotal * TAX_RATE).toFixed(2));
  const shipping = discountedSubtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = parseFloat((discountedSubtotal + tax + shipping).toFixed(2));
  return { subtotal, tax, shipping, total };
};

const validateAddress = (addr) =>
  addr?.name && addr?.phone && addr?.addressLine1 && addr?.city && addr?.state && addr?.pincode;

const incrementCoupon = async (couponCode) => {
  if (couponCode) {
    await Coupon.findOneAndUpdate(
      { code: couponCode.trim().toUpperCase() },
      { $inc: { usedCount: 1 } }
    );
  }
};

// ── Controllers ────────────────────────────────────────────────────────────

// @desc    Apply coupon code and return discount amount
// @route   POST /api/payment/coupon/apply
// @access  Private
const applyCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) return res.status(400).json({ message: 'Coupon code is required.' });

    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ message: 'Invalid or expired coupon code.' });

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return res.status(400).json({ message: 'This coupon has expired.' });
    }
    if (coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ message: 'Coupon usage limit has been reached.' });
    }
    if (Number(subtotal) < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum order of ₹${coupon.minOrderAmount} required for this coupon.`,
      });
    }

    const rawDiscount = coupon.discountType === 'percent'
      ? (Number(subtotal) * coupon.discountValue) / 100
      : coupon.discountValue;

    const discount = parseFloat(Math.min(rawDiscount, Number(subtotal)).toFixed(2));

    res.json({
      discount,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      message: coupon.discountType === 'percent'
        ? `${coupon.discountValue}% discount applied!`
        : `₹${coupon.discountValue} discount applied!`,
    });
  } catch (error) {
    console.error('applyCoupon error:', error);
    res.status(500).json({ message: 'Failed to apply coupon.' });
  }
};

// @desc    Create Razorpay order + save pending DB order
// @route   POST /api/payment/create-order
// @access  Private
const createRazorpayOrder = async (req, res) => {
  try {
    const { shippingAddress, couponCode, discount = 0 } = req.body;

    if (!validateAddress(shippingAddress)) {
      return res.status(400).json({ message: 'Complete shipping address is required.' });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty.' });
    }

    const items = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.image,
      quantity: item.quantity,
    }));

    const numericDiscount = Number(discount) || 0;
    const { subtotal, tax, shipping, total } = calculatePricing(items, numericDiscount);

    const razorpay = getRazorpayInstance();
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100), // paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: {
        user: req.user._id.toString(),
        couponCode: couponCode || '',
      },
    });

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + DELIVERY_DAYS);

    const order = await Order.create({
      user: req.user._id,
      items,
      subtotal,
      tax,
      shipping,
      discount: numericDiscount,
      total,
      couponCode: couponCode || undefined,
      shippingAddress,
      paymentMethod: 'Razorpay',
      paymentStatus: 'pending',
      razorpayOrderId: razorpayOrder.id,
      estimatedDelivery,
    });

    res.json({
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('createRazorpayOrder error:', error);
    res.status(500).json({ message: error.message || 'Failed to create payment order.' });
  }
};

// @desc    Verify Razorpay payment signature (called from frontend after payment)
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, couponCode } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: 'Payment details are incomplete.' });
    }

    // HMAC-SHA256 signature verification
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      await Order.findByIdAndUpdate(orderId, { paymentStatus: 'failed', status: 'cancelled' });
      return res.status(400).json({ message: 'Payment verification failed. Signature mismatch.' });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: 'paid',
        status: 'processing',
        razorpayPaymentId,
        razorpaySignature,
      },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: 'Order not found.' });

    // Clear user's server-side cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    // Increment coupon usage
    await incrementCoupon(couponCode);

    res.json({ message: 'Payment verified successfully.', orderId: order._id });
  } catch (error) {
    console.error('verifyPayment error:', error);
    res.status(500).json({ message: 'Payment verification failed.' });
  }
};

// @desc    Mark payment as failed (called when user closes Razorpay modal)
// @route   POST /api/payment/failed
// @access  Private
const handlePaymentFailure = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'failed',
        status: 'cancelled',
      });
    }
    res.json({ message: 'Payment failure recorded.' });
  } catch (error) {
    console.error('handlePaymentFailure error:', error);
    res.status(500).json({ message: 'Failed to record payment failure.' });
  }
};

// @desc    Razorpay webhook — server-side payment confirmation (production safety net)
// @route   POST /api/payment/webhook
// @access  Public (verified via Razorpay-Signature header)
const razorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Only verify signature if webhook secret is configured
    if (webhookSecret) {
      const signature = req.headers['x-razorpay-signature'];
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (signature !== expectedSignature) {
        return res.status(400).json({ message: 'Invalid webhook signature.' });
      }
    }

    const event = req.body.event;
    const paymentEntity = req.body.payload?.payment?.entity;

    if (event === 'payment.captured' && paymentEntity) {
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;

      const order = await Order.findOne({ razorpayOrderId });
      if (order && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
        order.status = 'processing';
        order.razorpayPaymentId = razorpayPaymentId;
        await order.save();

        // Clear server cart
        await Cart.findOneAndUpdate({ user: order.user }, { items: [] });

        // Increment coupon
        await incrementCoupon(order.couponCode);

        console.log(`Webhook: Payment captured for order ${order._id}`);
      }
    }

    if (event === 'payment.failed' && paymentEntity) {
      const razorpayOrderId = paymentEntity.order_id;
      const order = await Order.findOne({ razorpayOrderId });
      if (order && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'failed';
        order.status = 'cancelled';
        await order.save();
        console.log(`Webhook: Payment failed for order ${order._id}`);
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('razorpayWebhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed.' });
  }
};

// @desc    Place a Cash on Delivery order
// @route   POST /api/payment/cod
// @access  Private
const placeCODOrder = async (req, res) => {
  try {
    const { shippingAddress, couponCode, discount = 0 } = req.body;

    if (!validateAddress(shippingAddress)) {
      return res.status(400).json({ message: 'Complete shipping address is required.' });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty.' });
    }

    const items = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.image,
      quantity: item.quantity,
    }));

    const numericDiscount = Number(discount) || 0;
    const { subtotal, tax, shipping, total } = calculatePricing(items, numericDiscount);

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + DELIVERY_DAYS);

    const order = await Order.create({
      user: req.user._id,
      items,
      subtotal,
      tax,
      shipping,
      discount: numericDiscount,
      total,
      couponCode: couponCode || undefined,
      shippingAddress,
      paymentMethod: 'COD',
      paymentStatus: 'pending',
      estimatedDelivery,
    });

    // Clear server cart
    cart.items = [];
    await cart.save();

    // Increment coupon usage
    await incrementCoupon(couponCode);

    res.status(201).json({ orderId: order._id });
  } catch (error) {
    console.error('placeCODOrder error:', error);
    res.status(500).json({ message: 'Failed to place order.' });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPayment,
  handlePaymentFailure,
  razorpayWebhook,
  applyCoupon,
  placeCODOrder,
};
