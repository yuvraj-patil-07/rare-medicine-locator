const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const { validateEmail, validatePassword } = require('../utils/validators');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  if (!name || !email || !password) {
    return ApiResponse.error(res, 'Please provide name, email, and password', 400);
  }

  if (!validateEmail(email)) {
    return ApiResponse.error(res, 'Please provide a valid email', 400);
  }

  if (!validatePassword(password)) {
    return ApiResponse.error(res, 'Password must be at least 8 characters', 400);
  }

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return ApiResponse.error(res, 'An account with this email already exists', 400);
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: role === 'pharmacy' ? 'pharmacy' : 'user',
  });

  const token = user.generateAuthToken();

  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };

  return ApiResponse.created(res, { user: userData, token }, 'Registration successful');
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return ApiResponse.error(res, 'Please provide email and password', 400);
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return ApiResponse.error(res, 'Invalid credentials', 401);
  }

  if (!user.isActive) {
    return ApiResponse.error(res, 'Your account has been deactivated. Contact support.', 403);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return ApiResponse.error(res, 'Invalid credentials', 401);
  }

  const token = user.generateAuthToken();

  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    address: user.address,
    isActive: user.isActive,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
  };

  return ApiResponse.success(res, { user: userData, token }, 'Login successful');
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('recentlyViewed.medicine', 'name image price');

  return ApiResponse.success(res, { user });
});

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return ApiResponse.error(res, 'Please provide current and new password', 400);
  }

  if (!validatePassword(newPassword)) {
    return ApiResponse.error(res, 'New password must be at least 8 characters', 400);
  }

  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return ApiResponse.error(res, 'Current password is incorrect', 401);
  }

  user.password = newPassword;
  await user.save();

  const token = user.generateAuthToken();

  return ApiResponse.success(res, { token }, 'Password updated successfully');
});

module.exports = { register, login, getMe, updatePassword };
