const express = require('express');
const router = express.Router();
const cartController = require('../Controllers/CartController');

// Add item to cart
router.post('/add', cartController.addToCart);

// Get all cart items
router.get('/', cartController.getCartItems);

// Update cart item quantity
router.put('/:id', cartController.updateCartItem);

// Remove item from cart
router.delete('/:id', cartController.removeFromCart);

// Clear entire cart
router.delete('/clear/all', cartController.clearCart);

module.exports = router;
