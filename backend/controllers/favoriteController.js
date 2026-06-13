const Favorite = require('../models/Favorite');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const { getPaginationData } = require('../utils/helpers');

// @desc    Toggle favorite medicine
// @route   POST /api/favorites/medicine/:medicineId
// @access  Private
const toggleMedicineFavorite = asyncHandler(async (req, res) => {
  const existing = await Favorite.findOne({
    user: req.user._id,
    medicine: req.params.medicineId,
  });

  if (existing) {
    await Favorite.findByIdAndDelete(existing._id);
    return ApiResponse.success(res, { isFavorited: false }, 'Removed from favorites');
  }

  await Favorite.create({
    user: req.user._id,
    medicine: req.params.medicineId,
  });

  return ApiResponse.success(res, { isFavorited: true }, 'Added to favorites');
});

// @desc    Toggle favorite pharmacy
// @route   POST /api/favorites/pharmacy/:pharmacyId
// @access  Private
const togglePharmacyFavorite = asyncHandler(async (req, res) => {
  const existing = await Favorite.findOne({
    user: req.user._id,
    pharmacy: req.params.pharmacyId,
  });

  if (existing) {
    await Favorite.findByIdAndDelete(existing._id);
    return ApiResponse.success(res, { isFavorited: false }, 'Removed from favorites');
  }

  await Favorite.create({
    user: req.user._id,
    pharmacy: req.params.pharmacyId,
  });

  return ApiResponse.success(res, { isFavorited: true }, 'Added to favorites');
});

// @desc    Get favorite medicines
// @route   GET /api/favorites/medicines
// @access  Private
const getFavoriteMedicines = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  const total = await Favorite.countDocuments({ user: req.user._id, medicine: { $exists: true } });
  const favorites = await Favorite.find({ user: req.user._id, medicine: { $exists: true } })
    .populate({
      path: 'medicine',
      select: 'name image price category stock pharmacy',
      populate: { path: 'pharmacy', select: 'name address.city' },
    })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const pagination = getPaginationData(page, limit, total);

  return ApiResponse.paginated(res, favorites, pagination);
});

// @desc    Get favorite pharmacies
// @route   GET /api/favorites/pharmacies
// @access  Private
const getFavoritePharmacies = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  const total = await Favorite.countDocuments({ user: req.user._id, pharmacy: { $exists: true } });
  const favorites = await Favorite.find({ user: req.user._id, pharmacy: { $exists: true } })
    .populate('pharmacy', 'name image address phone rating totalReviews')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const pagination = getPaginationData(page, limit, total);

  return ApiResponse.paginated(res, favorites, pagination);
});

// @desc    Check if item is favorited
// @route   GET /api/favorites/check
// @access  Private
const checkFavorite = asyncHandler(async (req, res) => {
  const { medicineId, pharmacyId } = req.query;

  const filter = { user: req.user._id };
  if (medicineId) filter.medicine = medicineId;
  if (pharmacyId) filter.pharmacy = pharmacyId;

  const favorite = await Favorite.findOne(filter);

  return ApiResponse.success(res, { isFavorited: !!favorite });
});

module.exports = {
  toggleMedicineFavorite,
  togglePharmacyFavorite,
  getFavoriteMedicines,
  getFavoritePharmacies,
  checkFavorite,
};
