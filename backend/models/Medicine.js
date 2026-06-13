const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    genericName: {
      type: String,
      trim: true,
      default: '',
    },
    brand: {
      type: String,
      trim: true,
      default: '',
    },
    manufacturer: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Antibiotics',
        'Antiviral',
        'Antifungal',
        'Cardiovascular',
        'Oncology',
        'Neurology',
        'Immunosuppressants',
        'Orphan Drugs',
        'Biologics',
        'Hormonal',
        'Dermatology',
        'Gastrointestinal',
        'Respiratory',
        'Pain Management',
        'Psychiatric',
        'Rare Disease',
        'Supplements',
        'Other',
      ],
    },
    dosageForm: {
      type: String,
      enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Ointment', 'Drops', 'Inhaler', 'Patch', 'Powder', 'Suspension', 'Other'],
      default: 'Tablet',
    },
    strength: {
      type: String,
      trim: true,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    pharmacy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
    requiresPrescription: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: '',
    },
    images: [String],
    expiryDate: {
      type: Date,
    },
    batchNumber: {
      type: String,
      default: '',
    },
    sideEffects: [String],
    contraindications: [String],
    storageConditions: {
      type: String,
      default: 'Store in a cool, dry place',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    totalReserved: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for search and performance
medicineSchema.index({ name: 'text', genericName: 'text', brand: 'text', manufacturer: 'text' });
medicineSchema.index({ pharmacy: 1 });
medicineSchema.index({ category: 1 });
medicineSchema.index({ price: 1 });
medicineSchema.index({ stock: 1 });
medicineSchema.index({ isActive: 1 });

// Virtual: is low stock
medicineSchema.virtual('isLowStock').get(function () {
  return this.stock <= this.lowStockThreshold && this.stock > 0;
});

// Virtual: is out of stock
medicineSchema.virtual('isOutOfStock').get(function () {
  return this.stock === 0;
});

// Virtual: is expired
medicineSchema.virtual('isExpired').get(function () {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
});

module.exports = mongoose.model('Medicine', medicineSchema);
