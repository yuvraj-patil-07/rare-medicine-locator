const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const GeoService = require('../services/geoService');
const { getPaginationData } = require('../utils/helpers');

// @desc    Register a new pharmacy
// @route   POST /api/pharmacies
// @access  Private (pharmacy role)
const createPharmacy = asyncHandler(async (req, res) => {
  let {
    name, description, license, phone, email, website,
    address, coordinates, operatingHours, deliveryAvailable, emergencyAvailable,
  } = req.body;

  // Check if user already has a pharmacy
  const existingPharmacy = await Pharmacy.findOne({ owner: req.user._id });
  if (existingPharmacy) {
    return ApiResponse.error(res, 'You already have a registered pharmacy', 400);
  }

  if (typeof address === 'string') {
    try { address = JSON.parse(address); } catch (e) {}
  }
  if (typeof operatingHours === 'string') {
    try { operatingHours = JSON.parse(operatingHours); } catch (e) {}
  }
  
  let longitude = 0, latitude = 0;
  if (coordinates) {
    let parsedCoords = coordinates;
    if (typeof coordinates === 'string') {
      try { parsedCoords = JSON.parse(coordinates); } catch (e) {}
    }
    longitude = parseFloat(parsedCoords.longitude || parsedCoords[0] || 0);
    latitude = parseFloat(parsedCoords.latitude || parsedCoords[1] || 0);
  }

  const pharmacyData = {
    owner: req.user._id,
    name,
    description,
    license,
    phone,
    email,
    website,
    address,
    location: {
      type: 'Point',
      coordinates: [longitude, latitude],
    },
    operatingHours,
    deliveryAvailable: deliveryAvailable === 'true' || deliveryAvailable === true,
    emergencyAvailable: emergencyAvailable === 'true' || emergencyAvailable === true,
  };

  if (req.file) {
    pharmacyData.image = `/uploads/${req.file.filename}`;
  }

  const pharmacy = await Pharmacy.create(pharmacyData);

  return ApiResponse.created(res, { pharmacy }, 'Pharmacy registered. Awaiting admin approval.');
});

// @desc    Get all approved pharmacies
// @route   GET /api/pharmacies
// @access  Public
const getPharmacies = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  const filter = { isApproved: true, isActive: true };

  if (req.query.city) {
    filter['address.city'] = new RegExp(req.query.city, 'i');
  }

  if (req.query.emergency === 'true') {
    filter.emergencyAvailable = true;
  }

  if (req.query.delivery === 'true') {
    filter.deliveryAvailable = true;
  }

  const total = await Pharmacy.countDocuments(filter);
  const pharmacies = await Pharmacy.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ rating: -1, createdAt: -1 });

  const pagination = getPaginationData(page, limit, total);

  return ApiResponse.paginated(res, pharmacies, pagination);
});

// @desc    Get nearby pharmacies
// @route   GET /api/pharmacies/nearby
// @access  Public
const getNearbyPharmacies = asyncHandler(async (req, res) => {
  const { longitude, latitude, maxDistance } = req.query;

  if (!longitude || !latitude) {
    return ApiResponse.error(res, 'Please provide longitude and latitude', 400);
  }

  const maxDistanceKm = parseFloat(maxDistance) || 10;
  const pharmacies = await GeoService.findNearbyPharmacies(
    longitude, latitude, maxDistanceKm
  );

  return ApiResponse.success(res, { pharmacies, count: pharmacies.length });
});

// @desc    Get single pharmacy
// @route   GET /api/pharmacies/:id
// @access  Public
const getPharmacy = asyncHandler(async (req, res) => {
  const pharmacy = await Pharmacy.findById(req.params.id)
    .populate('owner', 'name email');

  if (!pharmacy) {
    return ApiResponse.error(res, 'Pharmacy not found', 404);
  }

  // Get medicines count and navigation URL
  const medicineCount = await Medicine.countDocuments({
    pharmacy: pharmacy._id,
    isActive: true,
  });

  const pharmacyData = pharmacy.toObject();
  pharmacyData.totalMedicines = medicineCount;
  pharmacyData.isOpen = pharmacy.isCurrentlyOpen();

  if (req.query.userLat && req.query.userLng) {
    pharmacyData.navigationUrl = GeoService.getNavigationUrl(
      pharmacy.location.coordinates[1],
      pharmacy.location.coordinates[0],
      req.query.userLat,
      req.query.userLng
    );
  }

  return ApiResponse.success(res, { pharmacy: pharmacyData });
});

// @desc    Update pharmacy
// @route   PUT /api/pharmacies/:id
// @access  Private (pharmacy owner)
const updatePharmacy = asyncHandler(async (req, res) => {
  let pharmacy = await Pharmacy.findById(req.params.id);

  if (!pharmacy) {
    return ApiResponse.error(res, 'Pharmacy not found', 404);
  }

  if (pharmacy.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return ApiResponse.error(res, 'Not authorized to update this pharmacy', 403);
  }

  const updateData = { ...req.body };

  if (typeof req.body.address === 'string') {
    try { updateData.address = JSON.parse(req.body.address); } catch (e) {}
  }
  if (typeof req.body.operatingHours === 'string') {
    try { updateData.operatingHours = JSON.parse(req.body.operatingHours); } catch (e) {}
  }

  if (req.body.coordinates) {
    let parsedCoords = req.body.coordinates;
    if (typeof req.body.coordinates === 'string') {
      try { parsedCoords = JSON.parse(req.body.coordinates); } catch (e) {}
    }
    updateData.location = {
      type: 'Point',
      coordinates: [
        parseFloat(parsedCoords.longitude || parsedCoords[0] || 0),
        parseFloat(parsedCoords.latitude || parsedCoords[1] || 0),
      ],
    };
    delete updateData.coordinates;
  }

  if (req.body.deliveryAvailable !== undefined) {
    updateData.deliveryAvailable = req.body.deliveryAvailable === 'true' || req.body.deliveryAvailable === true;
  }
  if (req.body.emergencyAvailable !== undefined) {
    updateData.emergencyAvailable = req.body.emergencyAvailable === 'true' || req.body.emergencyAvailable === true;
  }

  if (req.file) {
    updateData.image = `/uploads/${req.file.filename}`;
  }

  pharmacy = await Pharmacy.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  return ApiResponse.success(res, { pharmacy }, 'Pharmacy updated successfully');
});

// @desc    Get pharmacy dashboard stats
// @route   GET /api/pharmacies/:id/stats
// @access  Private (pharmacy owner)
const getPharmacyStats = asyncHandler(async (req, res) => {
  const pharmacy = await Pharmacy.findById(req.params.id);

  if (!pharmacy) {
    return ApiResponse.error(res, 'Pharmacy not found', 404);
  }

  if (pharmacy.owner.toString() !== req.user._id.toString()) {
    return ApiResponse.error(res, 'Not authorized', 403);
  }

  const Reservation = require('../models/Reservation');

  const [
    totalMedicines,
    lowStockMedicines,
    outOfStockMedicines,
    pendingReservations,
    totalReservations,
    completedReservations,
    recentReservations,
  ] = await Promise.all([
    Medicine.countDocuments({ pharmacy: pharmacy._id, isActive: true }),
    Medicine.countDocuments({ pharmacy: pharmacy._id, isActive: true, stock: { $gt: 0, $lte: 5 } }),
    Medicine.countDocuments({ pharmacy: pharmacy._id, isActive: true, stock: 0 }),
    Reservation.countDocuments({ pharmacy: pharmacy._id, status: 'pending' }),
    Reservation.countDocuments({ pharmacy: pharmacy._id }),
    Reservation.countDocuments({ pharmacy: pharmacy._id, status: 'completed' }),
    Reservation.find({ pharmacy: pharmacy._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .populate('medicine', 'name'),
  ]);

  // Revenue calculation
  const revenueResult = await Reservation.aggregate([
    { $match: { pharmacy: pharmacy._id, status: 'completed' } },
    { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
  ]);

  const stats = {
    totalMedicines,
    lowStockMedicines,
    outOfStockMedicines,
    pendingReservations,
    totalReservations,
    completedReservations,
    rating: pharmacy.rating,
    totalReviews: pharmacy.totalReviews,
    totalRevenue: revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0,
    recentReservations,
  };

  return ApiResponse.success(res, { stats });
});

// @desc    Get my pharmacy (for pharmacy owner)
// @route   GET /api/pharmacies/my/pharmacy
// @access  Private (pharmacy role)
const getMyPharmacy = asyncHandler(async (req, res) => {
  const pharmacy = await Pharmacy.findOne({ owner: req.user._id });

  if (!pharmacy) {
    return ApiResponse.error(res, 'You do not have a registered pharmacy', 404);
  }

  return ApiResponse.success(res, { pharmacy });
});

module.exports = {
  createPharmacy,
  getPharmacies,
  getNearbyPharmacies,
  getPharmacy,
  updatePharmacy,
  getPharmacyStats,
  getMyPharmacy,
};
