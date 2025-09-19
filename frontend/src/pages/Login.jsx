import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Loader2, CheckCircle, XCircle, User, Shield, Settings, AlertCircle, LogIn, Recycle, Gift, Globe, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Predefined role credentials
  const roleCredentials = {
    admin: { email: "admin@example.com", password: "admin123", dashboard: "/admin-dashboard" },
    transport: { email: "transport@example.com", password: "transport123", dashboard: "/transport" },
    inventory: { email: "inventory@example.com", password: "inventory123", dashboard: "/inventory" },
    production: { email: "production@example.com", password: "production123", dashboard: "/production" },
    sales: { email: "sales@example.com", password: "sales123", dashboard: "/sales" },
    finance: { email: "finance@example.com", password: "finance123", dashboard: "/finance" }
  };

  // Check if user is already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      // Don't redirect to home page, stay on current page or go to dashboard
      const from = location.state?.from?.pathname;
      if (from && from !== '/') {
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, navigate, location]);

  const validateField = (name, value) => {
    let error = "";
    
    switch(name) {
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Please enter a valid email address";
        }
        break;
      case 'password':
        if (value.length < 6) {
          error = "Password must be at least 6 characters long";
        }
        break;
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
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

    // Check for role-based login
    const matchedRole = Object.keys(roleCredentials).find(role => {
      const creds = roleCredentials[role];
      return creds.email === formData.email && creds.password === formData.password;
    });

    if (matchedRole) {
      // Role-based login successful
      const userData = {
        id: matchedRole + "_user",
        email: formData.email,
        role: matchedRole,
        name: matchedRole.charAt(0).toUpperCase() + matchedRole.slice(1) + " User"
      };
      
      login(userData, "role_token_" + matchedRole);
      
      setMessage({ type: "success", text: `Login successful! Redirecting to ${matchedRole} dashboard...` });
      
      setTimeout(() => {
        navigate(roleCredentials[matchedRole].dashboard, { replace: true });
      }, 800);
      
      setLoading(false);
      return;
    }

    // Validate all fields for regular login
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'role') {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });

      const result = await response.json();

      if (result.success) {
        login(result.user, result.token);
        setMessage({ type: "success", text: "Login successful! Redirecting..." });
        
        setTimeout(() => {
          const from = location.state?.from?.pathname;
          navigate(from || '/', { replace: true });
        }, 800);
      } else {
        setMessage({ type: "error", text: result.message || "Invalid credentials. Try role-based login or check your details." });
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage({ type: "error", text: "Network error. Please check your connection and try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="flex flex-col lg:flex-row w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden bg-white">
        
        {/* Left Side - Login Form */}
        <div className="bg-white p-8 sm:p-12 w-full lg:w-1/2 flex flex-col justify-center">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">Sign in to your EcoCycle account</p>
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
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          )}


          <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="Enter your password"
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
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
              >
                Forgot password?
              </button>
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
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500 bg-white">Or continue with</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => setMessage({ type: "error", text: "Google login coming soon!" })}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                alt="Google"
                className="w-5 h-5 mr-3"
              />
              <span className="text-gray-700 font-medium">Continue with Google</span>
            </button>
            
            <button
              onClick={() => setMessage({ type: "error", text: "Social login coming soon!" })}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="font-medium">Continue with Facebook</span>
            </button>
          </div>

          {/* Navigate to Register */}
          <p className="text-sm text-gray-600 text-center mt-6">
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-blue-600 cursor-pointer hover:underline font-semibold"
            >
              Create Account
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
              Welcome Back to
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                EcoCycle
              </span>
            </h2>
            <p className="text-lg mb-8 text-blue-100">
              Continue your journey in transforming plastic waste into valuable resources. 
              Your eco-impact dashboard is waiting for you.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                    <Recycle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">Track Progress</h3>
                </div>
                <p className="text-sm text-blue-100">Monitor your recycling impact</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">Your Rewards</h3>
                </div>
                <p className="text-sm text-blue-100">Check earned points and cashback</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">Global Impact</h3>
                </div>
                <p className="text-sm text-blue-100">See your environmental contribution</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">Community Hub</h3>
                </div>
                <p className="text-sm text-blue-100">Connect with eco-warriors</p>
              </div>
            </div>

            {/* Live Stats */}
            <div className="mt-8 p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <h4 className="text-lg font-semibold mb-4 text-center">Live EcoCycle Stats</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-yellow-300">50,247</div>
                  <div className="text-xs text-blue-100">Active Users</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-300">2.1M</div>
                  <div className="text-xs text-blue-100">Bottles Today</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-300">₹12.5L</div>
                  <div className="text-xs text-blue-100">Rewards Paid</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
