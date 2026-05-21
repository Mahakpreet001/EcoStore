const express = require('express');
const router = express.Router();
const { placeOrder, getMyOrders, getOrderById, cancelOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getMyOrders).post(protect, placeOrder);
router.route('/:id').get(protect, getOrderById);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
