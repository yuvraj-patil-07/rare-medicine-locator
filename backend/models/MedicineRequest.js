const mongoose = require('mongoose');

const medicineRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    medicineName: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
    },
    genericName: {
      type: String,
      trim: true,
      default: '',
    },
    strength: {
      type: String,
      trim: true,
      default: '',
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'completed', 'cancelled'],
      default: 'pending',
    },
    prescriptionImage: {
      type: String,
      default: '',
    },
    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
    },
    acceptedMedicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
    },
    acceptedAt: Date,
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: Map prescriptionImage to prescription for consistency
medicineRequestSchema.virtual('prescription').get(function () {
  return this.prescriptionImage;
});

// Indexes
medicineRequestSchema.index({ user: 1, status: 1 });
medicineRequestSchema.index({ status: 1 });
medicineRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('MedicineRequest', medicineRequestSchema);
