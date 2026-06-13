const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: [
        'reservation_created',
        'reservation_approved',
        'reservation_rejected',
        'reservation_cancelled',
        'reservation_completed',
        'reservation_expired',
        'low_stock',
        'new_review',
        'pharmacy_approved',
        'pharmacy_rejected',
        'medicine_available',
        'system',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    data: {
      reservationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' },
      medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
      pharmacyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy' },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

// Auto-delete old notifications (keep last 90 days)
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('Notification', notificationSchema);
