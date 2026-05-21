const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Single source-of-truth for cart response format
const formatCart = (cart) =>
  cart.items.map(item => ({
    id: item.product._id,
    name: item.product.name,
    price: item.product.price,
    image: item.product.image,
    category: item.product.category,
    quantity: item.quantity,
  }));

const populateAndRespond = async (cart, res) => {
  await cart.populate('items.product');
  res.json(formatCart(cart));
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    res.json(formatCart(cart));
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving cart.' });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  if (!productId) return res.status(400).json({ message: 'productId is required.' });
  if (quantity < 1) return res.status(400).json({ message: 'Quantity must be at least 1.' });

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

    const existingIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    await populateAndRespond(cart, res);
  } catch (error) {
    res.status(500).json({ message: 'Server error adding to cart.' });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
const updateQuantity = async (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId || quantity == null) return res.status(400).json({ message: 'productId and quantity are required.' });
  if (quantity < 1) return res.status(400).json({ message: 'Quantity must be at least 1.' });

  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found.' });

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex === -1) return res.status(404).json({ message: 'Item not found in cart.' });

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    await populateAndRespond(cart, res);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating cart.' });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found.' });

    cart.items = cart.items.filter(item => item.product.toString() !== req.params.id);
    await cart.save();
    await populateAndRespond(cart, res);
  } catch (error) {
    res.status(500).json({ message: 'Server error removing from cart.' });
  }
};

// @desc    Clear entire cart (called internally after checkout)
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: 'Server error clearing cart.' });
  }
};

module.exports = { getCart, addToCart, updateQuantity, removeFromCart, clearCart };
