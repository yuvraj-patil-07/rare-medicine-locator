const express = require('express');
const router = express.Router();
const {
  createPharmacyReview, createMedicineReview, getPharmacyReviews,
  getMedicineReviews, deleteReview, markHelpful,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { validateId } = require('../middleware/validate');

router.post('/pharmacy/:pharmacyId', protect, createPharmacyReview);
router.post('/medicine/:medicineId', protect, createMedicineReview);
router.get('/pharmacy/:pharmacyId', getPharmacyReviews);
router.get('/medicine/:medicineId', getMedicineReviews);
router.delete('/:id', protect, validateId(), deleteReview);
router.put('/:id/helpful', protect, validateId(), markHelpful);

module.exports = router;
