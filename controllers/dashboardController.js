const Invoice = require('../models/Invoice');
const Item = require('../models/Item');
const Category = require('../models/Category');

// @desc    Get dashboard metrics & statistics
// @route   GET /api/dashboard/stats
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Sales metrics
    const [todayInvoices, monthInvoices, allInvoices] = await Promise.all([
      Invoice.find({ createdAt: { $gte: startOfToday, $lte: endOfToday } }),
      Invoice.find({ createdAt: { $gte: startOfMonth } }),
      Invoice.find(),
    ]);

    const todaySales = todayInvoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
    const monthSales = monthInvoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
    const totalSales = allInvoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);

    // Inventory metrics
    const allItems = await Item.find().populate('category', 'name color');
    const totalItems = allItems.length;
    const outOfStockItems = allItems.filter((i) => i.stock <= 0);
    const lowStockItems = allItems.filter((i) => i.stock > 0 && i.stock <= i.minStockAlert);

    const now = new Date();
    const sixtyDaysLater = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
    const expiredItems = allItems.filter((i) => new Date(i.expiryDate) <= now);
    const expiringSoonItems = allItems.filter((i) => {
      const exp = new Date(i.expiryDate);
      return exp > now && exp <= sixtyDaysLater;
    });

    const totalCategories = await Category.countDocuments();

    // Recent 5 invoices
    const recentInvoices = await Invoice.find().sort({ createdAt: -1 }).limit(5);

    // Last 7 days sales trend
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

      const dayInvoices = await Invoice.find({
        createdAt: { $gte: dayStart, $lte: dayEnd },
      });
      const dayTotal = dayInvoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);

      last7Days.push({
        date: dayName,
        sales: Math.round(dayTotal),
        count: dayInvoices.length,
      });
    }

    res.json({
      success: true,
      data: {
        summary: {
          todaySales: Math.round(todaySales),
          todayInvoicesCount: todayInvoices.length,
          monthSales: Math.round(monthSales),
          monthInvoicesCount: monthInvoices.length,
          totalSales: Math.round(totalSales),
          totalInvoicesCount: allInvoices.length,
          totalItems,
          totalCategories,
          lowStockCount: lowStockItems.length,
          outOfStockCount: outOfStockItems.length,
          expiredCount: expiredItems.length,
          expiringSoonCount: expiringSoonItems.length,
        },
        alerts: {
          lowStock: lowStockItems.slice(0, 5),
          expiringSoon: expiringSoonItems.slice(0, 5),
          expired: expiredItems.slice(0, 5),
        },
        recentInvoices,
        last7Days,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

