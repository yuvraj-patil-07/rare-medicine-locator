const express = require('express');
const router = express.Router();
const {
  getProfile, updateProfile, getSearchHistory,
  clearSearchHistory, getRecentlyViewed, deleteAccount,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, uploadSingle, updateProfile);
router.get('/search-history', protect, getSearchHistory);
router.delete('/search-history', protect, clearSearchHistory);
router.get('/recently-viewed', protect, getRecentlyViewed);
router.delete('/account', protect, deleteAccount);

module.exports = router;
