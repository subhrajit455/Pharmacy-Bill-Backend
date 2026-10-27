const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Item = require('../models/Item');
const Setting = require('../models/Setting');

// @route   POST /api/seed
// @desc    Seed demo pharmaceutical categories and items
router.post('/', async (req, res) => {
  try {
    // Clear existing or only seed if empty
    const { force } = req.query;
    const existingCount = await Item.countDocuments();
    if (existingCount > 0 && force !== 'true') {
      return res.json({
        success: true,
        message: `Database already has ${existingCount} items. Pass ?force=true to overwrite.`,
      });
    }

    if (force === 'true') {
      await Category.deleteMany({});
      await Item.deleteMany({});
    }

    // Seed Categories
    const categoriesData = [
      { name: 'Tablets', description: 'Oral solid dosage forms', color: '#3b82f6' },
      { name: 'Capsules', description: 'Gelatin shell encapsulated medicine', color: '#8b5cf6' },
      { name: 'Syrups & Suspensions', description: 'Oral liquid medications', color: '#10b981' },
      { name: 'Injections & IV Fluids', description: 'Sterile injectable formulations', color: '#ef4444' },
      { name: 'Ointments & Creams', description: 'Topical dermatological preparations', color: '#f59e0b' },
      { name: 'Eye & Ear Drops', description: 'Ophthalmic and Otic solutions', color: '#06b6d4' },
      { name: 'Surgical & Devices', description: 'Bandages, syringes, gloves, thermometers', color: '#6366f1' },
      { name: 'Baby & Mother Care', description: 'Infant formulas, gripe water, baby wipes', color: '#ec4899' },
    ];

    const createdCategories = await Category.insertMany(categoriesData);
    const catMap = {};
    createdCategories.forEach((c) => {
      catMap[c.name] = c._id;
    });

    const now = new Date();
    // Helper to get date months in future
    const futureDate = (months) => {
      const d = new Date();
      d.setMonth(d.getMonth() + months);
      return d;
    };

    // Seed Items
    const itemsData = [
      {
        name: 'Dolo 650 Tablet',
        genericName: 'Paracetamol 650mg',
        category: catMap['Tablets'],
        batchNo: 'DL24A09',
        barcode: '890123456001',
        manufacturer: 'Micro Labs Ltd',
        rackLocation: 'Rack A-1',
        packType: 'Strip of 15',
        hsnCode: '3004',
        purchasePrice: 22.5,
        mrp: 34.0,
        sellingPrice: 32.0,
        gstRate: 12,
        stock: 140,
        minStockAlert: 20,
        expiryDate: futureDate(18),
        isPrescriptionRequired: false,
      },
      {
        name: 'Augmentin 625 Duo',
        genericName: 'Amoxicillin (500mg) + Clavulanic Acid (125mg)',
        category: catMap['Tablets'],
        batchNo: 'AUG24C12',
        barcode: '890123456002',
        manufacturer: 'GlaxoSmithKline (GSK)',
        rackLocation: 'Rack A-2',
        packType: 'Strip of 10',
        hsnCode: '3004',
        purchasePrice: 155.0,
        mrp: 204.5,
        sellingPrice: 195.0,
        gstRate: 12,
        stock: 45,
        minStockAlert: 15,
        expiryDate: futureDate(14),
        isPrescriptionRequired: true,
      },
      {
        name: 'Pan 40 Tablet',
        genericName: 'Pantoprazole 40mg',
        category: catMap['Tablets'],
        batchNo: 'PAN24K01',
        barcode: '890123456003',
        manufacturer: 'Alkem Laboratories',
        rackLocation: 'Rack A-3',
        packType: 'Strip of 15',
        hsnCode: '3004',
        purchasePrice: 110.0,
        mrp: 155.0,
        sellingPrice: 142.0,
        gstRate: 12,
        stock: 80,
        minStockAlert: 15,
        expiryDate: futureDate(22),
        isPrescriptionRequired: false,
      },
      {
        name: 'Azithral 500 Tablet',
        genericName: 'Azithromycin 500mg',
        category: catMap['Tablets'],
        batchNo: 'AZT23M88',
        barcode: '890123456004',
        manufacturer: 'Alembic Pharmaceuticals',
        rackLocation: 'Rack B-1',
        packType: 'Strip of 5',
        hsnCode: '3004',
        purchasePrice: 90.0,
        mrp: 132.0,
        sellingPrice: 125.0,
        gstRate: 12,
        stock: 8, // LOW STOCK demo
        minStockAlert: 12,
        expiryDate: futureDate(12),
        isPrescriptionRequired: true,
      },
      {
        name: 'Becosules Z Capsules',
        genericName: 'B-Complex Forte with Vitamin C and Zinc',
        category: catMap['Capsules'],
        batchNo: 'BCS24B45',
        barcode: '890123456005',
        manufacturer: 'Pfizer Ltd',
        rackLocation: 'Rack B-3',
        packType: 'Strip of 20',
        hsnCode: '3004',
        purchasePrice: 38.0,
        mrp: 52.0,
        sellingPrice: 48.0,
        gstRate: 12,
        stock: 95,
        minStockAlert: 20,
        expiryDate: futureDate(16),
        isPrescriptionRequired: false,
      },
      {
        name: 'Omeprazole 20mg Capsule',
        genericName: 'Omeprazole 20mg',
        category: catMap['Capsules'],
        batchNo: 'OMP24E19',
        barcode: '890123456006',
        manufacturer: 'Cipla Ltd',
        rackLocation: 'Rack B-2',
        packType: 'Strip of 15',
        hsnCode: '3004',
        purchasePrice: 42.0,
        mrp: 65.0,
        sellingPrice: 58.0,
        gstRate: 12,
        stock: 4, // CRITICAL LOW STOCK
        minStockAlert: 15,
        expiryDate: futureDate(20),
        isPrescriptionRequired: false,
      },
      {
        name: 'Ascoril LS Syrup',
        genericName: 'Levosalbutamol + Ambroxol + Guaifenesin',
        category: catMap['Syrups & Suspensions'],
        batchNo: 'ASC24F77',
        barcode: '890123456007',
        manufacturer: 'Glenmark Pharmaceuticals',
        rackLocation: 'Syrup Shelf S-1',
        packType: 'Bottle 100ml',
        hsnCode: '3004',
        purchasePrice: 85.0,
        mrp: 123.0,
        sellingPrice: 115.0,
        gstRate: 12,
        stock: 50,
        minStockAlert: 10,
        expiryDate: futureDate(10),
        isPrescriptionRequired: true,
      },
      {
        name: 'Benadryl Cough Formula',
        genericName: 'Diphenhydramine + Ammonium Chloride + Sodium Citrate',
        category: catMap['Syrups & Suspensions'],
        batchNo: 'BND23Z01',
        barcode: '890123456008',
        manufacturer: 'Johnson & Johnson',
        rackLocation: 'Syrup Shelf S-2',
        packType: 'Bottle 150ml',
        hsnCode: '3004',
        purchasePrice: 105.0,
        mrp: 145.0,
        sellingPrice: 135.0,
        gstRate: 12,
        stock: 35,
        minStockAlert: 10,
        expiryDate: futureDate(1), // EXPIRING SOON demo (within 30 days)
        isPrescriptionRequired: false,
      },
      {
        name: 'Monocef 1g Injection',
        genericName: 'Ceftriaxone Sodium 1000mg',
        category: catMap['Injections & IV Fluids'],
        batchNo: 'MNF24D22',
        barcode: '890123456009',
        manufacturer: 'Aristo Pharmaceuticals',
        rackLocation: 'Injectable Cabinet I-1',
        packType: 'Vial + WFI',
        hsnCode: '3004',
        purchasePrice: 48.0,
        mrp: 68.5,
        sellingPrice: 65.0,
        gstRate: 12,
        stock: 60,
        minStockAlert: 15,
        expiryDate: futureDate(24),
        isPrescriptionRequired: true,
      },
      {
        name: 'Volini Pain Relief Gel',
        genericName: 'Diclofenac Diethylamine + Methyl Salicylate + Menthol',
        category: catMap['Ointments & Creams'],
        batchNo: 'VOL24H15',
        barcode: '890123456010',
        manufacturer: 'Sun Pharma',
        rackLocation: 'Topical Shelf T-1',
        packType: 'Tube 50g',
        hsnCode: '3004',
        purchasePrice: 130.0,
        mrp: 175.0,
        sellingPrice: 160.0,
        gstRate: 12,
        stock: 40,
        minStockAlert: 8,
        expiryDate: futureDate(18),
        isPrescriptionRequired: false,
      },
      {
        name: 'Betadine 10% Ointment',
        genericName: 'Povidone Iodine 10% w/w',
        category: catMap['Ointments & Creams'],
        batchNo: 'BTD24J09',
        barcode: '890123456011',
        manufacturer: 'Win-Medicare',
        rackLocation: 'Topical Shelf T-2',
        packType: 'Tube 20g',
        hsnCode: '3004',
        purchasePrice: 75.0,
        mrp: 105.0,
        sellingPrice: 98.0,
        gstRate: 12,
        stock: 30,
        minStockAlert: 10,
        expiryDate: futureDate(15),
        isPrescriptionRequired: false,
      },
      {
        name: 'Ciplox Eye/Ear Drops',
        genericName: 'Ciprofloxacin 0.3% w/v',
        category: catMap['Eye & Ear Drops'],
        batchNo: 'CPX24P03',
        barcode: '890123456012',
        manufacturer: 'Cipla Ltd',
        rackLocation: 'Drop Box D-1',
        packType: 'Vial 10ml',
        hsnCode: '3004',
        purchasePrice: 14.0,
        mrp: 21.0,
        sellingPrice: 19.0,
        gstRate: 12,
        stock: 75,
        minStockAlert: 15,
        expiryDate: futureDate(12),
        isPrescriptionRequired: true,
      },
      {
        name: 'Digital Thermometer MT-101',
        genericName: 'Medical Digital Fever Thermometer',
        category: catMap['Surgical & Devices'],
        batchNo: 'DGT24Q01',
        barcode: '890123456013',
        manufacturer: 'Dr. Morepen',
        rackLocation: 'Devices Shelf M-1',
        packType: '1 Piece Box',
        hsnCode: '9025',
        purchasePrice: 140.0,
        mrp: 250.0,
        sellingPrice: 220.0,
        gstRate: 18,
        stock: 25,
        minStockAlert: 5,
        expiryDate: futureDate(48),
        isPrescriptionRequired: false,
      },
      {
        name: 'Accu-Chek Active Test Strips',
        genericName: 'Blood Glucose Monitoring Strips',
        category: catMap['Surgical & Devices'],
        batchNo: 'ACC24V99',
        barcode: '890123456014',
        manufacturer: 'Roche Diagnostics',
        rackLocation: 'Devices Shelf M-2',
        packType: 'Box of 50 Strips',
        hsnCode: '3822',
        purchasePrice: 780.0,
        mrp: 1099.0,
        sellingPrice: 990.0,
        gstRate: 12,
        stock: 18,
        minStockAlert: 5,
        expiryDate: futureDate(11),
        isPrescriptionRequired: false,
      },
      {
        name: 'Woodwards Gripe Water',
        genericName: 'Terpeneless Dill Seed Oil + Sodium Bicarbonate',
        category: catMap['Baby & Mother Care'],
        batchNo: 'WDW24R11',
        barcode: '890123456015',
        manufacturer: 'TTK Healthcare',
        rackLocation: 'Baby Shelf B-1',
        packType: 'Bottle 130ml',
        hsnCode: '3004',
        purchasePrice: 45.0,
        mrp: 60.0,
        sellingPrice: 56.0,
        gstRate: 12,
        stock: 40,
        minStockAlert: 10,
        expiryDate: futureDate(14),
        isPrescriptionRequired: false,
      },
    ];

    await Item.insertMany(itemsData);

    // Initialize Store Setting if not present
    let setting = await Setting.findOne();
    if (!setting) {
      await Setting.create({
        storeName: 'Apollo Care Pharmacy & Surgical',
        tagline: 'Your Trusted Healthcare & Wellness Partner',
        address: 'Plot 45, Commercial Complex, Near District Hospital, Metro Pillar 128',
        phone: '+91 98765 43210 / 011-23456789',
        email: 'billing@apollocarepharmacy.com',
        gstin: '07AAAAA1234A1Z5',
        dlNumber1: 'DL-20B/10492/2021',
        dlNumber2: 'DL-21B/10493/2021',
        fssaiNumber: '10020011002345',
        invoicePrefix: 'RX-',
        defaultPrintFormat: 'a4',
      });
    }

    res.json({
      success: true,
      message: `Successfully seeded ${categoriesData.length} categories and ${itemsData.length} pharmaceutical items!`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

