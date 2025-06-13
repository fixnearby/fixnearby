import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Wrench, User, AlertCircle, Phone } from 'lucide-react';
import { axiosInstance } from '../../../lib/axios';
axiosInstance
import toast from "react-hot-toast";
import { useNavigate } from 'react-router-dom';

// Zod-like validation schema (simulated)
const loginSchema = {
  validate: (data) => {
    const errors = {};
    
    // Email validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!data.phone) {
      errors.phone = 'phone number is required';
    } else if (!phoneRegex.test(data.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    // Password validation
    if (!data.password) {
      errors.password = 'Password is required';
    } else if (data.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }
    
    return {
      success: Object.keys(errors).length === 0,
      errors
    };
  }
};




const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async () => {
    // Validate form data using Zod-like schema
    const validation = loginSchema.validate(formData);
    
    if (!validation.success) {
      setFieldErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      toast.error(firstError);
      return;
    }
    
    setIsLoading(true);
    setFieldErrors({});

    try {
      // Make API call using axios
      const response = await axiosInstance.post('/user/login', formData);
      
      if (response.status ===200 || response.status === 201) {
        toast.success('Login successful! Redirecting...');
        navigate("/user/dashboard")
        window.location.reload();
        
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
              <Wrench className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              fixNearby
            </span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                    fieldErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your Phone Number"
                />
              </div>
              {fieldErrors.phone && (
                <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{fieldErrors.phone}</span>
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                    fieldErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{fieldErrors.password}</span>
                </p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <a href="/user/forgot-password" className="text-sm text-blue-600 hover:text-purple-600 font-medium transition-colors">
                Forgot your password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">or</span>
            </div>
          </div>

          {/* Repairer Login */}
          <div className="text-center space-y-4">
            <p className="text-gray-600 text-sm">
              Are you a service provider?
            </p>
            <a href="/repairer/login"
              className="w-full border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <User className="w-5 h-5" />
              <span>Login as Repairer</span>
            </a>
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center mt-8 space-y-2">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/user/getotp" className="text-blue-600 hover:text-purple-600 font-semibold transition-colors">
              Sign up
            </a>
          </p>
          <div className="flex justify-center space-x-6 text-xs text-gray-500">
            <a href="/privacy" className="hover:text-gray-700 transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-gray-700 transition-colors">Terms of Service</a>
            <a href="/help" className="hover:text-gray-700 transition-colors">Help</a>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="bg-amber-100 rounded-full p-1">
                <AlertCircle className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-amber-900 mb-1">Demo Credentials</h3>
              <p className="text-xs text-amber-700 mb-2">
                For testing purposes, you can use:
              </p>
              <div className="text-xs text-amber-700 space-y-1">
                <div><strong>Email:</strong> test@example.com</div>
                <div><strong>Password:</strong> password123</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Login;