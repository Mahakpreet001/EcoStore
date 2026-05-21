const Product = require('../models/Product');

// @desc    Fetch products with search, filter, sort, and pagination
// @route   GET /api/products?page=1&limit=12&category=&search=&minPrice=&maxPrice=&sortBy=
// @access  Public
const getProducts = async (req, res) => {
  try {
    const queryObj = {};

    if (req.query.category) queryObj.category = req.query.category;

    if (req.query.search) {
      queryObj.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    if (req.query.minPrice || req.query.maxPrice) {
      queryObj.price = {};
      if (req.query.minPrice) queryObj.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) queryObj.price.$lte = Number(req.query.maxPrice);
    }

    // Sorting
    const sortMap = {
      'price-low': { price: 1 },
      'price-high': { price: -1 },
      'rating': { rating: -1 },
      'newest': { createdAt: -1 },
      'name': { name: 1 },
    };
    const sort = sortMap[req.query.sortBy] || { name: 1 };

    // Pagination
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(queryObj).sort(sort).skip(skip).limit(limit),
      Product.countDocuments(queryObj),
    ]);

    res.json({
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json(product);
  } catch (error) {
    res.status(404).json({ message: 'Product not found.' });
  }
};

// @desc    Get distinct categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const product = await new Product(req.body).save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create product.' });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    const { name, price, description, image, category, rating } = req.body;
    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = price;
    if (description !== undefined) product.description = description;
    if (image !== undefined) product.image = image;
    if (category !== undefined) product.category = category;
    if (rating !== undefined) product.rating = rating;

    res.json(await product.save());
  } catch (error) {
    res.status(400).json({ message: 'Failed to update product.' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    await product.deleteOne();
    res.json({ message: 'Product removed.' });
  } catch (error) {
    res.status(400).json({ message: 'Failed to delete product.' });
  }
};

module.exports = { getProducts, getProductById, getCategories, createProduct, updateProduct, deleteProduct };
