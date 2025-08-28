import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ import navigate hook

function Register() {
  const [formData, setFormData] = useState({
    nic: "",
    name: "",
    email: "",
    password: "",
    mobile: "",
    address: "",
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // ✅ use navigate

  const handleChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    console.log("Attempting to register with data:", formData);
    setMessage("Registration successful!");
    // ✅ After successful registration navigate to login
    setTimeout(() => navigate("/login"), 1500);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="flex flex-col lg:flex-row w-full max-w-5xl rounded-2xl shadow-xl overflow-hidden">
        
        {/* Left Side - Registration Form */}
        <div className="bg-white p-8 sm:p-12 w-full lg:w-1/2 flex flex-col justify-center">
          <div className="flex items-center justify-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Create an Account
            </h1>
          </div>

          {message && (
            <div className={`p-3 mb-4 text-center rounded-lg ${message.includes('failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="nic"
              placeholder="NIC"
              value={formData.nic}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 focus:outline-none"
            />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 focus:outline-none"
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 focus:outline-none"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 focus:outline-none"
            />
            <input
              type="text"
              name="mobile"
              placeholder="Mobile Number"
              value={formData.mobile}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 focus:outline-none"
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 focus:outline-none"
            />

            <button
              type="submit"
              className="w-full bg-green-500 text-white font-semibold py-3 rounded-lg hover:bg-green-600 transition duration-300"
            >
              Register
            </button>
          </form>

          {/* ✅ Navigate to login page */}
          <p className="text-sm text-gray-600 text-center mt-6">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-blue-600 cursor-pointer hover:underline"
            >
              Login
            </span>
          </p>
        </div>

        {/* Right Side - Promotional Content */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 bg-gradient-to-br from-green-500 to-blue-500 text-white flex flex-col justify-center">
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Turn Waste Into Rewards
          </h2>
          <p className="text-lg mb-8">
            Join thousands of eco-warriors transforming plastic waste into valuable resources while earning points and making a positive environmental impact.
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-start">
              <span className="flex-shrink-0 mr-3">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2.5a.5.5 0 01.5.5v16a.5.5 0 01-1 0V3a.5.5 0 01.5-.5z" />
                  <path fillRule="evenodd" d="M10 2.5a7.5 7.5 0 100 15 7.5 7.5 0 000-15zm-6.5 7.5a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z" clipRule="evenodd" />
                </svg>
              </span>
              <div>
                <h3 className="text-xl font-semibold">Smart Recycling</h3>
                <p className="text-sm text-gray-200">AI-powered sorting</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 mr-3">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.865.503l-3 5a1 1 0 00.865 1.497h6a1 1 0 00.865-1.497l-3-5A1 1 0 0010 7z" clipRule="evenodd" />
                </svg>
              </span>
              <div>
                <h3 className="text-xl font-semibold">Earn Points</h3>
                <p className="text-sm text-gray-200">Rewards for recycling</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 mr-3">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-12a1 1 0 10-2 0v4a1 1 0 102 0V6zm0 6a1 1 0 10-2 0h2a1 1 0 100-2z" clipRule="evenodd" />
                </svg>
              </span>
              <div>
                <h3 className="text-xl font-semibold">Save Planet</h3>
                <p className="text-sm text-gray-200">Track your impact</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 mr-3">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a1 1 0 011-1h1.464a.5.5 0 01.354.146l2.121 2.121a.5.5 0 01.146.354V19a1 1 0 01-1 1h-4a1 1 0 01-1-1zM17 9a3 3 0 100-6 3 3 0 000 6zm-7 9a1 1 0 011-1h1.464a.5.5 0 01.354.146l2.121 2.121a.5.5 0 01.146.354V19a1 1 0 01-1 1h-4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </span>
              <div>
                <h3 className="text-xl font-semibold">Community</h3>
                <p className="text-sm text-gray-200">Global network</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
