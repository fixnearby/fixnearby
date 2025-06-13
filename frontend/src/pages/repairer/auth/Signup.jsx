import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import servicefromjson from '../../../services.json'; // Assuming you have a JSON file with services
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
  MapPin,
  Briefcase,
  CheckCircle,
  AlertCircle,
  Star,
  Award,
  Loader,
  CreditCard, // Import CreditCard icon for Aadhar field
  IdCard
} from 'lucide-react';
import { axiosInstance } from '../../../lib/axios';

const Signup = () => {
  const location = useLocation();
  const navigate = useNavigate();
    const phone = location.state?.phone;
  
    useEffect(() => {
      if (!phone) {
        navigate("/repairer/getotp");
      }
    }, [phone, navigate]);

  const [formData, setFormData] = useState({
    fullname: '',         // CHANGED: fullName -> fullname (matches backend)
    password: '',
    upiId: '',
    confirmPassword: '',
    services: '',         // CHANGED: profession -> services (matches backend)
    pincode: '',             // Keeping 'city' in state if frontend UI still uses it, but it won't be sent to backend in payload below.
    aadharcardNumber: '', // ADDED: New field for Aadhar card number (matches backend)
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Renamed 'professions' to 'servicesOffered' for clarity and alignment with 'services' field

  const servicesOffered = servicefromjson.home_services.map(item =>
  item.main_category
  );

  const benefits = [
    {
      icon: <Star className="w-6 h-6" />,
      title: "Professional Growth",
      description: "Build your reputation and expand your client base"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure Payments",
      description: "Get paid safely and on time for your services"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Flexible Schedule",
      description: "Work when you want and set your own rates"
    }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    // console.log(`Input changed: name=${name}, value=${newValue}`); // Uncomment for debugging
    
    setFormData(prev => {
      const updatedFormData = {
        ...prev,
        [name]: newValue
      };
      // console.log("Previous formData:", prev); // Uncomment for debugging
      // console.log("Updated formData (after setFormData call):", updatedFormData); // Uncomment for debugging
      return updatedFormData;
    });

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    // Clear general error if any field is changed
    if (errors.general) {
      setErrors(prev => ({
        ...prev,
        general: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullname.trim()) { // CHANGED: formData.fullName -> formData.fullname
      newErrors.fullname = 'Full name is required'; // CHANGED: newErrors.fullName -> newErrors.fullname
    }

    // ADDED: Aadhar card validation
    if (!formData.aadharcardNumber.trim()) {
      newErrors.aadharcardNumber = 'Aadhar Card Number is required';
    } else if (!/^\d{12}$/.test(formData.aadharcardNumber.trim())) { // Simple 12-digit check
      newErrors.aadharcardNumber = 'Aadhar Card Number must be 12 digits';
    }

    if (!formData.upiId.trim()) {
      newErrors.upiId = 'UPI ID is required';
    } else if (!/^[\w.-]{2,256}@[a-zA-Z]{3,64}$/.test(formData.upiId.trim())) { 
      newErrors.upiId = 'Please enter a correct UPI ID';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } 
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.services) { // CHANGED: formData.profession -> formData.services
      newErrors.services = 'Please select your service'; // CHANGED: newErrors.profession -> newErrors.services
    }
    
    // Keeping city validation on frontend if it's still a UI field, but remember it won't be sent to backend
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    }

    if(formData.pincode.length !== 6) {
      newErrors.pincode = 'Pincode must be exactly 6 digits';}

    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    if (!validateForm()) return;

    // console.log("FormData being sent:", formData); // Uncomment for debugging
    
    setIsLoading(true);
    setErrors({}); // Clear previous errors

    try {
      // Make sure the URL matches your backend API endpoint
      const response = await axiosInstance.post('/repairer/signup', {
        fullname: formData.fullname,             // CHANGED: fullName -> fullname (matches backend)
        phone,
        upiId: formData.upiId,
        password: formData.password,
        services: formData.services,             // CHANGED: profession -> services (matches backend)
        aadharcardNumber: formData.aadharcardNumber,
        pincode : formData.pincode // ADDED: aadharcardNumber (matches backend)
        // Removed 'city' from payload as backend doesn't expect it in the provided controller.
        // If your backend *does* store 'city' in the Repairer model, but it wasn't part of the
        // provided controller's validation destructuring, you can add it back here:
        // city: formData.city,
      });

      if (response.status === 201) { // Assuming your backend returns 201 for creation success
        setSignupSuccess(true);
        console.log('Signup successful:', response.data);
        // If your backend sends a JWT token in the response, you might store it like this:
        // localStorage.setItem('token', response.data.token); 

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/repairer/dashboard'); // **Change this to your actual dashboard route if different**
        }, 2000); 
        window.location.reload();
      }
    } catch (error) {
      console.error('Signup error:', error);
      // Handle different types of errors (e.g., email already exists, validation failures)
      if (error.response && error.response.data && error.response.data.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: 'An unexpected error occurred. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Conditional rendering for success message
  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md mx-4">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Account Created!</h1>
          <p className="text-gray-600 mb-6">
            You've successfully joined fixNearby. Redirecting to your dashboard...
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
              <a href="/repairer/login" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Already have an account?
              </a>
              <a href="/user/getotp" className="text-blue-600 hover:text-purple-600 font-medium transition-colors">
                Looking for repairs?
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Form */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Register Your {phone}</h1>
              <p className="text-gray-600 text-lg">
                Join as a professional and start earning today
              </p>
            </div>

            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700">{errors.general}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="fullname" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="fullname" // CHANGED: id to fullname
                    name="fullname" // CHANGED: name to fullname
                    value={formData.fullname} // CHANGED: value to formData.fullname
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className={`block w-full pl-10 pr-3 py-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.fullname ? 'border-red-300' : 'border-gray-200' // CHANGED: errors.fullName -> errors.fullname
                    }`}
                  />
                </div>
                {errors.fullname && ( // CHANGED: errors.fullName -> errors.fullname
                  <p className="mt-2 text-sm text-red-600">{errors.fullname}</p> // CHANGED: errors.fullName -> errors.fullname
                )}
              </div>

              {/* NEW FIELD: Aadhar Card Number */}
              <div>
                <label htmlFor="aadharcardNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                  Aadhar Card Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IdCard className="h-5 w-5 text-gray-400" /> {/* Using CreditCard icon */}
                  </div>
                  <input
                    type="text"
                    id="aadharcardNumber"
                    name="aadharcardNumber"
                    value={formData.aadharcardNumber}
                    onChange={handleInputChange}
                    placeholder="Enter 12-digit Aadhar Number"
                    className={`block w-full pl-10 pr-3 py-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.aadharcardNumber ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                </div>
                {errors.aadharcardNumber && (
                  <p className="mt-2 text-sm text-red-600">{errors.aadharcardNumber}</p>
                )}
              </div>

              <div>
                <label htmlFor="upiId" className="block text-sm font-semibold text-gray-700 mb-2">
                  UPI ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CreditCard className="h-5 w-5 text-gray-400" /> {/* Using CreditCard icon */}
                  </div>
                  <input
                    type="text"
                    id="upiId"
                    name="upiId"
                    value={formData.upiId}
                    onChange={handleInputChange}
                    placeholder="Enter your UPI ID"
                    className={`block w-full pl-10 pr-3 py-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.upiId ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                </div>
                {errors.upiId && (
                  <p className="mt-2 text-sm text-red-600">{errors.upiId}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
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
                      placeholder="Enter password"
                      className={`block w-full pl-10 pr-10 py-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.password ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm password"
                      className={`block w-full pl-10 pr-10 py-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.confirmPassword ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="services" className="block text-sm font-semibold text-gray-700 mb-2"> {/* CHANGED: profession -> services */}
                    Service Offered {/* CHANGED: Profession -> Service Offered */}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className="h-5 w-5 text-gray-400" />
                    </div>
                    
                    <select
                      id="services" 
                      name="services" 
                      value={formData.services} 
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-3 py-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.services ? 'border-red-300' : 'border-gray-200' 
                      }`}
                    >
                      <option value="">Select your service</option> {/* CHANGED: profession -> service */}
                      {servicesOffered.map((service) => ( // CHANGED: professions.map -> servicesOffered.map
                        <option key={service} value={service}>
                          {service}
                        </option>
                      ))}
                    </select>
                    <center className='text-red-600 text-sm'>*You can add more services from profile section</center>
                  </div>
                  {errors.services && ( // CHANGED: errors.profession -> errors.services
                    <p className="mt-2 text-sm text-red-600">{errors.services}</p> // CHANGED: errors.profession -> errors.services
                  )}
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                    Pincode
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="302019"
                      className={`block w-full pl-10 pr-3 py-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.pincode ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {errors.pincode && (
                    <p className="mt-2 text-sm text-red-600">{errors.pincode}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
                  I agree to the{' '}
                  <a href="#" className="text-blue-600 hover:text-purple-600 font-medium">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-blue-600 hover:text-purple-600 font-medium">
                    Privacy Policy
                  </a>
                </label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-sm text-red-600">{errors.agreeToTerms}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Start Your{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Success Story
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Join thousands of professionals who are building their careers on fixNearby.
              </p>
            </div>

            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Join Our Community</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">500+</div>
                  <div className="text-sm text-gray-600">Professionals</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">50K+</div>
                  <div className="text-sm text-gray-600">Jobs Done</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">4.9★</div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold">Sarah M.</div>
                  <div className="text-blue-100 text-sm">Electrician</div>
                </div>
              </div>
              <p className="text-blue-100 mb-4">
                "fixNearby helped me grow my business by 300% in just 6 months. The platform is user-friendly and the support team is amazing!"
              </p>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current text-yellow-300" />
                ))}
              </div>
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

export default Signup;
