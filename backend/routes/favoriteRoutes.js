const express = require('express');
const router = express.Router();
const {
  toggleMedicineFavorite, togglePharmacyFavorite,
  getFavoriteMedicines, getFavoritePharmacies, checkFavorite,
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

router.get('/check', protect, checkFavorite);
router.get('/medicines', protect, getFavoriteMedicines);
router.get('/pharmacies', protect, getFavoritePharmacies);
router.post('/medicine/:medicineId', protect, toggleMedicineFavorite);
router.post('/pharmacy/:pharmacyId', protect, togglePharmacyFavorite);

module.exports = router;
