const Medicine = require('../models/Medicine');
const Pharmacy = require('../models/Pharmacy');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const NotificationService = require('../services/notificationService');
const emailService = require('../services/emailService');
const { getPaginationData } = require('../utils/helpers');

// @desc    Search medicines (with autocomplete, filters, sorting, geo)
// @route   GET /api/medicines/search
// @access  Public
const searchMedicines = asyncHandler(async (req, res) => {
  const {
    q, category, minPrice, maxPrice, inStock,
    sortBy, page: pageStr, limit: limitStr,
    longitude, latitude, maxDistance,
  } = req.query;

  const page = parseInt(pageStr) || 1;
  const limit = parseInt(limitStr) || 12;
  const skip = (page - 1) * limit;

  let filter = { isActive: true };

  // Text search
  if (q) {
    filter.$or = [
      { name: new RegExp(q, 'i') },
      { genericName: new RegExp(q, 'i') },
      { brand: new RegExp(q, 'i') },
      { manufacturer: new RegExp(q, 'i') },
    ];

    // Save search history if user is logged in
    if (req.user) {
      await req.user.addSearchHistory(q);
    }
  }

  // Category filter
  if (category) {
    filter.category = category;
  }

  // Price filter
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  // Stock filter
  if (inStock === 'true') {
    filter.stock = { $gt: 0 };
  }

  // Nearby filter using geospatial query
  if (longitude && latitude) {
    const maxDistKm = parseFloat(maxDistance) || 10;
    const maxDistMeters = maxDistKm * 1000;

    const nearbyPharmacies = await Pharmacy.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: maxDistMeters,
        },
      },
      isApproved: true,
      isActive: true,
    }).select('_id');

    const pharmacyIds = nearbyPharmacies.map((p) => p._id);
    filter.pharmacy = { $in: pharmacyIds };
  }

  // Sort options
  let sort = {};
  switch (sortBy) {
    case 'price_asc':
      sort = { price: 1 };
      break;
    case 'price_desc':
      sort = { price: -1 };
      break;
    case 'rating':
      sort = { rating: -1 };
      break;
    case 'name':
      sort = { name: 1 };
      break;
    case 'newest':
      sort = { createdAt: -1 };
      break;
    default:
      sort = { rating: -1, createdAt: -1 };
  }

  const total = await Medicine.countDocuments(filter);
  const medicines = await Medicine.find(filter)
    .populate('pharmacy', 'name address.city address.state phone location rating')
    .skip(skip)
    .limit(limit)
    .sort(sort);

  const pagination = getPaginationData(page, limit, total);

  return ApiResponse.paginated(res, medicines, pagination);
});

// @desc    Autocomplete suggestions
// @route   GET /api/medicines/autocomplete
// @access  Public
const autocomplete = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.length < 2) {
    return ApiResponse.success(res, { suggestions: [] });
  }

  const medicines = await Medicine.find({
    $or: [
      { name: new RegExp(q, 'i') },
      { genericName: new RegExp(q, 'i') },
      { brand: new RegExp(q, 'i') },
    ],
    isActive: true,
  })
    .select('name genericName brand category')
    .limit(8)
    .lean();

  const suggestions = medicines.map((m) => ({
    id: m._id,
    name: m.name,
    genericName: m.genericName,
    brand: m.brand,
    category: m.category,
  }));

  return ApiResponse.success(res, { suggestions });
});

// @desc    Get medicine categories
// @route   GET /api/medicines/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Medicine.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  return ApiResponse.success(res, { categories });
});

// @desc    Get all medicines
// @route   GET /api/medicines
// @access  Public
const getMedicines = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  const filter = { isActive: true };

  if (req.query.pharmacy) {
    filter.pharmacy = req.query.pharmacy;
  }

  if (req.query.category) {
    filter.category = req.query.category;
  }

  const total = await Medicine.countDocuments(filter);
  const medicines = await Medicine.find(filter)
    .populate('pharmacy', 'name address.city phone location')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const pagination = getPaginationData(page, limit, total);

  return ApiResponse.paginated(res, medicines, pagination);
});

// @desc    Get single medicine
// @route   GET /api/medicines/:id
// @access  Public
const getMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id)
    .populate('pharmacy', 'name address phone email location operatingHours rating image');

  if (!medicine) {
    return ApiResponse.error(res, 'Medicine not found', 404);
  }

  // Add to recently viewed if user is logged in
  if (req.user) {
    await req.user.addRecentlyViewed(medicine._id);
  }

  const medicineData = medicine.toObject();

  // Add navigation URL if user location provided
  if (req.query.userLat && req.query.userLng && medicine.pharmacy) {
    const { getNavigationUrl } = require('../utils/helpers');
    medicineData.navigationUrl = getNavigationUrl(
      medicine.pharmacy.location.coordinates[1],
      medicine.pharmacy.location.coordinates[0],
      req.query.userLat,
      req.query.userLng
    );
  }

  return ApiResponse.success(res, { medicine: medicineData });
});

// @desc    Create medicine (pharmacy owner)
// @route   POST /api/medicines
// @access  Private (pharmacy)
const createMedicine = asyncHandler(async (req, res) => {
  const pharmacy = await Pharmacy.findOne({ owner: req.user._id });

  if (!pharmacy) {
    return ApiResponse.error(res, 'You must have an approved pharmacy to add medicines', 400);
  }

  if (!pharmacy.isApproved) {
    return ApiResponse.error(res, 'Your pharmacy must be approved before adding medicines', 403);
  }

  const medicineData = {
    ...req.body,
    pharmacy: pharmacy._id,
  };

  if (req.file) {
    medicineData.image = `/uploads/${req.file.filename}`;
  }

  if (req.files && req.files.length > 0) {
    medicineData.images = req.files.map((f) => `/uploads/${f.filename}`);
  }

  // Parse types from multipart form-data
  if (medicineData.requiresPrescription !== undefined) {
    medicineData.requiresPrescription = medicineData.requiresPrescription === 'true' || medicineData.requiresPrescription === true;
  }
  if (typeof medicineData.sideEffects === 'string') {
    medicineData.sideEffects = medicineData.sideEffects.split(',').map(s => s.trim()).filter(Boolean);
  }
  if (typeof medicineData.contraindications === 'string') {
    medicineData.contraindications = medicineData.contraindications.split(',').map(s => s.trim()).filter(Boolean);
  }

  const medicine = await Medicine.create(medicineData);

  // Update pharmacy medicine count
  await Pharmacy.findByIdAndUpdate(pharmacy._id, {
    $inc: { totalMedicines: 1 },
  });

  return ApiResponse.created(res, { medicine }, 'Medicine added successfully');
});

// @desc    Update medicine
// @route   PUT /api/medicines/:id
// @access  Private (pharmacy owner)
const updateMedicine = asyncHandler(async (req, res) => {
  let medicine = await Medicine.findById(req.params.id);

  if (!medicine) {
    return ApiResponse.error(res, 'Medicine not found', 404);
  }

  const pharmacy = await Pharmacy.findById(medicine.pharmacy);
  if (pharmacy.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return ApiResponse.error(res, 'Not authorized', 403);
  }

  const updateData = { ...req.body };

  if (req.file) {
    updateData.image = `/uploads/${req.file.filename}`;
  }

  // Parse types from multipart form-data
  if (updateData.requiresPrescription !== undefined) {
    updateData.requiresPrescription = updateData.requiresPrescription === 'true' || updateData.requiresPrescription === true;
  }
  if (typeof updateData.sideEffects === 'string') {
    updateData.sideEffects = updateData.sideEffects.split(',').map(s => s.trim()).filter(Boolean);
  }
  if (typeof updateData.contraindications === 'string') {
    updateData.contraindications = updateData.contraindications.split(',').map(s => s.trim()).filter(Boolean);
  }

  medicine = await Medicine.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  // Check for low stock alert
  if (medicine.stock <= medicine.lowStockThreshold && medicine.stock > 0) {
    await NotificationService.lowStockAlert(
      pharmacy.owner,
      medicine._id,
      medicine.name,
      medicine.stock
    );
    await emailService.sendLowStockAlert(
      pharmacy.email,
      pharmacy.name,
      medicine.name,
      medicine.stock
    );
  }

  return ApiResponse.success(res, { medicine }, 'Medicine updated successfully');
});

// @desc    Delete medicine
// @route   DELETE /api/medicines/:id
// @access  Private (pharmacy owner)
const deleteMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);

  if (!medicine) {
    return ApiResponse.error(res, 'Medicine not found', 404);
  }

  const pharmacy = await Pharmacy.findById(medicine.pharmacy);
  if (pharmacy.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return ApiResponse.error(res, 'Not authorized', 403);
  }

  // Soft delete
  medicine.isActive = false;
  await medicine.save();

  // Update pharmacy medicine count
  await Pharmacy.findByIdAndUpdate(pharmacy._id, {
    $inc: { totalMedicines: -1 },
  });

  return ApiResponse.success(res, null, 'Medicine removed successfully');
});

// @desc    Get pharmacy inventory
// @route   GET /api/medicines/pharmacy/:pharmacyId
// @access  Private (pharmacy owner)
const getPharmacyInventory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = { pharmacy: req.params.pharmacyId };

  if (req.query.search) {
    filter.name = new RegExp(req.query.search, 'i');
  }

  if (req.query.category) {
    filter.category = req.query.category;
  }

  if (req.query.stockStatus === 'low') {
    filter.stock = { $gt: 0, $lte: 5 };
  } else if (req.query.stockStatus === 'out') {
    filter.stock = 0;
  } else if (req.query.stockStatus === 'in') {
    filter.stock = { $gt: 0 };
  }

  const total = await Medicine.countDocuments(filter);
  const medicines = await Medicine.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const pagination = getPaginationData(page, limit, total);

  return ApiResponse.paginated(res, medicines, pagination);
});

module.exports = {
  searchMedicines,
  autocomplete,
  getCategories,
  getMedicines,
  getMedicine,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getPharmacyInventory,
};
