import { useState } from 'react';
import { Link } from 'react-router-dom';

function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);

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
          <p className="text-lg font-bold text-green-700">${product.price.toFixed(2)}</p>
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