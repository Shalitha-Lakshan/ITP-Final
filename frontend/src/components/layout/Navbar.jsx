import { useState } from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Placeholder for auth state

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-green-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold">EcoRecycle</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-600 hover:text-white">Home</Link>
            <Link to="/about" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-600 hover:text-white">About</Link>
            <Link to="/bins" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-600 hover:text-white">Smart Bins</Link>
            <Link to="/products" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-600 hover:text-white">Shop</Link>
            
            {isLoggedIn ? (
              <>
                <Link to="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-600 hover:text-white">Dashboard</Link>
                <button 
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
                  onClick={() => setIsLoggedIn(false)}
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex space-x-3">
                <Link to="/login" className="px-4 py-2 rounded bg-green-800 text-white hover:bg-green-900 transition-colors">
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 rounded bg-white text-green-700 hover:bg-gray-100 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-green-600 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-600">Home</Link>
            <Link to="/about" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-600">About</Link>
            <Link to="/bins" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-600">Smart Bins</Link>
            <Link to="/products" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-600">Shop</Link>
            
            {isLoggedIn ? (
              <>
                <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-600">Dashboard</Link>
                <button 
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium bg-red-600 hover:bg-red-700"
                  onClick={() => setIsLoggedIn(false)}
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="space-y-2 pt-2">
                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium bg-green-800 hover:bg-green-900">Login</Link>
                <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium bg-white text-green-700 hover:bg-gray-100">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;