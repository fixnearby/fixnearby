// frontend/src/pages/user/Showservices.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { axiosInstance } from '../../../lib/axios'; // Ensure axiosInstance is correctly configured with baseURL and withCredentials
import { 
  Wrench, 
  Star, 
  MapPin, 
  Clock, 
  CheckCircle,
  Zap,        
  Droplets,   
  Hammer,     
  Paintbrush, 
  Shield,     
  Loader,     
  Send,       
  AlertCircle 
} from 'lucide-react';

// Enhanced mapping for service icons
const serviceIcons = {
  electronics: <Zap className="w-5 h-5" />,
  appliances: <Wrench className="w-5 h-5" />,
  plumbing: <Droplets className="w-5 h-5" />,
  electrical: <Zap className="w-5 h-5" />,
  carpentry: <Hammer className="w-5 h-5" />,
  painting: <Paintbrush className="w-5 h-5" />,
  automotive: <Shield className="w-5 h-5" />, 
  hvac: <Shield className="w-5 h-5" />,       
  other: <Wrench className="w-5 h-5" />
};

const Showservices = () => {
  const [repairers, setRepairers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore(); // Get user object from auth store

  // States for the service request form
  const [showServiceRequestForm, setShowServiceRequestForm] = useState(false);
  const [selectedRepairerForRequest, setSelectedRepairerForRequest] = useState(null); // Stores repairer ID
  const [serviceTypeInput, setServiceTypeInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [currentFetchedLocation, setCurrentFetchedLocation] = useState(null); // { address, postalCode, lat, lon, city }
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [locationSuccess, setLocationSuccess] = useState(null);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccessMessage, setSubmitSuccessMessage] = useState(null);

  // Allowed service types (must match your backend's ServiceRequest enum)
  const allowedServiceTypes = [
    'electronics', 'appliances', 'plumbing', 'electrical', 
    'carpentry', 'painting', 'automotive', 'hvac', 'other'
  ];

  // Callback to fetch repairers (moved from useEffect for better control)
  const fetchRepairers = useCallback(async () => {
    setLoading(true);
    try {
      // The backend expects user.location.postalCode, which should be available
      // via userProtectRoute and req.user on the backend.
      const response = await axiosInstance.get('/user/dashboard'); // GET /api/user/dashboard
      setRepairers(response.data);
    } catch (error) {
      console.error('Error fetching repairers:', error.response?.data || error.message);
      // Handle the error more gracefully, e.g., show a message to the user
      // For a 400 error about missing user location, you might guide them to update their profile
      if (error.response?.status === 400 && error.response?.data?.message.includes('User location')) {
        setSubmitError("Your profile location is missing. Please update your profile or fetch current location for service requests.");
      } else {
        setSubmitError("Failed to load available repairers.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRepairers();
  }, [fetchRepairers]);

  // Function to fetch user's current location from browser
  const fetchUserLiveLocation = async () => {
    setLocationLoading(true);
    setLocationError(null);
    setLocationSuccess(null);
    setCurrentFetchedLocation(null); 

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setLocationLoading(false);
      return;
    }

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;

      // Reverse geocoding using OpenStreetMap Nominatim API
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
      const response = await fetch(nominatimUrl);
      const data = await response.json();

      if (data && data.address) {
        const address = data.display_name || 'Fetched Address';
        const postalCode = data.address.postcode || 'N/A';
        const city = data.address.city || data.address.town || data.address.village || 'N/A';

        setCurrentFetchedLocation({
          address: address,
          postalCode: postalCode,
          lat: latitude,
          lon: longitude,
          city: city 
        });
        setLocationSuccess("Location fetched successfully!");
      } else {
        setLocationError("Could not retrieve address details for this location.");
      }
    } catch (err) {
      console.error("Geolocation or reverse geocoding error:", err);
      if (err.code === err.PERMISSION_DENIED) {
        setLocationError("Location access denied. Please enable location services in your browser settings.");
      } else if (err.code === err.POSITION_UNAVAILABLE) {
        setLocationError("Location information is unavailable. Please try again later.");
      } else if (err.code === err.TIMEOUT) {
        setLocationError("Timed out while trying to fetch location.");
      } else {
        setLocationError("Failed to fetch location. Please ensure location services are enabled.");
      }
    } finally {
      setLocationLoading(false);
    }
  };

  // Function to open the service request form
  const openServiceRequestForm = (repairerId) => {
    setSelectedRepairerForRequest(repairerId);
    setServiceTypeInput('');
    setDescriptionInput('');
    setCurrentFetchedLocation(null);
    setLocationError(null);
    setLocationSuccess(null);
    setSubmitError(null);
    setSubmitSuccessMessage(null);
    setShowServiceRequestForm(true);
  };

  // Function to submit the service request
  const handleSubmitServiceRequest = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccessMessage(null);
    setIsSubmittingRequest(true);

    if (!user || !user._id) {
      setSubmitError("User not authenticated. Please log in.");
      setIsSubmittingRequest(false);
      return;
    }

    if (!serviceTypeInput || !descriptionInput) {
      setSubmitError("Please select a service type and provide a description.");
      setIsSubmittingRequest(false);
      return;
    }

    // Determine the location to send: fetched live location, or user's profile location
    const requestLocation = currentFetchedLocation || user.location; 

    if (!requestLocation || !requestLocation.address || !requestLocation.postalCode) {
      setSubmitError("Please fetch your current location or ensure your profile has a saved address and postal code.");
      setIsSubmittingRequest(false);
      return;
    }

    try {
      const response = await axiosInstance.post('/user/service-request', {
        repairerId: selectedRepairerForRequest,
        serviceType: serviceTypeInput,
        description: descriptionInput,
        location: { 
          address: requestLocation.address,
          postalCode: requestLocation.postalCode
        }
      });

      if (response.status === 201) {
        setSubmitSuccessMessage(`Service request for "${response.data.title}" submitted successfully!`);
        // Reset form and hide it after successful submission
        setServiceTypeInput('');
        setDescriptionInput('');
        setCurrentFetchedLocation(null);
        setSelectedRepairerForRequest(null);
        setShowServiceRequestForm(false);
        // Optionally, refetch repairers or update UI to reflect the new request
      } else {
        setSubmitError(response.data?.message || "Failed to submit service request.");
      }
    } catch (err) {
      console.error('Error creating service request:', err.response?.data || err.message);
      setSubmitError(err.response?.data?.message || 'An error occurred while submitting your request. Please try again.');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Available Repairers</h1>
      
      {/* Global submit error/success message */}
      {submitError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl flex items-center space-x-2">
          <AlertCircle size={20} />
          <span>{submitError}</span>
        </div>
      )}
      {submitSuccessMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-xl flex items-center space-x-2">
          <CheckCircle size={20} />
          <span>{submitSuccessMessage}</span>
        </div>
      )}

      {/* Service Request Form - Shown conditionally */}
      {showServiceRequestForm && selectedRepairerForRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fade-in-up">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Request Service</h2>
            <p className="text-gray-600 mb-4">
              For: <span className="font-semibold">{repairers.find(r => r._id === selectedRepairerForRequest)?.fullname}</span>
            </p>

            <form onSubmit={handleSubmitServiceRequest} className="space-y-4">
              <div>
                <label htmlFor="serviceTypeInput" className="block text-sm font-medium text-gray-700 mb-1">
                  Service Type
                </label>
                <select
                  id="serviceTypeInput"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={serviceTypeInput}
                  onChange={(e) => setServiceTypeInput(e.target.value)}
                  disabled={isSubmittingRequest}
                  required
                >
                  <option value="">Select service type</option>
                  {allowedServiceTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="descriptionInput" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="descriptionInput"
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Describe your issue in detail..."
                  value={descriptionInput}
                  onChange={(e) => setDescriptionInput(e.target.value)}
                  disabled={isSubmittingRequest}
                  required
                ></textarea>
              </div>

              {/* Location Fetching Section */}
              <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location for Service
                </label>
                <button
                  type="button"
                  onClick={fetchUserLiveLocation}
                  disabled={locationLoading || isSubmittingRequest}
                  className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {locationLoading ? (
                    <Loader size={16} className="animate-spin" />
                  ) : (
                    <MapPin size={16} />
                  )}
                  <span>Fetch Current Location</span>
                </button>
                {locationLoading && <p className="text-sm text-gray-500 mt-2 text-center">Fetching...</p>}
                {locationError && (
                  <p className="text-sm text-red-500 mt-2 text-center flex items-center justify-center">
                    <AlertCircle size={14} className="mr-1"/>{locationError}
                  </p>
                )}
                {locationSuccess && (
                  <p className="text-sm text-green-600 mt-2 text-center flex items-center justify-center">
                    <CheckCircle size={14} className="mr-1"/>{locationSuccess}
                  </p>
                )}
                {currentFetchedLocation ? (
                  <div className="bg-gray-100 p-3 rounded-md mt-3 text-sm text-gray-800">
                    <p><strong>Using:</strong> {currentFetchedLocation.address}</p>
                    <p><strong>Postal Code:</strong> {currentFetchedLocation.postalCode}</p>
                  </div>
                ) : user?.location?.address ? (
                  <div className="bg-gray-100 p-3 rounded-md mt-3 text-sm text-gray-800">
                    <p><strong>Using profile location:</strong> {user.location.address} (Postal Code: {user.location.postalCode})</p>
                  </div>
                ) : (
                    <p className="text-sm text-gray-500 mt-3 text-center">No location fetched. Will use profile location if available.</p>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowServiceRequestForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  disabled={isSubmittingRequest}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRequest || locationLoading}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:opacity-90 transition-opacity flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingRequest ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Repairers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {repairers.map(repairer => (
          <div 
            key={repairer._id} 
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                {/* Placeholder for repairer image/avatar */}
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center text-gray-400">
                  <Wrench size={32} /> {/* Generic icon for profile placeholder */}
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-bold text-gray-900">{repairer.fullname}</h2>
                  <div className="flex items-center mt-1">
                    {/* Display average rating */}
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.floor(repairer.rating?.average || 0) ? 
                          'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">
                      ({repairer.rating?.count || 0} reviews)
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{repairer.location?.address || 'Location not specified'}</span>
              </div>
              
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Services Offered</h3>
                <div className="flex flex-wrap gap-2">
                  {repairer.services && repairer.services.map((service, index) => (
                    <div 
                      key={index} 
                      className="flex items-center bg-blue-50 px-3 py-1 rounded-full"
                    >
                      {serviceIcons[service.name.toLowerCase()] || serviceIcons.other} {/* Use toLowerCase for consistent matching */}
                      <span className="ml-2 text-sm font-medium">
                        {service.name} (₹{service.price})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{repairer.experience || 0} years experience</span>
                </div>
                
                <button
                  onClick={() => openServiceRequestForm(repairer._id)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full font-medium hover:opacity-90 transition-opacity"
                >
                  Request Service
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {repairers.length === 0 && !loading && !submitError && ( // Show only if no errors
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No repairers available</h3>
          <p className="text-gray-600">
            There are currently no repairers available in your area. Please check back later.
          </p>
        </div>
      )}
    </div>
  );
};

export default Showservices;