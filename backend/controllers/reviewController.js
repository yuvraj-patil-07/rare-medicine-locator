const Review = require('../models/Review');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const Reservation = require('../models/Reservation');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const NotificationService = require('../services/notificationService');
const { getPaginationData } = require('../utils/helpers');

// @desc    Create review for pharmacy
// @route   POST /api/reviews/pharmacy/:pharmacyId
// @access  Private
const createPharmacyReview = asyncHandler(async (req, res) => {
  const { rating, title, comment } = req.body;
  const pharmacyId = req.params.pharmacyId;

  const pharmacy = await Pharmacy.findById(pharmacyId);
  if (!pharmacy) {
    return ApiResponse.error(res, 'Pharmacy not found', 404);
  }

  // Check if user already reviewed
  const existingReview = await Review.findOne({
    user: req.user._id,
    pharmacy: pharmacyId,
  });

  if (existingReview) {
    return ApiResponse.error(res, 'You have already reviewed this pharmacy', 400);
  }

  // Check if user has a completed reservation at this pharmacy
  const hasReservation = await Reservation.findOne({
    user: req.user._id,
    pharmacy: pharmacyId,
    status: 'completed',
  });

  const review = await Review.create({
    user: req.user._id,
    pharmacy: pharmacyId,
    rating,
    title,
    comment,
    isVerifiedPurchase: !!hasReservation,
  });

  const populatedReview = await Review.findById(review._id).populate('user', 'name avatar');

  // Notify pharmacy owner
  await NotificationService.newReview(pharmacy.owner, req.user._id, pharmacyId, rating);

  return ApiResponse.created(res, { review: populatedReview }, 'Review submitted successfully');
});

// @desc    Create review for medicine
// @route   POST /api/reviews/medicine/:medicineId
// @access  Private
const createMedicineReview = asyncHandler(async (req, res) => {
  const { rating, title, comment } = req.body;
  const medicineId = req.params.medicineId;

  const medicine = await Medicine.findById(medicineId);
  if (!medicine) {
    return ApiResponse.error(res, 'Medicine not found', 404);
  }

  const existingReview = await Review.findOne({
    user: req.user._id,
    medicine: medicineId,
  });

  if (existingReview) {
    return ApiResponse.error(res, 'You have already reviewed this medicine', 400);
  }

  const review = await Review.create({
    user: req.user._id,
    medicine: medicineId,
    rating,
    title,
    comment,
  });

  const populatedReview = await Review.findById(review._id).populate('user', 'name avatar');

  return ApiResponse.created(res, { review: populatedReview }, 'Review submitted successfully');
});

// @desc    Get pharmacy reviews
// @route   GET /api/reviews/pharmacy/:pharmacyId
// @access  Public
const getPharmacyReviews = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = { pharmacy: req.params.pharmacyId, isActive: true };

  const total = await Review.countDocuments(filter);
  const reviews = await Review.find(filter)
    .populate('user', 'name avatar')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const pagination = getPaginationData(page, limit, total);

  return ApiResponse.paginated(res, reviews, pagination);
});

// @desc    Get medicine reviews
// @route   GET /api/reviews/medicine/:medicineId
// @access  Public
const getMedicineReviews = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = { medicine: req.params.medicineId, isActive: true };

  const total = await Review.countDocuments(filter);
  const reviews = await Review.find(filter)
    .populate('user', 'name avatar')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const pagination = getPaginationData(page, limit, total);

  return ApiResponse.paginated(res, reviews, pagination);
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return ApiResponse.error(res, 'Review not found', 404);
  }

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return ApiResponse.error(res, 'Not authorized', 403);
  }

  review.isActive = false;
  await review.save();

  // Recalculate ratings
  if (review.pharmacy) await Review.calcAverageRating(review.pharmacy);
  if (review.medicine) await Review.calcMedicineRating(review.medicine);

  return ApiResponse.success(res, null, 'Review deleted successfully');
});

// @desc    Mark review as helpful
// @route   PUT /api/reviews/:id/helpful
// @access  Private
const markHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { $inc: { helpful: 1 } },
    { new: true }
  );

  if (!review) {
    return ApiResponse.error(res, 'Review not found', 404);
  }

  return ApiResponse.success(res, { review }, 'Marked as helpful');
});

module.exports = {
  createPharmacyReview,
  createMedicineReview,
  getPharmacyReviews,
  getMedicineReviews,
  deleteReview,
  markHelpful,
};
