const express = require('express');
const router = express.Router();
const {
  createInvoice,
  getInvoices,
  getInvoiceById,
  deleteInvoice,
  getNextInvoiceNumber,
} = require('../controllers/invoiceController');

router.get('/next-number', getNextInvoiceNumber);
router.route('/').get(getInvoices).post(createInvoice);
router.route('/:id').get(getInvoiceById).delete(deleteInvoice);

module.exports = router;

