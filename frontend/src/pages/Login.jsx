import React, { useState } from 'react';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Handle form submission (e.g., send data to a backend)
  const handleLoginSubmit = (event) => {
    event.preventDefault();
    console.log('Login Submitted:', { username, password });
    // In a real app, you would handle authentication logic here.
  };

  const handleRegisterSubmit = (event) => {
    event.preventDefault();
    console.log('Register Submitted:', { username, password });
    // In a real app, you would handle user registration here.
  };

  // Handle forgot password click
  const handleForgotPassword = () => {
    console.log('Forgot password clicked!');
    // In a real app, you would navigate to a password reset page or open a modal.
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 font-sans">
      {/* Left side: Login/Register form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white md:bg-gray-100">
        <div className="w-full max-w-sm rounded-3xl p-8 bg-white shadow-xl">
          <div className="flex flex-col items-center mb-6">
            <h1 className="text-3xl font-bold text-green-600">EcoRecycle</h1>
            <p className="text-sm text-gray-500 mt-1">Join the sustainable recycling revolution</p>
          </div>
          
          <div className="flex mb-6 text-sm font-medium">
            <button
              className={`flex-1 p-3 rounded-full transition-colors duration-300 ${
                isLogin ? 'bg-green-600 text-white shadow-md' : 'bg-gray-200 text-gray-700'
              }`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={`flex-1 p-3 rounded-full transition-colors duration-300 -ml-4 ${
                !isLogin ? 'bg-green-600 text-white shadow-md' : 'bg-gray-200 text-gray-700'
              }`}
              onClick={() => setIsLogin(false)}
            >
              Register
            </button>
          </div>

          <div className="text-center">
            {isLogin ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Welcome Back</h2>
                <p className="text-sm text-gray-500 mb-4">Sign in to your EcoRecycle account</p>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <div className="text-right">
                  <button type="button" onClick={handleForgotPassword} className="text-sm text-green-600 hover:underline">
                    Forgot password?
                  </button>
                </div>
                <button type="submit" className="w-full p-3 mt-4 text-white bg-green-600 rounded-xl font-bold hover:bg-green-700 transition-colors">
                  Sign In
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Create Account</h2>
                <p className="text-sm text-gray-500 mb-4">Join our community and start recycling</p>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button type="submit" className="w-full p-3 mt-4 text-white bg-green-600 rounded-xl font-bold hover:bg-green-700 transition-colors">
                  Register
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      
      {/* Right side: Marketing content */}
      <div className="flex-1 hidden md:flex items-center justify-center p-8 bg-green-600 text-white rounded-l-3xl shadow-xl">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-white mb-6">Turn Waste Into Rewards</h2>
          <p className="text-gray-200 mb-8">
            Join thousands of eco-warriors transforming plastic waste into valuable resources while earning points and making a positive environmental impact.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-start p-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-semibold text-white">Smart Recycling</h3>
              <p className="text-xs text-gray-200">AI-powered sorting</p>
            </div>
            <div className="flex flex-col items-start p-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-semibold text-white">Earn Points</h3>
              <p className="text-xs text-gray-200">Rewards for recycling</p>
            </div>
            <div className="flex flex-col items-start p-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-semibold text-white">Save Planet</h3>
              <p className="text-xs text-gray-200">Track your impact</p>
            </div>
            <div className="flex flex-col items-start p-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-semibold text-white">Community</h3>
              <p className="text-xs text-gray-200">Global network</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
