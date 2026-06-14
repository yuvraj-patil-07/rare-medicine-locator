const express = require('express');
const router = express.Router();
const {
  createRequest,
  getMyRequests,
  cancelRequest,
  getActiveRequests,
  acceptRequest,
} = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/auth');
const { uploadPrescription } = require('../middleware/upload');
const { validateId } = require('../middleware/validate');

router.post('/', protect, uploadPrescription, createRequest);
router.get('/my', protect, getMyRequests);
router.get('/active', protect, authorize('pharmacy'), getActiveRequests);
router.put('/:id/cancel', protect, validateId(), cancelRequest);
router.post('/:id/accept', protect, authorize('pharmacy'), validateId(), acceptRequest);

module.exports = router;
