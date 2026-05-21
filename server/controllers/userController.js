const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  return null;
};

// Validation rules (reusable middleware)
const signupValidation = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters.'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signupUser = [
  ...signupValidation,
  async (req, res) => {
    if (handleValidationErrors(req, res)) return;
    const { name, email, password } = req.body;
    try {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: 'An account with this email already exists.' });

      const user = await User.create({ name, email, password });
      res.status(201).json({
        message: 'Signup successful',
        user: { id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) },
      });
    } catch (error) {
      res.status(500).json({ message: 'Signup failed. Please try again.' });
    }
  },
];

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = [
  ...loginValidation,
  async (req, res) => {
    if (handleValidationErrors(req, res)) return;
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }
      res.json({
        message: 'Login successful',
        user: { id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) },
      });
    } catch (error) {
      res.status(500).json({ message: 'Login failed. Please try again.' });
    }
  },
];

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
};

// @desc    Update user profile (name only — email changes need verification in prod)
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = [
  body('name').trim().notEmpty().withMessage('Name cannot be empty.'),
  async (req, res) => {
    if (handleValidationErrors(req, res)) return;
    try {
      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ message: 'User not found.' });

      user.name = req.body.name;
      await user.save();

      res.json({ id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
    } catch (error) {
      res.status(500).json({ message: 'Profile update failed.' });
    }
  },
];

module.exports = { signupUser, loginUser, getUserProfile, updateUserProfile };
