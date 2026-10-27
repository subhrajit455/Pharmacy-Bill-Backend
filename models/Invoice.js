const mongoose = require('mongoose');

const InvoiceItemSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
  },
  name: {
    type: String,
    required: true,
  },
  genericName: {
    type: String,
    default: '',
  },
  batchNo: {
    type: String,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  hsnCode: {
    type: String,
    default: '3004',
  },
  packType: {
    type: String,
    default: 'Strip',
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  mrp: {
    type: Number,
    required: true,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  discountPercent: {
    type: Number,
    default: 0,
  },
  discountAmount: {
    type: Number,
    default: 0,
  },
  gstRate: {
    type: Number,
    default: 12,
  },
  taxableAmount: {
    type: Number,
    required: true,
  },
  gstAmount: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
});

const InvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customer: {
      name: {
        type: String,
        default: 'Walk-in Customer',
      },
      phone: {
        type: String,
        default: '',
      },
      email: {
        type: String,
        default: '',
      },
      address: {
        type: String,
        default: '',
      },
    },
    doctor: {
      name: {
        type: String,
        default: 'Self / OTC',
      },
      regNo: {
        type: String,
        default: '',
      },
      clinic: {
        type: String,
        default: '',
      },
    },
    items: [InvoiceItemSchema],
    subTotal: {
      type: Number,
      required: true,
    },
    discountTotal: {
      type: Number,
      default: 0,
    },
    taxTotal: {
      type: Number,
      default: 0,
    },
    cgst: {
      type: Number,
      default: 0,
    },
    sgst: {
      type: Number,
      default: 0,
    },
    roundOff: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'credit', 'split'],
      default: 'cash',
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'partial', 'unpaid'],
      default: 'paid',
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    balanceDue: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Invoice', InvoiceSchema);

