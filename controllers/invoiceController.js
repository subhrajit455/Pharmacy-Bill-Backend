const Invoice = require('../models/Invoice');
const Item = require('../models/Item');
const Setting = require('../models/Setting');

// Helper to generate next invoice number
const generateInvoiceNumber = async () => {
  const setting = (await Setting.findOne()) || { invoicePrefix: 'PHARM-' };
  const prefix = setting.invoicePrefix || 'PHARM-';

  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // e.g. 20261027

  // Find count of invoices created today
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const countToday = await Invoice.countDocuments({
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });

  const seq = String(countToday + 1).padStart(4, '0');
  return `${prefix}${dateStr}-${seq}`;
};

// @desc    Get next invoice number preview
// @route   GET /api/invoices/next-number
exports.getNextInvoiceNumber = async (req, res) => {
  try {
    const nextNumber = await generateInvoiceNumber();
    res.json({ success: true, invoiceNumber: nextNumber });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new invoice & decrement inventory
// @route   POST /api/invoices
exports.createInvoice = async (req, res) => {
  try {
    const {
      customer,
      doctor,
      items,
      paymentMethod = 'cash',
      paymentStatus = 'paid',
      amountPaid,
      notes,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Invoice must contain at least one item' });
    }

    // Verify stock availability first for all items
    for (const lineItem of items) {
      if (lineItem.item) {
        const dbItem = await Item.findById(lineItem.item);
        if (!dbItem) {
          return res.status(404).json({
            success: false,
            message: `Medicine "${lineItem.name}" not found in inventory.`,
          });
        }
        if (dbItem.stock < lineItem.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for "${dbItem.name}". Available: ${dbItem.stock}, Requested: ${lineItem.quantity}`,
          });
        }
      }
    }

    // Calculate totals
    let subTotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;
    const processedItems = [];

    for (const lineItem of items) {
      const qty = Number(lineItem.quantity) || 1;
      const unitPrice = Number(lineItem.unitPrice) || 0;
      const mrp = Number(lineItem.mrp) || unitPrice;
      const discountPercent = Number(lineItem.discountPercent) || 0;
      const gstRate = Number(lineItem.gstRate) || 0;

      const baseAmount = unitPrice * qty;
      const discountAmount = Number(((baseAmount * discountPercent) / 100).toFixed(2));
      const taxableAmount = Number((baseAmount - discountAmount).toFixed(2));
      const gstAmount = Number(((taxableAmount * gstRate) / 100).toFixed(2));
      const lineTotal = Number((taxableAmount + gstAmount).toFixed(2));

      subTotal += taxableAmount;
      discountTotal += discountAmount;
      taxTotal += gstAmount;

      processedItems.push({
        item: lineItem.item,
        name: lineItem.name,
        genericName: lineItem.genericName || '',
        batchNo: lineItem.batchNo || 'N/A',
        expiryDate: lineItem.expiryDate || new Date(),
        hsnCode: lineItem.hsnCode || '3004',
        packType: lineItem.packType || 'Unit',
        quantity: qty,
        mrp,
        unitPrice,
        discountPercent,
        discountAmount,
        gstRate,
        taxableAmount,
        gstAmount,
        total: lineTotal,
      });

      // Deduct stock from inventory
      if (lineItem.item) {
        await Item.findByIdAndUpdate(lineItem.item, {
          $inc: { stock: -qty },
        });
      }
    }

    const cgst = Number((taxTotal / 2).toFixed(2));
    const sgst = Number((taxTotal / 2).toFixed(2));
    const rawTotal = subTotal + taxTotal;
    const grandTotal = Math.round(rawTotal);
    const roundOff = Number((grandTotal - rawTotal).toFixed(2));

    const finalAmountPaid = paymentStatus === 'paid' ? grandTotal : (Number(amountPaid) || 0);
    const balanceDue = Number((grandTotal - finalAmountPaid).toFixed(2));

    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await Invoice.create({
      invoiceNumber,
      customer: customer || { name: 'Walk-in Customer' },
      doctor: doctor || { name: 'Self / OTC' },
      items: processedItems,
      subTotal: Number(subTotal.toFixed(2)),
      discountTotal: Number(discountTotal.toFixed(2)),
      taxTotal: Number(taxTotal.toFixed(2)),
      cgst,
      sgst,
      roundOff,
      grandTotal,
      paymentMethod,
      paymentStatus,
      amountPaid: finalAmountPaid,
      balanceDue: balanceDue > 0 ? balanceDue : 0,
      notes: notes || '',
    });

    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all invoices with filters
// @route   GET /api/invoices
exports.getInvoices = async (req, res) => {
  try {
    const { search, paymentStatus, startDate, endDate, limit = 50, page = 1 } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } },
      ];
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      count: invoices.length,
      data: invoices,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single invoice by ID
// @route   GET /api/invoices/:id
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel/Delete invoice and restore stock
// @route   DELETE /api/invoices/:id
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    // Restore stock for items
    for (const lineItem of invoice.items) {
      if (lineItem.item) {
        await Item.findByIdAndUpdate(lineItem.item, {
          $inc: { stock: lineItem.quantity },
        });
      }
    }

    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Invoice cancelled and stock restored successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

