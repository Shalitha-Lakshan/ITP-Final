const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  getSalesAnalytics,
  getAllCustomers,
  createCustomer,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteOrder
} = require('../Controllers/SalesController');

// Sales Orders Routes
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderById);
router.post('/orders', createOrder);
router.put('/orders/:id/status', updateOrderStatus);
router.delete('/orders/:id', deleteOrder);

// Analytics Routes
router.get('/analytics', getSalesAnalytics);

// Customer Routes
router.get('/customers', getAllCustomers);
router.post('/customers', createCustomer);

// Product Routes
router.get('/products', getAllProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);

module.exports = router;
