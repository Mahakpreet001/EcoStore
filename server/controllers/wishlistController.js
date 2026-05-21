const Wishlist = require('../models/Wishlist');

const formatProducts = (products) =>
  products.map(p => ({
    id: p._id,
    name: p.name,
    price: p.price,
    image: p.image,
    category: p.category,
    description: p.description,
    rating: p.rating,
  }));

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }
    res.json(formatProducts(wishlist.products));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch wishlist.' });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist/add
// @access  Private
const addToWishlist = async (req, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ message: 'productId is required.' });

  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [productId] });
    } else if (!wishlist.products.map(String).includes(String(productId))) {
      wishlist.products.push(productId);
      await wishlist.save();
    }
    await wishlist.populate('products');
    res.json(formatProducts(wishlist.products));
  } catch (error) {
    res.status(500).json({ message: 'Failed to add to wishlist.' });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:id
// @access  Private
const removeFromWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (wishlist) {
      wishlist.products = wishlist.products.filter(p => p.toString() !== req.params.id);
      await wishlist.save();
      await wishlist.populate('products');
      return res.json(formatProducts(wishlist.products));
    }
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove from wishlist.' });
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
