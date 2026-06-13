const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
    },
    pharmacy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique indexes
favoriteSchema.index({ user: 1, medicine: 1 }, { unique: true, sparse: true });
favoriteSchema.index({ user: 1, pharmacy: 1 }, { unique: true, sparse: true });
favoriteSchema.index({ user: 1 });

module.exports = mongoose.model('Favorite', favoriteSchema);
