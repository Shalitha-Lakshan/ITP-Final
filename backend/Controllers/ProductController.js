const Product = require('../Model/ProductModel');

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const { name, price, stock, category, imageUrl, description, points } = req.body;

    // Validate required fields
    if (!name || !price || !category) {
      return res.status(400).json({ 
        message: 'Missing required fields: name, price, and category are required' 
      });
    }

    // Additional validation for name (letters and spaces only)
    if (!/^[A-Za-z\s]+$/.test(name)) {
      return res.status(400).json({ 
        message: 'Product name can only contain letters and spaces' 
      });
    }

    // Additional validation for price (max 4 digits)
    if (price > 9999.99 || price < 0) {
      return res.status(400).json({ 
        message: 'Price must be between 0 and 9999.99' 
      });
    }

    // Additional validation for stock and points (no negative numbers)
    if (stock < 0) {
      return res.status(400).json({ 
        message: 'Stock level cannot be negative' 
      });
    }

    if (points < 0) {
      return res.status(400).json({ 
        message: 'Reward points cannot be negative' 
      });
    }

    // Create new product
    const newProduct = new Product({
      name: name.trim(),
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      category,
      imageUrl: imageUrl || '',
      description: description?.trim() || '',
      points: parseInt(points) || 0
    });

    const savedProduct = await newProduct.save();

    res.status(201).json({
      message: 'Product created successfully',
      product: savedProduct
    });

  } catch (error) {
    console.error('Error creating product:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors 
      });
    }

    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      message: 'Products retrieved successfully',
      products,
      count: products.length
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ 
        message: 'Product not found' 
      });
    }

    res.status(200).json({
      message: 'Product retrieved successfully',
      product
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid product ID format' 
      });
    }

    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate name if provided
    if (updates.name && !/^[A-Za-z\s]+$/.test(updates.name)) {
      return res.status(400).json({ 
        message: 'Product name can only contain letters and spaces' 
      });
    }

    // Validate price if provided
    if (updates.price !== undefined && (updates.price > 9999.99 || updates.price < 0)) {
      return res.status(400).json({ 
        message: 'Price must be between 0 and 9999.99' 
      });
    }

    // Validate stock if provided
    if (updates.stock !== undefined && updates.stock < 0) {
      return res.status(400).json({ 
        message: 'Stock level cannot be negative' 
      });
    }

    // Validate points if provided
    if (updates.points !== undefined && updates.points < 0) {
      return res.status(400).json({ 
        message: 'Reward points cannot be negative' 
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ 
        message: 'Product not found' 
      });
    }

    res.status(200).json({
      message: 'Product updated successfully',
      product: updatedProduct
    });

  } catch (error) {
    console.error('Error updating product:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors 
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid product ID format' 
      });
    }

    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedProduct = await Product.findByIdAndDelete(id);
    
    if (!deletedProduct) {
      return res.status(404).json({ 
        message: 'Product not found' 
      });
    }

    res.status(200).json({
      message: 'Product deleted successfully',
      product: deletedProduct
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid product ID format' 
      });
    }

    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const products = await Product.find({ category }).sort({ createdAt: -1 });
    
    res.status(200).json({
      message: `Products in ${category} category retrieved successfully`,
      products,
      count: products.length
    });

  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
};
