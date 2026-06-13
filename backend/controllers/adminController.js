const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const Reservation = require('../models/Reservation');
const Review = require('../models/Review');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const NotificationService = require('../services/notificationService');
const { getPaginationData } = require('../utils/helpers');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (admin)
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalPharmacies,
    approvedPharmacies,
    pendingPharmacies,
    totalMedicines,
    totalReservations,
    completedReservations,
    pendingReservations,
    totalReviews,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Pharmacy.countDocuments(),
    Pharmacy.countDocuments({ isApproved: true }),
    Pharmacy.countDocuments({ isApproved: false }),
    Medicine.countDocuments({ isActive: true }),
    Reservation.countDocuments(),
    Reservation.countDocuments({ status: 'completed' }),
    Reservation.countDocuments({ status: 'pending' }),
    Review.countDocuments({ isActive: true }),
  ]);

  // Revenue
  const revenueResult = await Reservation.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } },
  ]);

  // Recent activity
  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('name email role createdAt');

  const recentReservations = await Reservation.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('user', 'name')
    .populate('medicine', 'name')
    .populate('pharmacy', 'name');

  // Monthly stats (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyReservations = await Reservation.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
        revenue: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$totalPrice', 0] } },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Top categories
  const topCategories = await Medicine.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  const stats = {
    totalUsers,
    totalPharmacies,
    approvedPharmacies,
    pendingPharmacies,
    totalMedicines,
    totalReservations,
    completedReservations,
    pendingReservations,
    totalReviews,
    totalRevenue: revenueResult.length > 0 ? revenueResult[0].total : 0,
    recentUsers,
    recentReservations,
    monthlyReservations,
    topCategories,
  };

  return ApiResponse.success(res, { stats });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (admin)
const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.search) {
    filter.$or = [
      { name: new RegExp(req.query.search, 'i') },
      { email: new RegExp(req.query.search, 'i') },
    ];
  }

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .select('-password')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const pagination = getPaginationData(page, limit, total);

  return ApiResponse.paginated(res, users, pagination);
});

// @desc    Update user status
// @route   PUT /api/admin/users/:id
// @access  Private (admin)
const updateUser = asyncHandler(async (req, res) => {
  const { isActive, role } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    return ApiResponse.error(res, 'User not found', 404);
  }

  if (isActive !== undefined) user.isActive = isActive;
  if (role) user.role = role;

  await user.save();

  return ApiResponse.success(res, { user }, 'User updated successfully');
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (admin)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return ApiResponse.error(res, 'User not found', 404);
  }

  user.isActive = false;
  await user.save();

  return ApiResponse.success(res, null, 'User deactivated successfully');
});

// @desc    Get all pharmacies (admin)
// @route   GET /api/admin/pharmacies
// @access  Private (admin)
const getAllPharmacies = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.approved === 'true') filter.isApproved = true;
  if (req.query.approved === 'false') filter.isApproved = false;
  if (req.query.search) {
    filter.name = new RegExp(req.query.search, 'i');
  }

  const total = await Pharmacy.countDocuments(filter);
  const pharmacies = await Pharmacy.find(filter)
    .populate('owner', 'name email')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const pagination = getPaginationData(page, limit, total);

  return ApiResponse.paginated(res, pharmacies, pagination);
});

// @desc    Approve pharmacy
// @route   PUT /api/admin/pharmacies/:id/approve
// @access  Private (admin)
const approvePharmacy = asyncHandler(async (req, res) => {
  const pharmacy = await Pharmacy.findById(req.params.id);

  if (!pharmacy) {
    return ApiResponse.error(res, 'Pharmacy not found', 404);
  }

  pharmacy.isApproved = true;
  await pharmacy.save();

  // Notify pharmacy owner
  await NotificationService.pharmacyApproved(pharmacy.owner, pharmacy._id);

  return ApiResponse.success(res, { pharmacy }, 'Pharmacy approved successfully');
});

// @desc    Reject pharmacy
// @route   PUT /api/admin/pharmacies/:id/reject
// @access  Private (admin)
const rejectPharmacy = asyncHandler(async (req, res) => {
  const pharmacy = await Pharmacy.findById(req.params.id);

  if (!pharmacy) {
    return ApiResponse.error(res, 'Pharmacy not found', 404);
  }

  pharmacy.isApproved = false;
  pharmacy.isActive = false;
  await pharmacy.save();

  // Notify pharmacy owner
  await NotificationService.pharmacyRejected(pharmacy.owner, pharmacy._id);

  return ApiResponse.success(res, { pharmacy }, 'Pharmacy rejected');
});

// @desc    Delete pharmacy
// @route   DELETE /api/admin/pharmacies/:id
// @access  Private (admin)
const deletePharmacy = asyncHandler(async (req, res) => {
  const pharmacy = await Pharmacy.findById(req.params.id);

  if (!pharmacy) {
    return ApiResponse.error(res, 'Pharmacy not found', 404);
  }

  pharmacy.isActive = false;
  await pharmacy.save();

  // Deactivate all medicines
  await Medicine.updateMany({ pharmacy: pharmacy._id }, { isActive: false });

  return ApiResponse.success(res, null, 'Pharmacy deactivated');
});

// @desc    Get all medicines (admin)
// @route   GET /api/admin/medicines
// @access  Private (admin)
const getAllMedicines = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.search) {
    filter.name = new RegExp(req.query.search, 'i');
  }
  if (req.query.category) {
    filter.category = req.query.category;
  }

  const total = await Medicine.countDocuments(filter);
  const medicines = await Medicine.find(filter)
    .populate('pharmacy', 'name address.city')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const pagination = getPaginationData(page, limit, total);

  return ApiResponse.paginated(res, medicines, pagination);
});

// @desc    Delete medicine (admin)
// @route   DELETE /api/admin/medicines/:id
// @access  Private (admin)
const deleteMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);

  if (!medicine) {
    return ApiResponse.error(res, 'Medicine not found', 404);
  }

  medicine.isActive = false;
  await medicine.save();

  return ApiResponse.success(res, null, 'Medicine removed');
});

// @desc    Get reports
// @route   GET /api/admin/reports
// @access  Private (admin)
const getReports = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  const reservationFilter = {};
  if (Object.keys(dateFilter).length > 0) {
    reservationFilter.createdAt = dateFilter;
  }

  const [
    reservationsByStatus,
    topMedicines,
    topPharmacies,
    dailyReservations,
  ] = await Promise.all([
    Reservation.aggregate([
      { $match: reservationFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Reservation.aggregate([
      { $match: { ...reservationFilter, status: 'completed' } },
      { $group: { _id: '$medicine', count: { $sum: 1 }, revenue: { $sum: '$totalPrice' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'medicines',
          localField: '_id',
          foreignField: '_id',
          as: 'medicine',
        },
      },
      { $unwind: '$medicine' },
      { $project: { name: '$medicine.name', count: 1, revenue: 1 } },
    ]),
    Reservation.aggregate([
      { $match: { ...reservationFilter, status: 'completed' } },
      { $group: { _id: '$pharmacy', count: { $sum: 1 }, revenue: { $sum: '$totalPrice' } } },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'pharmacies',
          localField: '_id',
          foreignField: '_id',
          as: 'pharmacy',
        },
      },
      { $unwind: '$pharmacy' },
      { $project: { name: '$pharmacy.name', count: 1, revenue: 1 } },
    ]),
    Reservation.aggregate([
      { $match: reservationFilter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 30 },
    ]),
  ]);

  return ApiResponse.success(res, {
    reports: {
      reservationsByStatus,
      topMedicines,
      topPharmacies,
      dailyReservations,
    },
  });
});

module.exports = {
  getDashboardStats,
  getUsers,
  updateUser,
  deleteUser,
  getAllPharmacies,
  approvePharmacy,
  rejectPharmacy,
  deletePharmacy,
  getAllMedicines,
  deleteMedicine,
  getReports,
};
