import { useState, useEffect } from 'react';
import ProductCard from '../components/products/ProductCard';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock products data - in a real app, this would come from an API
  useEffect(() => {
    const mockProducts = [
      {
        id: 1,
        name: "Recycled Tote Bag",
        description: "Made from recycled plastic bottles, this durable tote is perfect for shopping.",
        price: 24.99,
        imageUrl: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cmVjeWNsZWQlMjBwcm9kdWN0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
        category: "bags",
        percentRecycled: 80,
        pointsWorth: 250,
        inStock: true
      },
      {
        id: 2,
        name: "Recycled Water Bottle",
        description: "Insulated water bottle made from recycled plastic. Keeps drinks cold for 24 hours.",
        price: 18.99,
        imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHJlY3ljbGVkJTIwcHJvZHVjdHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
        category: "bottles",
        percentRecycled: 95,
        pointsWorth: 180,
        inStock: true
      },
      {
        id: 3,
        name: "Recycled Notebook Set",
        description: "Set of 3 notebooks made from recycled paper and plastic covers.",
        price: 12.99,
        imageUrl: "https://images.unsplash.com/photo-1584589167171-541ce45f1eea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVjeWNsZWQlMjBwcm9kdWN0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
        category: "stationery",
        percentRecycled: 100,
        pointsWorth: 120,
        inStock: true
      },
      {
        id: 4,
        name: "Recycled Plant Pot",
        description: "Durable plant pots made from 100% recycled plastic.",
        price: 9.99,
        imageUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHBsYW50JTIwcG90fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
        category: "home",
        percentRecycled: 100,
        pointsWorth: 100,
        inStock: true
      },
      {
        id: 5,
        name: "Recycled Coasters",
        description: "Set of 4 coasters made from recycled plastic bottles.",
        price: 8.99,
        imageUrl: "https://images.unsplash.com/photo-1516962126636-27bf553c5ac4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Y29hc3RlcnN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
        category: "home",
        percentRecycled: 90,
        pointsWorth: 90,
        inStock: false
      },
      {
        id: 6,
        name: "Recycled Backpack",
        description: "Durable backpack made from recycled plastic bottles.",
        price: 49.99,
        imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YmFja3BhY2t8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
        category: "bags",
        percentRecycled: 85,
        pointsWorth: 500,
        inStock: true
      },
      {
        id: 7,
        name: "Recycled Sunglasses",
        description: "Stylish sunglasses with frames made from recycled ocean plastic.",
        price: 34.99,
        imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c3VuZ2xhc3Nlc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
        category: "accessories",
        percentRecycled: 70,
        pointsWorth: 350,
        inStock: true
      },
      {
        id: 8,
        name: "Recycled Pencil Case",
        description: "Pencil case made from recycled plastic with multiple compartments.",
        price: 7.99,
        imageUrl: "https://images.unsplash.com/photo-1522771500908-85dc259877cc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHBlbmNpbCUyMGNhc2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
        category: "stationery",
        percentRecycled: 95,
        pointsWorth: 80,
        inStock: true
      },
      {
        id: 9,
        name: "Recycled Shopping Bag Set",
        description: "Set of 3 foldable shopping bags made from recycled materials.",
        price: 14.99,
        imageUrl: "https://images.unsplash.com/photo-1600247354058-a75b467be8cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8c2hvcHBpbmclMjBiYWd8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
        category: "bags",
        percentRecycled: 90,
        pointsWorth: 150,
        inStock: true
      }
    ];
    
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 800); // Simulate loading
  }, []);
  
  // Filter products based on category and search query
  const filteredProducts = products.filter(product => {
    const matchesCategory = filter === 'all' || product.category === filter;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  // Sort products based on selected sort option
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch(sortBy) {
      case 'priceLow':
        return a.price - b.price;
      case 'priceHigh':
        return b.price - a.price;
      case 'recycled':
        return b.percentRecycled - a.percentRecycled;
      case 'points':
        return a.pointsWorth - b.pointsWorth;
      default: // featured
        return 0; // maintain original order
    }
  });
  
  // Get unique categories for filter dropdown
  const categories = ['all', ...new Set(products.map(product => product.category))];
  
  return (

    <>
    <Navbar />
    
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Shop Recycled Products</h1>
          <p className="mt-2 text-lg text-gray-600">
            Every purchase helps fund our recycling initiatives
          </p>
        </div>
        <div className="mt-4 md:mt-0 bg-green-100 px-4 py-2 rounded-md">
          <p className="text-green-800">
            <span className="font-medium">Earn & redeem points:</span> Each product can be purchased with EcoPoints!
          </p>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category-filter"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              id="sort-by"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="recycled">% Recycled</option>
              <option value="points">Points: Low to High</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-center">
          <p className="text-yellow-700">No products match your search criteria. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      
      {/* Points Information */}
      <div className="mt-12 bg-green-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-green-800 mb-2">How to Earn & Redeem Points</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-green-700 mb-2">Earning Points</h4>
            <ul className="space-y-2 text-sm text-green-700">
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Earn 5 points for each plastic bottle you recycle</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Get 100 bonus points when you sign up</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Earn 50 points for referring a friend</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Participate in special events for bonus points</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-md font-medium text-green-700 mb-2">Redeeming Points</h4>
            <ul className="space-y-2 text-sm text-green-700">
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Use points to purchase recycled products</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Redeem points for free shipping on orders</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Get exclusive access to limited edition items</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Exchange points for discounts on purchases</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}

export default ProductsPage;