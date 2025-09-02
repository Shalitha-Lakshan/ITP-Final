import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Recycle, Gift, Globe2, Users, Eye, EyeOff, User, Mail, Phone, MapPin, Lock, IdCard, Loader2, CheckCircle, AlertCircle } from "lucide-react";

function Register() {
  const [formData, setFormData] = useState({
    nic: "",
    name: "",
    email: "",
    password: "",
    mobile: "",
    address: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  // Validation patterns
  const patterns = {
    nic: /^[0-9]{9}[vVxX]$|^[0-9]{12}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    mobile: /^[0-9]{10}$/
  };

  const validateField = (name, value) => {
    let error = "";
    
    switch(name) {
      case 'nic':
        if (!patterns.nic.test(value)) {
          error = "Please enter a valid NIC number (9 digits + V/X or 12 digits)";
        }
        break;
      case 'name':
        if (value.length < 2) {
          error = "Name must be at least 2 characters long";
        }
        break;
      case 'email':
        if (!patterns.email.test(value)) {
          error = "Please enter a valid email address";
        }
        break;
      case 'password':
        if (value.length < 6) {
          error = "Password must be at least 6 characters long";
        }
        break;
      case 'mobile':
        if (!patterns.mobile.test(value)) {
          error = "Please enter a valid 10-digit mobile number";
        }
        break;
      case 'address':
        if (value.length < 10) {
          error = "Address must be at least 10 characters long";
        }
        break;
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-format mobile number
    if (name === 'mobile') {
      const formattedValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
    }
    // Auto-format NIC
    else if (name === 'nic') {
      let formattedValue = value.toUpperCase();
      if (formattedValue.length <= 12) {
        if (formattedValue.length === 10 && /^[0-9]{9}[VVXX]$/.test(formattedValue)) {
          // Old NIC format
        } else {
          // New NIC format - only numbers
          formattedValue = formattedValue.replace(/[^0-9VX]/g, '');
        }
      }
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
    }
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setLoading(true);

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: "success", text: "Registration successful! Welcome to EcoCycle." });
        setFormData({
          nic: "",
          name: "",
          email: "",
          password: "",
          mobile: "",
          address: "",
        });
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage({ type: "error", text: result.message || "Registration failed. Please try again." });
        
        // Handle field-specific errors
        if (result.errors) {
          setErrors(result.errors);
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage({ type: "error", text: "Network error. Please check your connection and try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="flex flex-col lg:flex-row w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden bg-white">
        
        {/* Left Side - Registration Form */}
        <div className="bg-white p-8 sm:p-12 w-full lg:w-1/2 flex flex-col justify-center">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg mb-4">
              <Recycle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Join EcoCycle
            </h1>
            <p className="text-gray-600">Create your account and start making a difference</p>
          </div>

          {/* Success/Error Messages */}
          {message.text && (
            <div className={`p-4 mb-6 rounded-xl flex items-center space-x-3 ${
              message.type === "success" 
                ? "bg-green-50 border border-green-200 text-green-800" 
                : "bg-red-50 border border-red-200 text-red-800"
            }`}>
              {message.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* NIC Field */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <IdCard className="w-4 h-4 inline mr-2" />NIC Number
              </label>
              <input
                type="text"
                name="nic"
                placeholder="Enter your NIC number"
                value={formData.nic}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                  errors.nic ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              />
              {errors.nic && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />{errors.nic}
                </p>
              )}
            </div>

            {/* Name Field */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                  errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />{errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                  errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />{errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Lock className="w-4 h-4 inline mr-2" />Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a secure password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                    errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />{errors.password}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters required</p>
            </div>

            {/* Mobile Field */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />Mobile Number
              </label>
              <input
                type="tel"
                name="mobile"
                placeholder="Enter 10-digit mobile number"
                value={formData.mobile}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                  errors.mobile ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              />
              {errors.mobile && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />{errors.mobile}
                </p>
              )}
            </div>

            {/* Address Field */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />Address
              </label>
              <textarea
                name="address"
                placeholder="Enter your full address"
                value={formData.address}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                rows={3}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none ${
                  errors.address ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              />
              {errors.address && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />{errors.address}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-300 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <User className="w-5 h-5" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          <p className="text-sm text-gray-600 text-center mt-6">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-blue-600 cursor-pointer hover:underline font-semibold"
            >
              Sign In
            </span>
          </p>
        </div>

        {/* Right Side - Promotional Content */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 bg-gradient-to-br from-blue-600 to-purple-600 text-white flex flex-col justify-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
            <div className="absolute bottom-20 right-10 w-24 h-24 bg-white rounded-full"></div>
            <div className="absolute top-1/2 right-20 w-16 h-16 bg-white rounded-full"></div>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-4 leading-tight">
              Turn Waste Into
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Rewards
              </span>
            </h2>
            <p className="text-lg mb-8 text-blue-100">
              Join thousands of eco-warriors transforming plastic waste into
              valuable resources while earning points and making a positive
              environmental impact.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                    <Recycle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">Smart Recycling</h3>
                </div>
                <p className="text-sm text-blue-100">AI-powered sorting and processing</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">Earn Rewards</h3>
                </div>
                <p className="text-sm text-blue-100">Points and cashback for recycling</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                    <Globe2 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">Save Planet</h3>
                </div>
                <p className="text-sm text-blue-100">Track your environmental impact</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">Community</h3>
                </div>
                <p className="text-sm text-blue-100">Join our global eco-network</p>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-yellow-300">50K+</div>
                <div className="text-xs text-blue-100">Users</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-300">2M+</div>
                <div className="text-xs text-blue-100">Bottles Recycled</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-300">₹10L+</div>
                <div className="text-xs text-blue-100">Rewards Paid</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
