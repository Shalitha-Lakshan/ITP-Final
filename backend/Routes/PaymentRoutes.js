const express = require('express');
const router = express.Router();
const {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransactionStatus,
  processRefund,
  getPaymentAnalytics,
  getAllInvoices,
  createInvoice,
  updateInvoiceStatus,
  getAllPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod
} = require('../Controllers/PaymentController');

// Payment Transaction Routes
router.get('/transactions', getAllTransactions);
router.get('/transactions/:id', getTransactionById);
router.post('/transactions', createTransaction);
router.put('/transactions/:id/status', updateTransactionStatus);
router.post('/transactions/:id/refund', processRefund);

// Analytics Routes
router.get('/analytics', getPaymentAnalytics);

// Invoice Routes
router.get('/invoices', getAllInvoices);
router.post('/invoices', createInvoice);
router.put('/invoices/:id/status', updateInvoiceStatus);

// Payment Method Routes
router.get('/methods', getAllPaymentMethods);
router.post('/methods', createPaymentMethod);
router.put('/methods/:id', updatePaymentMethod);

module.exports = router;
