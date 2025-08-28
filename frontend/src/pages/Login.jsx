import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");
    console.log("Attempting to log in with data:", formData);

    // ✅ Simulated login validation
    if (formData.username === "testuser" && formData.password === "password123") {
      setMessage("Login successful!");
      
      // ✅ Redirect to HomePage after 1 second
      setTimeout(() => {
        navigate("/"); // go to HomePage
      }, 1000);
    } else {
      setMessage("Login failed. Check your username and password.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 font-sans">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white md:bg-gray-100">
        <div className="w-full max-w-sm rounded-3xl p-8 bg-white shadow-xl">
          <div className="flex flex-col items-center mb-6">
            <h1 className="text-3xl font-bold text-green-600">EcoRecycle</h1>
            <p className="text-sm text-gray-500 mt-1">
              Join the sustainable recycling revolution
            </p>
          </div>

          {/* Login/Register Toggle */}
          <div className="flex mb-6 text-sm font-medium">
            <button
              className="flex-1 p-3 rounded-full bg-green-600 text-white shadow-md"
              onClick={() => console.log("Currently on login page")}
            >
              Login
            </button>
            <button
              className="flex-1 p-3 rounded-full -ml-4 bg-gray-200 text-gray-700 hover:bg-gray-300"
              onClick={() => navigate("/register")} // ✅ Navigate to register page
            >
              Register
            </button>
          </div>

          {/* Messages */}
          {message && (
            <div
              className={`p-3 mb-4 text-center rounded-lg ${
                message.includes("failed")
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {message}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Welcome Back
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Sign in to your EcoRecycle account
            </p>

            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <div className="text-right">
              <button
                type="button"
                onClick={() => console.log("Forgot password clicked!")}
                className="text-sm text-green-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full p-3 mt-4 text-white bg-green-600 rounded-xl font-bold hover:bg-green-700 transition-colors"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>

      {/* Right Side - Marketing */}
      <div className="flex-1 hidden md:flex items-center justify-center p-8 bg-gradient-to-br from-green-500 to-blue-500 text-white rounded-l-3xl shadow-xl">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-white mb-6">
            Turn Waste Into Rewards
          </h2>
          <p className="text-gray-200 mb-8">
            Join thousands of eco-warriors transforming plastic waste into
            valuable resources while earning points and making a positive
            environmental impact.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-start p-4">
              <h3 className="font-semibold text-white">Smart Recycling</h3>
              <p className="text-xs text-gray-200">AI-powered sorting</p>
            </div>
            <div className="flex flex-col items-start p-4">
              <h3 className="font-semibold text-white">Earn Points</h3>
              <p className="text-xs text-gray-200">Rewards for recycling</p>
            </div>
            <div className="flex flex-col items-start p-4">
              <h3 className="font-semibold text-white">Save Planet</h3>
              <p className="text-xs text-gray-200">Track your impact</p>
            </div>
            <div className="flex flex-col items-start p-4">
              <h3 className="font-semibold text-white">Community</h3>
              <p className="text-xs text-gray-200">Global network</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
