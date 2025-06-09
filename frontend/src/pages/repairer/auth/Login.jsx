import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import { 
  Wrench, 
  Phone, 
  Mail, 
  ArrowRight, 
  Shield, 
  Eye,
  EyeOff,
  User,
  Lock,
  AlertCircle
} from 'lucide-react';

// You need to import axiosInstance and useAuthStore here
// Adjust paths relative to this file's location (frontend/src/pages/repairer/auth/Login.jsx)
import { axiosInstance } from '../../../lib/axios.js'; // Adjust path as needed
import { useAuthStore } from '../../../store/authStore.js'; // Adjust path as needed


const Login = () => {
  const navigate = useNavigate(); // Initialize the navigate function
  const { setRepairer } = useAuthStore(); // Destructure setRepairer from your auth store

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({}); // Clear previous errors

    try {
      // Make the actual API call for login
      const response = await axiosInstance.post('/repairer/login', { 
        email: formData.email,
        password: formData.password
      });

      console.log('Backend response on successful login attempt:', response.data);
      
      // *** FIX: Changed the condition to simply check if response.data exists ***
      // If the backend returned a 200 OK and data, we assume it's the repairer object
      if (response.data) { 
        setRepairer(response.data); // Store the repairer data in your global state
        console.log("Repairer state updated successfully in store. Navigating to dashboard.");
        navigate('/repairer/dashboard', { replace: true }); // Navigate only on successful backend login
      } else {
        // This 'else' block should ideally not be hit with a 200 OK response from backend
        setErrors({ general: 'Login successful, but no repairer data was received. Please contact support.' });
      }
      
    } catch (error) {
      console.error('Login error:', error);
      // Handle different error responses from the backend
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);

        if (error.response.status === 401 || error.response.status === 403) {
          setErrors({ general: error.response.data.message || 'Invalid email or password.' });
        } else if (error.response.data && error.response.data.message) {
          setErrors({ general: error.response.data.message });
        } else {
          setErrors({ general: 'An unexpected error occurred during login. Please try again.' }); 
        }
      } else if (error.request) {
        setErrors({ general: 'No response from server. Please check your internet connection or server status.' });
      } else {
        setErrors({ general: 'An error occurred. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Wrench className="w-8 h-8 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                fixNearby
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/repairer/getotp" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                New Professional?
              </a>
              <a href="/user/getotp" className="text-blue-600 hover:text-purple-600 font-medium transition-colors">
                Looking for repairs?
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-gray-600 text-lg">
                Sign in to your professional account
              </p>
            </div>

            {/* Error Message */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{errors.general}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    className={`block w-full pl-10 pr-3 py-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.email ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className={`block w-full pl-10 pr-12 py-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.password ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-sm text-blue-600 hover:text-purple-600 font-medium">
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit" 
                onClick={handleSubmit} 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="text-center">
                <a
                  href="/repairer/getotp"
                  className="text-blue-600 hover:text-purple-600 font-semibold text-lg transition-colors"
                >
                  Join as Professional
                </a>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                By signing in, you agree to our{' '}
                <a href="#" className="text-blue-600 hover:text-purple-600 font-medium">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-600 hover:text-purple-600 font-medium">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Shield className="w-5 h-5 text-green-500" />
                <span className="font-medium text-gray-900">Secure Login</span>
              </div>
              <p className="text-sm text-gray-600">
                Your account is protected with enterprise-grade security and encryption.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
