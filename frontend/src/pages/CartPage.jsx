import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Load cart items from backend API
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchCartItems();
  }, [isAuthenticated, navigate]);

  const fetchCartItems = async () => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    try {
      const userId = user.id || user._id;
      const response = await axios.get(`http://localhost:5000/api/cart?userId=${userId}`);
      setCartItems(response.data.cartItems || []);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Update quantity
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      await axios.put(`http://localhost:5000/api/cart/${itemId}`, { quantity: newQuantity });
      fetchCartItems(); // Refresh cart items
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity. Please try again.');
    }
  };

  // Remove item from cart
  const removeItem = async (itemId) => {
    try {
      await axios.delete(`http://localhost:5000/api/cart/${itemId}`);
      fetchCartItems(); // Refresh cart items
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item. Please try again.');
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }


    try {
      const userId = user.id || user._id;
      const response = await axios.delete(`http://localhost:5000/api/cart/clear/${userId}`);
      
      if (response.status === 200) {
        setCartItems([]);
        window.dispatchEvent(new Event('cartUpdated'));
        alert('Cart cleared successfully!');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('Failed to clear cart. Please try again.');
    }
  };

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar forceWhiteBackground={true} />
        <div className="flex justify-center items-center py-20 pt-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar forceWhiteBackground={true} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              to="/products" 
              className="flex items-center text-green-600 hover:text-green-800 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Continue Shopping
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <ShoppingBag className="mr-3" size={32} />
              Shopping Cart ({totalItems} items)
            </h1>
          </div>
          
          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
            >
              <Trash2 size={16} className="mr-1" />
              Clear Cart
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-16">
            <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Discover our eco-friendly products and start shopping!</p>
            <Link
              to="/products"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          /* Cart with Items */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item._id} className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{item.productName}</h3>
                    <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                    <p className="text-green-600 font-bold mt-2">LKR {parseFloat(item.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} each</p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={16} className={item.quantity <= 1 ? 'text-gray-300' : 'text-gray-600'} />
                    </button>
                    
                    <span className="w-12 text-center font-medium">{item.quantity}</span>
                    
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Plus size={16} className="text-gray-600" />
                    </button>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      LKR {(item.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <button
                      onClick={() => removeItem(item._id)}
                      className="text-red-600 hover:text-red-800 text-sm mt-2 flex items-center"
                    >
                      <Trash2 size={14} className="mr-1" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h3>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                    <span className="font-medium">LKR {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">LKR {tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold">Total</span>
                      <span className="text-lg font-bold text-green-600">LKR {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
                
                <Link
                  to="/checkout"
                  className="block w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors mb-3 text-center"
                >
                  Proceed to Checkout
                </Link>
                
                <Link
                  to="/products"
                  className="block w-full text-center border border-green-600 text-green-600 hover:bg-green-50 py-3 rounded-lg font-medium transition-colors"
                >
                  Continue Shopping
                </Link>
                
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700 text-center">
                    🌱 Your purchase helps support sustainable practices!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}

export default CartPage;
