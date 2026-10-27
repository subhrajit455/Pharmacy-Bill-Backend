const express = require('express');
const router = express.Router();
const {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  adjustStock,
  getStockAlerts,
} = require('../controllers/itemController');

router.get('/alerts/summary', getStockAlerts);
router.post('/:id/adjust-stock', adjustStock);

router.route('/').get(getItems).post(createItem);
router.route('/:id').get(getItemById).put(updateItem).delete(deleteItem);

module.exports = router;

