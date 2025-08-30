import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Recycle, Gift, Globe, Users } from "lucide-react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

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

    if (formData.username === "testuser" && formData.password === "password123") {
      setMessage("Login successful!");
      setTimeout(() => {
        navigate("/"); // redirect to homepage
      }, 1000);
    } else {
      setMessage("Login failed. Check your username and password.");
    }
  };

  return (
    <GoogleOAuthProvider clientId="715586356915-nnbig0ob12djfjiq073mt5nqc4d0eiqn.apps.googleusercontent.com">
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4 sm:p-8">
        <div className="flex flex-col lg:flex-row w-full max-w-5xl rounded-2xl shadow-xl overflow-hidden">
          
          {/* Left Side - Login Form */}
          <div className="bg-white p-8 sm:p-12 w-full lg:w-1/2 flex flex-col justify-center">
            <div className="flex items-center justify-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                Welcome Back
              </h1>
            </div>

            {/* Message */}
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-green-300 focus:outline-none"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-green-300 focus:outline-none"
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
                className="w-full bg-green-500 text-white font-semibold py-3 rounded-lg hover:bg-green-600 transition duration-300"
              >
                Sign In
              </button>
            </form>

            {/* OAuth Buttons */}
            <div className="mt-6 space-y-3">
              {/* Google Login */}
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  console.log("Google Credential:", credentialResponse);
                  const userObject = jwtDecode(credentialResponse.credential);
                  console.log("Google User:", userObject);
                  navigate("/"); // redirect home
                }}
                onError={() => console.log("Google login failed")}
                useOneTap
                text="continue_with"
                shape="pill"
                size="large"
                className="w-full flex justify-center items-center bg-white text-gray-800 border border-gray-300 hover:bg-gray-100 transition duration-200"
              >
                <span className="mr-3">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                    alt="Google"
                    className="w-5 h-5"
                  />
                </span>
                Continue with Google
              </GoogleLogin>

              {/* Facebook Login */}
              <button
                onClick={() => window.location.href = "https://www.facebook.com/"}
                className="w-full flex justify-center items-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
              >
                <span className="mr-3">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png"
                    alt="Facebook"
                    className="w-5 h-5"
                  />
                </span>
                Continue with Facebook
              </button>
            </div>

            {/* Navigate to Register */}
            <p className="text-sm text-gray-600 text-center mt-6">
              Don’t have an account?{" "}
              <span
                onClick={() => navigate("/register")}
                className="text-blue-600 cursor-pointer hover:underline"
              >
                Register
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
                <Globe className="w-8 h-8 mr-3 text-white" />
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
    </GoogleOAuthProvider>
  );
}

export default Login;
