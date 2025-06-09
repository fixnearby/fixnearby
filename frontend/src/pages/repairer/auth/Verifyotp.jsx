import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useLocation and useNavigate
import axios from 'axios'; // Import axios
import {
  Wrench,
  Phone,
  Mail,
  ArrowRight,
  Shield,
  CheckCircle,
  ArrowLeft,
  Loader,
  Clock,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const VerifyOtp = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Use useLocation hook to access state passed from previous route
  const location = useLocation();
  const navigate = useNavigate(); // For navigation after success/failure

  const [email, setEmail] = useState(''); // State to store the email for verification
  // Determine verification method and contact info dynamically from passed state or email format
  const [verificationMethod, setVerificationMethod] = useState('email'); // Default to email
  const [displayContactInfo, setDisplayContactInfo] = useState(''); // What to display to the user

  const inputRefs = useRef([]);

  useEffect(() => {
    // Extract email (and possibly phone) from location.state
    if (location.state && location.state.email) {
      setEmail(location.state.email);
      // Assuming email is the primary method for repairer OTP based on backend
      setVerificationMethod('email');
      setDisplayContactInfo(location.state.email);
    } else {
      // If email is not provided, this route was likely accessed directly or incorrectly.
      // You might want to redirect them back or show a prominent error.
      setError('Verification email is missing. Please go back to get OTP.');
      // Optionally redirect:
      // setTimeout(() => navigate('/repairer/getotp'), 3000);
    }

    // Timer effect
    if (timeLeft > 0 && !success) { // Stop timer if successful
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !error) {
      // If timer runs out and no other error is present, set an expiration message
      setError('OTP has expired. Please resend the code.');
    }
  }, [timeLeft, location.state, success, error, navigate]); // Added dependencies

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(''); // Clear error when user starts typing

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    const digits = paste.replace(/\D/g, '').slice(0, 6);

    const newOtp = [...otp];
    for (let i = 0; i < digits.length; i++) {
      newOtp[i] = digits[i];
    }
    setOtp(newOtp);

    // Focus the next empty input or the last one
    const nextIndex = Math.min(digits.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async () => {
    const otpString = otp.join('');

    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    if (!email) {
        setError('Verification email is missing. Please go back and try again.');
        return;
    }

    setIsLoading(true);
    setError('');

    try {
      // ACTUAL API CALL to your backend
      const response = await axios.post('http://localhost:3000/api/repairer/verify-otp', {
        email: email, // Send the email obtained from state
        otp: otpString,
      });

      if (response.status === 200) {
        setSuccess(true);
        setTimeout(() => {
          console.log('Verification successful! Redirecting to signup...');
          // Redirect to the repairer signup page, passing the email
          navigate('/repairer/signup', { state: { email: email } });
        }, 2000);
      }
      // Any non-2xx status will typically throw an error caught by the catch block
    } catch (error) {
      console.error('Verification error:', error);
      // Access the error message from the backend response
      setError(error.response?.data?.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (timeLeft > 0 || isResending) return; // Prevent resend if timer is active or already resending
    if (!email) {
        setError('Cannot resend. Email is missing. Please go back to get OTP.');
        return;
    }

    setIsResending(true);
    setError('');
    
    try {
      // ACTUAL API CALL to resend OTP
      const response = await axios.post('http://localhost:3000/api/repairer/getotp', { email: email });

      if (response.status === 200) {
        setTimeLeft(120); // Reset timer on successful resend
        console.log('OTP resent successfully');
        setError(''); // Clear any previous errors on successful resend
      } else {
        // This case might be rare if axios catches non-2xx as errors
        setError(response.data?.message || 'Failed to resend code.');
      }
    } catch (error) {
      console.error('Resend error:', error);
      setError(error.response?.data?.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const maskContact = (contact) => {
    if (!contact) return ''; // Handle empty contact info
    if (verificationMethod === 'phone') {
      // This masking assumes a specific phone format like +1 (555) 123-4567
      // You might need to adjust this based on your actual phone number format
      return contact.replace(/(\+\d{1,3})?\s?(\(?\d{3}\)?)?\s?(\d{3})?-?(\d{4})/, (match, p1, p2, p3, p4) => {
        let masked = '';
        if (p1) masked += p1 + ' ';
        if (p2) masked += '(***) ';
        else masked += '*** '; // If no area code format, just mask
        if (p3) masked += '***-';
        else masked += '***-'; // If no middle digits, just mask
        masked += p4;
        return masked;
      });
    } else { // Mask for email
      const [local, domain] = contact.split('@');
      if (!local || !domain) return contact; // Return as is if not a valid email format
      return `${local.charAt(0)}***${local.slice(-1)}@${domain}`;
    }
  };


  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md mx-4">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Verification Successful!</h1>
          <p className="text-gray-600 mb-6">
            Your account has been verified successfully. You'll be redirected to the signup page shortly.
          </p>
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

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
              <button
                onClick={() => navigate(-1)} // Go back to previous page (GetOtp)
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Form */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                {verificationMethod === 'phone' ? (
                  <Phone className="w-8 h-8 text-white" />
                ) : (
                  <Mail className="w-8 h-8 text-white" />
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Account</h1>
              <p className="text-gray-600 text-lg mb-4">
                We've sent a 6-digit verification code to
              </p>
              <p className="text-blue-600 font-semibold text-lg">
                {maskContact(displayContactInfo)}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700">{error}</span>
              </div>
            )}

            <div className="space-y-6">
              {/* OTP Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4 text-center">
                  Enter Verification Code
                </label>
                <div className="flex justify-center space-x-3 mb-6">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  ))}
                </div>
              </div>

              {/* Timer */}
              <div className="text-center mb-6">
                {timeLeft > 0 ? (
                  <div className="flex items-center justify-center space-x-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Code expires in {formatTime(timeLeft)}</span>
                  </div>
                ) : (
                  <div className="text-red-600">
                    <span>Code expired</span>
                  </div>
                )}
              </div>

              {/* Verify Button */}
              <button
                onClick={handleVerify}
                disabled={isLoading || otp.join('').length !== 6 || !email || timeLeft === 0}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Account</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Resend Code */}
              <div className="text-center">
                <p className="text-gray-600 mb-2">Didn't receive the code?</p>
                <button
                  onClick={handleResend}
                  disabled={timeLeft > 0 || isResending || !email}
                  className="text-blue-600 hover:text-purple-600 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Resend Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Almost{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  There!
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Just one more step to secure your account and start connecting with customers.
              </p>
            </div>

            {/* Security Features */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Secure Verification</h3>
                  <p className="text-gray-600">
                    Your account is protected with enterprise-grade security measures.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Trusted Platform</h3>
                  <p className="text-gray-600">
                    Join thousands of verified professionals on fixNearby.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Quick Setup</h3>
                  <p className="text-gray-600">
                    Get verified in minutes and start receiving job requests today.
                  </p>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Having trouble?</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Check your spam/junk folder for the verification code</li>
                <li>• Make sure you entered the correct {verificationMethod === 'phone' ? 'phone number' : 'email address'}</li>
                <li>• Wait a few minutes before requesting a new code</li>
                <li>• Contact our support team if you continue having issues</li>
              </ul>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <a href="#" className="text-blue-600 hover:text-purple-600 font-medium flex items-center space-x-2">
                  <span>Contact Support</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Demo Code Notice - REMOVE THIS IN PRODUCTION */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="font-semibold text-yellow-800">Demo Mode</span>
              </div>
              <p className="text-yellow-700 text-sm">
                For testing purposes, the backend will send an actual OTP to the email.
                The hardcoded "123456" in the old frontend is no longer used for verification.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">fixNearby</span>
              </div>
              <p className="text-gray-400">
                Connecting skilled professionals with customers who need quality repair services.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Professionals</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Join as Professional</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Professional Login</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Customers</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Find Professionals</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Book Services</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Customer Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Safety & Trust</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 fixNearby. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VerifyOtp;