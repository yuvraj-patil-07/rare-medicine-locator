const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true,
    },
    pharmacy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled', 'expired'],
      default: 'pending',
    },
    reservationCode: {
      type: String,
      unique: true,
      required: true,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    prescriptionImage: {
      type: String,
      default: '',
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    approvedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
reservationSchema.index({ user: 1, status: 1 });
reservationSchema.index({ pharmacy: 1, status: 1 });
reservationSchema.index({ expiresAt: 1 });
reservationSchema.index({ createdAt: -1 });

// Virtual: check if expired
reservationSchema.virtual('isExpired').get(function () {
  return this.status === 'pending' && new Date() > this.expiresAt;
});

// Virtual: Map prescriptionImage to prescription for consistency
reservationSchema.virtual('prescription').get(function () {
  return this.prescriptionImage;
});

// Auto-expire pending reservations
reservationSchema.pre('find', function () {
  // This is handled via a scheduled check in the controller
});

module.exports = mongoose.model('Reservation', reservationSchema);
