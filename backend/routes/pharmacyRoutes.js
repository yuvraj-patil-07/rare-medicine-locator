const express = require('express');
const router = express.Router();
const {
  createPharmacy, getPharmacies, getNearbyPharmacies,
  getPharmacy, updatePharmacy, getPharmacyStats, getMyPharmacy,
} = require('../controllers/pharmacyController');
const { protect, authorize } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const { validateId } = require('../middleware/validate');

router.get('/', getPharmacies);
router.get('/nearby', getNearbyPharmacies);
router.get('/my/pharmacy', protect, authorize('pharmacy'), getMyPharmacy);
router.get('/:id', validateId(), getPharmacy);
router.get('/:id/stats', protect, authorize('pharmacy'), validateId(), getPharmacyStats);
router.post('/', protect, authorize('pharmacy'), uploadSingle, createPharmacy);
router.put('/:id', protect, authorize('pharmacy', 'admin'), validateId(), uploadSingle, updatePharmacy);

module.exports = router;
