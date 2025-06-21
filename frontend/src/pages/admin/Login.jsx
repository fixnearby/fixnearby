import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Wrench,
  User,
  AlertCircle,
  Phone,
} from "lucide-react";


import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import images from "../../assets/images";
import { axiosInstance } from "../../lib/axios";

const loginSchema = {
  validate: (data) => {
    const errors = {};

    if (!data.fullname.trim()) {
      errors.fullname = "Full name is required";
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!data.phone) {
      errors.phone = "Phone number is required";
    } else if (!phoneRegex.test(data.phone)) {
      errors.phone = "Please enter a valid 10-digit phone number";
    }

    if (!data.password) {
      errors.password = "Password is required";
    } else if (data.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }

    return {
      success: Object.keys(errors).length === 0,
      errors,
    };
  },
};

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async () => {
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
      const response = await axiosInstance.post("/admin/login", formData);

      if (response.status === 200 || response.status === 201) {
        toast.success("Login successful! Redirecting...");
        navigate("/admin/dashboard");
        window.location.reload();
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6 cursor-pointer">
            <a href="/">
              <img
                src={images.logooo}
                alt="fixNearby Logo"
                className="h-10 w-auto rounded-lg shadow-md cursor-pointer"
              />
            </a>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">Sign in to your admin account to continue</p>
        </div>

        {/* Main Card */}

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="space-y-6">
            <div>
              <label
                htmlFor="fullname"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="fullname"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                    fieldErrors.fullname
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
              </div>
              {fieldErrors.fullname && (
                <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{fieldErrors.fullname}</span>
                </p>
              )}
            </div>

            {/* Phone Input */}
            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="block text-sm font-semibold text-gray-700"
              >
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                    fieldErrors.phone
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter your Phone Number"
                  maxLength="10"
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
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                    fieldErrors.password
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
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
              <a
                href="/user/forgot-password"
                className="text-emerald-600 hover:text-lime-600 font-medium transition-colors"
              >
                Forgot your password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-700 text-white py-3 px-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 cursor-pointer"
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




        </div>

      </div>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default Login;
