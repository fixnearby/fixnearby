import React, { useState , useEffect} from 'react';
import { Mail, ArrowRight, Wrench, User, CheckCircle } from 'lucide-react';
import { axiosInstance } from '../../../lib/axios';
import toast from "react-hot-toast";
import { useLocation, useNavigate } from 'react-router-dom';

const Verifyotp = () => {

  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  useEffect(() => {
    if (!email) {
      navigate("/user/getotp");
    }
  }, [email, navigate]);


  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email using our Zod-like schema
    if(otp.length !== 6){
      toast.error('Please enter a valid 6-digit OTP');
      setOtp('');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    try {
      const response = await axiosInstance.post("/user/verify-otp",{email,otp});
      if (response.status ===200 || response.status === 201) {
        toast.success('OTP verified successfully!');
        setOtp(''); 
        navigate("/user/signup",{ state: { email } });
        window.location.reload();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to send OTP. Please try again.');
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
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify OTP</h1>
          <p className="text-gray-600">Enter your OTP to verify {email}</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                6 digit OTP
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Enter your OTP (6 digits)"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Verifying OTP...</span>
                </>
              ) : (
                <>
                  <span>Verify OTP</span>
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
            <a href="/user/login" className="text-blue-600 hover:text-purple-600 font-semibold transition-colors">
              Sign in
            </a>
          </p>
          <div className="flex justify-center space-x-6 text-xs text-gray-500">
            <a href="/privacy" className="hover:text-gray-700 transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-gray-700 transition-colors">Terms of Service</a>
            <a href="/help" className="hover:text-gray-700 transition-colors">Help</a>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="bg-blue-100 rounded-full p-1">
                <CheckCircle className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Secure & Private</h3>
              <p className="text-xs text-blue-700">
                Your email is encrypted and will only be used for account verification and service updates.
              </p>
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


  export default Verifyotp