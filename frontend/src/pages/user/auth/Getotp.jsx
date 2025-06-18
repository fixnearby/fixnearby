import React, { useState } from 'react';
import { Phone, ArrowRight, Wrench } from 'lucide-react';
import { axiosInstance } from '../../../lib/axios';
import toast from "react-hot-toast";
import { useNavigate } from 'react-router-dom';

const Getotp = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const phoneRegex = /^[6-9]\d{9}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phone) {
      toast.error('Phone number is required');
      return;
    }
    if (!phoneRegex.test(phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axiosInstance.post("/user/getotp", { phone });
      if (response.status === 200 || response.status === 201) {
        toast.success('OTP sent successfully!');
        navigate("/user/verify-otp", { state: { phone } });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send OTP. Please try again.';
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
          <div className="flex items-center justify-center mb-6">
            {/* Logo */}
            <img 
              src="/images/logooo.png" 
              alt="fixNearby Logo" 
              className="h-10 w-auto rounded-lg shadow-md" 
            />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Get OTP</h1>
          <p className="text-gray-600">Enter your phone number to get started</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="space-y-6">
            {/* Phone Input */}
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
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Enter your 10-digit phone number"
                  maxLength="10"
                />
              </div>
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
                  <span>Sending OTP...</span>
                </>
              ) : (
                <>
                  <span>Get OTP</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center mt-8 space-y-2">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/user/login" className="text-emerald-600 hover:text-lime-600 font-semibold transition-colors">
              Sign in
            </a>
          </p>
          <div className="flex justify-center space-x-6 text-xs text-gray-500">
            <a href="/privacy-policy" className="hover:text-gray-700 transition-colors">Privacy Policy</a>
            <a href="/terms-and-conditions" className="hover:text-gray-700 transition-colors">Terms of Service</a>
            <a href="/contact-us" className="hover:text-gray-700 transition-colors">Help</a>
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

export default Getotp;