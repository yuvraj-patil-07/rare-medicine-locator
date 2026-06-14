const MedicineRequest = require('../models/MedicineRequest');
const Medicine = require('../models/Medicine');
const Pharmacy = require('../models/Pharmacy');
const Reservation = require('../models/Reservation');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const NotificationService = require('../services/notificationService');
const { generateReservationCode, getPaginationData } = require('../utils/helpers');

// @desc    Create a new medicine request
// @route   POST /api/requests
// @access  Private (Patient/User role)
const createRequest = asyncHandler(async (req, res) => {
  const { medicineName, genericName, strength, quantity, notes } = req.body;

  if (!medicineName) {
    return ApiResponse.error(res, 'Medicine name is required', 400);
  }

  const requestData = {
    user: req.user._id,
    medicineName,
    genericName: genericName || '',
    strength: strength || '',
    quantity: quantity ? parseInt(quantity) : 1,
    notes: notes || '',
    prescriptionImage: req.file ? `/uploads/${req.file.filename}` : '',
  };

  const request = await MedicineRequest.create(requestData);

  return ApiResponse.created(res, { request }, 'Medicine request created successfully');
});

// @desc    Get user's requests
// @route   GET /api/requests/my
// @access  Private (Patient/User role)
const getMyRequests = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = { user: req.user._id };

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const total = await MedicineRequest.countDocuments(filter);
  const requests = await MedicineRequest.find(filter)
    .populate('acceptedBy', 'name address phone')
    .populate('acceptedMedicine', 'name price')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const pagination = getPaginationData(page, limit, total);

  return ApiResponse.paginated(res, requests, pagination);
});

// @desc    Cancel a medicine request
// @route   PUT /api/requests/:id/cancel
// @access  Private (Patient/User role)
const cancelRequest = asyncHandler(async (req, res) => {
  const request = await MedicineRequest.findById(req.params.id);

  if (!request) {
    return ApiResponse.error(res, 'Request not found', 404);
  }

  if (request.user.toString() !== req.user._id.toString()) {
    return ApiResponse.error(res, 'Not authorized to cancel this request', 403);
  }

  if (request.status !== 'pending') {
    return ApiResponse.error(res, `Cannot cancel request in ${request.status} status`, 400);
  }

  request.status = 'cancelled';
  await request.save();

  return ApiResponse.success(res, { request }, 'Request cancelled successfully');
});

// @desc    Get all active/pending medicine requests (for Pharmacies)
// @route   GET /api/requests/active
// @access  Private (Pharmacy role)
const getActiveRequests = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const skip = (page - 1) * limit;

  const filter = { status: 'pending' };

  const total = await MedicineRequest.countDocuments(filter);
  const requests = await MedicineRequest.find(filter)
    .populate('user', 'name email phone')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const pagination = getPaginationData(page, limit, total);

  return ApiResponse.paginated(res, requests, pagination);
});

// @desc    Accept a medicine request
// @route   POST /api/requests/:id/accept
// @access  Private (Pharmacy owner)
const acceptRequest = asyncHandler(async (req, res) => {
  const { medicineId } = req.body;

  if (!medicineId) {
    return ApiResponse.error(res, 'Medicine ID is required to accept this request', 400);
  }

  const request = await MedicineRequest.findById(req.params.id);
  if (!request) {
    return ApiResponse.error(res, 'Request not found', 404);
  }

  if (request.status !== 'pending') {
    return ApiResponse.error(res, 'Request has already been processed or cancelled', 400);
  }

  // Find pharmacy owned by current user
  const pharmacy = await Pharmacy.findOne({ owner: req.user._id });
  if (!pharmacy) {
    return ApiResponse.error(res, 'You must register a pharmacy storefront first', 400);
  }

  if (!pharmacy.isApproved) {
    return ApiResponse.error(res, 'Your pharmacy storefront is not approved yet', 400);
  }

  // Find medicine from inventory
  const medicine = await Medicine.findOne({ _id: medicineId, pharmacy: pharmacy._id });
  if (!medicine) {
    return ApiResponse.error(res, 'Medicine not found in your inventory', 404);
  }

  if (medicine.stock < request.quantity) {
    return ApiResponse.error(res, `Insufficient stock in your inventory. You only have ${medicine.stock} units.`, 400);
  }

  // Generate Reservation
  const reservationCode = generateReservationCode();
  const totalPrice = medicine.price * request.quantity;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const reservation = await Reservation.create({
    user: request.user,
    medicine: medicine._id,
    pharmacy: pharmacy._id,
    quantity: request.quantity,
    totalPrice,
    reservationCode,
    notes: `Fulfilled request for: ${request.medicineName}. ` + (request.notes ? `User notes: ${request.notes}` : ''),
    expiresAt,
    prescriptionImage: request.prescriptionImage || '',
    status: 'approved', // Since pharmacy accepted it explicitly, set directly to approved
    approvedAt: new Date(),
  });

  // Deduct medicine stock
  medicine.stock -= request.quantity;
  medicine.totalReserved += request.quantity;
  await medicine.save();

  // Update request status
  request.status = 'accepted';
  request.acceptedBy = pharmacy._id;
  request.acceptedMedicine = medicine._id;
  request.acceptedAt = new Date();
  await request.save();

  // Notify user
  await NotificationService.create({
    recipient: request.user,
    sender: req.user._id,
    type: 'reservation_approved', // Use standard or custom type
    title: 'Medicine Request Accepted',
    message: `Your request for "${request.medicineName}" was accepted by ${pharmacy.name}! A reservation (Code: ${reservationCode}) has been automatically created for you.`,
    data: { requestId: request._id, reservationId: reservation._id },
  });

  return ApiResponse.success(res, { request, reservation }, 'Request accepted and reservation created successfully');
});

module.exports = {
  createRequest,
  getMyRequests,
  cancelRequest,
  getActiveRequests,
  acceptRequest,
};
