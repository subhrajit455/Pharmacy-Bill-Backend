const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Medicine / Item name is required'],
      trim: true,
      index: true,
    },
    genericName: {
      type: String,
      required: [true, 'Generic composition is required'],
      trim: true,
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    batchNo: {
      type: String,
      required: [true, 'Batch number is required'],
      trim: true,
      uppercase: true,
    },
    barcode: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    manufacturer: {
      type: String,
      default: 'General Pharma',
      trim: true,
    },
    rackLocation: {
      type: String,
      default: 'General Shelf',
      trim: true,
    },
    packType: {
      type: String,
      default: 'Strip of 10',
      trim: true,
    },
    hsnCode: {
      type: String,
      default: '3004',
      trim: true,
    },
    purchasePrice: {
      type: Number,
      required: [true, 'Purchase price is required'],
      min: [0, 'Purchase price cannot be negative'],
    },
    mrp: {
      type: Number,
      required: [true, 'MRP is required'],
      min: [0, 'MRP cannot be negative'],
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Selling price cannot be negative'],
    },
    gstRate: {
      type: Number,
      default: 12, // 0, 5, 12, 18
      min: [0, 'GST rate cannot be negative'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock count is required'],
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    minStockAlert: {
      type: Number,
      default: 10,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    isPrescriptionRequired: {
      type: Boolean,
      default: false,
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

// Virtual for stock status: 'out_of_stock' | 'low_stock' | 'in_stock'
ItemSchema.virtual('stockStatus').get(function () {
  if (this.stock <= 0) return 'out_of_stock';
  if (this.stock <= this.minStockAlert) return 'low_stock';
  return 'in_stock';
});

// Virtual for expiry status: 'expired' | 'expiring_soon' (within 60 days) | 'good'
ItemSchema.virtual('expiryStatus').get(function () {
  if (!this.expiryDate) return 'good';
  const now = new Date();
  const diffTime = new Date(this.expiryDate).getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'expired';
  if (diffDays <= 60) return 'expiring_soon';
  return 'good';
});

ItemSchema.set('toJSON', { virtuals: true });
ItemSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Item', ItemSchema);

