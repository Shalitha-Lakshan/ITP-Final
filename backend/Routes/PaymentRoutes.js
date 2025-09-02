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
  updatePaymentMethod,
  getFinanceOverview,
  getChartData,
  getAllEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getAllPayments,
  createPayment,
  updatePayment,
  deletePayment,
  updatePaymentStatus
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

// Finance Dashboard Routes
router.get('/overview', getFinanceOverview);
router.get('/charts', getChartData);

// Employee Management Routes
router.get('/employees', getAllEmployees);
router.post('/employees', createEmployee);
router.put('/employees/:id', updateEmployee);
router.delete('/employees/:id', deleteEmployee);

// Payment CRUD Routes
router.get('/payments', getAllPayments);
router.post('/payments', createPayment);
router.put('/payments/:id', updatePayment);
router.delete('/payments/:id', deletePayment);
router.patch('/payments/:id/status', updatePaymentStatus);

module.exports = router;
