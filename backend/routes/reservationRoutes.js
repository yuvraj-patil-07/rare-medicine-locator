const express = require('express');
const router = express.Router();
const {
  createReservation, getMyReservations, getPharmacyReservations,
  updateReservationStatus, cancelReservation, getReservation,
} = require('../controllers/reservationController');
const { protect, authorize } = require('../middleware/auth');
const { uploadPrescription } = require('../middleware/upload');
const { validateId } = require('../middleware/validate');

router.post('/', protect, uploadPrescription, createReservation);
router.get('/', protect, getMyReservations);
router.get('/:id', protect, validateId(), getReservation);
router.get('/pharmacy/:pharmacyId', protect, authorize('pharmacy'), getPharmacyReservations);
router.put('/:id/status', protect, authorize('pharmacy'), validateId(), updateReservationStatus);
router.put('/:id/cancel', protect, validateId(), cancelReservation);

module.exports = router;
