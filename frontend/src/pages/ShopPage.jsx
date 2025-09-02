import React, { useState, useEffect } from 'react';
import { ShoppingCart, Heart, Star, Filter, Grid, List, Search, Package, Recycle, Award, Truck } from 'lucide-react';
import Header from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';

function ShopPage() {
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  // Sample eco-friendly products
  const sampleProducts = [
    {
      id: 1,
      name: "Recycled Water Bottle",
      category: "bottles",
      price: 18.99,
      originalPrice: 24.99,
      points: 180,
      rating: 4.8,
      reviews: 124,
      image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400",
      badge: "95% Recycled",
      description: "Insulated water bottle made from recycled plastic bottles. Keeps drinks cold for 24 hours.",
      features: ["BPA Free", "24hr Cold", "Leak Proof", "Dishwasher Safe"],
      inStock: true,
      fastShipping: true
    },
    {
      id: 2,
      name: "Eco Tote Bag Set",
      category: "bags",
      price: 24.99,
      originalPrice: 34.99,
      points: 250,
      rating: 4.9,
      reviews: 89,
      image: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=400",
      badge: "80% Recycled",
      description: "Set of 3 durable tote bags made from recycled plastic bottles. Perfect for shopping and daily use.",
      features: ["Set of 3", "Machine Washable", "Heavy Duty", "Foldable"],
      inStock: true,
      fastShipping: true
    },
    {
      id: 3,
      name: "Recycled Notebook Set",
      category: "stationery",
      price: 12.99,
      originalPrice: 16.99,
      points: 120,
      rating: 4.7,
      reviews: 156,
      image: "https://images.unsplash.com/photo-1584589167171-541ce45f1eea?w=400",
      badge: "100% Recycled",
      description: "Set of 3 notebooks made from recycled paper with plastic covers from recycled bottles.",
      features: ["Lined Pages", "Hardcover", "Eco Ink", "Perforated"],
      inStock: true,
      fastShipping: false
    },
    {
      id: 4,
      name: "Solar Power Bank",
      category: "electronics",
      price: 39.99,
      originalPrice: 49.99,
      points: 400,
      rating: 4.6,
      reviews: 78,
      image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400",
      badge: "Solar Powered",
      description: "Portable solar power bank with recycled plastic casing. Charge your devices sustainably.",
      features: ["10000mAh", "Solar Panel", "Fast Charge", "Waterproof"],
      inStock: true,
      fastShipping: true
    },
    {
      id: 5,
      name: "Bamboo Cutlery Set",
      category: "kitchen",
      price: 15.99,
      originalPrice: 19.99,
      points: 160,
      rating: 4.8,
      reviews: 203,
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
      badge: "Biodegradable",
      description: "Complete bamboo cutlery set with carrying case. Perfect alternative to plastic utensils.",
      features: ["Travel Case", "Dishwasher Safe", "Lightweight", "Reusable"],
      inStock: false,
      fastShipping: false
    },
    {
      id: 6,
      name: "Recycled Phone Case",
      category: "electronics",
      price: 22.99,
      originalPrice: 29.99,
      points: 230,
      rating: 4.5,
      reviews: 67,
      image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400",
      badge: "Ocean Plastic",
      description: "Protective phone case made from ocean plastic waste. Available for all major phone models.",
      features: ["Drop Protection", "Wireless Charging", "Slim Design", "Ocean Plastic"],
      inStock: true,
      fastShipping: true
    }
  ];

  const categories = [
    { id: 'all', name: 'All Products', count: sampleProducts.length },
    { id: 'bottles', name: 'Bottles', count: sampleProducts.filter(p => p.category === 'bottles').length },
    { id: 'bags', name: 'Bags', count: sampleProducts.filter(p => p.category === 'bags').length },
    { id: 'electronics', name: 'Electronics', count: sampleProducts.filter(p => p.category === 'electronics').length },
    { id: 'kitchen', name: 'Kitchen', count: sampleProducts.filter(p => p.category === 'kitchen').length },
    { id: 'stationery', name: 'Stationery', count: sampleProducts.filter(p => p.category === 'stationery').length }
  ];

  useEffect(() => {
    setProducts(sampleProducts);
    setFilteredProducts(sampleProducts);
  }, []);

  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => b.id - a.id);
        break;
      default:
        // Featured - keep original order
        break;
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, sortBy, searchQuery]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const toggleWishlist = (productId) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const ProductCard = ({ product }) => (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100">
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            {product.badge}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <button
            onClick={() => toggleWishlist(product.id)}
            className={`p-2 rounded-full transition-colors duration-200 ${
              wishlist.includes(product.id)
                ? 'bg-red-100 text-red-600'
                : 'bg-white/80 text-gray-600 hover:bg-red-100 hover:text-red-600'
            }`}
          >
            <Heart className="w-5 h-5" fill={wishlist.includes(product.id) ? 'currentColor' : 'none'} />
          </button>
        </div>
        {product.fastShipping && (
          <div className="absolute bottom-4 left-4">
            <span className="bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center">
              <Truck className="w-3 h-3 mr-1" />
              Fast Shipping
            </span>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-200">
            {product.name}
          </h3>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600">{product.rating}</span>
            <span className="text-sm text-gray-400">({product.reviews})</span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {product.features.slice(0, 2).map((feature, index) => (
            <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs">
              {feature}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-green-600">${product.price}</span>
            {product.originalPrice > product.price && (
              <span className="text-sm text-gray-400 line-through">${product.originalPrice}</span>
            )}
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Award className="w-4 h-4" />
            <span>{product.points} pts</span>
          </div>
        </div>

        <button
          onClick={() => addToCart(product)}
          disabled={!product.inStock}
          className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
            product.inStock
              ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">
              Eco-Friendly Shop
            </h1>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Discover amazing products made from recycled materials. Every purchase helps create a sustainable future.
            </p>
            <div className="flex items-center justify-center space-x-8 text-green-100">
              <div className="flex items-center space-x-2">
                <Recycle className="w-6 h-6" />
                <span>100% Recycled Materials</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="w-6 h-6" />
                <span>Free Shipping Over LKR 5,000</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-6 h-6" />
                <span>Earn Reward Points</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </h3>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Categories</label>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors duration-200 ${
                        selectedCategory === category.id
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span>{category.name}</span>
                      <span className="text-sm bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Toolbar */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700 font-medium">
                    {filteredProducts.length} products found
                  </span>
                  {isAuthenticated() && (
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <Award className="w-4 h-4" />
                      <span>Earn points on every purchase!</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="featured">Featured</option>
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>

                  {/* View Mode */}
                  <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className={`grid gap-8 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your filters or search terms.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShopPage;
