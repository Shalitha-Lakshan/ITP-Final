const express = require('express');
const router = express.Router();
const productController = require('../Controllers/ProductController');

// Create a new product
router.post('/', productController.createProduct);

// Get all products
router.get('/', productController.getAllProducts);

// Get product by ID
router.get('/:id', productController.getProductById);

// Update product by ID
router.put('/:id', productController.updateProduct);

// Delete product by ID
router.delete('/:id', productController.deleteProduct);

// Get products by category
router.get('/category/:category', productController.getProductsByCategory);

module.exports = router;
