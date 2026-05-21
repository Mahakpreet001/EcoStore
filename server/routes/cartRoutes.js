const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateQuantity, removeFromCart, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getCart).delete(protect, clearCart);
router.post('/add', protect, addToCart);
router.put('/update', protect, updateQuantity);
router.delete('/:id', protect, removeFromCart);

module.exports = router;
