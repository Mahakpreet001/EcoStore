const Order = require('../models/Order');

const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

// @desc    Get all orders (admin) with stats + pagination
// @route   GET /api/admin/orders
// @access  Admin
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 25 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const query = status && VALID_STATUSES.includes(status) ? { status } : {};

    const [orders, total, [stats]] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(query),
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue:  { $sum: '$total' },
            totalOrders:   { $sum: 1 },
            pending:    { $sum: { $cond: [{ $eq: ['$status', 'pending'] },    1, 0] } },
            processing: { $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] } },
            shipped:    { $sum: { $cond: [{ $eq: ['$status', 'shipped'] },    1, 0] } },
            delivered:  { $sum: { $cond: [{ $eq: ['$status', 'delivered'] },  1, 0] } },
            cancelled:  { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] },  1, 0] } },
          },
        },
      ]),
    ]);

    res.json({
      orders,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        hasNext: Number(page) * Number(limit) < total,
        hasPrev: Number(page) > 1,
      },
      stats: stats ?? {
        totalRevenue: 0, totalOrders: 0,
        pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0,
      },
    });
  } catch (error) {
    console.error('getAllOrders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders.' });
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/admin/orders/:id/status
// @access  Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}.` });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: 'after', runValidators: true }
    ).populate('user', 'name email');

    if (!order) return res.status(404).json({ message: 'Order not found.' });

    res.json(order);
  } catch (error) {
    console.error('updateOrderStatus error:', error);
    res.status(500).json({ message: 'Failed to update order status.' });
  }
};

module.exports = { getAllOrders, updateOrderStatus };
