const express = require('express');
const router = express.Router();
const {
  getUserDashboard,
  getUserPoints,
  getUserOrders,
  getUserProfile,
  updateUserProfile,
  addPoints,
  redeemReward,
  createUserOrder,
  updateOrderStatus,
  addOrderReview
} = require('../Controllers/UserDashboardController');

// Dashboard Routes
router.get('/dashboard/:userId', getUserDashboard);

// Points Routes
router.get('/points/:userId', getUserPoints);
router.post('/points/:userId/add', addPoints);
router.post('/points/:userId/redeem', redeemReward);

// Orders Routes
router.get('/orders/:userId', getUserOrders);
router.post('/orders/:userId', createUserOrder);
router.put('/orders/:orderId/status', updateOrderStatus);
router.post('/orders/:orderId/review', addOrderReview);

// Profile Routes
router.get('/profile/:userId', getUserProfile);
router.put('/profile/:userId', updateUserProfile);

module.exports = router;
