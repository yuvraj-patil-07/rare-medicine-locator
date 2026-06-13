const express = require('express');
const router = express.Router();
const {
  searchMedicines, autocomplete, getCategories, getMedicines,
  getMedicine, createMedicine, updateMedicine, deleteMedicine,
  getPharmacyInventory,
} = require('../controllers/medicineController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const { validateId } = require('../middleware/validate');
const { searchLimiter } = require('../middleware/rateLimiter');

router.get('/search', searchLimiter, optionalAuth, searchMedicines);
router.get('/autocomplete', searchLimiter, autocomplete);
router.get('/categories', getCategories);
router.get('/', getMedicines);
router.get('/:id', validateId(), optionalAuth, getMedicine);
router.get('/pharmacy/:pharmacyId', protect, authorize('pharmacy', 'admin'), getPharmacyInventory);
router.post('/', protect, authorize('pharmacy'), uploadSingle, createMedicine);
router.put('/:id', protect, authorize('pharmacy', 'admin'), validateId(), uploadSingle, updateMedicine);
router.delete('/:id', protect, authorize('pharmacy', 'admin'), validateId(), deleteMedicine);

module.exports = router;
