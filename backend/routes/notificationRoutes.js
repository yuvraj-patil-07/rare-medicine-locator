const express = require('express');
const router = express.Router();
const {
  getNotifications, markAsRead, markAllAsRead,
  deleteNotification, getUnreadCount,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');
const { validateId } = require('../middleware/validate');

router.get('/', protect, getNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, validateId(), markAsRead);
router.delete('/:id', protect, validateId(), deleteNotification);

module.exports = router;
