const Reservation = require('../models/Reservation');
const Medicine = require('../models/Medicine');
const Pharmacy = require('../models/Pharmacy');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const NotificationService = require('../services/notificationService');
const emailService = require('../services/emailService');
const { generateReservationCode, getPaginationData } = require('../utils/helpers');

// @desc    Create reservation
// @route   POST /api/reservations
// @access  Private
const createReservation = asyncHandler(async (req, res) => {
  const { medicineId, quantity, notes } = req.body;

  if (!medicineId || !quantity) {
    return ApiResponse.error(res, 'Medicine ID and quantity are required', 400);
  }

  const medicine = await Medicine.findById(medicineId).populate('pharmacy');

  if (!medicine) {
    return ApiResponse.error(res, 'Medicine not found', 404);
  }

  if (!medicine.isActive) {
    return ApiResponse.error(res, 'This medicine is no longer available', 400);
  }

  if (medicine.stock < quantity) {
    return ApiResponse.error(res, `Insufficient stock. Only ${medicine.stock} units available.`, 400);
  }

  // Check for existing pending reservation for same medicine
  const existingReservation = await Reservation.findOne({
    user: req.user._id,
    medicine: medicineId,
    status: 'pending',
  });

  if (existingReservation) {
    return ApiResponse.error(res, 'You already have a pending reservation for this medicine', 400);
  }

  const reservationCode = generateReservationCode();
  const totalPrice = medicine.price * quantity;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const reservation = await Reservation.create({
    user: req.user._id,
    medicine: medicineId,
    pharmacy: medicine.pharmacy._id,
    quantity,
    totalPrice,
    reservationCode,
    notes,
    expiresAt,
    prescriptionImage: req.file ? `/uploads/${req.file.filename}` : '',
  });

  // Temporarily reduce stock
  medicine.stock -= quantity;
  medicine.totalReserved += quantity;
  await medicine.save();

  // Send notifications
  await NotificationService.reservationCreated(
    req.user._id,
    medicine.pharmacy.owner,
    reservation._id,
    medicine.name
  );

  // Send email
  await emailService.sendReservationConfirmation(
    req.user.email,
    req.user.name,
    reservationCode,
    medicine.name,
    medicine.pharmacy.name
  );

  const populatedReservation = await Reservation.findById(reservation._id)
    .populate('medicine', 'name image price')
    .populate('pharmacy', 'name address phone');

  return ApiResponse.created(
    res,
    { reservation: populatedReservation },
    'Reservation created successfully'
  );
});

// @desc    Get user's reservations
// @route   GET /api/reservations
// @access  Private
const getMyReservations = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = { user: req.user._id };

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const total = await Reservation.countDocuments(filter);
  const reservations = await Reservation.find(filter)
    .populate('medicine', 'name image price category')
    .populate('pharmacy', 'name address phone')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  // Auto-expire old pending reservations
  const now = new Date();
  for (const reservation of reservations) {
    if (reservation.status === 'pending' && now > reservation.expiresAt) {
      reservation.status = 'expired';
      await reservation.save();
      // Restore stock
      await Medicine.findByIdAndUpdate(reservation.medicine._id, {
        $inc: { stock: reservation.quantity, totalReserved: -reservation.quantity },
      });
    }
  }

  const pagination = getPaginationData(page, limit, total);

  return ApiResponse.paginated(res, reservations, pagination);
});

// @desc    Get pharmacy reservations
// @route   GET /api/reservations/pharmacy/:pharmacyId
// @access  Private (pharmacy owner)
const getPharmacyReservations = asyncHandler(async (req, res) => {
  const pharmacy = await Pharmacy.findById(req.params.pharmacyId);

  if (!pharmacy || pharmacy.owner.toString() !== req.user._id.toString()) {
    return ApiResponse.error(res, 'Not authorized', 403);
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = { pharmacy: req.params.pharmacyId };

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const total = await Reservation.countDocuments(filter);
  const reservations = await Reservation.find(filter)
    .populate('user', 'name email phone')
    .populate('medicine', 'name image price')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const pagination = getPaginationData(page, limit, total);

  return ApiResponse.paginated(res, reservations, pagination);
});

// @desc    Update reservation status (approve/reject/complete)
// @route   PUT /api/reservations/:id/status
// @access  Private (pharmacy owner)
const updateReservationStatus = asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body;

  if (!['approved', 'rejected', 'completed'].includes(status)) {
    return ApiResponse.error(res, 'Invalid status', 400);
  }

  const reservation = await Reservation.findById(req.params.id)
    .populate('medicine', 'name')
    .populate('pharmacy');

  if (!reservation) {
    return ApiResponse.error(res, 'Reservation not found', 404);
  }

  if (reservation.pharmacy.owner.toString() !== req.user._id.toString()) {
    return ApiResponse.error(res, 'Not authorized', 403);
  }

  if (reservation.status !== 'pending' && status !== 'completed') {
    return ApiResponse.error(res, `Cannot ${status} a reservation that is ${reservation.status}`, 400);
  }

  if (status === 'completed' && reservation.status !== 'approved') {
    return ApiResponse.error(res, 'Only approved reservations can be completed', 400);
  }

  reservation.status = status;

  if (status === 'approved') {
    reservation.approvedAt = new Date();
  } else if (status === 'rejected') {
    reservation.rejectionReason = rejectionReason || '';
    // Restore stock
    await Medicine.findByIdAndUpdate(reservation.medicine._id, {
      $inc: { stock: reservation.quantity, totalReserved: -reservation.quantity },
    });
  } else if (status === 'completed') {
    reservation.completedAt = new Date();
  }

  await reservation.save();

  // Send notifications
  const user = await User.findById(reservation.user);

  if (status === 'approved') {
    await NotificationService.reservationApproved(
      reservation.user, reservation.pharmacy.owner,
      reservation._id, reservation.medicine.name
    );
  } else if (status === 'rejected') {
    await NotificationService.reservationRejected(
      reservation.user, reservation.pharmacy.owner,
      reservation._id, reservation.medicine.name, rejectionReason
    );
  }

  // Send email
  if (user) {
    await emailService.sendReservationStatusUpdate(
      user.email, user.name, reservation.reservationCode,
      status, reservation.medicine.name
    );
  }

  return ApiResponse.success(res, { reservation }, `Reservation ${status} successfully`);
});

// @desc    Cancel reservation (by user)
// @route   PUT /api/reservations/:id/cancel
// @access  Private
const cancelReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id)
    .populate('medicine', 'name')
    .populate('pharmacy');

  if (!reservation) {
    return ApiResponse.error(res, 'Reservation not found', 404);
  }

  if (reservation.user.toString() !== req.user._id.toString()) {
    return ApiResponse.error(res, 'Not authorized', 403);
  }

  if (!['pending', 'approved'].includes(reservation.status)) {
    return ApiResponse.error(res, 'Cannot cancel this reservation', 400);
  }

  reservation.status = 'cancelled';
  reservation.cancelledAt = new Date();
  await reservation.save();

  // Restore stock
  await Medicine.findByIdAndUpdate(reservation.medicine._id, {
    $inc: { stock: reservation.quantity, totalReserved: -reservation.quantity },
  });

  // Notify pharmacy
  await NotificationService.reservationCancelled(
    reservation.pharmacy.owner,
    req.user._id,
    reservation._id,
    reservation.medicine.name
  );

  return ApiResponse.success(res, { reservation }, 'Reservation cancelled successfully');
});

// @desc    Get single reservation
// @route   GET /api/reservations/:id
// @access  Private
const getReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('medicine', 'name image price category')
    .populate('pharmacy', 'name address phone email');

  if (!reservation) {
    return ApiResponse.error(res, 'Reservation not found', 404);
  }

  // Verify access
  const isOwner = reservation.user._id.toString() === req.user._id.toString();
  const pharmacy = await Pharmacy.findById(reservation.pharmacy._id);
  const isPharmacyOwner = pharmacy && pharmacy.owner.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isPharmacyOwner && !isAdmin) {
    return ApiResponse.error(res, 'Not authorized', 403);
  }

  return ApiResponse.success(res, { reservation });
});

module.exports = {
  createReservation,
  getMyReservations,
  getPharmacyReservations,
  updateReservationStatus,
  cancelReservation,
  getReservation,
};
