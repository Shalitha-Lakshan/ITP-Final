import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = async () => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      const cartData = {
        productId: product.id.toString(),
        productName: product.name,
        price: product.price,
        quantity: 1,
        imageUrl: product.imageUrl,
        description: product.description,
        userId: user.id || user._id
      };

      const response = await axios.post('http://localhost:5000/api/cart/add', cartData);
      
      if (response.status === 200 || response.status === 201) {
        // Trigger custom event to update cart count
        window.dispatchEvent(new Event('cartUpdated'));
        alert(`${product.name} added to cart!`);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    }
  };

  return (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-md transition-shadow duration-300 hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative pb-2/3 h-60 overflow-hidden">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
        />
        {product.percentRecycled && (
          <div className="absolute top-3 right-3 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            {product.percentRecycled}% Recycled
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
          <p className="text-lg font-bold text-green-700">LKR {parseFloat(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        
        <p className="mt-2 text-gray-600 text-sm h-12 overflow-hidden">{product.description}</p>
        
        <div className="mt-4 flex justify-between items-center">
          <Link 
            to={`/products/${product.id}`} 
            className="text-green-600 hover:text-green-800 text-sm font-medium"
          >
            View Details
          </Link>
          
          <button 
            onClick={handleAddToCart}
            className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-md text-sm transition-colors"
          >
            Add to Cart
          </button>
        </div>
        
        {product.pointsWorth > 0 && (
          <div className="mt-3 bg-green-50 rounded-md p-2 text-center text-sm text-green-700">
            <span className="font-medium">Or redeem with {product.pointsWorth} points</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCard;