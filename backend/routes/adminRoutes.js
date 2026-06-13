const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getUsers, updateUser, deleteUser,
  getAllPharmacies, approvePharmacy, rejectPharmacy, deletePharmacy,
  getAllMedicines, deleteMedicine, getReports,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const { validateId } = require('../middleware/validate');

// All admin routes require admin role
router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/reports', getReports);

// User management
router.get('/users', getUsers);
router.put('/users/:id', validateId(), updateUser);
router.delete('/users/:id', validateId(), deleteUser);

// Pharmacy management
router.get('/pharmacies', getAllPharmacies);
router.put('/pharmacies/:id/approve', validateId(), approvePharmacy);
router.put('/pharmacies/:id/reject', validateId(), rejectPharmacy);
router.delete('/pharmacies/:id', validateId(), deletePharmacy);

// Medicine management
router.get('/medicines', getAllMedicines);
router.delete('/medicines/:id', validateId(), deleteMedicine);

module.exports = router;
