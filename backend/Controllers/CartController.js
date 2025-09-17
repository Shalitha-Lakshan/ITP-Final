const CartItem = require('../Model/CartModel');

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, productName, price, quantity = 1, imageUrl, description, userId = 'guest' } = req.body;

    // Validate required fields
    if (!productId || !productName || !price) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if item already exists in cart
    const existingItem = await CartItem.findOne({ productId, userId });

    if (existingItem) {
      // Update quantity if item exists
      existingItem.quantity += quantity;
      await existingItem.save();
      return res.status(200).json({ 
        message: 'Item quantity updated in cart', 
        cartItem: existingItem 
      });
    } else {
      // Create new cart item
      const newCartItem = new CartItem({
        productId,
        productName,
        price,
        quantity,
        imageUrl,
        description,
        userId
      });

      await newCartItem.save();
      return res.status(201).json({ 
        message: 'Item added to cart successfully', 
        cartItem: newCartItem 
      });
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all cart items
exports.getCartItems = async (req, res) => {
  try {
    const { userId = 'guest' } = req.query;
    const cartItems = await CartItem.find({ userId });
    
    const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

    res.status(200).json({
      cartItems,
      totalAmount: totalAmount.toFixed(2),
      totalItems
    });
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const cartItem = await CartItem.findByIdAndUpdate(
      id,
      { quantity },
      { new: true }
    );

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.status(200).json({ 
      message: 'Cart item updated successfully', 
      cartItem 
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;

    const cartItem = await CartItem.findByIdAndDelete(id);

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.status(200).json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Clear entire cart
exports.clearCart = async (req, res) => {
  try {
    // Get userId from URL params, query params, or body
    const userId = req.params.userId || req.query.userId || req.body.userId || 'guest';
    
    console.log('Clearing cart for userId:', userId);
    
    const result = await CartItem.deleteMany({ userId });
    
    console.log('Delete result:', result);
    
    res.status(200).json({ 
      message: 'Cart cleared successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
