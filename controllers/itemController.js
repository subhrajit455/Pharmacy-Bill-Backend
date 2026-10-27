const Item = require('../models/Item');

// @desc    Get all items with search & filter
// @route   GET /api/items
exports.getItems = async (req, res) => {
  try {
    const { search, category, stockStatus, expiryStatus, sort = 'name' } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
        { batchNo: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = category;
    }

    let items = await Item.find(query).populate('category', 'name color').sort(sort);

    // Apply stock status filter in memory or query
    if (stockStatus) {
      if (stockStatus === 'out_of_stock') {
        items = items.filter((item) => item.stock <= 0);
      } else if (stockStatus === 'low_stock') {
        items = items.filter((item) => item.stock > 0 && item.stock <= item.minStockAlert);
      } else if (stockStatus === 'in_stock') {
        items = items.filter((item) => item.stock > item.minStockAlert);
      }
    }

    // Apply expiry status filter
    if (expiryStatus) {
      const now = new Date();
      if (expiryStatus === 'expired') {
        items = items.filter((item) => new Date(item.expiryDate) <= now);
      } else if (expiryStatus === 'expiring_soon') {
        items = items.filter((item) => {
          const diffDays = Math.ceil((new Date(item.expiryDate) - now) / (1000 * 60 * 60 * 24));
          return diffDays > 0 && diffDays <= 60;
        });
      }
    }

    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single item
// @route   GET /api/items/:id
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('category', 'name color');
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new item
// @route   POST /api/items
exports.createItem = async (req, res) => {
  try {
    const item = await Item.create(req.body);
    const populated = await Item.findById(item._id).populate('category', 'name color');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update item
// @route   PUT /api/items/:id
exports.updateItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('category', 'name color');

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Quick adjust stock (Add or Deduct)
// @route   POST /api/items/:id/adjust-stock
exports.adjustStock = async (req, res) => {
  try {
    const { quantity, action } = req.body; // action: 'add' or 'subtract' or 'set'
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const num = Number(quantity);
    if (isNaN(num) || num <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid quantity' });
    }

    if (action === 'add') {
      item.stock += num;
    } else if (action === 'subtract') {
      if (item.stock < num) {
        return res.status(400).json({ success: false, message: 'Cannot deduct more than current stock' });
      }
      item.stock -= num;
    } else if (action === 'set') {
      item.stock = num;
    }

    await item.save();
    const updated = await Item.findById(item._id).populate('category', 'name color');
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get low stock and expired alerts
// @route   GET /api/items/alerts/summary
exports.getStockAlerts = async (req, res) => {
  try {
    const now = new Date();
    const sixtyDaysLater = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

    const allItems = await Item.find().populate('category', 'name color');

    const lowStockItems = allItems.filter((i) => i.stock <= i.minStockAlert);
    const expiredItems = allItems.filter((i) => new Date(i.expiryDate) <= now);
    const expiringSoonItems = allItems.filter((i) => {
      const exp = new Date(i.expiryDate);
      return exp > now && exp <= sixtyDaysLater;
    });

    res.json({
      success: true,
      data: {
        lowStockCount: lowStockItems.length,
        expiredCount: expiredItems.length,
        expiringSoonCount: expiringSoonItems.length,
        lowStockItems,
        expiredItems,
        expiringSoonItems,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

