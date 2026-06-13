const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pharmacy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
    },
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
      default: '',
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    helpful: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate reviews
reviewSchema.index({ user: 1, pharmacy: 1 }, { unique: true, sparse: true });
reviewSchema.index({ user: 1, medicine: 1 }, { unique: true, sparse: true });
reviewSchema.index({ pharmacy: 1, rating: 1 });
reviewSchema.index({ medicine: 1, rating: 1 });

// Static method to calculate average rating for a pharmacy
reviewSchema.statics.calcAverageRating = async function (pharmacyId) {
  const result = await this.aggregate([
    { $match: { pharmacy: pharmacyId, isActive: true } },
    {
      $group: {
        _id: '$pharmacy',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const Pharmacy = require('./Pharmacy');
  if (result.length > 0) {
    await Pharmacy.findByIdAndUpdate(pharmacyId, {
      rating: Math.round(result[0].averageRating * 10) / 10,
      totalReviews: result[0].totalReviews,
    });
  } else {
    await Pharmacy.findByIdAndUpdate(pharmacyId, {
      rating: 0,
      totalReviews: 0,
    });
  }
};

// Static method to calculate average rating for a medicine
reviewSchema.statics.calcMedicineRating = async function (medicineId) {
  const result = await this.aggregate([
    { $match: { medicine: medicineId, isActive: true } },
    {
      $group: {
        _id: '$medicine',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const Medicine = require('./Medicine');
  if (result.length > 0) {
    await Medicine.findByIdAndUpdate(medicineId, {
      rating: Math.round(result[0].averageRating * 10) / 10,
      totalReviews: result[0].totalReviews,
    });
  } else {
    await Medicine.findByIdAndUpdate(medicineId, {
      rating: 0,
      totalReviews: 0,
    });
  }
};

// Update ratings after save
reviewSchema.post('save', async function () {
  if (this.pharmacy) await this.constructor.calcAverageRating(this.pharmacy);
  if (this.medicine) await this.constructor.calcMedicineRating(this.medicine);
});

module.exports = mongoose.model('Review', reviewSchema);
