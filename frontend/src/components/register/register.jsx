import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Recycle, Gift, Globe2, Users } from "lucide-react"; // ✅ Lucide icons

function Register() {
  const [formData, setFormData] = useState({
    nic: "",
    name: "",
    email: "",
    password: "",
    mobile: "",
    address: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");
    console.log("Attempting to register with data:", formData);
    setMessage("Registration successful!");
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
            Join thousands of eco-warriors transforming plastic waste into
            valuable resources while earning points and making a positive
            environmental impact.
          </p>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-start">
              <Recycle className="w-8 h-8 mr-3 text-white" />
              <div>
                <h3 className="text-xl font-semibold">Smart Recycling</h3>
                <p className="text-sm text-gray-200">AI-powered sorting</p>
              </div>
            </div>

            <div className="flex items-start">
              <Gift className="w-8 h-8 mr-3 text-white" />
              <div>
                <h3 className="text-xl font-semibold">Earn Points</h3>
                <p className="text-sm text-gray-200">Rewards for recycling</p>
              </div>
            </div>

            <div className="flex items-start">
              <Globe2 className="w-8 h-8 mr-3 text-white" />
              <div>
                <h3 className="text-xl font-semibold">Save Planet</h3>
                <p className="text-sm text-gray-200">Track your impact</p>
              </div>
            </div>

            <div className="flex items-start">
              <Users className="w-8 h-8 mr-3 text-white" />
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
