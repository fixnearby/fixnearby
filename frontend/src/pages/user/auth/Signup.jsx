import React, { useState , useEffect} from 'react';
import {  ArrowRight, Wrench, User, PhoneCall, Eye, Lock , EyeOff } from 'lucide-react';
import { axiosInstance } from '../../../lib/axios';
import toast from "react-hot-toast";
import { useLocation, useNavigate } from 'react-router-dom';




const Signup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  useEffect(() => {
    if (!email) {
      navigate("/user/getotp");
    }
  }, [email, navigate]);



  const [fullname, setFullname] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
 
    const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email using our Zod-like schema
    if (!fullname || fullname.length < 3) {
      toast.error("Full name must be at least 3 characters");
      setIsLoading(false);
      return;
    }

    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    if (!phone || !/^\d{10}$/.test(phone)) {
      toast.error("Phone number must be exactly 10 digits");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    try {
      console.log("Submitting signup data:", { email, fullname, password, aadharCardNumber, phone });
      const response = await axiosInstance.post("/user/signup",{email,fullname, password, aadharCardNumber, phone});
      if (response.status ===200 || response.status === 201) {
        toast.success('Signup successfull!');
        setFullname(''); // Clear fullname input after successful submission
        setPassword(''); // Clear password input after successful submission
        setPhone(''); // Clear phone input after successful submission
        navigate("/user/dashboard");
        window.location.reload();
        
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to Signup . Please try again.');
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
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create an Account</h1>
          <p className="text-gray-600">Register your {email}</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="space-y-6">
            {/* Full name Input */}
            <div className="space-y-2">
              <label  className="block text-sm font-semibold text-gray-700">
                Full Name (as per Aadhar Card)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="fullname"
                  name="fullname"
                  type="text"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 `}
                  placeholder="Enter your Full Name as on Aadhar Card"
                />
              </div>
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 `}
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
            </div>

            {/* Phone number Input */}
            <div className="space-y-2">
              <label  className="block text-sm font-semibold text-gray-700">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PhoneCall className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="Phonenumber"
                  name="Phonenumber"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 `}
                  placeholder="Enter your Phone Number (10 digits)"
                />
              </div>
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
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span>Signup</span>
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
            Already have an account?{' '}
            <a href="/user/login" className="text-blue-600 hover:text-purple-600 font-semibold transition-colors">
              Login
            </a>
          </p>
          <div className="flex justify-center space-x-6 text-xs text-gray-500">
            <a href="/privacy" className="hover:text-gray-700 transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-gray-700 transition-colors">Terms of Service</a>
            <a href="/help" className="hover:text-gray-700 transition-colors">Help</a>
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
}

export default Signup