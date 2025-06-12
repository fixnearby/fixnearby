// frontend/src/pages/user/dashboard/Maindashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore.js';
import {
  requestService,
  logoutUser, 
  getUserDashboardStats,
  getUserRecentActivity,
} from '../../../services/apiService.js';
import toast from 'react-hot-toast';
import servicefromjson from '../../../services.json'; 

import {
  AirVent,
  User,
  Clock,
  X,
  Info,
  SquarePen,
  ArrowLeft,
  MapPin,
  LocateFixed,
  ArrowRight,
  Loader,
  CheckCircle,
  LogOut,
  Zap,
  Droplets,
  Hammer,
  Paintbrush,
  Bug,
  Shield,
  Truck,
  Flower,
  Ruler,
  Wrench,
  Sparkles,
  PaintRoller,
  MessageCircle,
  Bell,
  Settings
} from "lucide-react";


const ServiceRequestFormModal = ({
  isOpen,
  onClose,
  serviceType,
  defaultTitle
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationError, setLocationError] = useState('');


  const [locationData, setLocationData] = useState({
    fullAddress: '',
    pincode: '',
    city: '',
    state: '',
    coordinates: [],
    captureMethod: 'manual'
  });
  const [serviceDetails, setServiceDetails] = useState({
    title: defaultTitle || '',
    description: '',
    serviceType: serviceType || '',
    preferredTimeSlot: { 
      date: '', 
      time: '' 
    },
    urgency: 'medium',
    budget: '',
    contactInfo: '', 
  });

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedIssue, setSelectedIssue] = useState('');
  const [loadingEstimation, setLoadingEstimation] = useState(false);
  const [showEstimationPopup, setShowEstimationPopup] = useState(false);
  const [priceRange, setPriceRange] = useState('');

  const categories = servicefromjson.home_services.find(
    item => item.main_category.toLowerCase() === serviceDetails.title.toLowerCase()
  )?.categories || [];

  const issues = servicefromjson.home_services
    .find(item => item.main_category.toLowerCase() === serviceDetails.title.toLowerCase())
    ?.categories.find(cat => cat.category.toLowerCase() === selectedCategory.toLowerCase())
    ?.services || [];


  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleIssueChange = (e) => {
    setSelectedIssue(e.target.value);
  };

  useEffect(() => {
    if (selectedCategory && selectedIssue && serviceDetails.title) {
      const matchedCategory = servicefromjson.home_services.find(
        item => item.main_category.toLowerCase() === serviceDetails.title.toLowerCase()
      );

      const matchedSubCategory = matchedCategory?.categories?.find(
        cat => cat.category === selectedCategory
      );

      const matchedIssue = matchedSubCategory?.services?.find(
        svc => svc.issue === selectedIssue
      );

      if (matchedIssue?.price_range) {
        setPriceRange(matchedIssue.price_range);
      } else {
        setPriceRange("");
      }
    }
  }, [selectedCategory, selectedIssue, serviceDetails.title]);

  const handleAIEstimation = () => {
    if (!selectedCategory || !selectedIssue) {
      toast.error("Please select both category and issue");
      return;
    }

    setLoadingEstimation(true);
    setTimeout(() => {
      setLoadingEstimation(false);
      setShowEstimationPopup(true);
    }, 2000);
  };


  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setLoading(false);
      setIsSubmitting(false);
      setLocationError('');
      setLocationData({
        fullAddress: '',
        pincode: '',
        city: '',
        state: '',
        coordinates: [],
        captureMethod: 'manual'
      });
      setServiceDetails({
        title: defaultTitle || '',
        description: '',
        serviceType: serviceType || '',
        preferredTimeSlot: { 
          date: new Date().toISOString().split('T')[0], 
          time: ''
        },
        urgency: 'medium',
        budget: '', 
        contactInfo: '',
      });
      setSelectedCategory(''); 
      setSelectedIssue(''); 
      setPriceRange(''); 
      setShowEstimationPopup(false); 
      setLoadingEstimation(false); 
    }
  }, [isOpen, serviceType, defaultTitle]);


  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setLocationData(prev => ({ ...prev, [name]: value }));
    setLocationError('');
  };

  const handleServiceDetailsChange = (e) => {
    const { name, value } = e.target;
    if (name === 'preferredTimeSlot') { 
      setServiceDetails(prev => ({
        ...prev,
        preferredTimeSlot: {
          ...prev.preferredTimeSlot,
          time: value 
        }
      }));
    } else {
      setServiceDetails(prev => ({ ...prev, [name]: value }));
    }
  };


  const handleGeoLocate = async () => {
    setLoading(true);
    setLocationError('');
    setLocationData(prev => ({ ...prev, captureMethod: 'gps' }));

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      });

      const { latitude, longitude } = position.coords;

      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`;
      const response = await fetch(nominatimUrl);
      const data = await response.json();

      if (data && data.address) {
        setLocationData(prev => ({
          ...prev,
          fullAddress: data.display_name || `${data.address.road || ''}, ${data.address.neighbourhood || data.address.suburb || ''}, ${data.address.city || data.address.town || ''}`,
          pincode: data.address.postcode || '',
          city: data.address.city || data.address.town || data.address.village || '',
          state: data.address.state || '',
          coordinates: [longitude, latitude]
        }));
        toast.success('Location detected!');
      } else {
        setLocationError("Could not retrieve detailed address for this location.");
        toast.error('Failed to get detailed address from GPS.');
      }
    } catch (err) {
      console.error("Geolocation error:", err);
      if (err.code === err.PERMISSION_DENIED) {
        setLocationError("Location access denied. Please enable location services in your browser settings.");
      } else {
        setLocationError("Failed to fetch GPS location. Please try manual entry.");
      }
      setLocationData(prev => ({ ...prev, captureMethod: 'manual' }));
    } finally {
      setLoading(false);
    }
  };


  const handleLocationNext = () => {
    if (locationData.captureMethod === 'gps' && (!locationData.fullAddress || !locationData.pincode)) {
      setLocationError("GPS location detected, but couldn't get a full address or pincode. Please ensure location services are accurate or switch to manual entry.");
      return;
    }
    if (locationData.captureMethod === 'manual' && (!locationData.fullAddress.trim() || !locationData.pincode.trim())) {
      setLocationError("Please provide a full address and pincode for manual entry.");
      return;
    }

    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(locationData.pincode)) {
      setLocationError("Please enter a valid 6-digit pincode.");
      return;
    }

    setStep(2);
  };

 const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocationError('');
    if (!selectedCategory || !selectedIssue) {
      toast.error("Please select both a category and an issue.");
      setIsSubmitting(false);
      return;
    }

    if (!serviceDetails.description.trim()) {
      toast.error("Please provide a job description.");
      setIsSubmitting(false);
      return;
    }
    if (!serviceDetails.preferredTimeSlot.time) { 
        toast.error("Please select a preferred time slot.");
        setIsSubmitting(false);
        return;
    }
    if (!serviceDetails.contactInfo) {
      toast.error("Please provide your contact information (phone number or email).");
      setIsSubmitting(false);
      return;
    }

    if (!locationData.fullAddress || !locationData.pincode || !locationData.captureMethod) {
      toast.error("Please provide your full address, postal code, and select a location capture method.");
      setIsSubmitting(false);
      return;
    }

    try {
      const requestPayload = {
        title: serviceDetails.title,
        serviceType: serviceDetails.title,
        description: serviceDetails.description,
        preferredDate: serviceDetails.preferredTimeSlot.date,
        preferredTime: serviceDetails.preferredTimeSlot.time,
        contactInfo: serviceDetails.contactInfo,
        locationData: { 
          fullAddress: locationData.fullAddress, 
          pincode: locationData.pincode,
          city: locationData.city || undefined,
          state: locationData.state || undefined,
          coordinates: locationData.coordinates.length === 2 ? locationData.coordinates : undefined,
          captureMethod: locationData.captureMethod
        },
        issue: selectedIssue,
        category: selectedCategory,
        quotation: priceRange,
        preferredTimeSlot: { 
            date: serviceDetails.preferredTimeSlot.date,
            time: serviceDetails.preferredTimeSlot.time,
        }
      };

      console.log("Sending payload:", requestPayload);


      const response = await requestService(requestPayload);

      if (response.success) {

        toast.success("Service Requested Succesfully")
        onClose();
      } else {
        toast.error(response.message || 'Failed to create service request.');
      }
    } catch (error) {
      console.error('Error creating service request:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'An error occurred while creating service request.');
    } finally {
      setIsSubmitting(false);
    }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-0 overflow-hidden">
      <div className="bg-white border-black border-2 rounded-lg shadow-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 cursor-pointer"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
          Request Service: {serviceDetails.serviceType}
        </h2>

        {step === 1 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
              <MapPin className="mr-2" /> Step 1: Confirm Your Location
            </h3>

            <div className="space-y-3 mb-6">
              <h4 className="font-semibold text-gray-900">How would you like to provide your location?</h4>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => {
                    setLocationData(prev => ({ ...prev, captureMethod: 'gps' }));
                    setLocationError('');
                  }}
                  className={`p-4 border-2 rounded-xl text-left transition-all ${
                    locationData.captureMethod === 'gps'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <LocateFixed className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">Use GPS Location</div>
                      <div className="text-sm text-gray-600">Automatically detect your current location</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setLocationData(prev => ({ ...prev, captureMethod: 'manual' }));
                    setLocationError('');
                    setLocationData(prev => ({
                      ...prev,
                      fullAddress: '',
                      pincode: '',
                      city: '',
                      state: '',
                      coordinates: []
                    }));
                  }}
                  className={`p-4 border-2 rounded-xl text-left transition-all ${
                    locationData.captureMethod === 'manual'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">Enter Manually</div>
                      <div className="text-sm text-gray-600">Type your address and pincode</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {locationData.captureMethod === 'gps' && (
              <div className="mb-4">
                <button
                  onClick={handleGeoLocate}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Detecting Location...</span>
                    </>
                  ) : (
                    <>
                      <LocateFixed className="w-5 h-5" />
                      <span>Get My Location</span>
                    </>
                  )}
                </button>
                {locationData.fullAddress && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 mt-3">
                    <p className="text-sm text-green-700 font-medium">Detected Address:</p>
                    <p className="text-sm text-green-800">{locationData.fullAddress}</p>
                    <p className="text-xs text-green-600">Pincode: {locationData.pincode || 'N/A'}</p>
                  </div>
                )}
              </div>
            )}

            {locationData.captureMethod === 'manual' && (
              <>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fullAddress">
                    Full Address *
                  </label>
                  <textarea
                    id="fullAddress"
                    name="fullAddress"
                    value={locationData.fullAddress}
                    onChange={handleLocationChange}
                    rows="3"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="e.g., House No., Street, Area"
                    required
                  ></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="pincode">
                      Postal Code (Pincode) *
                    </label>
                    <input
                      type="text"
                      id="pincode"
                      name="pincode"
                      value={locationData.pincode}
                      onChange={(e) => setLocationData(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '') }))}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="e.g., 302001"
                      maxLength="6"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="city">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={locationData.city}
                      onChange={handleLocationChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="e.g., Jaipur"
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="state">
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={locationData.state}
                    onChange={handleLocationChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="e.g., Rajasthan"
                  />
                </div>
              </>
            )}

            {locationError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline ml-2">{locationError}</span>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleLocationNext}
                disabled={loading || !locationData.captureMethod}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Next <ArrowRight className="ml-2" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
              <SquarePen className="mr-2" /> Step 2: Job Details
            </h3>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                Service Type
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={serviceDetails.title}
                readOnly
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-gray-100 leading-tight focus:outline-none focus:shadow-none cursor-not-allowed"
              />
            </div>
            {/* Dropdowns side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                  Select Category in {serviceDetails.title}
                </label>
                <select
                  id="category"
                  name="category"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 bg-white focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">-- Select a Category --</option>
                  {categories.map((cat, index) => (
                    <option key={index} value={cat.category}>
                      {cat.category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="issue">
                  Select The Issue You Are Facing
                </label>
                <select
                  id="issue"
                  name="issue"
                  value={selectedIssue}
                  onChange={handleIssueChange}
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 bg-white focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">-- Select an Issue --</option>
                  {issues.map((issue, index) => (
                    <option key={index} value={issue.issue}>
                      {issue.issue}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Button */}
            <div className="mb-6 flex justify-center">
              <button
                type="button" // Change to type="button" to prevent form submission
                onClick={handleAIEstimation}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition cursor-pointer"
              >
                Get AI-Based Estimation
              </button>
            </div>


            {/* Fullscreen Spinner */}
            {loadingEstimation && (
              <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
                <div className="border-t-4 border-blue-500 border-solid rounded-full w-12 h-12 animate-spin"></div>
              </div>
            )}

            {/* Estimation Modal */}
            {showEstimationPopup && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
                <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full text-center space-y-4 relative">
                  <h2 className="text-xl font-semibold text-green-600">AI-Based Quotation</h2>
                  <p className="text-2xl font-bold text-gray-900">₹{priceRange}</p>
                  <p className="text-gray-600 text-sm">
                    Based on your selection: <strong>{selectedCategory}</strong> – <em>{selectedIssue}</em>
                  </p>
                  <p className="text-xs text-gray-500">
                    The technician will verify this and confirm the Quotation during the visit.<span className="text-red-600 font-medium"> ₹150</span> <span className='text-black'>fee applies if Quotation is cancelled after visit.</span>
                  </p>
                  <button
                    onClick={() => setShowEstimationPopup(false)}
                    className="mt-3 px-4 py-1 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                Job Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={serviceDetails.description}
                onChange={handleServiceDetailsChange}
                rows="4"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Describe the problem in detail (e.g., 'My kitchen faucet is constantly dripping, needs a new washer or full replacement.')"
                required
              ></textarea>
            </div>

            {/* Preferred Date - Display only as today's date */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Preferred Date
              </label>
              <input
                type="text"
                value={new Date(serviceDetails.preferredTimeSlot.date).toLocaleDateString()}
                readOnly
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-gray-100 leading-tight focus:outline-none focus:shadow-none cursor-not-allowed"
                aria-label="Preferred Date"
              />
              <p className="text-xs text-gray-500 mt-1">
                Currently set to today's date automatically.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="preferredTimeSlot">
                Preferred Time Slot *
              </label>
              <select
                id="preferredTimeSlot"
                name="preferredTimeSlot" // Name must match the state property being updated
                value={serviceDetails.preferredTimeSlot.time} // Bind to the 'time' property
                onChange={handleServiceDetailsChange} // Use the modified handler
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required // Mark as required
              >
                <option value="">Select a time slot</option>
                <option value="morning">Morning (9 AM - 12 PM)</option>
                <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                <option value="evening">Evening (5 PM - 9 PM)</option>
                <option value="flexible">Anytime during the day</option>
              </select>
            </div>

            {/* NEW: Contact Info Input */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contactInfo">
                Contact Information (Phone or Email) *
              </label>
              <input
                type="text"
                id="contactInfo"
                name="contactInfo"
                value={serviceDetails.contactInfo}
                onChange={handleServiceDetailsChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="e.g., +919876543210 or your.email@example.com"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="urgency">
                Urgency
              </label>
              <select
                id="urgency"
                name="urgency"
                value={serviceDetails.urgency}
                onChange={handleServiceDetailsChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical (Emergency)</option>
              </select>
            </div>


            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
              >
                <ArrowLeft className="mr-2" /> Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none cursor-pointer focus:shadow-outline flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader className="animate-spin mr-2" size={16} /> : <CheckCircle className="mr-2" />}
                Submit Request
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};


const UserMainDashboard = () => {
  const navigate = useNavigate();
  const { user, clearUser, clearRepairer, clearAdmin } = useAuthStore();

  const isAuthenticated = !!user;

  const [showServiceFormModal, setShowServiceFormModal] = useState(false);
  const [selectedServiceData, setSelectedServiceData] = useState(null);

  const [dashboardStats, setDashboardStats] = useState({
    totalServices: 0,
    completedServices: 0,
    inProgressServices: 0,
  });
  const [recentUserActivity, setRecentUserActivity] = useState([]);
  const [loadingDashboardData, setLoadingDashboardData] = useState(true);
  const [errorDashboardData, setErrorDashboardData] = useState(null);

  const services = [
    {
      icon: <AirVent className="w-8 h-8" />,
      title: "Appliances",
      description: "Home appliance repair and maintenance",
      color: "from-indigo-400 to-blue-500",
      category: "Appliances"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Electrical",
      description: "Electrical repairs, wiring, and installations",
      color: "from-yellow-400 to-orange-500",
      category: "Electrical"
    },
    {
      icon: <Droplets className="w-8 h-8" />,
      title: "Plumbing",
      description: "Pipe repairs, fittings, and water solutions",
      color: "from-blue-400 to-cyan-500",
      category: "Plumbing"
    },
    {
      icon: <Hammer className="w-8 h-8" />,
      title: "Carpentry",
      description: "Woodwork, furniture repair, and fittings",
      color: "from-amber-400 to-yellow-600",
      category: "Carpentry"
    },
    {
      icon: <Paintbrush className="w-8 h-8" />,
      title: "Cleaning",
      description: "Deep cleaning and sanitation services",
      color: "from-lime-400 to-emerald-500",
      category: "Cleaning"
    },
    {
      icon: <PaintRoller className="w-8 h-8" />,
      title: "Painting & Renovation",
      description: "Interior and exterior painting & minor renovations",
      color: "from-purple-400 to-pink-500",
      category: "Painting & Renovation"
    },
    {
      icon: <Bug className="w-8 h-8" />,
      title: "Pest Control",
      description: "Termite, rodent, and pest extermination",
      color: "from-red-400 to-rose-500",
      category: "Pest Control"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Security & Automation",
      description: "Smart locks, cameras, and home automation",
      color: "from-gray-500 to-slate-700",
      category: "Security & Automation"
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Moving & Storage",
      description: "Packing, moving, and short-term storage",
      color: "from-orange-400 to-amber-600",
      category: "Moving & Storage"
    },
    {
      icon: <Flower className="w-8 h-8" />,
      title: "Gardening & Landscaping",
      description: "Garden design, maintenance & landscaping",
      color: "from-green-400 to-emerald-600",
      category: "Gardening & Landscaping"
    },
    {
      icon: <Ruler className="w-8 h-8" />,
      title: "Interior Design",
      description: "Home styling and interior consultancy",
      color: "from-cyan-400 to-blue-600",
      category: "Interior Design"
    },
    {
      icon: <Wrench className="w-8 h-8" />,
      title: "Repairs and Installation",
      description: "General repairs and device installations",
      color: "from-stone-400 to-gray-600",
      category: "Repairs and Installation"
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Specialized Services",
      description: "Accessibility services & gutter and septic tank cleaning",
      color: "from-fuchsia-400 to-violet-600",
      category: "Specialized Services"
    }
  ];


  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?._id) {
        setLoadingDashboardData(false);
        return;
      }
      setLoadingDashboardData(true);
      setErrorDashboardData(null);
      try {
        const [statsResponse, activityResponse] = await Promise.all([
          getUserDashboardStats(),
          getUserRecentActivity()
        ]);
        setDashboardStats({
          totalServices: statsResponse.totalServices,
          completedServices: statsResponse.completedServices,
          inProgressServices: statsResponse.inProgressServices,
        });
        setRecentUserActivity(activityResponse);
      } catch (err) {
        console.error("Error fetching user dashboard data:", err);
        setErrorDashboardData("Failed to load dashboard data.");
        toast.error("Failed to load dashboard data.");
      } finally {
        setLoadingDashboardData(false);
      }
    };

    fetchDashboardData();
  }, [user]);


  const handleServiceClick = (service) => {
    if (!isAuthenticated) {
      toast.error("Please login to request a service.");
      navigate('/user/login');
      return;
    }


    setSelectedServiceData(service);
    setShowServiceFormModal(true);
    console.log(service.category);
  };

  const handleModalClose = () => {
    setShowServiceFormModal(false);
    setSelectedServiceData(null);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success('Logged out successfully!');
      clearUser();
      clearRepairer();
      clearAdmin();
      navigate('/user/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to logout. Please try again.');
      console.error('Logout error:', error);
    }
  };

  const handleMessagesClick = () => {
    console.log("User Messages button clicked. Navigating to /user/messages");
    navigate('/user/messages');
  };

  const handleNotificationsClick = () => {
    console.log("User Notifications button clicked. Navigating to /user/notifications");
    toast.info("Notifications page is under development!");
  };

  if (!user && !loadingDashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please log in as a user to view your dashboard.</p>
          <Link to="/user/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Wrench className="w-8 h-8 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                fixNearby
              </span>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700 font-medium">{user?.fullname || 'Guest'}</span>
              </div>

              {/* NEW: Messages Button */}
              <button
                onClick={handleMessagesClick}
                className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                aria-label="Messages"
              >
                <MessageCircle className="w-6 h-6 text-gray-700" />
              </button>

              {/* NEW: Notifications Button (if implemented) */}
              <button
                onClick={handleNotificationsClick}
                className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-6 h-6 text-gray-700" />
              </button>

              {/* In Progress Jobs Link */}
              <button
                onClick={() => navigate('/user/inprogress')}
                className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full hover:bg-blue-200 transition-colors cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">In Progress</span>
              </button>

              {/* Pending Services Link */}
              <button
                onClick={() => navigate('/user/pending-service')}
                className="flex items-center space-x-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full hover:bg-yellow-200 transition-colors cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Pending</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-100 text-red-700 px-4 py-2 rounded-full hover:bg-red-200 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{user?.fullname?.split(' ')[0] || 'User'}</span>!
          </h1>
          <p className="text-xl text-gray-600">Choose a service to get started with your home repairs</p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              onClick={() => handleServiceClick(service)}
              className="service-card bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 cursor-pointer"
            >
              <div className="p-6">
                <div className={`bg-gradient-to-r ${service.color} text-white w-16 h-16 rounded-2xl flex items-center justify-center mb-4 hover:scale-110 transition-transform mx-auto`}>
                  {service.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">{service.title}</h3>
                <p className="text-gray-600 text-sm text-center mb-4">{service.description}</p>

                <div className="text-center mt-4 relative flex justify-center items-center gap-2">
                  <button className="text-blue-600 font-semibold text-sm">
                    Book Visit – Free
                  </button>

                  <div className="relative group cursor-pointer">
                    <Info className="w-4 h-4 text-blue-600" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-blue-50 text-gray-800 text-xs rounded-md border border-blue-200 px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow">
                      <strong className="text-blue-700">Note:</strong> Technician visit is <span className="text-green-600 font-medium">FREE</span> if you accept the quotation and proceed with service . <span className="text-red-600 font-medium">₹150</span> fee applies if cancelled after visit.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>


        {/* Quick Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {loadingDashboardData ? (
            <>
              <div className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl p-6 text-white animate-pulse h-32"></div>
              <div className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl p-6 text-white animate-pulse h-32"></div>
              <div className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl p-6 text-white animate-pulse h-32"></div>
            </>
          ) : errorDashboardData ? (
            <div className="md:col-span-3 bg-red-100 text-red-700 p-4 rounded-lg text-center">
              Error: {errorDashboardData}
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Services</p>
                  <p className="text-2xl font-bold">{dashboardStats.totalServices}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-200" />
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Completed</p>
                  <p className="text-2xl font-bold">{dashboardStats.completedServices}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-200" />
              </div>

              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">In Progress</p>
                  <p className="text-2xl font-bold">{dashboardStats.inProgressServices}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-200" />
              </div>
            </>
          )}
        </div>

        {/* Recent Activity */}
        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          {loadingDashboardData ? (
            <div className="bg-gray-100 p-6 rounded-xl shadow-md animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded mb-3"></div>
              ))}
            </div>
          ) : errorDashboardData ? (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg">Error: {errorDashboardData}</div>
          ) : recentUserActivity.length === 0 ? (
            <div className="bg-white p-6 rounded-xl shadow-md text-center text-gray-500">
              No recent activity to display.
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl shadow-md">
              <ul className="divide-y divide-gray-200">
                {recentUserActivity.map((activity, index) => (
                  <li key={index} className="flex items-center py-3">
                    <span className="text-gray-800 font-medium mr-2">-</span>
                    <span className="text-gray-700">{activity.message}</span>
                    <span className="ml-auto text-sm text-gray-500">{activity.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

      </main>

      {/* Service Request Form Modal (handles both location and description) */}
      <ServiceRequestFormModal
        isOpen={showServiceFormModal}
        onClose={handleModalClose}
        serviceType={selectedServiceData?.category}
        defaultTitle={selectedServiceData?.title}
      />
    </div>
  );
};

export default UserMainDashboard;
