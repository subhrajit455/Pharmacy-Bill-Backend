const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: 'Apollo Care Pharmacy & Surgical',
    },
    tagline: {
      type: String,
      default: 'Quality Medicines & Healthcare Services',
    },
    address: {
      type: String,
      default: 'Shop No. 12, Ground Floor, Central Market, Near Civil Hospital',
    },
    phone: {
      type: String,
      default: '+91 98765 43210',
    },
    email: {
      type: String,
      default: 'care@apollopharmacy.local',
    },
    gstin: {
      type: String,
      default: '07AAAAA0000A1Z5',
    },
    dlNumber1: {
      type: String,
      default: 'DL-20B/123456/2022', // Form 20B (Retail Drug License - allopathic)
    },
    dlNumber2: {
      type: String,
      default: 'DL-21B/654321/2022', // Form 21B (Retail Drug License)
    },
    fssaiNumber: {
      type: String,
      default: '10019011000123',
    },
    invoicePrefix: {
      type: String,
      default: 'PHARM-',
    },
    defaultPrintFormat: {
      type: String,
      enum: ['a4', 'thermal-80', 'thermal-58', 'a5'],
      default: 'a4',
    },
    termsAndConditions: {
      type: String,
      default: '1. Medicines once sold cannot be taken back without cash memo.\n2. Refrigerated & Schedule X items are non-returnable.\n3. Please consult a registered medical practitioner before consuming prescription drugs.',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Setting', SettingSchema);

