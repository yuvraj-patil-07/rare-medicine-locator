const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('recentlyViewed.medicine', 'name image price category');

  return ApiResponse.success(res, { user });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body;

  const updateData = {};
  if (name) updateData.name = name;
  if (phone) updateData.phone = phone;
  if (address) updateData.address = address;

  // Handle avatar upload
  if (req.file) {
    updateData.avatar = `/uploads/${req.file.filename}`;
  }

  const user = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  });

  return ApiResponse.success(res, { user }, 'Profile updated successfully');
});

// @desc    Get search history
// @route   GET /api/users/search-history
// @access  Private
const getSearchHistory = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('searchHistory');
  return ApiResponse.success(res, { searchHistory: user.searchHistory });
});

// @desc    Clear search history
// @route   DELETE /api/users/search-history
// @access  Private
const clearSearchHistory = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { searchHistory: [] });
  return ApiResponse.success(res, null, 'Search history cleared');
});

// @desc    Get recently viewed medicines
// @route   GET /api/users/recently-viewed
// @access  Private
const getRecentlyViewed = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('recentlyViewed')
    .populate({
      path: 'recentlyViewed.medicine',
      select: 'name image price category stock pharmacy',
      populate: { path: 'pharmacy', select: 'name address.city' },
    });

  return ApiResponse.success(res, { recentlyViewed: user.recentlyViewed });
});

// @desc    Delete account
// @route   DELETE /api/users/account
// @access  Private
const deleteAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { isActive: false });
  return ApiResponse.success(res, null, 'Account deactivated successfully');
});

module.exports = {
  getProfile,
  updateProfile,
  getSearchHistory,
  clearSearchHistory,
  getRecentlyViewed,
  deleteAccount,
};
